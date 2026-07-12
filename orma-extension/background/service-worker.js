chrome.runtime.onInstalled.addListener(() => {
  console.log('[Orma] installed')
})

// Let people open the side panel by clicking the toolbar icon too,
// not just the "Chat" button inside the popup.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch((error) => console.error('[Orma] sidePanel setup failed:', error))

// Placeholder for future background work, e.g.:
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   if (msg.type === 'SAVE_MEMORY') {
//     // forward extracted content to the Orma backend for
//     // chunking + embedding, then respond with the saved record.
//   }
// })
