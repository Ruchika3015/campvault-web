const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://campvault-backend.onrender.com';


/**
 * ================================================================
 * LOW-LEVEL API REQUEST
 * ================================================================
 *
 * - Reads JWT from sessionStorage
 * - Automatically attaches Authorization header
 * - Supports JSON requests
 * - Supports FormData requests
 * - Normalizes backend errors
 */

export async function apiRequest(
  path,
  options = {}
) {

  /*
   * AuthContext stores the JWT as cj_token.
   */
  const token =
    sessionStorage.getItem(
      'cj_token'
    );


  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;


  const headers = {

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(isFormData
      ? {}
      : {
          'Content-Type':
            'application/json',
        }),

    ...(options.headers || {}),
  };


  const config = {
    ...options,
    headers,
  };


  let response;


  try {

    response =
      await fetch(
        `${BASE_URL}${path}`,
        config
      );

  } catch (error) {

    console.error(
      'API NETWORK ERROR:',
      error
    );


    throw {

      status: 0,

      message:
        'Exchange unavailable. Check your connection and try again.',

    };

  }


  let data = null;


  try {

    data =
      await response.json();

  } catch {

    data = null;

  }


  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
      (
        response.status === 401

          ? 'Your session has expired. Please log in again.'

          : response.status === 403

          ? 'You are not authorized to perform this action.'

          : response.status === 404

          ? 'Requested resource was not found.'

          : 'Something went wrong on the exchange. Please try again.'
      );


    console.error(
      'API ERROR:',
      {
        path,
        status:
          response.status,
        data,
      }
    );


    throw {

      status:
        response.status,

      message,

      data,

    };

  }


  return data;

}


/* ================================================================
   API
================================================================ */

