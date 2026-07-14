import axios from 'axios';

const BASE = 'http://localhost:5000/api';

// ── Auth helpers ─────────────────────────────────────────────────────────────
export function getToken() { return localStorage.getItem('orma_token'); }
export function setToken(t) { localStorage.setItem('orma_token', t); }
export function removeToken() { localStorage.removeItem('orma_token'); }
export function getUser() {
  try { return JSON.parse(localStorage.getItem('orma_user') || 'null'); } catch { return null; }
}
export function setUser(u) { localStorage.setItem('orma_user', JSON.stringify(u)); }
export function removeUser() { localStorage.removeItem('orma_user'); }

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  const res = await axios.post(`${BASE}/auth/login`, { email, password });
  setToken(res.data.token);
  setUser(res.data.user);
  return res.data;
}

export async function signup(name, email, password) {
  const res = await axios.post(`${BASE}/auth/signup`, { name, email, password });
  setToken(res.data.token);
  setUser(res.data.user);
  return res.data;
}

export function logout() {
  removeToken();
  removeUser();
}

export async function getProfile() {
  const res = await axios.get(`${BASE}/auth/me`, { headers: authHeaders() });
  return res.data;
}

// ── Captures ─────────────────────────────────────────────────────────────────
export async function getCaptures({ limit = 50, skip = 0, date, search } = {}) {
  const params = { limit, skip };
  if (date) params.date = date;
  if (search) params.search = search;
  const res = await axios.get(`${BASE}/captures`, { headers: authHeaders(), params });
  return res.data; // { captures, total }
}

export async function getCapture(id) {
  const res = await axios.get(`${BASE}/captures/${id}`, { headers: authHeaders() });
  return res.data;
}

export async function deleteCapture(id) {
  const res = await axios.delete(`${BASE}/captures/${id}`, { headers: authHeaders() });
  return res.data;
}

export async function getDailyStats() {
  const res = await axios.get(`${BASE}/captures/stats/daily`, { headers: authHeaders() });
  return res.data; // [{ _id: 'YYYY-MM-DD', count: N }]
}

// ── Chat ─────────────────────────────────────────────────────────────────────
export async function chatWithMemories(message) {
  const res = await axios.post(
    `${BASE}/captures/chat`,
    { message },
    { headers: authHeaders() }
  );
  return res.data; // { answer, sources }
}

// ── Legacy aliases so old pages don't break ──────────────────────────────────
export async function getMemories() {
  const { captures } = await getCaptures({ limit: 50 });
  return captures.map(c => ({
    id: c._id,
    title: c.title,
    url: c.url,
    domain: c.domain,
    summary: c.summary,
    category: c.category,
    savedAt: c.capturedAt,
    projectId: c.category?.toLowerCase().replace(/[^a-z]/g, '-') || 'general',
  }));
}
export async function getProjects() { return []; }
export async function searchMemories(q) {
  if (!q) return getMemories();
  const { captures } = await getCaptures({ search: q });
  return captures.map(c => ({ id: c._id, title: c.title, summary: c.summary, projectId: c.category }));
}
export async function getMemory(id) { return getCapture(id); }
export async function deleteMemory(id) { return deleteCapture(id); }
