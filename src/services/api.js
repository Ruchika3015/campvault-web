const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://campvault-backend.onrender.com';
/**
 * Low-level fetch wrapper for CampusJugaad REST API.
 *
 * - Automatically attaches JWT
 * - Supports JSON requests
 * - Supports FormData requests
 * - Normalizes backend errors
 */
export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('cj_token');

  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;

  const headers = {
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(isFormData
      ? {}
      : {
          'Content-Type': 'application/json',
        }),

    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, config);
  } catch {
    throw {
      status: 0,
      message:
        'Exchange unavailable. Check your connection and try again.',
    };
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (response.status === 401
        ? 'Invalid email or password.'
        : 'Something went wrong on the exchange. Please try again.');

    throw {
      status: response.status,
      message,
      data,
    };
  }

  return data;
}

export const api = {
  // ================================================================
  // AUTH / USERS
  // ================================================================

  register: (payload) =>
    apiRequest('/api/v1/users/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    apiRequest('/api/v1/users/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: () =>
    apiRequest('/api/v1/users/profile'),

  // ================================================================
  // COLLEGES
  // ================================================================

  getColleges: () =>
    apiRequest('/api/v1/colleges'),

  // ================================================================
  // JUGAADS
  // ================================================================

  createJugaad: (payload) =>
    apiRequest('/api/v1/jugaads', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getDiscoveryFeed: () =>
    apiRequest('/api/v1/jugaads'),

  getMyJugaads: () =>
    apiRequest('/api/v1/jugaads/my'),

  getJugaad: (id) =>
    apiRequest(`/api/v1/jugaads/${id}`),

  updateJugaad: (id, payload) =>
    apiRequest(`/api/v1/jugaads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteJugaad: (id) =>
    apiRequest(`/api/v1/jugaads/${id}`, {
      method: 'DELETE',
    }),

  // ================================================================
  // INTEREST
  // ================================================================

  expressInterest: (jugaadId) =>
    apiRequest(`/api/v1/jugaads/${jugaadId}/interested`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  markNotInterested: (jugaadId) =>
    apiRequest(`/api/v1/jugaads/${jugaadId}/not-interested`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  // ================================================================
  // JUGAAD-SPECIFIC PROPOSALS
  // ================================================================

  submitProposal: (jugaadId, payload) =>
    apiRequest(`/api/v1/jugaads/${jugaadId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProposalsForJugaad: (jugaadId) =>
    apiRequest(`/api/v1/jugaads/${jugaadId}/proposals`),

  // ================================================================
  // PROPOSALS
  // Confirmed backend:
  // GET  /api/v1/proposals/my
  // GET  /api/v1/proposals/received
  // PUT  /api/v1/proposals/:id/accept
  // PUT  /api/v1/proposals/:id/reject
  // PUT  /api/v1/proposals/:id/withdraw
  // POST /api/v1/proposals/:id/counter-offer
  // GET  /api/v1/proposals/:id/counter-offers
  // ================================================================

  getMyProposals: () =>
    apiRequest('/api/v1/proposals/my'),

  getReceivedProposals: () =>
    apiRequest('/api/v1/proposals/received'),

  acceptProposal: (proposalId) =>
    apiRequest(`/api/v1/proposals/${proposalId}/accept`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),

  rejectProposal: (proposalId) =>
    apiRequest(`/api/v1/proposals/${proposalId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),

  withdrawProposal: (proposalId) =>
    apiRequest(`/api/v1/proposals/${proposalId}/withdraw`, {
      method: 'PUT',
      body: JSON.stringify({}),
    }),

  createCounterOffer: (proposalId, payload) =>
    apiRequest(`/api/v1/proposals/${proposalId}/counter-offer`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCounterOffers: (proposalId) =>
    apiRequest(`/api/v1/proposals/${proposalId}/counter-offers`),

  // ================================================================
  // CONVERSATIONS / MESSAGES
  // Confirmed backend:
  // GET  /api/v1/conversations
  // GET  /api/v1/conversations/:id/messages
  // POST /api/v1/conversations/:id/messages
  // ================================================================

  getConversations: () =>
    apiRequest('/api/v1/conversations'),

  getConversationMessages: (conversationId) =>
    apiRequest(
      `/api/v1/conversations/${conversationId}/messages`
    ),

  sendMessage: (conversationId, text) =>
    apiRequest(
      `/api/v1/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      }
    ),

  // ================================================================
// NOTIFICATIONS
// Confirmed backend:
// GET /api/v1/notifications
// PUT /api/v1/notifications/read-all
// PUT /api/v1/notifications/:id/read
// ================================================================

getNotifications: () =>
  apiRequest('/api/v1/notifications'),

markAllNotificationsRead: () =>
  apiRequest('/api/v1/notifications/read-all', {
    method: 'PUT',
    body: JSON.stringify({}),
  }),

markNotificationRead: (id) =>
  apiRequest(`/api/v1/notifications/${id}/read`, {
    method: 'PUT',
    body: JSON.stringify({}),
  }),
};