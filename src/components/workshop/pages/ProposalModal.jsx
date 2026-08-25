import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

import {
  mockMyRequests,
  mockConversations,
} from '@/data/jugaadMockData';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const ProposalContext = createContext({
  proposals: [],
  receivedProposals: [],
  myRequests: [],
  conversations: [],
  loading: false,

  sendProposal: async () => {},
  acceptProposal: async () => {},
  rejectProposal: async () => {},
  counterProposal: async () => {},
  acceptCounter: async () => {},
  rejectCounter: async () => {},
  withdrawProposal: async () => {},

  getProposalForJugaad: () => null,
  getProposalsForJugaad: () => [],

  refreshData: async () => {},
});

export function useProposals() {
  return useContext(ProposalContext);
}

/* ============================================================
   HELPERS
============================================================ */

function extractList(response, keys = []) {
  if (Array.isArray(response)) {
    return response;
  }

  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key];
    }
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  for (const key of keys) {
    if (Array.isArray(response?.data?.[key])) {
      return response.data[key];
    }
  }

  return [];
}

/*
 * Extract a single conversation from an API response.
 *
 * Accept endpoints commonly return the newly-created conversation
 * inside:
 *   { conversation: {...} }
 *   { data: { conversation: {...} } }
 *   { data: {...conversation fields...} }
 */
function extractConversation(response) {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const candidates = [
    response?.conversation,
    response?.data?.conversation,
    response?.result?.conversation,
    response?.data,
    response?.result,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === 'object' &&
      !Array.isArray(candidate)
    ) {
      const id =
        candidate.id ??
        candidate.conversationId ??
        candidate.conversation_id ??
        candidate._id;

      if (id !== undefined && id !== null && id !== '') {
        return candidate;
      }
    }
  }

  return null;
}

/*
 * Convert a user object into a safe display object.
 */
function normalizeUser(user) {
  if (!user || typeof user !== 'object') {
    return null;
  }

  const name =
    user.name ||
    user.fullName ||
    user.full_name ||
    user.username ||
    user.displayName ||
    user.display_name ||
    user.email ||
    '';

  const explicitInitials =
    typeof user.initials === 'string'
      ? user.initials.trim()
      : '';

  let initials = explicitInitials;

  if (!initials && name) {
    initials = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  return {
    ...user,
    id:
      user.id ??
      user.userId ??
      user.user_id ??
      user._id ??
      null,

    name: name || 'User',

    initials:
      initials
        ? initials.slice(0, 2).toUpperCase()
        : 'U',
  };
}

/*
 * Find the other participant in a conversation.

 * Different backend implementations may return:
 *
 * otherUser
 * other_user
 * user
 * poster
 * helper
 * recipient
 * participant
 * participants[]
 * users[]
 */
function getOtherUser(conversation, currentUser) {
  const currentUserId = String(
    currentUser?.id ??
      currentUser?.userId ??
      currentUser?.user_id ??
      currentUser?._id ??
      ''
  );

  const directCandidates = [
    conversation?.otherUser,
    conversation?.other_user,
    conversation?.user,
    conversation?.recipient,
    conversation?.participant,
    conversation?.poster,
    conversation?.helper,
  ];

  for (const candidate of directCandidates) {
    const user = normalizeUser(candidate);

    if (user) {
      return user;
    }
  }

  /*
   * Some APIs return:
   *
   * participants: [user1, user2]
   *
   * Pick the participant who is not the logged-in user.
   */
  const participantArrays = [
    conversation?.participants,
    conversation?.users,
    conversation?.members,
  ];

  for (const participants of participantArrays) {
    if (!Array.isArray(participants)) {
      continue;
    }

    const users = participants
      .map(normalizeUser)
      .filter(Boolean);

    if (users.length === 0) {
      continue;
    }

    if (currentUserId) {
      const other = users.find(
        (user) => String(user.id ?? '') !== currentUserId
      );

      if (other) {
        return other;
      }
    }

    if (users.length >= 2) {
      return users[1];
    }

    return users[0];
  }

  return null;
}

/*
 * Safely get the Jugaad title.
 */
function getConversationTitle(conversation) {
  return (
    conversation?.jugaadTitle ||
    conversation?.jugaad_title ||
    conversation?.jugaad?.title ||
    conversation?.request?.title ||
    conversation?.proposal?.jugaadTitle ||
    conversation?.proposal?.jugaad?.title ||
    conversation?.title ||
    conversation?.requestTitle ||
    'Jugaad'
  );
}

/*
 * Safely get agreed amount.
 */
function getConversationAmount(conversation) {
  return (
    conversation?.agreedAmount ??
    conversation?.agreed_amount ??
    conversation?.agreedPrice ??
    conversation?.agreed_price ??
    conversation?.finalPrice ??
    conversation?.final_price ??
    conversation?.proposedAmount ??
    conversation?.proposed_amount ??
    conversation?.proposedPrice ??
    conversation?.proposed_price ??
    conversation?.amount ??
    conversation?.price ??
    conversation?.proposal?.agreedAmount ??
    conversation?.proposal?.agreed_price ??
    conversation?.proposal?.proposedAmount ??
    conversation?.proposal?.proposed_price ??
    0
  );
}

/*
 * Normalize message objects.
 */
function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(Boolean)
    .map((message, index) => ({
      ...message,

      id:
        message.id ??
        message._id ??
        `message-${index}`,

      text:
        message.text ??
        message.message ??
        message.content ??
        '',

      from:
        message.from ??
        message.sender ??
        message.sender_type ??
        null,

      timestamp:
        message.timestamp ??
        message.createdAt ??
        message.created_at ??
        null,
    }));
}

