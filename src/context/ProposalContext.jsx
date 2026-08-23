import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mockMyRequests, mockMyPostedJugaads, mockConversations } from '@/data/jugaadMockData';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const ProposalContext = createContext({
  proposals: [],
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

let proposalIdCounter = 100;

export function ProposalProvider({ children }) {
  const { isDemoMode, isAuthenticated } = useAuth();

  const [proposals, setProposals] = useState([]);
  const [myRequests, setMyRequests] = useState(isDemoMode ? mockMyRequests : []);
  const [conversations, setConversations] = useState(isDemoMode ? mockConversations : []);
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    if (isDemoMode) {
      setMyRequests(mockMyRequests);
      setConversations(mockConversations);
      return;
    }

    if (!isAuthenticated) {
      setMyRequests([]);
      setConversations([]);
      setProposals([]);
      return;
    }

    setLoading(true);
    try {
      const [reqData, convData] = await Promise.allSettled([
        api.getMyRequests(),
        api.getConversations(),
      ]);

      if (reqData.status === 'fulfilled') {
        const raw = reqData.value;
        const list = raw?.requests || raw?.data || (Array.isArray(raw) ? raw : []);
        setMyRequests(Array.isArray(list) ? list : []);
      }

      if (convData.status === 'fulfilled') {
        const raw = convData.value;
        const list = raw?.conversations || raw?.data || (Array.isArray(raw) ? raw : []);
        setConversations(Array.isArray(list) ? list : []);
      }
    } catch {
      // ignore fetch errors on background refresh
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, isAuthenticated]);

  useEffect(() => {
    if (isDemoMode) {
      setMyRequests(mockMyRequests);
      setConversations(mockConversations);
      setProposals([]);
    } else if (isAuthenticated) {
      refreshData();
    } else {
      setMyRequests([]);
      setConversations([]);
      setProposals([]);
    }
  }, [isDemoMode, isAuthenticated, refreshData]);

  const sendProposal = useCallback(async (payload) => {
    if (isDemoMode) {
      const newId = `prop-${++proposalIdCounter}`;
      const newProposal = {
        id: newId,
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
        offerHistory: [
          { from: 'helper', amount: payload.proposedPrice, message: payload.explanation, timestamp: new Date().toISOString() },
        ],
        sentAt: new Date().toISOString(),
      };
      setProposals((prev) => [...prev, newProposal]);

      setMyRequests((prev) => [
        {
          id: `req-${newId}`,
          jugaadId: payload.jugaadId,
          jugaadTitle: payload.jugaadTitle,
          category: payload.category,
          poster: payload.poster,
          amount: payload.amount,
          requestType: 'proposal',
          status: 'waiting',
          proposedAmount: payload.proposedPrice,
          explanation: payload.explanation,
          completionTime: payload.completionTime,
          skills: payload.skills || [],
          requestedAt: newProposal.sentAt,
          proposalId: newId,
        },
        ...prev,
      ]);

      return newProposal;
    }

    // Real authenticated user
    try {
      if (payload.proposedPrice && payload.proposedPrice !== payload.amount) {
        await api.sendBargain(payload.jugaadId, {
          proposedAmount: payload.proposedPrice,
          message: payload.explanation || '',
          completionTime: payload.completionTime || '',
          skills: payload.skills || [],
          explanation: payload.explanation || '',
        });
      } else {
        await api.expressInterest(payload.jugaadId);
      }
      await refreshData();
    } catch (err) {
      throw err;
    }
  }, [isDemoMode, refreshData]);

  const acceptProposal = useCallback(async (proposalId) => {
    if (isDemoMode) {
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'accepted' } : p))
      );
      setMyRequests((prev) =>
        prev.map((r) =>
          r.proposalId === proposalId
            ? { ...r, status: 'accepted', acceptedAt: new Date().toISOString(), agreedAmount: r.proposedAmount, conversationId: `conv-${proposalId}` }
            : r
        )
      );
      setProposals((prev) => {
        const proposal = prev.find((p) => p.id === proposalId);
        if (proposal) {
          setConversations((prevConv) => {
            if (prevConv.find((c) => c.id === `conv-${proposalId}`)) return prevConv;
            return [
              ...prevConv,
              {
                id: `conv-${proposalId}`,
                jugaadId: proposal.jugaadId,
                jugaadTitle: proposal.jugaadTitle,
                otherUser: { id: proposal.helper.id, name: proposal.helper.name, initials: proposal.helper.initials },
                agreedAmount: proposal.proposedPrice,
                status: 'accepted',
                messages: [],
              },
            ];
          });
        }
        return prev;
      });
      return;
    }

    // Real API
    await api.acceptRequest(proposalId);
    await refreshData();
  }, [isDemoMode, refreshData]);

  const rejectProposal = useCallback(async (proposalId) => {
    if (isDemoMode) {
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'rejected' } : p))
      );
      setMyRequests((prev) =>
        prev.map((r) =>
          r.proposalId === proposalId
            ? { ...r, status: 'rejected', rejectedAt: new Date().toISOString() }
            : r
        )
      );
      return;
    }

    // Real API
    await api.rejectRequest(proposalId);
    await refreshData();
  }, [isDemoMode, refreshData]);

  const counterProposal = useCallback(async (proposalId, counterPrice, counterMessage) => {
    if (isDemoMode) {
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                status: 'counter-offer',
                offerHistory: [
                  ...p.offerHistory,
                  { from: 'poster', amount: counterPrice, message: counterMessage, timestamp: new Date().toISOString() },
                ],
              }
            : p
        )
      );
      setMyRequests((prev) =>
        prev.map((r) =>
          r.proposalId === proposalId
            ? {
                ...r,
                status: 'negotiating',
                negotiationHistory: [
                  ...(r.negotiationHistory || []),
                  { from: 'poster', amount: counterPrice, message: counterMessage, timestamp: new Date().toISOString() },
                ],
              }
            : r
        )
      );
      return;
    }

    // Real API
    await api.counterOffer(proposalId, {
      amount: counterPrice,
      message: counterMessage,
    });
    await refreshData();
  }, [isDemoMode, refreshData]);

  const acceptCounter = useCallback(async (proposalId) => {
    if (isDemoMode) {
      setProposals((prev) => {
        const proposal = prev.find((p) => p.id === proposalId);
        if (proposal && proposal.offerHistory.length > 0) {
          const lastOffer = proposal.offerHistory[proposal.offerHistory.length - 1];
          setMyRequests((prevReqs) =>
            prevReqs.map((r) =>
              r.proposalId === proposalId
                ? {
                    ...r,
                    status: 'accepted',
                    agreedAmount: lastOffer.amount,
                    acceptedAt: new Date().toISOString(),
                    conversationId: `conv-${proposalId}`,
                  }
                : r
            )
          );
          setConversations((prevConv) => {
            if (prevConv.find((c) => c.id === `conv-${proposalId}`)) return prevConv;
            return [
              ...prevConv,
              {
                id: `conv-${proposalId}`,
                jugaadId: proposal.jugaadId,
                jugaadTitle: proposal.jugaadTitle,
                otherUser: { id: proposal.helper.id, name: proposal.helper.name, initials: proposal.helper.initials },
                agreedAmount: lastOffer.amount,
                status: 'accepted',
                messages: [],
              },
            ];
          });
        }
        return prev.map((p) => (p.id === proposalId ? { ...p, status: 'accepted' } : p));
      });
      return;
    }

    // Real API
    await api.acceptOffer(proposalId);
    await refreshData();
  }, [isDemoMode, refreshData]);

  const rejectCounter = useCallback(async (proposalId) => {
    if (isDemoMode) {
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'rejected' } : p))
      );
      setMyRequests((prev) =>
        prev.map((r) =>
          r.proposalId === proposalId ? { ...r, status: 'rejected' } : r
        )
      );
      return;
    }

    // Real API
    await api.rejectRequest(proposalId);
    await refreshData();
  }, [isDemoMode, refreshData]);

  const withdrawProposal = useCallback(async (proposalId) => {
    if (isDemoMode) {
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'withdrawn', withdrawnAt: new Date().toISOString() } : p))
      );
      setMyRequests((prev) =>
        prev.map((r) =>
          r.proposalId === proposalId
            ? { ...r, status: 'withdrawn', withdrawnAt: new Date().toISOString() }
            : r
        )
      );
      return;
    }

    // Real API (if rejection/withdrawal supported on request)
    try {
      await api.rejectRequest(proposalId);
    } catch {
      // fallback
    }
    await refreshData();
  }, [isDemoMode, refreshData]);

  const getProposalForJugaad = useCallback(
    (jugaadId) => {
      if (isDemoMode) {
        return proposals.find((p) => p.jugaadId === jugaadId);
      }
      return myRequests.find((r) => r.jugaad_id === jugaadId || r.jugaadId === jugaadId);
    },
    [isDemoMode, proposals, myRequests]
  );

  const getProposalsForJugaad = useCallback(
    (jugaadId) => {
      if (isDemoMode) {
        return proposals.filter((p) => p.jugaadId === jugaadId);
      }
      return myRequests.filter((r) => r.jugaad_id === jugaadId || r.jugaadId === jugaadId);
    },
    [isDemoMode, proposals, myRequests]
  );

  return (
    <ProposalContext.Provider
      value={{
        proposals,
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
