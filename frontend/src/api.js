// ============================================
// MAKATRON BROKER — API CLIENT
// ============================================

// ---- API BASE ----
// In development (running on localhost), hit the local backend.
// In production (deployed on Netlify), hit Render.
const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://makatron-broker-api.onrender.com'

console.log('[API] Using base URL:', API_BASE)

// ---- TOKEN MANAGEMENT ----
export function saveToken(token) {
  localStorage.setItem('mk_token', token)
}

export function getToken() {
  return localStorage.getItem('mk_token')
}

export function clearToken() {
  localStorage.removeItem('mk_token')
}

export function isLoggedIn() {
  return !!getToken()
}

// ---- REGISTER ----
export async function register(email, password) {
  const body = new URLSearchParams({ email, password })
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Registration failed')
  return data
}

// ---- LOGIN ----
export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password })
  const res = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Login failed')
  saveToken(data.access_token)
  return data
}

// ---- GET MY PROFILE ----
export async function getMyProfile() {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Failed to load profile')
  return res.json()
}

// ---- GET MY BALANCES ----
export async function getMyBalances() {
  const res = await fetch(`${API_BASE}/users/me/balances`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Failed to load balances')
  return res.json()
}

// ---- GET MY WALLET ADDRESSES ----
export async function getMyWallets() {
  const res = await fetch(`${API_BASE}/wallets/my-addresses`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Failed to load wallets')
  return res.json()
}

// ---- GET MY POSITIONS ----
export async function getMyPositions() {
  const res = await fetch(`${API_BASE}/positions`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Failed to load positions')
  return res.json()
}

// ---- CLOSE POSITION ----
export async function closePosition(asset, currentMarketPrice) {
  const body = new URLSearchParams({
    current_market_price: String(currentMarketPrice),
  })
  const res = await fetch(`${API_BASE}/positions/${asset}/close`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${getToken()}`,
    },
    body,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Failed to close position')
  return data
}

// ---- LOGOUT ----
export function logout() {
  clearToken()
  window.location.href = '/login'
}

// ============================================
// ADMIN ENDPOINTS
// ============================================

// ---- ADMIN: LIST USERS ----
export async function adminListUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Admin access required')
  return res.json()
}

// ---- ADMIN: PLATFORM STATS ----
export async function adminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Admin access required')
  return res.json()
}

// ---- ADMIN: FREEZE USER ----
export async function adminFreezeUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/freeze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Failed to freeze user')
  return res.json()
}

// ---- ADMIN: UNFREEZE USER ----
export async function adminUnfreezeUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/unfreeze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Failed to unfreeze user')
  return res.json()
}

// ---- ADMIN: CREDIT USER ----
export async function adminCreditUser(userId, asset, amount) {
  const body = new URLSearchParams({ asset, amount })
  const res = await fetch(`${API_BASE}/admin/users/${userId}/credit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${getToken()}`,
    },
    body,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to credit user')
  }
  return res.json()
}

// ---- ADMIN: DEBIT USER ----
export async function adminDebitUser(userId, asset, amount) {
  const body = new URLSearchParams({ asset, amount })
  const res = await fetch(`${API_BASE}/admin/users/${userId}/debit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${getToken()}`,
    },
    body,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Failed to debit user')
  }
  return res.json()
}

// ============================================
// ORDER ENGINE
// ============================================

// ---- PLACE ORDER ----
export async function placeOrder({
  symbol,
  side,
  orderType,
  quantity,
  price,
  currentMarketPrice,
}) {
  const body = new URLSearchParams({
    symbol,
    side,
    order_type: orderType,
    quantity: String(quantity),
    current_market_price: String(currentMarketPrice),
  })
  if (price !== undefined && price !== null && price !== '') {
    body.append('price', String(price))
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${getToken()}`,
    },
    body,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Failed to place order')
  return data
}

// ---- LIST MY ORDERS ----
export async function getMyOrders(statusFilter) {
  const url = statusFilter
    ? `${API_BASE}/orders?status_filter=${statusFilter}`
    : `${API_BASE}/orders`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Failed to load orders')
  return res.json()
}

// ---- CANCEL ORDER ----
export async function cancelMyOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || 'Failed to cancel order')
  return data
}

// ---- LIST MY TRADES ----
export async function getMyTrades() {
  const res = await fetch(`${API_BASE}/trades`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Failed to load trades')
  return res.json()
}