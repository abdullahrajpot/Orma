// Orma popup — real chrome.storage.local persistence, real active-tab read.
// No backend required for this to work; swap STORAGE_KEY reads/writes for
// fetch() calls to the Orma API once Mahnoor/Abdullah's backend is live.

const STORAGE_KEY = 'orma_memories'

const seedMemories = [
  {
    id: 's1',
    title: 'Vector Databases, Explained',
    domain: 'pinecone.io',
    url: 'https://pinecone.io/learn/vector-databases',
    project: 'RAG Research',
    savedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 's2',
    title: 'Chunking Strategies for RAG',
    domain: 'docs.llamaindex.ai',
    url: 'https://docs.llamaindex.ai/chunking',
    project: 'RAG Research',
    savedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 's3',
    title: 'Manifest V3 Migration Guide',
    domain: 'developer.chrome.com',
    url: 'https://developer.chrome.com/docs/extensions/mv3',
    project: 'Extension Build',
    savedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
]

function getStore() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      resolve(res[STORAGE_KEY] ?? null)
    })
  })
}

function setStore(list) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: list }, resolve)
  })
}

function timeAgo(ts) {
  const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

function render(list, query = '') {
  const el = document.getElementById('list')
  const q = query.trim().toLowerCase()
  const filtered = q ? list.filter((m) => m.title.toLowerCase().includes(q)) : list

  if (filtered.length === 0) {
    el.innerHTML = `<p class="empty">Nothing saved yet.</p>`
    return
  }

  el.innerHTML = filtered
    .slice(0, 6)
    .map(
      (m) => `
      <div class="card" data-url="${m.url}">
        <div class="card-title">${m.title}</div>
        <div class="card-meta">
          <span>${m.domain}</span>
          <span class="tag">${m.project}</span>
        </div>
      </div>`
    )
    .join('')

  el.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      chrome.tabs.create({ url: card.dataset.url })
    })
  })
}

async function init() {
  let list = await getStore()
  if (!list) {
    list = seedMemories
    await setStore(list)
  }
  render(list)

  // Show current tab so the person knows what "Save this page" will capture
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const currentTabEl = document.getElementById('currentTab')
  if (tab?.url) {
    currentTabEl.textContent = `Will save: ${tab.title}`
  }

  document.getElementById('search').addEventListener('input', (e) => {
    render(list, e.target.value)
  })

  document.getElementById('saveBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveBtn')
    btn.disabled = true
    btn.textContent = 'Saving…'

    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    let domain = ''
    try {
      domain = new URL(activeTab.url).hostname.replace('www.', '')
    } catch {
      domain = activeTab.url
    }

    // Simulates: content script extraction → chunk → embed → summarize.
    // Real version: chrome.tabs.sendMessage(activeTab.id, {type: 'EXTRACT'})
    // then POST the cleaned content to the Orma backend.
    await new Promise((r) => setTimeout(r, 700))

    const newMemory = {
      id: String(Date.now()),
      title: activeTab.title,
      domain,
      url: activeTab.url,
      project: 'Unsorted',
      savedAt: Date.now(),
    }
    list = [newMemory, ...list]
    await setStore(list)
    render(list)

    btn.textContent = 'Saved ✓'
    setTimeout(() => {
      btn.textContent = 'Save this page'
      btn.disabled = false
    }, 1200)
  })

  document.getElementById('openPanel').addEventListener('click', () => {
    chrome.sidePanel.open({ windowId: tab.windowId })
  })
  document.getElementById('footChat').addEventListener('click', () => {
    chrome.sidePanel.open({ windowId: tab.windowId })
  })
}

init()
