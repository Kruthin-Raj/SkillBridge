export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'skillbridge.token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(status, message, details) {
    // When the server returns field-level validation details, append them
    // to the message so the UI shows what actually went wrong.
    const fullMessage =
      Array.isArray(details) && details.length
        ? `${message}: ${details.map((d) => `${d.field ? d.field + ' – ' : ''}${d.message}`).join(', ')}`
        : message;
    super(fullMessage);
    this.status = status;
    this.details = details;
  }
}

/**
 * Single place every network call goes through: attaches the JWT, parses the
 * response and turns a non-2xx into a throwable ApiError.
 */
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    // An expired or tampered token should not leave the UI in a signed-in state.
    if (response.status === 401) {
      tokenStore.clear();
      window.dispatchEvent(new Event('unauthorized'));
    }
    throw new ApiError(response.status, payload.error || response.statusText, payload.details);
  }

  return payload;
}

export const api = {
  auth: {
    requestOtp: (email) =>
      request('/api/auth/request-otp', { method: 'POST', body: { email }, auth: false }),
    login: (email, password) =>
      request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
    register: (email, password, code, roll_number) =>
      request('/api/auth/register', { method: 'POST', body: { email, password, code, roll_number }, auth: false }),
    resetPassword: (email, code, password) =>
      request('/api/auth/reset-password', { method: 'POST', body: { email, code, password }, auth: false }),
    setPassword: (password) =>
      request('/api/auth/set-password', { method: 'POST', body: { password } }),
    me: () => request('/api/auth/me'),
  },

  users: {
    search: (q) => request(`/api/users/search?q=${encodeURIComponent(q)}`, { auth: false }),
    get: (id) => request(`/api/users/${id}`, { auth: false }),
    updateMe: (patch) => request('/api/users/me', { method: 'PATCH', body: patch }),
    updateAvatar: (avatar_url) =>
      request('/api/users/me/avatar', { method: 'PATCH', body: { avatar_url } }),
  },

  listings: {
    list: (mode) => request(`/api/listings${mode ? `?mode=${mode}` : ''}`, { auth: false }),
    forOwner: (ownerId) => request(`/api/listings?owner_id=${ownerId}`, { auth: false }),
    get: (id) => request(`/api/listings/${id}`),
    create: (listing) => request('/api/listings', { method: 'POST', body: listing }),
    setStatus: (id, status) =>
      request(`/api/listings/${id}/status`, { method: 'PATCH', body: { status } }),
    setWorkerStatus: (id, worker_status) =>
      request(`/api/listings/${id}/worker-status`, { method: 'PATCH', body: { worker_status } }),
  },

  messages: {
    get: (listingId) => request(`/api/messages/${listingId}`),
    send: (listingId, content) => request(`/api/messages/${listingId}`, { method: 'POST', body: { content } }),
  },

  bids: {
    forListing: (listingId) => request(`/api/bids?listing_id=${listingId}`),
    create: (bid) => request('/api/bids', { method: 'POST', body: bid }),
    accept: (id) => request(`/api/bids/${id}/accept`, { method: 'POST' }),
  },

  exchanges: {
    matches: () => request('/api/exchanges/matches'),
    mine: () => request('/api/exchanges'),
    propose: (proposal) => request('/api/exchanges', { method: 'POST', body: proposal }),
    accept: (id) => request(`/api/exchanges/${id}/accept`, { method: 'POST' }),
  },

  reviews: {
    forUser: (userId) => request(`/api/reviews?user_id=${userId}`, { auth: false }),
    create: (review) => request('/api/reviews', { method: 'POST', body: review }),
  },

  dashboard: {
    get: () => request('/api/dashboard'),
  },

  reports: {
    create: (report) => request('/api/reports', { method: 'POST', body: report }),
  },

  notifications: {
    list: () => request('/api/notifications'),
    markRead: () => request('/api/notifications/read', { method: 'PATCH' }),
  },

  admin: {
    getUsers: () => request('/api/admin/users'),
    getReports: () => request('/api/admin/reports'),
    warnUser: (id, payload) => request(`/api/admin/users/${id}/warn`, { method: 'POST', body: payload }),
    blockUser: (id, payload) => request(`/api/admin/users/${id}/block`, { method: 'POST', body: payload }),
    unblockUser: (id, payload) => request(`/api/admin/users/${id}/unblock`, { method: 'POST', body: payload }),
  },
};
