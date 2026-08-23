import { createContext, useContext, useState, useCallback } from 'react';
import { mockMyRequests, mockMyPostedJugaads, mockConversations } from '@/data/jugaadMockData';

const ProposalContext = createContext({
  proposals: [],
  myRequests: [],
  conversations: [],
  sendProposal: () => {},
  acceptProposal: () => {},
  rejectProposal: () => {},
  counterProposal: () => {},
  acceptCounter: () => {},
  rejectCounter: () => {},
  withdrawProposal: () => {},
  getProposalForJugaad: () => null,
  getProposalsForJugaad: () => [],
});

export function useProposals() {
  return useContext(ProposalContext);
}

let proposalIdCounter = 100;

export function ProposalProvider({ children }) {
  // Start with existing mock myRequests as the base
  const [proposals, setProposals] = useState([]);
  const [myRequests, setMyRequests] = useState(mockMyRequests);
  const [conversations, setConversations] = useState(mockConversations);

  const sendProposal = useCallback((payload) => {
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
      status: 'pending', // pending | accepted | rejected | counter-offer | withdrawn
      offerHistory: [
        { from: 'helper', amount: payload.proposedPrice, message: payload.explanation, timestamp: new Date().toISOString() },
      ],
      sentAt: new Date().toISOString(),
    };
    setProposals((prev) => [...prev, newProposal]);

    // Also add to myRequests so the helper can track it
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
  }, []);

  const acceptProposal = useCallback((proposalId) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, status: 'accepted' } : p
      )
    );
    setMyRequests((prev) =>
      prev.map((r) =>
        r.proposalId === proposalId
          ? { ...r, status: 'accepted', acceptedAt: new Date().toISOString(), agreedAmount: r.proposedAmount, conversationId: `conv-${proposalId}` }
          : r
      )
    );
    // Create a conversation
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
  }, []);

  const rejectProposal = useCallback((proposalId) => {
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
  }, []);

  const counterProposal = useCallback((proposalId, counterPrice, counterMessage) => {
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
  }, []);

  const acceptCounter = useCallback((proposalId) => {
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
  }, []);

  const rejectCounter = useCallback((proposalId) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'rejected' } : p))
    );
    setMyRequests((prev) =>
      prev.map((r) =>
        r.proposalId === proposalId ? { ...r, status: 'rejected' } : r
      )
    );
  }, []);

  const withdrawProposal = useCallback((proposalId) => {
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
  }, []);

  const getProposalForJugaad = useCallback(
    (jugaadId) => proposals.find((p) => p.jugaadId === jugaadId),
    [proposals]
  );

  const getProposalsForJugaad = useCallback(
    (jugaadId) => proposals.filter((p) => p.jugaadId === jugaadId),
    [proposals]
  );

  return (
    <ProposalContext.Provider
      value={{
        proposals,
        myRequests,
        conversations,
        sendProposal,
        acceptProposal,
        rejectProposal,
        counterProposal,
        acceptCounter,
        rejectCounter,
        withdrawProposal,
        getProposalForJugaad,
        getProposalsForJugaad,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
}