export const api = {


  // ================================================================
  // AUTH / USERS
  // ================================================================


  // ------------------------------------------------
  // REGISTER
  // ------------------------------------------------

  register: (
    payload
  ) =>
    apiRequest(
      '/api/v1/users/register',
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  // ------------------------------------------------
  // LOGIN
  // ------------------------------------------------

  login: (
    payload
  ) =>
    apiRequest(
      '/api/v1/users/login',
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  // ------------------------------------------------
  // GET PROFILE
  // ------------------------------------------------

  getProfile: () =>
    apiRequest(
      '/api/v1/users/profile'
    ),


  // ------------------------------------------------
  // UPDATE PROFILE
  // ------------------------------------------------

  updateProfile: (
    payload
  ) =>
    apiRequest(
      '/api/v1/users/profile',
      {
        method: 'PUT',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  // ------------------------------------------------
  // CHANGE PASSWORD
  // ------------------------------------------------

  changePassword: (
    payload
  ) =>
    apiRequest(
      '/api/v1/users/password',
      {
        method: 'PUT',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  // ------------------------------------------------
  // DELETE ACCOUNT
  // ------------------------------------------------

  deleteAccount: (
    payload
  ) =>
    apiRequest(
      '/api/v1/users/account',
      {
        method: 'DELETE',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  // ================================================================
  // COLLEGES
  // ================================================================

  getColleges: () =>
    apiRequest(
      '/api/v1/colleges'
    ),


  // ================================================================
  // JUGAAD
  // ================================================================


  // ------------------------------------------------
  // CREATE JUGAAD
  // ------------------------------------------------

  createJugaad: (
    payload
  ) =>
    apiRequest(
      '/api/v1/jugaads',
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  // ------------------------------------------------
  // DISCOVERY FEED
  // ------------------------------------------------

  getDiscoveryFeed: () =>
    apiRequest(
      '/api/v1/jugaads'
    ),


  // ------------------------------------------------
  // MY JUGAAD POSTS
  // ------------------------------------------------

  getMyJugaads: () =>
    apiRequest(
      '/api/v1/jugaads/my'
    ),


  // ------------------------------------------------
  // GET ONE JUGAAD
  // ------------------------------------------------

  getJugaad: (
    id
  ) =>
    apiRequest(
      `/api/v1/jugaads/${id}`
    ),


  // ------------------------------------------------
  // UPDATE JUGAAD
  // ------------------------------------------------

  updateJugaad: (
    id,
    payload
  ) =>
    apiRequest(
      `/api/v1/jugaads/${id}`,
      {
        method: 'PUT',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  // ------------------------------------------------
  // DELETE / CANCEL JUGAAD
  // ------------------------------------------------

  deleteJugaad: (
    id
  ) =>
    apiRequest(
      `/api/v1/jugaads/${id}`,
      {
        method: 'DELETE',
      }
    ),


  // ================================================================
  // INTEREST
  // ================================================================


  // ------------------------------------------------
  // EXPRESS INTEREST
  // ------------------------------------------------

  expressInterest: (
    jugaadId
  ) =>
    apiRequest(
      `/api/v1/jugaads/${jugaadId}/interested`,
      {
        method: 'POST',

        body:
          JSON.stringify({}),
      }
    ),


  // ------------------------------------------------
  // MARK NOT INTERESTED
  // ------------------------------------------------

  markNotInterested: (
    jugaadId
  ) =>
    apiRequest(
      `/api/v1/jugaads/${jugaadId}/not-interested`,
      {
        method: 'POST',

        body:
          JSON.stringify({}),
      }
    ),


  // ================================================================
  // JUGAAD-SPECIFIC PROPOSALS
  // ================================================================


  // ------------------------------------------------
  // SUBMIT PROPOSAL
  // ------------------------------------------------

  submitProposal: (
    jugaadId,
    payload
  ) =>
    apiRequest(
      `/api/v1/jugaads/${jugaadId}/proposals`,
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  // ------------------------------------------------
  // GET PROPOSALS FOR JUGAAD
  // ------------------------------------------------

  getProposalsForJugaad: (
    jugaadId
  ) =>
    apiRequest(
      `/api/v1/jugaads/${jugaadId}/proposals`
    ),


  // ================================================================
  // PROPOSALS
  // ================================================================


  // ------------------------------------------------
  // MY PROPOSALS
  // ------------------------------------------------

  getMyProposals: () =>
    apiRequest(
      '/api/v1/proposals/my'
    ),


  // ------------------------------------------------
  // RECEIVED PROPOSALS
  // ------------------------------------------------

  getReceivedProposals: () =>
    apiRequest(
      '/api/v1/proposals/received'
    ),


  // ------------------------------------------------
  // ACCEPT PROPOSAL
  // ------------------------------------------------

  acceptProposal: (
    proposalId
  ) =>
    apiRequest(
      `/api/v1/proposals/${proposalId}/accept`,
      {
        method: 'PUT',

        body:
          JSON.stringify({}),
      }
    ),


  // ------------------------------------------------
  // REJECT PROPOSAL
  // ------------------------------------------------

  rejectProposal: (
    proposalId
  ) =>
    apiRequest(
      `/api/v1/proposals/${proposalId}/reject`,
      {
        method: 'PUT',

        body:
          JSON.stringify({}),
      }
    ),


  // ------------------------------------------------
  // WITHDRAW PROPOSAL
  // ------------------------------------------------

  withdrawProposal: (
    proposalId
  ) =>
    apiRequest(
      `/api/v1/proposals/${proposalId}/withdraw`,
      {
        method: 'PUT',

        body:
          JSON.stringify({}),
      }
    ),


  // ------------------------------------------------
  // CREATE COUNTER OFFER
  // ------------------------------------------------

  createCounterOffer: (
    proposalId,
    payload
  ) =>
    apiRequest(
      `/api/v1/proposals/${proposalId}/counter-offer`,
      {
        method: 'POST',

        body:
          JSON.stringify(
            payload
          ),
      }
    ),


  // ------------------------------------------------
  // GET COUNTER OFFERS
  // ------------------------------------------------

  getCounterOffers: (
    proposalId
  ) =>
    apiRequest(
      `/api/v1/proposals/${proposalId}/counter-offers`
    ),


  // ================================================================
  // CONVERSATIONS / MESSAGES
  // ================================================================


  // ------------------------------------------------
  // GET CONVERSATIONS
  // ------------------------------------------------

  getConversations: () =>
    apiRequest(
      '/api/v1/conversations'
    ),


  // ------------------------------------------------
  // GET CONVERSATION MESSAGES
  // ------------------------------------------------

  getConversationMessages: (
    conversationId
  ) =>
    apiRequest(
      `/api/v1/conversations/${conversationId}/messages`
    ),


  // ------------------------------------------------
  // SEND MESSAGE
  // ------------------------------------------------

  sendMessage: (
    conversationId,
    text
  ) =>
    apiRequest(
      `/api/v1/conversations/${conversationId}/messages`,
      {
        method: 'POST',

        body:
          JSON.stringify({
            content:
              text,
          }),
      }
    ),


  // ------------------------------------------------
  // MARK CONVERSATION READ
  // ------------------------------------------------

  markConversationAsRead: (
    conversationId
  ) =>
    apiRequest(
      `/api/v1/conversations/${conversationId}/read`,
      {
        method: 'PUT',

        body:
          JSON.stringify({}),
      }
    ),


  // ================================================================
  // NOTIFICATIONS
  // ================================================================


  // ------------------------------------------------
  // GET NOTIFICATIONS
  // ------------------------------------------------

  getNotifications: () =>
    apiRequest(
      '/api/v1/notifications'
    ),


  // ------------------------------------------------
  // GET NOTIFICATION PREFERENCES
  // ------------------------------------------------

  getNotificationPreferences: () =>
    apiRequest(
      '/api/v1/notifications/preferences'
    ),


  // ------------------------------------------------
  // UPDATE NOTIFICATION PREFERENCES
  // ------------------------------------------------

  updateNotificationPreferences: (
    preferences
  ) =>
    apiRequest(
      '/api/v1/notifications/preferences',
      {
        method: 'PUT',

        body:
          JSON.stringify(
            preferences
          ),
      }
    ),


  // ------------------------------------------------
  // MARK ALL NOTIFICATIONS READ
  // ------------------------------------------------

  markAllNotificationsRead: () =>
    apiRequest(
      '/api/v1/notifications/read-all',
      {
        method: 'PUT',

        body:
          JSON.stringify({}),
      }
    ),


  // ------------------------------------------------
  // MARK ONE NOTIFICATION READ
  // ------------------------------------------------

  markNotificationRead: (
    id
  ) =>
    apiRequest(
      `/api/v1/notifications/${id}/read`,
      {
        method: 'PUT',

        body:
          JSON.stringify({}),
      }
    ),

};