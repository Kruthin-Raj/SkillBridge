const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
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
    if (response.status === 401) tokenStore.clear();
    throw new ApiError(response.status, payload.error || response.statusText, payload.details);
  }

  return payload;
}

export const api = {
  auth: {
    requestOtp: (email) =>
      request('/api/auth/request-otp', { method: 'POST', body: { email }, auth: false }),
    verifyOtp: (email, code) =>
      request('/api/auth/verify-otp', { method: 'POST', body: { email, code }, auth: false }),
    me: () => request('/api/auth/me'),
  },

  users: {
    get: (id) => request(`/api/users/${id}`, { auth: false }),
    updateMe: (patch) => request('/api/users/me', { method: 'PATCH', body: patch }),
    updateAvatar: (avatar_url) =>
      request('/api/users/me/avatar', { method: 'PATCH', body: { avatar_url } }),
  },

  listings: {
    list: (mode) => request(`/api/listings${mode ? `?mode=${mode}` : ''}`, { auth: false }),
    get: (id) => request(`/api/listings/${id}`, { auth: false }),
    create: (listing) => request('/api/listings', { method: 'POST', body: listing }),
    setStatus: (id, status) =>
      request(`/api/listings/${id}/status`, { method: 'PATCH', body: { status } }),
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

  notifications: {
    list: () => request('/api/notifications'),
    markRead: () => request('/api/notifications/read', { method: 'PATCH' }),
  },
};
