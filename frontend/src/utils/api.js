const BASE = '/api'

function getToken() {
  return localStorage.getItem('sp_token') || ''
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
}

export async function login(username, password) {
  const r = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!r.ok) throw new Error('Credenciales incorrectas')
  const data = await r.json()
  localStorage.setItem('sp_token', data.token)
  localStorage.setItem('sp_user', JSON.stringify(data.user))
  return data
}

export function logout() {
  localStorage.removeItem('sp_token')
  localStorage.removeItem('sp_user')
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('sp_user') || 'null') }
  catch { return null }
}

export function isAuthenticated() {
  return !!localStorage.getItem('sp_token')
}

async function apiFetch(url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: authHeaders() })
  if (r.status === 401) throw new Error('401')
  if (!r.ok) throw new Error(`Error ${r.status}`)
  return r.json()
}

export const fetchConversations = () => apiFetch(`${BASE}/conversations`)
export const fetchMessages      = (id) => apiFetch(`${BASE}/conversations/${id}/messages`)
export const fetchStats         = () => apiFetch(`${BASE}/stats`)
export const fetchContacts      = () => apiFetch(`${BASE}/contacts`)
export const fetchBotSessions  = () => apiFetch(`${BASE}/bot-sessions`)
export const fetchBotSession   = (id) => apiFetch(`${BASE}/bot-sessions/${encodeURIComponent(id)}`)
