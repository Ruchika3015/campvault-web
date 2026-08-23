import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { mockMyPostedJugaads, JUGAAD_STATUS, REQUEST_STATUS, timeAgo } from '@/data/jugaadMockData';
import { ClipboardList, ArrowLeft, ChevronRight, UserCheck, HandCoins, Check, X, MessageSquare, Clock, Tag } from 'lucide-react';
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

export function MyJugaadsPage() {
  const { proposals, acceptProposal, rejectProposal, counterProposal } = useProposals();
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState({});
  const [counterTarget, setCounterTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const items = mockMyPostedJugaads.map((x) => ({ ...x, status: status[x.id] || x.status }));

  if (selected) {
    const item = items.find((x) => x.id === selected) || items[0];
    const itemProposals = proposals.filter((p) => p.jugaadId === item.id);
    return (
      <Detail
        item={item}
        proposals={itemProposals}
        onBack={() => setSelected(null)}
        onStatus={(s) => setStatus((v) => ({ ...v, [item.id]: s }))}
        onAcceptProposal={(p) => setConfirmAction({ variant: 'accept', proposal: p })}
        onRejectProposal={(p) => setConfirmAction({ variant: 'reject', proposal: p })}
        onCounterProposal={(p) => setCounterTarget(p)}
        confirmAction={confirmAction}
        setConfirmAction={setConfirmAction}
        onConfirmAction={() => {
          if (confirmAction.variant === 'accept') acceptProposal(confirmAction.proposal.id);
          else if (confirmAction.variant === 'reject') rejectProposal(confirmAction.proposal.id);
          setConfirmAction(null);
        }}
      />
    );
  }

  return (
    <div>
      <Header title="MY JUGAADS" sub="The work you put into the exchange." icon={<ClipboardList />} />
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[9px] text-ink-3">{items.length} posted opportunities</p>
        <Link to="/dashboard/post-jugaad" className="machine-control machine-control--primary" style={{ padding: '8px 12px' }}>
          <span className="ctrl-led" />
          POST NEW
        </Link>
      </div>
      <div className="grid lg:grid-cols-2 gap-3">
        {items.map((item) => {
          const itemProposals = proposals.filter((p) => p.jugaadId === item.id);
          return (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className="surface-metal-brushed rounded-2xl p-5 text-left hover:border-amber/40 transition-colors"
              style={{ border: '1px solid var(--metal-1)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg">{item.title}</p>
                  <p className="font-mono text-[9px] text-ink-3 mt-1">{item.id} · {item.skillRequired}</p>
                </div>
                <span
                  className="font-technical text-[7px] px-2 py-1 rounded"
                  style={{ color: `var(--${JUGAAD_STATUS[item.status].color})`, background: `color-mix(in srgb, var(--${JUGAAD_STATUS[item.status].color}) 12%, transparent)` }}
                >
                  {JUGAAD_STATUS[item.status].label}
                </span>
              </div>
              <p className="font-mono text-[10px] text-ink-2 mt-4 line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-3 mt-4">
                <span className="font-display text-lg text-amber">₹{item.amount}</span>
                <span className="font-mono text-[9px] text-ink-3">
                  {item.interestedStudents.length + itemProposals.length} requests
                </span>
                {itemProposals.length > 0 && (
                  <span className="font-technical text-[7px] text-amber px-1.5 py-0.5 rounded bg-amber/10">
                    {itemProposals.length} PROPOSALS
                  </span>
                )}
                <ChevronRight size={14} className="ml-auto text-ink-3" />
              </div>
            </button>
          );
        })}
      </div>

      {counterTarget && (
        <CounterOfferModal
          proposal={counterTarget}
          onClose={() => setCounterTarget(null)}
          onSubmit={(price, msg) => counterProposal(counterTarget.id, price, msg)}
        />
      )}
    </div>
  );
}

function Header({ title, sub, icon }) {
  return (
    <section className="pt-12 pb-7">
      <div className="flex items-center gap-3 mb-4">
        <LED color="amber" pulse size={7} />
        <span className="font-technical text-[9px] text-ink-2">WORKSHOP // PERSONAL LEDGER</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-amber">{icon}</span>
        <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
      </div>
      <p className="mt-3 text-sm text-ink-2">{sub}</p>
    </section>
  );
}

function Detail({ item, proposals, onBack, onStatus, onAcceptProposal, onRejectProposal, onCounterProposal, confirmAction, setConfirmAction, onConfirmAction }) {
  return (
    <div>
      <section className="pt-12 pb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 font-technical text-[8px] text-ink-3 hover:text-ink-0 mb-5">
          <ArrowLeft size={12} />
          BACK TO MY JUGAADS
        </button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LED color={JUGAAD_STATUS[item.status].color} pulse size={5} />
              <span className="font-technical text-[8px]" style={{ color: `var(--${JUGAAD_STATUS[item.status].color})` }}>
                {JUGAAD_STATUS[item.status].label}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl">{item.title}</h1>
            <p className="font-mono text-[9px] text-ink-3 mt-2">{item.id} · {item.skillRequired} · posted {timeAgo(item.postedAt)}</p>
          </div>
          <div className="surface-panel rounded-xl px-5 py-3">
            <p className="font-technical text-[7px] text-ink-3">BUDGET</p>
            <p className="font-display text-2xl text-amber">₹{item.acceptedStudent?.agreedAmount || item.amount}</p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[.75fr_1.25fr] gap-5">
        <div className="surface-panel rounded-2xl p-5">
          <p className="font-technical text-[9px] mb-3">JUGAAD DETAILS</p>
          <p className="font-mono text-xs text-ink-2 leading-relaxed">{item.description}</p>
          <div className="mt-5 pt-4 border-t border-metal-1/40">
            <p className="font-technical text-[8px] text-ink-3">ASSIGNMENT STATUS</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['open', 'receiving-requests', 'assigned', 'in-progress', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => onStatus(s)}
                  className={`px-2.5 py-2 rounded-md font-technical text-[7px] ${item.status === s ? 'bg-amber text-bg-0' : 'bg-bg-2 text-ink-3 border border-metal-1'}`}
                >
                  {JUGAAD_STATUS[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Proposals Received */}
          {proposals.length > 0 && (
            <div className="surface-metal-brushed rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-technical text-[9px] text-amber">PROPOSALS RECEIVED</p>
                <span className="font-mono text-[8px] text-ink-3">{proposals.length} proposals</span>
              </div>
              <div className="space-y-3">
                {proposals.map((p) => (
                  <ProposalDetailCard
                    key={p.id}
                    proposal={p}
                    onAccept={() => onAcceptProposal(p)}
                    onReject={() => onRejectProposal(p)}
                    onCounter={() => onCounterProposal(p)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Existing interested students */}
          <div className="surface-metal-brushed rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-technical text-[9px]">INTERESTED STUDENTS</p>
              <span className="font-mono text-[8px] text-ink-3">{item.interestedStudents.length} requests</span>
            </div>
            <div className="space-y-3">
              {item.interestedStudents.map((student) => (
                <StudentRequest
                  key={student.id}
                  student={student}
                  assigned={item.acceptedStudent?.id === student.id}
                  locked={!!item.acceptedStudent && item.acceptedStudent.id !== student.id}
                />
              ))}
            </div>
            {item.acceptedStudent && (
              <div className="mt-4 surface-panel rounded-xl p-3 flex items-center gap-2 text-mint">
                <UserCheck size={15} />
                <span className="font-mono text-[10px]">Assigned to {item.acceptedStudent.name} · ₹{item.acceptedStudent.agreedAmount}</span>
                <Link to="/dashboard/messages/conv1" className="ml-auto font-technical text-[8px] text-mint">MESSAGE</Link>
              </div>
            )}
          </div>
        </div>

        {confirmAction && (
          <ConfirmActionModal
            variant={confirmAction.variant}
            proposal={confirmAction.proposal}
            onClose={() => setConfirmAction(null)}
            onConfirm={onConfirmAction}
          />
        )}
      </div>
    </div>
  );
}

function ProposalDetailCard({ proposal, onAccept, onReject, onCounter }) {
  const status = proposal.status;
  const cfg = PROPOSAL_STATUS[status] || PROPOSAL_STATUS.pending;
  const isAccepted = status === 'accepted';
  const isRejected = status === 'rejected';
  const isWithdrawn = status === 'withdrawn';
  const conversationId = `conv-${proposal.id}`;

  return (
    <div className="surface-panel rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-amber text-bg-0 font-display text-[9px] shrink-0">
          {proposal.helper?.initials || 'U'}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-sm">{proposal.helper?.name || 'Student'}</p>
            <span className="font-technical text-[7px] px-1.5 py-0.5 rounded" style={{ color: `var(--${cfg.color})`, background: `color-mix(in srgb, var(--${cfg.color}) 12%, transparent)` }}>
              {cfg.label}
            </span>
          </div>
          {proposal.skills && proposal.skills.length > 0 && (
            <p className="font-mono text-[8px] text-ink-3 mt-1 flex items-center gap-1">
              <Tag size={10} />
              {proposal.skills.join(' · ')}
            </p>
          )}
          {proposal.explanation && (
            <p className="font-mono text-[10px] text-ink-2 mt-2 leading-relaxed">"{proposal.explanation}"</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[9px] font-mono text-ink-3">
            <span className="font-display text-base text-amber">₹{proposal.proposedPrice}</span>
            {proposal.completionTime && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {proposal.completionTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {status === 'counter-offer' && proposal.offerHistory && proposal.offerHistory.length > 1 && (
        <div className="mt-3 surface-wood rounded-lg p-2">
          <p className="font-technical text-[7px] text-paper/70 mb-1">OFFER HISTORY</p>
          {proposal.offerHistory.map((offer, i) => (
            <div key={i} className="flex items-center gap-2 py-0.5">
              <span className="font-mono text-[8px] text-paper flex-1">
                {offer.from === 'helper' ? proposal.helper?.name || 'Helper' : 'You'} {offer.message && `— ${offer.message}`}
              </span>
              <span className="font-display text-xs text-amber">₹{offer.amount}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-3 pt-3 border-t border-metal-1/40">
        {isAccepted && (
          <Link to={`/dashboard/messages/${conversationId}`} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]">
            <MessageSquare size={12} />
            MESSAGE
          </Link>
        )}
        {!isAccepted && !isRejected && !isWithdrawn && (
          <>
            <button onClick={onAccept} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]">
              <Check size={12} />
              ACCEPT
            </button>
            <button onClick={onReject} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px]">
              <X size={12} />
              REJECT
            </button>
            <button onClick={onCounter} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-[8px]">
              <HandCoins size={12} />
              COUNTER
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StudentRequest({ student, assigned, locked }) {
  return (
    <div className="surface-panel rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-amber text-bg-0 font-display text-[9px] shrink-0">{student.initials}</span>
        <div className="flex-1">
          <p className="font-display text-sm">{student.name}</p>
          <p className="font-mono text-[8px] text-ink-3 mt-1">{student.skills.join(' · ')} · {student.rating}★</p>
          {student.message && <p className="font-mono text-[10px] text-ink-2 mt-2">"{student.message}"</p>}
        </div>
        <span className="font-technical text-[7px] text-amber">{student.requestType === 'bargain' ? `OFFER ₹${student.proposedAmount}` : 'INTERESTED'}</span>
      </div>
      {!assigned && !locked && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-metal-1/40">
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]">
            <Check size={12} />
            ACCEPT
          </button>
          <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px]">
            <X size={12} />
            REJECT
          </button>
          {student.requestType === 'bargain' && (
            <button className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-[8px]">
              <HandCoins size={12} />
              COUNTER
            </button>
          )}
        </div>
      )}
    </div>
  );
}
