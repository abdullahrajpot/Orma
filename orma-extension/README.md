# Orma — Chrome Extension (Browser Extension UI)

Manifest V3 extension: popup + side panel, both using the same
locked Slate Ledger palette as the React dashboard. No build step —
plain HTML/CSS/JS, so it loads directly in Chrome.

## Load it in Chrome
1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** → select this `orma-extension` folder
4. Pin the Orma icon to the toolbar

## What actually works right now
- **Popup** (`popup/`) — reads the active tab's title/URL via `chrome.tabs`,
  saves it to `chrome.storage.local` on "Save this page" (real
  persistence, survives closing the popup), search box filters the
  saved list live.
- **Side panel** (`sidepanel/`) — opens from the 💬 button in the popup
  or the toolbar icon. Chat UI reads from the same `chrome.storage.local`
  list and does a simple keyword match to simulate RAG until the real
  backend is wired in.
- **Content script** (`content/content-script.js`) — listens for an
  `EXTRACT_CONTENT` message and returns the page's title/URL/text; this
  is the hook point for Readability + Turndown cleaning later.
- **Background service worker** (`background/service-worker.js`) —
  registers the side panel behavior; has a commented placeholder for the
  future save/embedding queue.

## Wiring up the real backend
Every place that currently reads/writes `chrome.storage.local` is
commented with the equivalent `fetch()` call to the planned API
(`POST /api/memories`, `POST /api/chat`, etc.) — same contract as
`src/lib/api.js` in the dashboard project, so both frontends talk to the
backend the same way.
