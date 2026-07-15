const API = 'http://localhost:5000/api';
let statusInterval = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function showScreen(id) {
  document.getElementById('auth-screen').style.display = id === 'auth' ? '' : 'none';
  document.getElementById('main-screen').style.display = id === 'main' ? '' : 'none';
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = '';
}

function hideAuthError() {
  document.getElementById('auth-error').style.display = 'none';
}

async function apiPost(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

// ── Read state directly from storage (source of truth) ───────────────────────
async function readState() {
  return new Promise(resolve => {
    chrome.storage.local.get(
      ['orma_recording', 'orma_token', 'orma_capture_count', 'orma_user', 'orma_capture_interval', 'orma_groq_api_key'],
      resolve
    );
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  const state = await readState();

  if (!state.orma_token) {
    showScreen('auth');
    return;
  }

  // Try to verify with backend, but don't block on it
  let user = state.orma_user || null;
  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${state.orma_token}` },
    });
    if (res.ok) {
      user = await res.json();
      chrome.storage.local.set({ orma_user: user });
    } else if (res.status === 401) {
      // Token expired
      chrome.storage.local.remove(['orma_token', 'orma_user']);
      showScreen('auth');
      return;
    }
  } catch {
    // Backend offline — use cached user
  }

  showMainScreen(state.orma_token, user || { email: 'offline mode' });
}

// ── Main screen ───────────────────────────────────────────────────────────────
function showMainScreen(token, user) {
  showScreen('main');
  document.getElementById('user-email').textContent =
    user?.email || user?.name || 'recording your memory';

  // Read recording state directly from storage — don't trust service worker messages
  syncUI();
  loadSettingsIntoForm();

  // Poll every 2 seconds to keep UI in sync
  if (statusInterval) clearInterval(statusInterval);
  statusInterval = setInterval(syncUI, 2000);

  // Toggle handler
  const toggle = document.getElementById('recordToggle');
  toggle.addEventListener('change', async (e) => {
    const on = e.target.checked;
    // Disable toggle during transition to prevent double-clicks
    toggle.disabled = true;

    if (on) {
      // Send to service worker and also write directly to storage as backup
      await chrome.storage.local.set({ orma_recording: true });
      chrome.runtime.sendMessage({ type: 'START_RECORDING', token }, () => {
        toggle.disabled = false;
        syncUI();
      });
    } else {
      await chrome.storage.local.set({ orma_recording: false });
      chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }, () => {
        toggle.disabled = false;
        syncUI();
      });
    }
  });

  // Capture now button
  document.getElementById('captureNowBtn').addEventListener('click', async () => {
    const btn = document.getElementById('captureNowBtn');
    btn.textContent = 'Capturing…';
    btn.disabled = true;
    chrome.runtime.sendMessage({ type: 'FORCE_CAPTURE' }, () => {
      setTimeout(() => {
        btn.textContent = '📸 Capture now';
        btn.disabled = false;
        syncUI();
      }, 2000);
    });
  });
}

async function syncUI() {
  const state = await readState();
  const recording = state.orma_recording ?? false;
  const count = state.orma_capture_count ?? 0;

  // Update toggle (only if not being interacted with)
  const toggle = document.getElementById('recordToggle');
  if (!toggle.disabled) toggle.checked = recording;

  // Status dot
  const dot = document.getElementById('record-status-dot');
  dot.className = 'status-dot ' + (recording ? 'on' : 'off');

  // Labels
  document.getElementById('record-label').textContent =
    recording ? 'Recording…' : 'Recording off';
  document.getElementById('record-hint').textContent = recording
    ? 'Captures on every page visit and tab switch.'
    : 'Turn on to automatically capture every page you visit.';
  document.getElementById('capture-count').textContent =
    `${count} capture${count !== 1 ? 's' : ''} this session`;

  // Show/hide capture now button
  document.getElementById('captureNowBtn').style.display = recording ? '' : 'none';
}

function loadSettingsIntoForm() {
  const intervalInput = document.getElementById('captureIntervalInput');
  const apiKeyInput = document.getElementById('apiKeyInput');
  if (!intervalInput || !apiKeyInput) return;

  chrome.storage.local.get(['orma_capture_interval', 'orma_groq_api_key'], (data) => {
    intervalInput.value = data.orma_capture_interval || 30;
    apiKeyInput.value = data.orma_groq_api_key || '';
  });
}

async function saveSettings() {
  const intervalInput = document.getElementById('captureIntervalInput');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const statusEl = document.getElementById('settingsStatus');

  if (!intervalInput || !apiKeyInput || !statusEl) return;

  const interval = Math.max(10, parseInt(intervalInput.value, 10) || 30);
  const apiKey = apiKeyInput.value.trim();

  await chrome.storage.local.set({
    orma_capture_interval: interval,
    orma_groq_api_key: apiKey,
  });

  chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', interval, apiKey }, () => {
    statusEl.textContent = 'Settings saved.';
  });
}

// ── Auth: login ───────────────────────────────────────────────────────────────
document.getElementById('showSignup').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup-form').style.display = '';
  hideAuthError();
});

document.getElementById('showLogin').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('login-form').style.display = '';
  hideAuthError();
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) return showAuthError('Email and password required.');

  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Logging in…'; btn.disabled = true;
  const { status, data } = await apiPost('/auth/login', { email, password });
  btn.textContent = 'Log in'; btn.disabled = false;

  if (status === 200 && data?.token) {
    const user = data.user || { email };
    await chrome.storage.local.set({ orma_token: data.token, orma_user: user });
    chrome.runtime.sendMessage({ type: 'SET_TOKEN', token: data.token });
    showMainScreen(data.token, user);
  } else {
    showAuthError(data?.error || 'Login failed. Check your credentials.');
  }
});

// ── Auth: signup ──────────────────────────────────────────────────────────────
document.getElementById('signupBtn').addEventListener('click', async () => {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  if (!name || !email || !password) return showAuthError('All fields required.');

  const btn = document.getElementById('signupBtn');
  btn.textContent = 'Creating…'; btn.disabled = true;
  const { status, data } = await apiPost('/auth/signup', { name, email, password });
  btn.textContent = 'Create account'; btn.disabled = false;

  if (status === 201 && data?.token) {
    const user = data.user || { name, email };
    await chrome.storage.local.set({ orma_token: data.token, orma_user: user });
    chrome.runtime.sendMessage({ type: 'SET_TOKEN', token: data.token });
    showMainScreen(data.token, user);
  } else {
    showAuthError(data?.error || 'Signup failed. Try again.');
  }
});

document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
  await saveSettings();
});

// ── Quick ask ──────────────────────────────────────────────────────────────────
document.getElementById('quickAskBtn').addEventListener('click', quickAsk);
document.getElementById('quickAsk').addEventListener('keydown', e => {
  if (e.key === 'Enter') quickAsk();
});

async function quickAsk() {
  const input = document.getElementById('quickAsk');
  const q = input.value.trim();
  if (!q) return;

  const answerEl = document.getElementById('quickAnswer');
  answerEl.style.display = '';
  answerEl.textContent = 'Searching your memory…';

  const state = await readState();
  if (!state.orma_token) { answerEl.textContent = 'Please log in first.'; return; }

  try {
    const res = await fetch(`${API}/captures/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.orma_token}`,
      },
      body: JSON.stringify({ message: q }),
    });
    const data = await res.json();
    answerEl.textContent = data.answer || 'No answer found.';
  } catch {
    answerEl.textContent = 'Could not reach the backend. Is it running on port 5000?';
  }
}

// ── Other buttons ─────────────────────────────────────────────────────────────
document.getElementById('openPanel').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.sidePanel.open({ windowId: tab?.windowId });
});

document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:5173' });
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  if (statusInterval) clearInterval(statusInterval);
  chrome.runtime.sendMessage({ type: 'CLEAR_TOKEN' });
  await chrome.storage.local.remove([
    'orma_token', 'orma_user', 'orma_capture_count', 'orma_recording',
  ]);
  chrome.action.setBadgeText({ text: '' });
  showScreen('auth');
});

// ── Boot ───────────────────────────────────────────────────────────────────────
init();