/*
 * Normalize a conversation so the frontend ALWAYS receives:
 *
 * {
 *   id,
 *   otherUser,
 *   jugaadTitle,
 *   agreedAmount,
 *   messages,
 *   status
 * }
 */
function normalizeConversation(conversation, currentUser) {
  if (!conversation || typeof conversation !== 'object') {
    return null;
  }

  const otherUser = getOtherUser(
    conversation,
    currentUser
  );

  const id =
    conversation.id ??
    conversation.conversationId ??
    conversation.conversation_id ??
    conversation._id;

  if (!id) {
    return null;
  }

  return {
    ...conversation,

    id: String(id),

    // Keep all possible relationship IDs so pages can reliably
    // connect an accepted proposal to its conversation.
    proposalId:
      conversation.proposalId ??
      conversation.proposal_id ??
      conversation.proposal?.id ??
      null,

    jugaadId:
      conversation.jugaadId ??
      conversation.jugaad_id ??
      conversation.jugaad?.id ??
      conversation.proposal?.jugaadId ??
      conversation.proposal?.jugaad_id ??
      conversation.proposal?.jugaad?.id ??
      null,

    helperId:
      conversation.helperId ??
      conversation.helper_id ??
      conversation.helper?.id ??
      null,

    posterId:
      conversation.posterId ??
      conversation.poster_id ??
      conversation.poster?.id ??
      conversation.jugaad?.posterId ??
      conversation.jugaad?.poster_id ??
      null,

    otherUser:
      otherUser || {
        id: null,
        name: 'User',
        initials: 'U',
      },

    jugaadTitle:
      getConversationTitle(conversation),

    agreedAmount:
      getConversationAmount(conversation),

    messages:
      normalizeMessages(conversation.messages),

    status:
      conversation.status ||
      conversation.state ||
      'accepted',
  };
}

/* ============================================================
   PROVIDER
============================================================ */

