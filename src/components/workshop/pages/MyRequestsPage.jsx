import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { useProposals } from '@/context/ProposalContext';
import { REQUEST_STATUS, timeAgo } from '@/data/jugaadMockData';
import { Send, MessageSquare, HandCoins, Check, X, Clock, Tag, Undo2 } from 'lucide-react';
import { ConfirmActionModal } from '@/components/workshop/pages/ConfirmActionModal';

const STATUS_CFG = {
  ...REQUEST_STATUS,
  waiting: { color: 'amber', label: 'PENDING' },
  withdrawn: { color: 'ink', label: 'WITHDRAWN' },
};

export function MyRequestsPage() {
  const { myRequests, acceptCounter, rejectCounter, withdrawProposal } = useProposals();
  const [confirmAction, setConfirmAction] = useState(null);
  const requests = myRequests;

  return (
    <div>
      <section className="pt-12 pb-7">
        <div className="flex items-center gap-3 mb-4">
          <LED color="mint" pulse size={7} />
          <span className="font-technical text-[9px] text-ink-2">05 — YOUR OUTGOING SIGNALS</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl">
          MY<br />
          <span className="text-mint">REQUESTS.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-ink-2">
          Track every Jugaad where you raised your hand, made an offer, or started a collaboration.
        </p>
      </section>

      <div className="space-y-3">
        {requests.map((r) => (
          <RequestRow
            key={r.id}
            request={r}
            acceptCounter={acceptCounter}
            rejectCounter={rejectCounter}
            onWithdraw={() => setConfirmAction({ variant: 'withdraw', proposal: { id: r.proposalId, helper: { name: 'You' }, jugaadTitle: r.jugaadTitle, proposedPrice: r.proposedAmount || r.amount } })}
          />
        ))}
      </div>

      {confirmAction && (
        <ConfirmActionModal
          variant={confirmAction.variant}
          proposal={confirmAction.proposal}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction.variant === 'withdraw') withdrawProposal(confirmAction.proposal.id);
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
}

function RequestRow({ request, acceptCounter, rejectCounter, onWithdraw }) {
  const cfg = STATUS_CFG[request.status] || { color: 'amber', label: request.status?.toUpperCase() || 'PENDING' };
  const isAccepted = ['accepted', 'price-agreed', 'in-progress', 'completed'].includes(request.status);
  const isNegotiating = request.status === 'negotiating';
  const isWithdrawn = request.status === 'withdrawn';
  const isPending = request.status === 'waiting';
  const proposalId = request.proposalId;
  const canWithdraw = isPending || (isNegotiating && proposalId);

  return (
    <article className="surface-panel rounded-2xl p-5" style={{ border: '1px solid var(--metal-1)' }}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-full bg-amber text-bg-0 font-display text-[9px] shrink-0">
          {request.poster.initials}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg">{request.jugaadTitle}</h2>
            <span
              className="font-technical text-[7px] px-2 py-1 rounded"
              style={{ color: `var(--${cfg.color})`, background: `color-mix(in srgb, var(--${cfg.color}) 12%, transparent)` }}
            >
              {cfg.label}
            </span>
          </div>
          <p className="font-mono text-[9px] text-ink-3 mt-1">
            Poster: {request.poster.name} · {request.category} · {timeAgo(request.requestedAt)}
          </p>
          {request.explanation && (
            <p className="font-mono text-[10px] text-ink-2 mt-2 leading-relaxed surface-panel rounded-lg p-3">
              "{request.explanation}"
            </p>
          )}
          {request.skills && request.skills.length > 0 && (
            <p className="font-mono text-[9px] text-ink-3 mt-2 flex items-center gap-1">
              <Tag size={10} />
              {request.skills.join(' · ')}
            </p>
          )}
          {request.completionTime && (
            <p className="font-mono text-[9px] text-ink-3 mt-1 flex items-center gap-1">
              <Clock size={11} />
              {request.completionTime}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display text-xl text-amber">₹{request.agreedAmount || request.proposedAmount || request.amount}</p>
          <p className="font-mono text-[8px] text-ink-3">{request.requestType === 'bargain' ? 'BARGAIN' : request.requestType === 'proposal' ? 'PROPOSAL' : 'INTEREST'}</p>
        </div>
      </div>

      {isNegotiating && (
        <div className="mt-4 surface-wood rounded-xl p-3">
          <p className="font-technical text-[8px] text-paper/80 mb-2">NEGOTIATION HISTORY</p>
          {request.negotiationHistory?.map((o, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <span className="font-mono text-[9px] text-paper flex-1">
                {o.from === 'me' ? 'You' : 'Poster'} {o.message && `— ${o.message}`}
              </span>
              <span className="font-display text-sm text-amber">₹{o.amount}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-metal-1/40 flex flex-wrap gap-2">
        {isAccepted && (
          <Link
            to={`/dashboard/messages/${request.conversationId || 'conv1'}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]"
          >
            <MessageSquare size={12} />
            MESSAGE
          </Link>
        )}
        {isNegotiating && proposalId && (
          <>
            <button
              onClick={() => acceptCounter(proposalId)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px] hover:bg-mint/25 transition-colors"
            >
              <Check size={12} />
              ACCEPT OFFER
            </button>
            <button
              onClick={() => rejectCounter(proposalId)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px] hover:bg-coral/20 transition-colors"
            >
              <X size={12} />
              REJECT
            </button>
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-[8px] hover:bg-amber/10 transition-colors">
              <HandCoins size={12} />
              COUNTER
            </button>
          </>
        )}
        {isNegotiating && !proposalId && (
          <span className="font-mono text-[9px] text-ink-3">Waiting for your response to the counter offer.</span>
        )}
        {canWithdraw && (
          <button
            onClick={onWithdraw}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px] hover:bg-coral/20 transition-colors ml-auto"
          >
            <Undo2 size={12} />
            WITHDRAW PROPOSAL
          </button>
        )}
        {isWithdrawn && (
          <span className="font-mono text-[9px] text-ink-3 ml-auto">This proposal was withdrawn.</span>
        )}
      </div>
    </article>
  );
}
