// Orma content script.
// Runs on every page. For now it only exposes a message handler that
// returns cleaned page text on request — the popup/service worker calls
// this before saving a memory. Swap in Readability + Turndown here
// (per the project doc's tech stack) once that dependency is bundled.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_CONTENT') {
    const title = document.title
    const text = document.body?.innerText?.slice(0, 5000) ?? ''
    sendResponse({ title, url: location.href, text })
  }
  return true
})