export function ProposalProvider({ children }) {
  const {
    isDemoMode,
    isAuthenticated,
    user: currentUser,
  } = useAuth();

  const [proposals, setProposals] = useState([]);

  const [receivedProposals, setReceivedProposals] =
    useState([]);

  const [myRequests, setMyRequests] = useState(
    isDemoMode ? mockMyRequests : []
  );

  const [conversations, setConversations] = useState(
    isDemoMode ? mockConversations : []
  );

  const [loading, setLoading] = useState(false);

  /* ============================================================
     REFRESH DATA
  ============================================================ */

  const refreshData = useCallback(async () => {
    if (isDemoMode) {
      setMyRequests(mockMyRequests);
      setConversations(mockConversations);
      return;
    }

    if (!isAuthenticated) {
      setMyRequests([]);
      setReceivedProposals([]);
      setConversations([]);
      setProposals([]);
      return;
    }

    setLoading(true);

    try {
      const results = await Promise.allSettled([
        api.getMyProposals(),
        api.getReceivedProposals(),
        api.getConversations(),
      ]);

      const myProposalsResult = results[0];
      const receivedResult = results[1];
      const conversationsResult = results[2];

      /* ========================================================
         MY PROPOSALS
      ======================================================== */

      if (myProposalsResult.status === 'fulfilled') {
        const list = extractList(
          myProposalsResult.value,
          ['proposals', 'myProposals']
        );

        setProposals(list);
        setMyRequests(list);
      }

      /* ========================================================
         RECEIVED PROPOSALS
      ======================================================== */

      if (receivedResult.status === 'fulfilled') {
        const list = extractList(
          receivedResult.value,
          ['proposals', 'receivedProposals']
        );

        setReceivedProposals(list);
      }

      /* ========================================================
         CONVERSATIONS
      ======================================================== */

      if (conversationsResult.status === 'fulfilled') {
        const rawConversations = extractList(
          conversationsResult.value,
          ['conversations']
        );

        console.log(
          'RAW CONVERSATIONS FROM BACKEND:',
          conversationsResult.value
        );
        console.log(
          'RAW CONVERSATION LIST:',
          rawConversations
        );

        const normalizedConversations =
          rawConversations
            .map((conversation) =>
              normalizeConversation(
                conversation,
                currentUser
              )
            )
            .filter(Boolean);

        console.log(
          'NORMALIZED CONVERSATIONS:',
          normalizedConversations
        );

        /*
         * Do not accidentally erase a conversation that was
         * just created by acceptProposal when the conversations
         * endpoint returns a different response shape.
         */
        setConversations((current) => {
          const merged = [...normalizedConversations];

          current.forEach((existing) => {
            const exists = merged.some(
              (conversation) =>
                String(conversation.id) ===
                String(existing.id)
            );

            if (!exists) {
              merged.push(existing);
            }
          });

          return merged;
        });
      }
    } catch (error) {
      console.error(
        'Failed to refresh proposal data:',
        error
      );
    } finally {
      setLoading(false);
    }
  }, [
    isDemoMode,
    isAuthenticated,
    currentUser,
  ]);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    if (isDemoMode) {
      setMyRequests(mockMyRequests);
      setConversations(mockConversations);
      setProposals([]);
      setReceivedProposals([]);
      return;
    }

    if (isAuthenticated) {
      refreshData();
    } else {
      setMyRequests([]);
      setReceivedProposals([]);
      setConversations([]);
      setProposals([]);
    }
  }, [
    isDemoMode,
    isAuthenticated,
    refreshData,
  ]);

  /* ============================================================
     SEND PROPOSAL
  ============================================================ */

  const sendProposal = useCallback(
    async (payload = {}) => {
      console.log(
        'SEND PROPOSAL - ORIGINAL PAYLOAD:',
        payload
      );

      const jugaadId =
        payload.jugaadId ??
        payload.jugaad_id ??
        payload.item?.id ??
        payload.item?.jugaadId ??
        payload.item?.jugaad_id;

      if (
        jugaadId === undefined ||
        jugaadId === null ||
        jugaadId === ''
      ) {
        throw new Error(
          'Jugaad ID is missing.'
        );
      }

      if (isDemoMode) {
        const newProposal = {
          id: `demo-proposal-${Date.now()}`,
          jugaadId,

          jugaadTitle:
            payload.jugaadTitle ??
            payload.item?.title ??
            '',

          category:
            payload.category ??
            payload.item?.category ??
            'OTHER',

          poster:
            payload.poster ??
            payload.item?.poster ??
            null,

          amount:
            payload.amount ??
            payload.item?.amount ??
            0,

          helper:
            payload.helper ??
            null,

          explanation:
            payload.proposal_message ??
            payload.explanation ??
            '',

          proposedPrice:
            payload.proposed_price ??
            payload.proposedPrice ??
            payload.proposedAmount ??
            0,

          completionTime:
            payload.estimated_completion ??
            payload.completionTime ??
            '',

          skills:
            Array.isArray(payload.skills)
              ? payload.skills
              : [],

          status: 'pending',

          sentAt:
            new Date().toISOString(),
        };

        setProposals((current) => [
          ...current,
          newProposal,
        ]);

        setMyRequests((current) => [
          newProposal,
          ...current,
        ]);

        return newProposal;
      }

      const proposalMessage =
        payload.proposal_message ??
        payload.proposalMessage ??
        payload.explanation ??
        payload.message ??
        '';

      const proposedPriceRaw =
        payload.proposed_price ??
        payload.proposedPrice ??
        payload.proposedAmount ??
        payload.price ??
        '';

      const estimatedCompletion =
        payload.estimated_completion ??
        payload.estimatedCompletion ??
        payload.completionTime ??
        payload.completion_time ??
        null;

      const proposalPayload = {
        proposal_message:
          String(proposalMessage).trim(),

        proposed_price:
          Number(proposedPriceRaw),

        estimated_completion:
          estimatedCompletion === null ||
          estimatedCompletion === undefined ||
          estimatedCompletion === ''
            ? null
            : String(
                estimatedCompletion
              ).trim(),
      };

      console.log(
        'SEND PROPOSAL - BACKEND PAYLOAD:',
        proposalPayload
      );

      if (
        !proposalPayload.proposal_message
      ) {
        throw new Error(
          'Proposal message is required.'
        );
      }

      if (
        !Number.isFinite(
          proposalPayload.proposed_price
        ) ||
        proposalPayload.proposed_price <= 0
      ) {
        throw new Error(
          'Proposed price must be a positive number.'
        );
      }

      const response =
        await api.submitProposal(
          jugaadId,
          proposalPayload
        );

      console.log(
        'PROPOSAL SUBMITTED SUCCESSFULLY:',
        response
      );

      await refreshData();

      return response;
    },
    [
      isDemoMode,
      refreshData,
    ]
  );

  /* ============================================================
     ACCEPT PROPOSAL
  ============================================================ */

  const acceptProposal = useCallback(
    async (proposalId) => {
      if (!proposalId) {
        throw new Error(
          'Proposal ID is missing.'
        );
      }

      if (isDemoMode) {
        const updateProposal =
          (proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  status: 'accepted',
                }
              : proposal;

        setProposals((current) =>
          current.map(updateProposal)
        );

        setReceivedProposals((current) =>
          current.map(updateProposal)
        );

        return;
      }

      const response =
        await api.acceptProposal(
          proposalId
        );

      /*
       * Some backends return the newly-created conversation
       * directly from the accept endpoint. Save it immediately
       * so the UI can show MESSAGE without waiting for another
       * endpoint to expose it.
       */
      const acceptedConversation =
        extractConversation(response);

      if (acceptedConversation) {
        const normalizedConversation =
          normalizeConversation(
            acceptedConversation,
            currentUser
          );

        if (normalizedConversation) {
          console.log(
            'CONVERSATION CREATED BY ACCEPT:',
            normalizedConversation
          );

          setConversations((current) => {
            const exists = current.some(
              (conversation) =>
                String(conversation.id) ===
                String(normalizedConversation.id)
            );

            if (exists) {
              return current.map(
                (conversation) =>
                  String(conversation.id) ===
                  String(normalizedConversation.id)
                    ? {
                        ...conversation,
                        ...normalizedConversation,
                      }
                    : conversation
              );
            }

            return [
              ...current,
              normalizedConversation,
            ];
          });
        }
      }

      await refreshData();

      return response;
    },
    [
      isDemoMode,
      refreshData,
      currentUser,
    ]
  );

  /* ============================================================
     REJECT PROPOSAL
  ============================================================ */

  const rejectProposal = useCallback(
    async (proposalId) => {
      if (!proposalId) {
        throw new Error(
          'Proposal ID is missing.'
        );
      }

      if (isDemoMode) {
        const updateProposal =
          (proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  status: 'rejected',
                }
              : proposal;

        setProposals((current) =>
          current.map(updateProposal)
        );

        setReceivedProposals((current) =>
          current.map(updateProposal)
        );

        return;
      }

      const response =
        await api.rejectProposal(
          proposalId
        );

      await refreshData();

      return response;
    },
    [
      isDemoMode,
      refreshData,
    ]
  );

  /* ============================================================
     COUNTER PROPOSAL
  ============================================================ */

  const counterProposal = useCallback(
    async (
      proposalId,
      counterPrice,
      counterMessage = ''
    ) => {
      if (!proposalId) {
        throw new Error(
          'Proposal ID is missing.'
        );
      }

      if (
        !counterPrice ||
        Number(counterPrice) <= 0
      ) {
        throw new Error(
          'Counter offer amount must be greater than zero.'
        );
      }

      if (isDemoMode) {
        const updateProposal =
          (proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  status:
                    'counter-offer',
                  counterOffer: {
                    amount:
                      Number(counterPrice),
                    message:
                      counterMessage,
                    timestamp:
                      new Date().toISOString(),
                  },
                }
              : proposal;

        setProposals((current) =>
          current.map(updateProposal)
        );

        setReceivedProposals((current) =>
          current.map(updateProposal)
        );

        return;
      }

      const response =
        await api.createCounterOffer(
          proposalId,
          {
            amount:
              Number(counterPrice),

            message:
              counterMessage || '',
          }
        );

      await refreshData();

      return response;
    },
    [
      isDemoMode,
      refreshData,
    ]
  );

  /* ============================================================
     ACCEPT COUNTER
  ============================================================ */

  const acceptCounter = useCallback(
    async (proposalId) => {
      return acceptProposal(
        proposalId
      );
    },
    [acceptProposal]
  );

  /* ============================================================
     REJECT COUNTER
  ============================================================ */

  const rejectCounter = useCallback(
    async (proposalId) => {
      return rejectProposal(
        proposalId
      );
    },
    [rejectProposal]
  );

  /* ============================================================
     WITHDRAW
  ============================================================ */

  const withdrawProposal =
    useCallback(
      async (proposalId) => {
        if (!proposalId) {
          throw new Error(
            'Proposal ID is missing.'
          );
        }

        if (isDemoMode) {
          setProposals((current) =>
            current.map(
              (proposal) =>
                proposal.id === proposalId
                  ? {
                      ...proposal,
                      status:
                        'withdrawn',
                    }
                  : proposal
            )
          );

          return;
        }

        const response =
          await api.withdrawProposal(
            proposalId
          );

        await refreshData();

        return response;
      },
      [
        isDemoMode,
        refreshData,
      ]
    );

  /* ============================================================
     GET SINGLE PROPOSAL
  ============================================================ */

  const getProposalForJugaad =
    useCallback(
      (jugaadId) => {
        if (
          jugaadId === undefined ||
          jugaadId === null
        ) {
          return null;
        }

        const sent =
          proposals.find(
            (proposal) =>
              String(
                proposal?.jugaadId ??
                  proposal?.jugaad_id
              ) ===
              String(jugaadId)
          );

        if (sent) {
          return sent;
        }

        const received =
          receivedProposals.find(
            (proposal) =>
              String(
                proposal?.jugaadId ??
                  proposal?.jugaad_id
              ) ===
              String(jugaadId)
          );

        return received || null;
      },
      [
        proposals,
        receivedProposals,
      ]
    );

  /* ============================================================
     GET ALL PROPOSALS
  ============================================================ */

  const getProposalsForJugaad =
    useCallback(
      (jugaadId) => {
        if (
          jugaadId === undefined ||
          jugaadId === null
        ) {
          return [];
        }

        return [
          ...proposals,
          ...receivedProposals,
        ].filter(
          (proposal) =>
            String(
              proposal?.jugaadId ??
                proposal?.jugaad_id
            ) ===
            String(jugaadId)
        );
      },
      [
        proposals,
        receivedProposals,
      ]
    );

  /* ============================================================
     PROVIDER
  ============================================================ */

  return (
    <ProposalContext.Provider
      value={{
        proposals,
        receivedProposals,
        myRequests,
        conversations,
        loading,

        sendProposal,
        acceptProposal,
        rejectProposal,
        counterProposal,
        acceptCounter,
        rejectCounter,
        withdrawProposal,

        getProposalForJugaad,
        getProposalsForJugaad,

        refreshData,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
}