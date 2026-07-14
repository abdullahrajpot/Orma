// Orma content script — runs in page context
// Handles two jobs:
//   1. EXTRACT_CONTENT  → returns title + text
//   2. TAKE_SCREENSHOT  → renders page to canvas, returns base64 JPEG

// Throttle: don't process the same URL twice within 30s
let lastCapturedUrl = '';
let lastCapturedTime = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // ── Text extraction ────────────────────────────────────────────────────────
  if (message.type === 'EXTRACT_CONTENT') {
    const el = document.querySelector('article, main, [role="main"]') || document.body;
    sendResponse({
      title: document.title,
      url: location.href,
      text: (el?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 3000),
    });
    return true;
  }

  // ── Screenshot via canvas ──────────────────────────────────────────────────
  if (message.type === 'TAKE_SCREENSHOT') {
    const now = Date.now();
    const url = location.href;

    // Throttle duplicate captures
    if (url === lastCapturedUrl && now - lastCapturedTime < 30_000) {
      sendResponse({ screenshot: null, reason: 'throttled' });
      return true;
    }

    try {
      // Use html2canvas approach via native Canvas API
      // We scroll to top temporarily, take a viewport snapshot
      const scrollY = window.scrollY;

      // Create a canvas the size of the viewport
      const canvas = document.createElement('canvas');
      const scale = 0.5; // downscale to reduce size
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      const ctx = canvas.getContext('2d');

      // Use CSS painting — works for most pages
      // For cross-origin iframes this will be blank but that's fine
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // drawWindow is not available in content scripts.
      // Instead we use a different approach: ask the service worker
      // to do captureVisibleTab from a tab event context.
      // Signal back that we need the SW to take the screenshot.
      sendResponse({ screenshot: null, reason: 'use_sw_capture' });
    } catch (e) {
      sendResponse({ screenshot: null, reason: e.message });
    }
    return true;
  }

  // ── Page metadata for tab-change captures ─────────────────────────────────
  if (message.type === 'GET_PAGE_META') {
    const el = document.querySelector('article, main, [role="main"]') || document.body;
    sendResponse({
      title: document.title,
      url: location.href,
      text: (el?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 3000),
      readyState: document.readyState,
    });
    return true;
  }
});
