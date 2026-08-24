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

  return [];
}

export function ProposalProvider({ children }) {
  const { isDemoMode, isAuthenticated } = useAuth();

  const [proposals, setProposals] = useState([]);

  const [receivedProposals, setReceivedProposals] = useState([]);

  const [myRequests, setMyRequests] = useState(
    isDemoMode ? mockMyRequests : []
  );

  const [conversations, setConversations] = useState(
    isDemoMode ? mockConversations : []
  );

  const [loading, setLoading] = useState(false);

  /*
   * ============================================================
   * REFRESH PROPOSAL DATA
   * ============================================================
   */

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

      /*
       * PROPOSALS CREATED BY CURRENT USER
       */

      if (myProposalsResult.status === 'fulfilled') {
        const list = extractList(
          myProposalsResult.value,
          ['proposals', 'myProposals']
        );

        setProposals(list);
        setMyRequests(list);
      }

      /*
       * PROPOSALS RECEIVED BY JUGAAD POSTER
       */

      if (receivedResult.status === 'fulfilled') {
        const list = extractList(
          receivedResult.value,
          ['proposals', 'receivedProposals']
        );

        setReceivedProposals(list);
      }

      /*
       * CONVERSATIONS
       */

      if (conversationsResult.status === 'fulfilled') {
        const list = extractList(
          conversationsResult.value,
          ['conversations']
        );

        setConversations(list);
      }
    } catch (error) {
      console.error(
        'Failed to refresh proposal data:',
        error
      );
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, isAuthenticated]);

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

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
      setConversations([]);
      setProposals([]);
      setReceivedProposals([]);
    }
  }, [
    isDemoMode,
    isAuthenticated,
    refreshData,
  ]);

  /*
   * ============================================================
   * SEND PROPOSAL
   * ============================================================
   */

  const sendProposal = useCallback(
    async (payload = {}) => {
      console.log(
        'SEND PROPOSAL - ORIGINAL PAYLOAD:',
        payload
      );

      /*
       * Accept all possible Jugaad ID names.
       */

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

      /*
       * ========================================================
       * DEMO MODE
       * ========================================================
       */

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

          sentAt: new Date().toISOString(),
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

      /*
       * ========================================================
       * REAL BACKEND
       *
       * BACKEND REQUIRES EXACTLY:
       *
       * proposal_message: string
       * proposed_price: number
       * estimated_completion: string | null
       * ========================================================
       */

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
        proposal_message: String(
          proposalMessage
        ).trim(),

        proposed_price: Number(
          proposedPriceRaw
        ),

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

      /*
       * ========================================================
       * FRONTEND VALIDATION
       * ========================================================
       */

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

      /*
       * ========================================================
       * SEND TO BACKEND
       * ========================================================
       */

      const response =
        await api.submitProposal(
          jugaadId,
          proposalPayload
        );

      console.log(
        'PROPOSAL SUBMITTED SUCCESSFULLY:',
        response
      );

      /*
       * Refresh proposal lists so:
       *
       * Account B sees it in My Requests
       * Account A sees it in Received Proposals
       */

      await refreshData();

      return response;
    },
    [
      isDemoMode,
      refreshData,
    ]
  );

  /*
   * ============================================================
   * ACCEPT PROPOSAL
   * ============================================================
   */

  const acceptProposal = useCallback(
    async (proposalId) => {
      if (!proposalId) {
        throw new Error(
          'Proposal ID is missing.'
        );
      }

      if (isDemoMode) {
        const updateProposal = (proposal) =>
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

      await refreshData();

      return response;
    },
    [
      isDemoMode,
      refreshData,
    ]
  );

  /*
   * ============================================================
   * REJECT PROPOSAL
   * ============================================================
   */

  const rejectProposal = useCallback(
    async (proposalId) => {
      if (!proposalId) {
        throw new Error(
          'Proposal ID is missing.'
        );
      }

      if (isDemoMode) {
        const updateProposal = (proposal) =>
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

  /*
   * ============================================================
   * COUNTER PROPOSAL
   * ============================================================
   */

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
        const updateProposal = (proposal) =>
          proposal.id === proposalId
            ? {
                ...proposal,
                status: 'counter-offer',
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
            amount: Number(
              counterPrice
            ),
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

  /*
   * ============================================================
   * ACCEPT COUNTER
   * ============================================================
   */

  const acceptCounter = useCallback(
    async (proposalId) => {
      return acceptProposal(
        proposalId
      );
    },
    [acceptProposal]
  );

  /*
   * ============================================================
   * REJECT COUNTER
   * ============================================================
   */

  const rejectCounter = useCallback(
    async (proposalId) => {
      return rejectProposal(
        proposalId
      );
    },
    [rejectProposal]
  );

  /*
   * ============================================================
   * WITHDRAW PROPOSAL
   * ============================================================
   */

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
            current.map((proposal) =>
              proposal.id === proposalId
                ? {
                    ...proposal,
                    status: 'withdrawn',
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

  /*
   * ============================================================
   * GET SINGLE PROPOSAL FOR JUGAAD
   * ============================================================
   */

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

  /*
   * ============================================================
   * GET ALL PROPOSALS FOR JUGAAD
   * ============================================================
   */

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

  /*
   * ============================================================
   * PROVIDER
   * ============================================================
   */

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