// Orma Service Worker v4
//
// CAPTURE STRATEGY:
// - Primary: capture when user navigates to a new page (tabs.onUpdated)
//   and when user switches tabs (tabs.onActivated).
//   These events fire in a context where captureVisibleTab WORKS.
// - Secondary: alarm every 30s as a heartbeat for long sessions on one page.
//
// This avoids the MV3 restriction where captureVisibleTab fails from
// alarm callbacks when there's no recent user gesture.

const API_BASE = 'http://localhost:5000/api';
const ALARM_NAME = 'orma_heartbeat';
const DEFAULT_HEARTBEAT_SECONDS = 30;
let heartbeatSeconds = DEFAULT_HEARTBEAT_SECONDS;
let periodicTimer = null;

// Per-tab debounce: don't capture the same tab twice within N ms
const recentCaptures = new Map(); // tabId → timestamp
const DEBOUNCE_MS = 20_000; // 20 seconds per tab

// ── Startup ──────────────────────────────────────────────────────────────────
async function onStartup() {
  console.log('[Orma SW] startup');
  try { chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }); } catch {}

  const data = await chrome.storage.local.get(['orma_recording', 'orma_token', 'orma_capture_interval', 'orma_groq_api_key']);
  heartbeatSeconds = Number(data.orma_capture_interval) || DEFAULT_HEARTBEAT_SECONDS;
  if (data.orma_recording && data.orma_token) {
    ensureHeartbeat();
    startPeriodicTimer();
    console.log('[Orma SW] Resumed recording on startup');
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ orma_recording: false, orma_capture_count: 0 });
  console.log('[Orma SW] Installed v4');
});

chrome.runtime.onStartup.addListener(onStartup);
onStartup();

// ── Tab navigation — fires when a page finishes loading ──────────────────────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only capture when the page is fully loaded
  if (changeInfo.status !== 'complete') return;
  if (!tab.active) return; // only active tab

  const data = await chrome.storage.local.get(['orma_recording', 'orma_token']);
  if (!data.orma_recording || !data.orma_token) return;

  console.log('[Orma SW] Tab updated (complete):', tab.url?.slice(0, 60));
  scheduleCapture(tabId, tab, data.orma_token, 800);
});

// ── Tab switch — fires when user switches to a different tab ─────────────────
chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  const data = await chrome.storage.local.get(['orma_recording', 'orma_token']);
  if (!data.orma_recording || !data.orma_token) return;

  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || isSystemPage(tab.url)) return;
    console.log('[Orma SW] Tab activated:', tab.url?.slice(0, 60));
    scheduleCapture(tabId, tab, data.orma_token, 500);
  } catch (e) {
    console.warn('[Orma SW] onActivated error:', e.message);
  }
});

// ── Heartbeat alarm — for long sessions on a single page ─────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  console.log('[Orma SW] Heartbeat alarm');

  const data = await chrome.storage.local.get(['orma_recording', 'orma_token']);
  if (!data.orma_recording || !data.orma_token) {
    chrome.alarms.clear(ALARM_NAME);
    return;
  }

  // Find the currently active tab and capture it
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab && !isSystemPage(tab.url || '')) {
      scheduleCapture(tab.id, tab, data.orma_token, 0, true);
    }
  } catch (e) {
    console.warn('[Orma SW] Heartbeat capture error:', e.message);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function isSystemPage(url) {
  return (
    !url ||
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('about:') ||
    url.startsWith('edge://') ||
    url.startsWith('devtools://')
  );
}

function ensureHeartbeat() {
  chrome.alarms.get(ALARM_NAME, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(ALARM_NAME, {
        delayInSeconds: heartbeatSeconds,
        periodInSeconds: heartbeatSeconds,
      });
      console.log('[Orma SW] Heartbeat alarm created every', heartbeatSeconds, 's');
    }
  });
}

function startPeriodicTimer() {
  if (periodicTimer) clearInterval(periodicTimer);
  periodicTimer = setInterval(async () => {
    try {
      const data = await chrome.storage.local.get(['orma_recording', 'orma_token']);
      if (!data.orma_recording || !data.orma_token) {
        stopPeriodicTimer();
        return;
      }
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (tab && !isSystemPage(tab.url || '')) {
        scheduleCapture(tab.id, tab, data.orma_token, 0, true);
      }
    } catch (e) {
      console.warn('[Orma SW] Periodic timer capture error:', e.message);
    }
  }, Math.max(heartbeatSeconds, 10) * 1000);
}

function stopPeriodicTimer() {
  if (periodicTimer) {
    clearInterval(periodicTimer);
    periodicTimer = null;
  }
}

// Debounced capture scheduler
function scheduleCapture(tabId, tab, token, delayMs, force = false) {
  const now = Date.now();
  const last = recentCaptures.get(tabId) || 0;
  if (!force && now - last < DEBOUNCE_MS) {
    console.log('[Orma SW] Debounced tab', tabId, 'last captured', Math.round((now - last) / 1000), 's ago');
    return;
  }
  recentCaptures.set(tabId, now);

  if (delayMs > 0) {
    setTimeout(() => doCapture(tab, token), delayMs);
  } else {
    doCapture(tab, token);
  }
}

