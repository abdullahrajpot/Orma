// Orma side panel chat — reads saved memories from chrome.storage.local
// and does a simple client-side keyword match to simulate RAG.
// Real version: POST the message to `${API_URL}/chat` and stream the
// response back (see src/lib/api.js in the dashboard project for the
// exact endpoint contract already agreed with the backend).

const STORAGE_KEY = 'orma_memories'
const messagesEl = document.getElementById('messages')

function addBubble(role, text, sources = []) {
  const div = document.createElement('div')
  div.className = `bubble ${role}`
  div.innerHTML = `<div>${text}</div>`
  if (sources.length) {
    const srcWrap = document.createElement('div')
    sources.forEach((s) => {
      const span = document.createElement('span')
      span.className = 'src'
      span.textContent = s.title
      span.addEventListener('click', () => chrome.tabs.create({ url: s.url }))
      srcWrap.appendChild(span)
    })
    div.appendChild(srcWrap)
  }
  messagesEl.appendChild(div)
  messagesEl.scrollTop = messagesEl.scrollHeight
}

function getMemories() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (res) => resolve(res[STORAGE_KEY] ?? []))
  })
}

addBubble(
  'assistant',
  "Ask me anything about what you've saved — I'll answer using only your own memories."
)

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const input = document.getElementById('input')
  const text = input.value.trim()
  if (!text) return

  addBubble('user', text)
  input.value = ''

  const thinking = document.createElement('div')
  thinking.className = 'bubble assistant'
  thinking.textContent = 'Reading your saved pages…'
  messagesEl.appendChild(thinking)
  messagesEl.scrollTop = messagesEl.scrollHeight

  const memories = await getMemories()
  const q = text.toLowerCase()
  const hit = memories.find((m) => q.split(' ').some((w) => w.length > 3 && m.title.toLowerCase().includes(w)))

  await new Promise((r) => setTimeout(r, 700))
  thinking.remove()

  if (hit) {
    addBubble('assistant', `Based on what you saved, here's what's relevant to "${text}".`, [hit])
  } else {
    addBubble('assistant', `I couldn't find a saved page closely matching that yet — try saving a few more pages first.`)
  }
})
