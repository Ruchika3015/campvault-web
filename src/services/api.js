const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Low-level fetch wrapper for the CampusJugaad REST API.
 * Automatically attaches the JWT bearer token when available.
 * Returns parsed JSON or throws a structured error.
 */
export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('cj_token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, config);
  } catch {
    throw { status: 0, message: 'Exchange unavailable. Check your connection and try again.' };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (response.status === 401 ? 'Invalid email or password.' : 'Something went wrong on the exchange. Please try again.');
    throw { status: response.status, message, data };
  }

  return data;
}

export const api = {
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

  getProfile: () => apiRequest('/api/v1/users/profile'),

  getColleges: () => apiRequest('/api/v1/colleges'),

  // ─── JUGAADS ───────────────────────────────────────────────────
  // POST /api/v1/jugaads — create a new Jugaad
  createJugaad: (payload) =>
    apiRequest('/api/v1/jugaads', { method: 'POST', body: JSON.stringify(payload) }),

  // GET /api/v1/jugaads/discover — get recommended Jugaads for the current user
  getDiscoveryFeed: () => apiRequest('/api/v1/jugaads/discover'),

  // GET /api/v1/jugaads/mine — get Jugaads posted by the current user
  getMyJugaads: () => apiRequest('/api/v1/jugaads/mine'),

  // GET /api/v1/jugaads/:id — get a single Jugaad with full details
  getJugaad: (id) => apiRequest(`/api/v1/jugaads/${id}`),

  // PATCH /api/v1/jugaads/:id/status — update Jugaad status
  updateJugaadStatus: (id, status) =>
    apiRequest(`/api/v1/jugaads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // ─── INTERESTS & REQUESTS ───────────────────────────────────────
  // POST /api/v1/jugaads/:id/interest — express interest in a Jugaad
  expressInterest: (jugaadId) =>
    apiRequest(`/api/v1/jugaads/${jugaadId}/interest`, { method: 'POST', body: JSON.stringify({}) }),

  // POST /api/v1/jugaads/:id/not-interested — mark as not interested (recommendation feedback)
  markNotInterested: (jugaadId) =>
    apiRequest(`/api/v1/jugaads/${jugaadId}/not-interested`, { method: 'POST', body: JSON.stringify({}) }),

  // GET /api/v1/requests/received — get requests received on my posted Jugaads
  getReceivedRequests: () => apiRequest('/api/v1/requests/received'),

  // GET /api/v1/requests/sent — get my sent requests (interests + bargains)
  getMyRequests: () => apiRequest('/api/v1/requests/sent'),

  // PATCH /api/v1/requests/:id/accept — poster accepts a request
  acceptRequest: (requestId) =>
    apiRequest(`/api/v1/requests/${requestId}/accept`, { method: 'PATCH', body: JSON.stringify({}) }),

  // PATCH /api/v1/requests/:id/reject — poster rejects a request
  rejectRequest: (requestId) =>
    apiRequest(`/api/v1/requests/${requestId}/reject`, { method: 'PATCH', body: JSON.stringify({}) }),

  // ─── BARGAINING / NEGOTIATION ───────────────────────────────────
  // POST /api/v1/jugaads/:id/bargain — send a bargain offer
  sendBargain: (jugaadId, payload) =>
    apiRequest(`/api/v1/jugaads/${jugaadId}/bargain`, { method: 'POST', body: JSON.stringify(payload) }),

  // POST /api/v1/requests/:id/counter — poster counters a bargain offer
  counterOffer: (requestId, payload) =>
    apiRequest(`/api/v1/requests/${requestId}/counter`, { method: 'POST', body: JSON.stringify(payload) }),

  // POST /api/v1/requests/:id/accept-offer — accept a bargain/counter offer
  acceptOffer: (requestId) =>
    apiRequest(`/api/v1/requests/${requestId}/accept-offer`, { method: 'POST', body: JSON.stringify({}) }),

  // ─── CONVERSATIONS & MESSAGES ───────────────────────────────────
  // GET /api/v1/conversations — get conversations for the current user
  getConversations: () => apiRequest('/api/v1/conversations'),

  // GET /api/v1/conversations/:id — get a single conversation with messages
  getConversation: (id) => apiRequest(`/api/v1/conversations/${id}`),

  // POST /api/v1/conversations/:id/messages — send a message
  sendMessage: (conversationId, text) =>
    apiRequest(`/api/v1/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),

  // ─── NOTIFICATIONS ──────────────────────────────────────────────
  // GET /api/v1/notifications — get notifications for the current user
  getNotifications: () => apiRequest('/api/v1/notifications'),

  // PATCH /api/v1/notifications/:id/read — mark a notification as read
  markNotificationRead: (id) =>
    apiRequest(`/api/v1/notifications/${id}/read`, { method: 'PATCH', body: JSON.stringify({}) }),

  // ─── PROFILE ──────────────────────────────────────────────────────
  // GET /api/v1/users/profile — get the current user's full profile
  // (already exists as getProfile above; extended profile fields below)

  // PATCH /api/v1/users/profile — update profile fields (bio, location, branch, etc.)
  updateProfile: (payload) =>
    apiRequest('/api/v1/users/profile', { method: 'PATCH', body: JSON.stringify(payload) }),

  // POST /api/v1/users/profile/skills — add a skill
  addProfileSkill: (skill) =>
    apiRequest('/api/v1/users/profile/skills', { method: 'POST', body: JSON.stringify({ skill }) }),

  // DELETE /api/v1/users/profile/skills/:id — remove a skill
  removeProfileSkill: (skillId) =>
    apiRequest(`/api/v1/users/profile/skills/${skillId}`, { method: 'DELETE' }),

  // POST /api/v1/users/profile/links — add a social/professional link
  addProfileLink: (payload) =>
    apiRequest('/api/v1/users/profile/links', { method: 'POST', body: JSON.stringify(payload) }),

  // DELETE /api/v1/users/profile/links/:id — remove a link
  removeProfileLink: (linkId) =>
    apiRequest(`/api/v1/users/profile/links/${linkId}`, { method: 'DELETE' }),

  // POST /api/v1/users/profile/projects — add a project
  addProfileProject: (payload) =>
    apiRequest('/api/v1/users/profile/projects', { method: 'POST', body: JSON.stringify(payload) }),

  // PATCH /api/v1/users/profile/projects/:id — update a project
  updateProfileProject: (projectId, payload) =>
    apiRequest(`/api/v1/users/profile/projects/${projectId}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // DELETE /api/v1/users/profile/projects/:id — delete a project
  removeProfileProject: (projectId) =>
    apiRequest(`/api/v1/users/profile/projects/${projectId}`, { method: 'DELETE' }),

  // POST /api/v1/users/profile/certifications — add a certification
  addProfileCertification: (payload) =>
    apiRequest('/api/v1/users/profile/certifications', { method: 'POST', body: JSON.stringify(payload) }),

  // DELETE /api/v1/users/profile/certifications/:id — remove a certification
  removeProfileCertification: (certId) =>
    apiRequest(`/api/v1/users/profile/certifications/${certId}`, { method: 'DELETE' }),

  // POST /api/v1/users/profile/resume — upload/replace resume (multipart)
  // NOTE: Frontend UI exists; backend file upload endpoint must be connected when available.
  uploadResume: (formData) =>
    apiRequest('/api/v1/users/profile/resume', { method: 'POST', body: formData }),

  // DELETE /api/v1/users/profile/resume — remove resume
  removeResume: () =>
    apiRequest('/api/v1/users/profile/resume', { method: 'DELETE' }),

  // ─── SETTINGS ──────────────────────────────────────────────────────
  // GET /api/v1/users/settings — get all user settings
  getSettings: () => apiRequest('/api/v1/users/settings'),

  // PATCH /api/v1/users/settings — update settings (notifications, privacy, etc.)
  updateSettings: (payload) =>
    apiRequest('/api/v1/users/settings', { method: 'PATCH', body: JSON.stringify(payload) }),

  // PATCH /api/v1/users/password — change password
  changePassword: (payload) =>
    apiRequest('/api/v1/users/password', { method: 'PATCH', body: JSON.stringify(payload) }),

  // GET /api/v1/users/sessions — list active sessions
  getSessions: () => apiRequest('/api/v1/users/sessions'),

  // DELETE /api/v1/users/sessions — logout all devices
  logoutAllDevices: () =>
    apiRequest('/api/v1/users/sessions', { method: 'DELETE' }),

  // GET /api/v1/users/data — download/export user data
  downloadMyData: () => apiRequest('/api/v1/users/data'),

  // DELETE /api/v1/users/account — delete account
  deleteAccount: () =>
    apiRequest('/api/v1/users/account', { method: 'DELETE' }),
};
