const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://campvault-backend.onrender.com';


/**
 * ================================================================
 * LOW-LEVEL API REQUEST
 * ================================================================
 */

export async function apiRequest(
  path,
  options = {}
) {
  const token =
    sessionStorage.getItem('cj_token');


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


/* ================================================================
   API
================================================================ */

export const api = {


  // ================================================================
  // AUTH / USERS
  // ================================================================

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


  getProfile: () =>
    apiRequest(
      '/api/v1/users/profile'
    ),


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
  // PROFILE - SKILLS
  // ================================================================

  getSkills: () =>
    apiRequest(
      '/api/v1/users/skills'
    ),


  addSkill: (
    payload
  ) =>
    apiRequest(
      '/api/v1/users/skills',
      {
        method: 'POST',

        body:
          JSON.stringify({
            name:
              String(
                payload?.name ?? ''
              ).trim(),

            category:
              String(
                payload?.category ?? ''
              ).trim(),

            level:
              String(
                payload?.level ?? ''
              ).trim(),
          }),
      }
    ),


  updateSkill: (
    skillId,
    payload
  ) =>
    apiRequest(
      `/api/v1/users/skills/${skillId}`,
      {
        method: 'PUT',

        body:
          JSON.stringify({
            name:
              String(
                payload?.name ?? ''
              ).trim(),

            category:
              String(
                payload?.category ?? ''
              ).trim(),

            level:
              String(
                payload?.level ?? ''
              ).trim(),
          }),
      }
    ),


  deleteSkill: (
    skillId
  ) =>
    apiRequest(
      `/api/v1/users/skills/${skillId}`,
      {
        method: 'DELETE',
      }
    ),


  // ================================================================
  // PROFILE - LINKS & PROFILES
  // ================================================================

  getLinks: () =>
    apiRequest(
      '/api/v1/users/links'
    ),


  addLink: (
    payload
  ) =>
    apiRequest(
      '/api/v1/users/links',
      {
        method: 'POST',

        body:
          JSON.stringify({
            platform:
              String(
                payload?.platform ?? ''
              ).trim(),

            url:
              String(
                payload?.url ?? ''
              ).trim(),
          }),
      }
    ),


  updateLink: (
    linkId,
    payload
  ) =>
    apiRequest(
      `/api/v1/users/links/${linkId}`,
      {
        method: 'PUT',

        body:
          JSON.stringify({
            platform:
              String(
                payload?.platform ?? ''
              ).trim(),

            url:
              String(
                payload?.url ?? ''
              ).trim(),
          }),
      }
    ),


  deleteLink: (
    linkId
  ) =>
    apiRequest(
      `/api/v1/users/links/${linkId}`,
      {
        method: 'DELETE',
      }
    ),


  // ================================================================
  // PROFILE - PROJECTS
  // ================================================================

  getProjects: () =>
    apiRequest(
      '/api/v1/users/projects'
    ),


  addProject: (
    payload
  ) =>
    apiRequest(
      '/api/v1/users/projects',
      {
        method: 'POST',

        body:
          JSON.stringify({

            name:
              String(
                payload?.name ?? ''
              ).trim(),

            description:
              String(
                payload?.description ?? ''
              ).trim(),

            technologies:
              Array.isArray(
                payload?.technologies
              )
                ? payload.technologies
                : String(
                    payload?.technologies ?? ''
                  )
                    .split(',')
                    .map(
                      (item) =>
                        item.trim()
                    )
                    .filter(Boolean),

            github:
              String(
                payload?.github ?? ''
              ).trim(),

            link:
              String(
                payload?.link ?? ''
              ).trim(),

          }),
      }
    ),


  updateProject: (
    projectId,
    payload
  ) =>
    apiRequest(
      `/api/v1/users/projects/${projectId}`,
      {
        method: 'PUT',

        body:
          JSON.stringify({

            name:
              String(
                payload?.name ?? ''
              ).trim(),

            description:
              String(
                payload?.description ?? ''
              ).trim(),

            technologies:
              Array.isArray(
                payload?.technologies
              )
                ? payload.technologies
                : String(
                    payload?.technologies ?? ''
                  )
                    .split(',')
                    .map(
                      (item) =>
                        item.trim()
                    )
                    .filter(Boolean),

            github:
              String(
                payload?.github ?? ''
              ).trim(),

            link:
              String(
                payload?.link ?? ''
              ).trim(),

          }),
      }
    ),


  deleteProject: (
    projectId
  ) =>
    apiRequest(
      `/api/v1/users/projects/${projectId}`,
      {
        method: 'DELETE',
      }
    ),


  // ================================================================
  // PROFILE - CERTIFICATIONS
  // ================================================================

  getCertifications: () =>
    apiRequest(
      '/api/v1/users/certifications'
    ),


  addCertification: (
    payload
  ) =>
    apiRequest(
      '/api/v1/users/certifications',
      {
        method: 'POST',

        body:
          JSON.stringify({

            title:
              String(
                payload?.title ?? ''
              ).trim(),

            organization:
              String(
                payload?.organization ?? ''
              ).trim(),

            date:
              String(
                payload?.date ?? ''
              ).trim(),

            description:
              String(
                payload?.description ?? ''
              ).trim(),

            credential_url:
              String(
                payload?.credential_url ??
                payload?.url ??
                ''
              ).trim(),

          }),
      }
    ),


  updateCertification: (
    certificationId,
    payload
  ) =>
    apiRequest(
      `/api/v1/users/certifications/${certificationId}`,
      {
        method: 'PUT',

        body:
          JSON.stringify({

            title:
              String(
                payload?.title ?? ''
              ).trim(),

            organization:
              String(
                payload?.organization ?? ''
              ).trim(),

            date:
              String(
                payload?.date ?? ''
              ).trim(),

            description:
              String(
                payload?.description ?? ''
              ).trim(),

            credential_url:
              String(
                payload?.credential_url ??
                payload?.url ??
                ''
              ).trim(),

          }),
      }
    ),


  deleteCertification: (
    certificationId
  ) =>
    apiRequest(
      `/api/v1/users/certifications/${certificationId}`,
      {
        method: 'DELETE',
      }
    ),


  // ================================================================
  // JUGAAD
  // ================================================================

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


  getDiscoveryFeed: () =>
    apiRequest(
      '/api/v1/jugaads'
    ),


  getMyJugaads: () =>
    apiRequest(
      '/api/v1/jugaads/my'
    ),


  getJugaad: (
    id
  ) =>
    apiRequest(
      `/api/v1/jugaads/${id}`
    ),


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


  getProposalsForJugaad: (
    jugaadId
  ) =>
    apiRequest(
      `/api/v1/jugaads/${jugaadId}/proposals`
    ),


  // ================================================================
  // PROPOSALS
  // ================================================================

  getMyProposals: () =>
    apiRequest(
      '/api/v1/proposals/my'
    ),


  getReceivedProposals: () =>
    apiRequest(
      '/api/v1/proposals/received'
    ),


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


  getCounterOffers: (
    proposalId
  ) =>
    apiRequest(
      `/api/v1/proposals/${proposalId}/counter-offers`
    ),


  // ================================================================
  // CONVERSATIONS / MESSAGES
  // ================================================================

  getConversations: () =>
    apiRequest(
      '/api/v1/conversations'
    ),


  getConversationMessages: (
    conversationId
  ) =>
    apiRequest(
      `/api/v1/conversations/${conversationId}/messages`
    ),


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

  getNotifications: () =>
    apiRequest(
      '/api/v1/notifications'
    ),


  getNotificationPreferences: () =>
    apiRequest(
      '/api/v1/notifications/preferences'
    ),


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


  markAllNotificationsRead: () =>
    apiRequest(
      '/api/v1/notifications/read-all',
      {
        method: 'PUT',

        body:
          JSON.stringify({}),
      }
    ),


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