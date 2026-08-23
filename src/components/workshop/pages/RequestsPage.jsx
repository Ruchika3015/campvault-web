import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { mockMyPostedJugaads, REQUEST_STATUS, timeAgo } from '@/data/jugaadMockData';
import { Inbox, Check, X, HandCoins, MessageSquare, Clock, Tag } from 'lucide-react';
import { useProposals } from '@/context/ProposalContext';
import { CounterOfferModal } from '@/components/workshop/pages/CounterOfferModal';
import { ConfirmActionModal } from '@/components/workshop/pages/ConfirmActionModal';

const PROPOSAL_STATUS = {
  pending: { color: 'amber', label: 'PENDING' },
  accepted: { color: 'mint', label: 'ACCEPTED' },
  rejected: { color: 'coral', label: 'REJECTED' },
  'counter-offer': { color: 'amber', label: 'COUNTER OFFER' },
  withdrawn: { color: 'ink', label: 'WITHDRAWN' },
};

export function RequestsPage() {
  const { proposals, acceptProposal, rejectProposal, counterProposal } = useProposals();
  const [requests, setRequests] = useState(() =>
    mockMyPostedJugaads.flatMap((j) =>
      j.interestedStudents.map((r) => ({ ...r, jugaadId: j.id, jugaadTitle: j.title, amount: j.amount }))
    )
  );
  const [counterTarget, setCounterTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const update = (id, status) => setRequests((v) => v.map((r) => (r.id === id ? { ...r, requestStatus: status } : r)));

  return (
    <div>
      <section className="pt-12 pb-7">
        <div className="flex items-center gap-3 mb-4">
          <LED color="coral" pulse size={7} />
          <span className="font-technical text-[9px] text-ink-2">04 — INCOMING SIGNALS</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl">
          REQUESTS<br />
          <span className="text-coral">RECEIVED.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-ink-2">
          Students interested in your Jugaads appear here. Choose who gets the assignment; messaging unlocks only after acceptance.
        </p>
      </section>

      {/* Proposals Received section */}
      {proposals.length > 0 && (
        <section className="mb-9">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-technical text-[9px] text-amber">PROPOSALS RECEIVED</span>
            <span className="font-mono text-[8px] text-ink-3">({proposals.length})</span>
            <span className="h-px flex-1 bg-metal-1/40" />
          </div>
          <div className="space-y-3">
            {proposals.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                onAccept={() => setConfirmAction({ variant: 'accept', proposal: p })}
                onReject={() => setConfirmAction({ variant: 'reject', proposal: p })}
                onCounter={() => setCounterTarget(p)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Existing mock interest requests */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-technical text-[9px] text-ink-0">INTEREST REQUESTS</span>
          <span className="font-mono text-[8px] text-ink-3">({requests.length})</span>
          <span className="h-px flex-1 bg-metal-1/40" />
        </div>
        <div className="space-y-3">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} onUpdate={update} />
          ))}
        </div>
      </section>

      {counterTarget && (
        <CounterOfferModal
          proposal={counterTarget}
          onClose={() => setCounterTarget(null)}
          onSubmit={(price, msg) => {
            counterProposal(counterTarget.id, price, msg);
          }}
        />
      )}

      {confirmAction && (
        <ConfirmActionModal
          variant={confirmAction.variant}
          proposal={confirmAction.proposal}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction.variant === 'accept') acceptProposal(confirmAction.proposal.id);
            else if (confirmAction.variant === 'reject') rejectProposal(confirmAction.proposal.id);
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
}

function ProposalCard({ proposal, onAccept, onReject, onCounter }) {
  const status = proposal.status;
  const cfg = PROPOSAL_STATUS[status] || PROPOSAL_STATUS.pending;
  const isAccepted = status === 'accepted';
  const isRejected = status === 'rejected';
  const isWithdrawn = status === 'withdrawn';
  const conversationId = `conv-${proposal.id}`;

  return (
    <article className="surface-metal-brushed rounded-2xl p-5" style={{ border: '1px solid var(--metal-1)' }}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="grid place-items-center w-11 h-11 rounded-full bg-amber text-bg-0 font-display text-[10px] shrink-0">
            {proposal.helper?.initials || 'U'}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg">{proposal.helper?.name || 'Student'}</p>
              <span className="font-technical text-[7px] px-2 py-0.5 rounded" style={{ color: `var(--${cfg.color})`, background: `color-mix(in srgb, var(--${cfg.color}) 12%, transparent)` }}>
                {cfg.label}
              </span>
            </div>
            {proposal.skills && proposal.skills.length > 0 && (
              <p className="font-mono text-[9px] text-ink-3 mt-1 flex items-center gap-1">
                <Tag size={10} />
                {proposal.skills.join(' · ')}
              </p>
            )}
            <p className="font-mono text-[9px] text-ink-2 mt-3">
              Proposal for <span className="text-amber">{proposal.jugaadTitle}</span>
            </p>
            {proposal.explanation && (
              <p className="font-mono text-[10px] text-ink-2 mt-2 leading-relaxed surface-panel rounded-lg p-3">
                "{proposal.explanation}"
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[9px] font-mono text-ink-3">
              {proposal.completionTime && (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {proposal.completionTime}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="md:text-right">
          <p className="font-technical text-[7px] text-ink-3">PROPOSED PRICE</p>
          <p className="font-display text-2xl text-amber mt-1">₹{proposal.proposedPrice}</p>
          <p className="font-mono text-[8px] text-ink-3 mt-1">{timeAgo(proposal.sentAt)}</p>
        </div>
      </div>

      {/* Offer history for counter-offer state */}
      {status === 'counter-offer' && proposal.offerHistory && proposal.offerHistory.length > 1 && (
        <div className="mt-4 surface-wood rounded-xl p-3">
          <p className="font-technical text-[8px] text-paper/80 mb-2">OFFER HISTORY</p>
          {proposal.offerHistory.map((offer, i) => (
            <div key={i} className="flex items-center gap-2 py-1">
              <span className="font-mono text-[9px] text-paper flex-1">
                {offer.from === 'helper' ? proposal.helper?.name || 'Helper' : 'You'} {offer.message && `— ${offer.message}`}
              </span>
              <span className="font-display text-sm text-amber">₹{offer.amount}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-metal-1/40 flex flex-wrap items-center gap-2">
        <span className="font-technical text-[8px] mr-auto flex items-center gap-1.5" style={{ color: `var(--${cfg.color})` }}>
          <LED color={cfg.color} size={5} />
          {cfg.label}
        </span>
        {isAccepted && (
          <Link
            to={`/dashboard/messages/${conversationId}`}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]"
          >
            <MessageSquare size={12} />
            MESSAGE
          </Link>
        )}
        {!isAccepted && !isRejected && !isWithdrawn && (
          <>
            <button
              onClick={onAccept}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px] hover:bg-mint/25 transition-colors"
            >
              <Check size={12} />
              ACCEPT
            </button>
            <button
              onClick={onReject}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px] hover:bg-coral/20 transition-colors"
            >
              <X size={12} />
              REJECT
            </button>
            <button
              onClick={onCounter}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-[8px] hover:bg-amber/10 transition-colors"
            >
              <HandCoins size={12} />
              COUNTER OFFER
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function RequestCard({ request, onUpdate }) {
  const accepted = request.requestStatus === 'accepted';
  const rejected = request.requestStatus === 'rejected';
  return (
    <article className="surface-metal-brushed rounded-2xl p-5" style={{ border: '1px solid var(--metal-1)' }}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="grid place-items-center w-11 h-11 rounded-full bg-amber text-bg-0 font-display text-[10px] shrink-0">{request.initials}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg">{request.name}</p>
              <span className="font-technical text-[7px] text-ink-3">{request.rating}★</span>
            </div>
            <p className="font-mono text-[9px] text-ink-3 mt-1">{request.skills.join(' · ')}</p>
            <p className="font-mono text-[9px] text-ink-2 mt-3">
              Interested in <span className="text-amber">{request.jugaadTitle}</span>
            </p>
          </div>
        </div>
        <div className="md:text-right">
          <p className="font-technical text-[7px] text-ink-3">{request.requestType === 'bargain' ? 'PROPOSED AMOUNT' : 'YOUR BUDGET'}</p>
          <p className="font-display text-2xl text-amber mt-1">₹{request.proposedAmount || request.amount}</p>
          <p className="font-mono text-[8px] text-ink-3 mt-1">{timeAgo(request.requestedAt)}</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-metal-1/40 flex flex-wrap items-center gap-2">
        <span className="font-technical text-[8px] mr-auto" style={{ color: `var(--${REQUEST_STATUS[request.requestStatus].color})` }}>
          <LED color={REQUEST_STATUS[request.requestStatus].color} size={5} /> {REQUEST_STATUS[request.requestStatus].label}
        </span>
        {accepted && (
          <Link to="/dashboard/messages/conv1" className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]">
            <MessageSquare size={12} />
            MESSAGE
          </Link>
        )}
        {!accepted && !rejected && (
          <>
            <button onClick={() => onUpdate(request.id, 'accepted')} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]">
              <Check size={12} />
              ACCEPT
            </button>
            <button onClick={() => onUpdate(request.id, 'rejected')} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px]">
              <X size={12} />
              REJECT
            </button>
            {request.requestType === 'bargain' && (
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-[8px]">
                <HandCoins size={12} />
                COUNTER OFFER
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
