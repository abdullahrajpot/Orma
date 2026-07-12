import { memories, projects, currentUser } from './mockData'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// GET /api/memories
export async function getMemories() {
  await delay(400)
  return memories
  // return fetch(`${BASE_URL}/memories`, { credentials: 'include' }).then((r) => r.json())
}

// GET /api/memories/:id
export async function getMemory(id) {
  await delay(300)
  const found = memories.find((m) => m.id === id)
  if (!found) throw new Error('Memory not found')
  return found
  // return fetch(`${BASE_URL}/memories/${id}`, { credentials: 'include' }).then((r) => r.json())
}

// POST /api/memories  { url }
export async function saveMemory(url) {
  await delay(1600) // simulates: fetch page -> clean -> chunk -> embed -> summarize
  return {
    id: String(memories.length + 1),
    title: 'New saved page',
    url,
    domain: new URL(url).hostname.replace('www.', ''),
    projectId: projects[0].id,
    savedAt: new Date().toISOString(),
    summary: 'Orma is generating a summary for this page.',
    tags: [],
  }
  // return fetch(`${BASE_URL}/memories`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   credentials: 'include',
  //   body: JSON.stringify({ url }),
  // }).then((r) => r.json())
}

// DELETE /api/memories/:id
export async function deleteMemory(id) {
  await delay(300)
  return { id, deleted: true }
  // return fetch(`${BASE_URL}/memories/${id}`, { method: 'DELETE', credentials: 'include' })
}

// GET /api/memories/search?q=
export async function searchMemories(query) {
  await delay(350)
  const q = query.trim().toLowerCase()
  if (!q) return memories
  return memories.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q))
  )
  // return fetch(`${BASE_URL}/memories/search?q=${encodeURIComponent(query)}`, {
  //   credentials: 'include',
  // }).then((r) => r.json())
}

// GET /api/projects
export async function getProjects() {
  await delay(250)
  return projects
  // return fetch(`${BASE_URL}/projects`, { credentials: 'include' }).then((r) => r.json())
}

// POST /api/chat  { message }
export async function chatWithMemories(message) {
  await delay(1200)
  const hit = memories.find((m) =>
    message.toLowerCase().includes('chunk') ? m.id === '2' : false
  )
  return {
    answer: hit
      ? `You saved a note that ~50-token overlap between chunks preserves context across boundaries.`
      : `Based on what you've saved, here's a synthesized answer to "${message}".`,
    sources: hit ? [hit] : [memories[0]],
  }
  // return fetch(`${BASE_URL}/chat`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   credentials: 'include',
  //   body: JSON.stringify({ message }),
  // }).then((r) => r.json())
}

// GET /api/user/profile
export async function getProfile() {
  await delay(200)
  return currentUser
  // return fetch(`${BASE_URL}/user/profile`, { credentials: 'include' }).then((r) => r.json())
}

// POST /api/auth/login  { email, password }
export async function login(email, password) {
  await delay(600)
  return { token: 'demo-token', user: { email } }
  // return fetch(`${BASE_URL}/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // }).then((r) => r.json())
}

// POST /api/auth/signup  { name, email, password }
export async function signup(name, email, password) {
  await delay(600)
  return { token: 'demo-token', user: { name, email } }
  // return fetch(`${BASE_URL}/auth/signup`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, email, password }),
  // }).then((r) => r.json())
}
