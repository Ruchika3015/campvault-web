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

      if (myProposalsResult.status === 'fulfilled') {
        const list = extractList(
          myProposalsResult.value,
          ['proposals', 'myProposals']
        );

        setProposals(list);

        setMyRequests(list);
      }

      if (receivedResult.status === 'fulfilled') {
        const list = extractList(
          receivedResult.value,
          ['proposals', 'receivedProposals']
        );

        setReceivedProposals(list);
      }

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

  const sendProposal = useCallback(
    async (payload) => {
      if (!payload?.jugaadId) {
        throw new Error('Jugaad ID is missing.');
      }

      if (isDemoMode) {
        const newProposal = {
          id: `demo-proposal-${Date.now()}`,
          jugaadId: payload.jugaadId,
          jugaadTitle: payload.jugaadTitle,
          category: payload.category,
          poster: payload.poster,
          amount: payload.amount,
          helper: payload.helper,
          explanation: payload.explanation,
          proposedPrice: payload.proposedPrice,
          completionTime: payload.completionTime,
          skills: payload.skills || [],
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
       * IMPORTANT:
       * Always create a real proposal in the backend.
       *
       * Do not use expressInterest() here.
       */
      const response = await api.submitProposal(
        payload.jugaadId,
        {
          proposedAmount: Number(
            payload.proposedPrice
          ),

          explanation:
            payload.explanation || '',

          completionTime:
            payload.completionTime || '',

          skills:
            payload.skills || [],
        }
      );

      await refreshData();

      return response;
    },
    [isDemoMode, refreshData]
  );

  const acceptProposal = useCallback(
    async (proposalId) => {
      if (!proposalId) {
        throw new Error('Proposal ID is missing.');
      }

      if (isDemoMode) {
        setProposals((current) =>
          current.map((proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  status: 'accepted',
                }
              : proposal
          )
        );

        setReceivedProposals((current) =>
          current.map((proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  status: 'accepted',
                }
              : proposal
          )
        );

        return;
      }

      const response =
        await api.acceptProposal(proposalId);

      await refreshData();

      return response;
    },
    [isDemoMode, refreshData]
  );

  const rejectProposal = useCallback(
    async (proposalId) => {
      if (!proposalId) {
        throw new Error('Proposal ID is missing.');
      }

      if (isDemoMode) {
        setProposals((current) =>
          current.map((proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  status: 'rejected',
                }
              : proposal
          )
        );

        setReceivedProposals((current) =>
          current.map((proposal) =>
            proposal.id === proposalId
              ? {
                  ...proposal,
                  status: 'rejected',
                }
              : proposal
          )
        );

        return;
      }

      const response =
        await api.rejectProposal(proposalId);

      await refreshData();

      return response;
    },
    [isDemoMode, refreshData]
  );

  const counterProposal = useCallback(
    async (
      proposalId,
      counterPrice,
      counterMessage = ''
    ) => {
      if (!proposalId) {
        throw new Error('Proposal ID is missing.');
      }

      if (!counterPrice || Number(counterPrice) <= 0) {
        throw new Error(
          'Counter offer amount must be greater than zero.'
        );
      }

      if (isDemoMode) {
        const updated = (proposal) =>
          proposal.id === proposalId
            ? {
                ...proposal,
                status: 'counter-offer',
                counterOffer: {
                  amount: Number(counterPrice),
                  message: counterMessage,
                  timestamp:
                    new Date().toISOString(),
                },
              }
            : proposal;

        setProposals((current) =>
          current.map(updated)
        );

        setReceivedProposals((current) =>
          current.map(updated)
        );

        return;
      }

      const response =
        await api.createCounterOffer(
          proposalId,
          {
            amount: Number(counterPrice),
            message: counterMessage,
          }
        );

      await refreshData();

      return response;
    },
    [isDemoMode, refreshData]
  );

  const acceptCounter = useCallback(
    async (proposalId) => {
      return acceptProposal(proposalId);
    },
    [acceptProposal]
  );

  const rejectCounter = useCallback(
    async (proposalId) => {
      return rejectProposal(proposalId);
    },
    [rejectProposal]
  );

  const withdrawProposal = useCallback(
    async (proposalId) => {
      if (!proposalId) {
        throw new Error('Proposal ID is missing.');
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
        await api.withdrawProposal(proposalId);

      await refreshData();

      return response;
    },
    [isDemoMode, refreshData]
  );

  const getProposalForJugaad = useCallback(
    (jugaadId) => {
      if (!jugaadId) {
        return null;
      }

      const sent = proposals.find(
        (proposal) =>
          String(
            proposal?.jugaadId ??
              proposal?.jugaad_id
          ) === String(jugaadId)
      );

      if (sent) {
        return sent;
      }

      const received = receivedProposals.find(
        (proposal) =>
          String(
            proposal?.jugaadId ??
              proposal?.jugaad_id
          ) === String(jugaadId)
      );

      return received || null;
    },
    [proposals, receivedProposals]
  );

  const getProposalsForJugaad = useCallback(
    (jugaadId) => {
      if (!jugaadId) {
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
          ) === String(jugaadId)
      );
    },
    [proposals, receivedProposals]
  );

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