// ── Messages ──────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('[Orma SW] Message:', msg.type);

  if (msg.type === 'START_RECORDING') {
    startRecording(msg.token).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'STOP_RECORDING') {
    stopRecording().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'GET_STATUS') {
    chrome.storage.local.get(
      ['orma_recording', 'orma_token', 'orma_capture_count'],
      (data) => {
        sendResponse({
          recording: data.orma_recording ?? false,
          captureCount: data.orma_capture_count ?? 0,
        });
      }
    );
    return true;
  }
  if (msg.type === 'SET_TOKEN') {
    chrome.storage.local.set({ orma_token: msg.token }, () => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'UPDATE_SETTINGS') {
    heartbeatSeconds = Math.max(10, Number(msg.interval) || DEFAULT_HEARTBEAT_SECONDS);
    chrome.storage.local.set({
      orma_capture_interval: heartbeatSeconds,
      orma_groq_api_key: msg.apiKey || '',
    }, async () => {
      await chrome.alarms.clear(ALARM_NAME);
      ensureHeartbeat();
      startPeriodicTimer();
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg.type === 'CLEAR_TOKEN') {
    stopRecording().then(() => {
      chrome.storage.local.set({ orma_token: null, orma_recording: false });
      sendResponse({ ok: true });
    });
    return true;
  }
  if (msg.type === 'FORCE_CAPTURE') {
    chrome.storage.local.get(['orma_token'], async (d) => {
      if (!d.orma_token) { sendResponse({ ok: false }); return; }
      try {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (tab) {
          recentCaptures.delete(tab.id); // bypass debounce for manual
          await doCapture(tab, d.orma_token);
        }
        sendResponse({ ok: true });
      } catch (e) {
        sendResponse({ ok: false, error: e.message });
      }
    });
    return true;
  }
});

// ── Start / Stop ──────────────────────────────────────────────────────────────
async function startRecording(token) {
  if (token) await chrome.storage.local.set({ orma_token: token });
  await chrome.storage.local.set({ orma_recording: true });
  ensureHeartbeat();
  startPeriodicTimer();

  // Immediate capture of current tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab && !isSystemPage(tab.url || '')) {
      console.log('[Orma SW] Immediate capture on start:', tab.url?.slice(0, 60));
      recentCaptures.delete(tab.id);
      setTimeout(() => doCapture(tab, token), 500);
    }
  } catch (e) {
    console.warn('[Orma SW] Start immediate capture failed:', e.message);
  }

  // Ensure periodic captures continue even if the page does not change.
  ensureHeartbeat();

  console.log('[Orma SW] Recording started');
}

async function stopRecording() {
  await chrome.storage.local.set({ orma_recording: false });
  await chrome.alarms.clear(ALARM_NAME);
  stopPeriodicTimer();
  recentCaptures.clear();
  console.log('[Orma SW] Recording stopped');
}

// ── CORE: do the actual capture ───────────────────────────────────────────────
async function doCapture(tab, token) {
  const url = tab.url || '';
  console.log('[Orma SW] doCapture:', url.slice(0, 80));

  if (isSystemPage(url)) {
    console.log('[Orma SW] Skipping system page');
    return;
  }

  // ── Screenshot ─────────────────────────────────────────────────────────────
  let screenshot = '';
  try {
    // captureVisibleTab works here because this function is called from
    // tab events (onUpdated, onActivated) which run in a privileged context
    screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'jpeg',
      quality: 50,
    });
    console.log('[Orma SW] Screenshot OK —', Math.round(screenshot.length / 1024), 'KB');
  } catch (e) {
    console.warn('[Orma SW] Screenshot failed:', e.message);
    // Continue — save page metadata even without screenshot
  }

  // ── Page text ──────────────────────────────────────────────────────────────
  let pageText = '';
  let title = tab.title || 'Untitled';
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const el = document.querySelector('article, main, [role="main"]') || document.body;
        return {
          title: document.title,
          text: (el?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 3000),
        };
      },
    });
    if (results?.[0]?.result) {
      title = results[0].result.title || title;
      pageText = results[0].result.text || '';
    }
    console.log('[Orma SW] Text extracted:', pageText.length, 'chars');
  } catch (e) {
    console.warn('[Orma SW] Text extraction failed:', e.message);
  }

  // ── Domain ─────────────────────────────────────────────────────────────────
  let domain = '';
  try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch {}

  // ── POST to backend ────────────────────────────────────────────────────────
  try {
    const settings = await chrome.storage.local.get(['orma_groq_api_key']);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    if (settings.orma_groq_api_key) {
      headers['X-Groq-API-Key'] = settings.orma_groq_api_key;
    }

    console.log('[Orma SW] Posting to backend...');
    const res = await fetch(`${API_BASE}/captures`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ url, title, domain, pageText, screenshot }),
    });

    console.log('[Orma SW] Backend response:', res.status);

    if (res.status === 201) {
      const stored = await chrome.storage.local.get(['orma_capture_count']);
      const count = (stored.orma_capture_count || 0) + 1;
      await chrome.storage.local.set({ orma_capture_count: count });
      chrome.action.setBadgeText({ text: String(count) });
      chrome.action.setBadgeBackgroundColor({ color: '#3D5A80' });
      console.log(`[Orma SW] ✓ Capture #${count}: "${title}"`);
    } else if (res.status === 204) {
      console.log('[Orma SW] Duplicate — skipped');
    } else {
      const body = await res.text().catch(() => '');
      console.warn('[Orma SW] Backend error:', res.status, body.slice(0, 200));
    }
  } catch (e) {
    console.error('[Orma SW] Fetch error:', e.message);
  }
}
