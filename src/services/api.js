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
 * - Handles backend errors
 * ================================================================
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

      data: null,
    };

  }


  let data = null;


  /*
   * Some successful requests may return JSON.
   * Some backend errors may return plain text.
   *
   * Try JSON first, then plain text.
   */

  try {

    const text =
      await response.text();


    if (text) {

      try {

        data =
          JSON.parse(text);

      } catch {

        data = {
          message: text,
        };

      }

    }

  } catch (error) {

    console.error(
      'API RESPONSE ERROR:',
      error
    );

  }


  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
      data?.details ||
      (
        response.status === 400

          ? 'Invalid request.'

          : response.status === 401

          ? 'Your session has expired. Please log in again.'

          : response.status === 403

          ? 'You are not authorized to perform this action.'

          : response.status === 404

          ? 'Requested resource was not found.'

          : response.status === 409

          ? 'This request conflicts with existing data.'

          : response.status === 500

          ? 'Server error. Please try again later.'

          : `Request failed with status ${response.status}.`
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


/**
 * ================================================================
 * NORMALIZE NOTIFICATION PREFERENCES
 * ================================================================
 *
 * PostgreSQL normally returns snake_case:
 *
 * interest_request_notifications
 *
 * Frontend uses camelCase:
 *
 * interestRequestNotifications
 *
 * This function supports BOTH formats.
 *
 * It also supports a response wrapped inside:
 *
 * {
 *   success: true,
 *   data: {...}
 * }
 *
 * ================================================================
 */

const normalizeNotificationPreferences = (
  response
) => {

  const source =
    response?.data &&
    typeof response.data === 'object'
      ? response.data
      : response || {};


  return {

    interestRequestNotifications:
      Boolean(
        source.interestRequestNotifications ??
        source.interest_request_notifications ??
        true
      ),


    proposalNotifications:
      Boolean(
        source.proposalNotifications ??
        source.proposal_notifications ??
        true
      ),


    acceptedProposalNotifications:
      Boolean(
        source.acceptedProposalNotifications ??
        source.accepted_proposal_notifications ??
        true
      ),


    rejectedProposalNotifications:
      Boolean(
        source.rejectedProposalNotifications ??
        source.rejected_proposal_notifications ??
        true
      ),


    counterOfferNotifications:
      Boolean(
        source.counterOfferNotifications ??
        source.counter_offer_notifications ??
        true
      ),


    messageNotifications:
      Boolean(
        source.messageNotifications ??
        source.message_notifications ??
        true
      ),


    jugaadTaskNotifications:
      Boolean(
        source.jugaadTaskNotifications ??
        source.jugaad_task_notifications ??
        true
      ),


    emailNotifications:
      Boolean(
        source.emailNotifications ??
        source.email_notifications ??
        true
      ),


    inAppNotifications:
      Boolean(
        source.inAppNotifications ??
        source.in_app_notifications ??
        true
      ),


    createdAt:
      source.createdAt ??
      source.created_at ??
      null,


    updatedAt:
      source.updatedAt ??
      source.updated_at ??
      null,

  };

};


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

  getNotificationPreferences: async () => {

    const response =
      await apiRequest(
        '/api/v1/notifications/preferences'
      );


    return normalizeNotificationPreferences(
      response
    );

  },


  // ------------------------------------------------
  // UPDATE NOTIFICATION PREFERENCES
  // ------------------------------------------------

  updateNotificationPreferences: async (
    preferences
  ) => {

    /*
     * Send exactly the fields expected
     * by the backend.
     */

    const payload = {

      interestRequestNotifications:
        Boolean(
          preferences?.interestRequestNotifications
        ),

      proposalNotifications:
        Boolean(
          preferences?.proposalNotifications
        ),

      acceptedProposalNotifications:
        Boolean(
          preferences?.acceptedProposalNotifications
        ),

      rejectedProposalNotifications:
        Boolean(
          preferences?.rejectedProposalNotifications
        ),

      counterOfferNotifications:
        Boolean(
          preferences?.counterOfferNotifications
        ),

      messageNotifications:
        Boolean(
          preferences?.messageNotifications
        ),

      jugaadTaskNotifications:
        Boolean(
          preferences?.jugaadTaskNotifications
        ),

      emailNotifications:
        Boolean(
          preferences?.emailNotifications
        ),

      inAppNotifications:
        Boolean(
          preferences?.inAppNotifications
        ),

    };


    const response =
      await apiRequest(
        '/api/v1/notifications/preferences',
        {
          method: 'PUT',

          body:
            JSON.stringify(
              payload
            ),
        }
      );


    /*
     * IMPORTANT:
     *
     * Normalize the response before
     * returning it to SettingsPage.
     *
     * This prevents the switch from:
     *
     * ON → saved → OFF
     *
     * when the backend returns snake_case.
     */

    return normalizeNotificationPreferences(
      response
    );

  },


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