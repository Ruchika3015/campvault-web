import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  Inbox,
  Check,
  X,
  HandCoins,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { CounterOfferModal } from '@/components/workshop/pages/CounterOfferModal';
import { ConfirmActionModal } from '@/components/workshop/pages/ConfirmActionModal';

const PROPOSAL_STATUS = {
  pending: {
    color: 'amber',
    label: 'PENDING',
  },
  accepted: {
    color: 'mint',
    label: 'ACCEPTED',
  },
  rejected: {
    color: 'coral',
    label: 'REJECTED',
  },
  withdrawn: {
    color: 'ink',
    label: 'WITHDRAWN',
  },
};

function formatTimeAgo(dateValue) {
  if (!dateValue) return '';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

function getInitials(name) {
  if (!name) return 'U';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function RequestsPage() {
  const { isAuthenticated } = useAuth();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [counterTarget, setCounterTarget] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [conversationIds, setConversationIds] = useState({});

  const fetchProposals = useCallback(async () => {
    if (!isAuthenticated) {
      setProposals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.getReceivedProposals();

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setProposals(list);
    } catch (err) {
      console.error('Failed to load received proposals:', err);

      setError(
        err?.message ||
          'Unable to load incoming proposals. Please try again.'
      );

      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleAccept = async (proposal) => {
    try {
      const response = await api.acceptProposal(proposal.id);

      /*
       * The backend returns:
       *
       * {
       *   success: true,
       *   message: "...",
       *   proposal: {...},
       *   jugaad: {...},
       *   conversation: {...}
       * }
       */

      const conversationId =
        response?.conversation?.id ||
        response?.data?.conversation?.id ||
        null;

      if (conversationId) {
        setConversationIds((current) => ({
          ...current,
          [proposal.id]: conversationId,
        }));
      }

      await fetchProposals();
    } catch (err) {
      console.error('Failed to accept proposal:', err);

      setError(
        err?.message ||
          'Unable to accept this proposal. Please try again.'
      );
    }
  };

  const handleReject = async (proposal) => {
    try {
      await api.rejectProposal(proposal.id);
      await fetchProposals();
    } catch (err) {
      console.error('Failed to reject proposal:', err);

      setError(
        err?.message ||
          'Unable to reject this proposal. Please try again.'
      );
    }
  };

  const handleCounterOffer = async (price, message) => {
    if (!counterTarget) return;

    try {
      await api.createCounterOffer(counterTarget.id, {
        amount: price,
        message,
      });

      setCounterTarget(null);
      await fetchProposals();
    } catch (err) {
      console.error('Failed to create counter offer:', err);

      setError(
        err?.message ||
          'Unable to send counter-offer. Please try again.'
      );
    }
  };

  return (
    <div>
      {/* ============================================================
          HEADER
      ============================================================ */}

      <section className="pt-12 pb-7">
        <div className="flex items-center gap-3 mb-4">
          <LED color="coral" pulse size={7} />

          <span className="font-technical text-[9px] text-ink-2">
            04 — INCOMING SIGNALS
          </span>

          <span className="h-px w-10 bg-metal-2" />

          <span className="font-technical text-[9px] text-coral">
            LIVE
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl">
          REQUESTS
          <br />
          <span className="text-coral">RECEIVED.</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm text-ink-2 leading-relaxed">
          Students who submitted proposals for your Jugaads appear here.
          Review their offer, negotiate if needed, or accept the proposal.
        </p>
      </section>

      {/* ============================================================
          ERROR
      ============================================================ */}

      {error && (
        <div
          className="mb-5 rounded-xl p-4"
          style={{
            border: '1px solid rgba(220, 90, 90, 0.3)',
            background: 'rgba(220, 90, 90, 0.05)',
          }}
        >
          <p className="font-mono text-xs text-coral">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchProposals}
            className="mt-2 font-technical text-[8px] text-amber"
          >
            TRY AGAIN →
          </button>
        </div>
      )}

      {/* ============================================================
          LOADING
      ============================================================ */}

      {loading ? (
        <div
          className="surface-metal-brushed rounded-2xl p-12 text-center"
          style={{ border: '1px solid var(--metal-1)' }}
        >
          <div className="mx-auto mb-4 w-8 h-8 rounded-full border-2 border-metal-2 border-t-amber animate-spin" />

          <p className="font-display text-xl text-ink-0">
            LOADING REQUESTS
          </p>

          <p className="font-mono text-xs text-ink-3 mt-2">
            Connecting to the workshop...
          </p>
        </div>
      ) : proposals.length === 0 ? (
        /* ============================================================
           EMPTY STATE
        ============================================================ */

        <div
          className="surface-metal-brushed rounded-2xl p-12 text-center"
          style={{ border: '1px solid var(--metal-1)' }}
        >
          <Inbox
            size={36}
            className="mx-auto text-ink-3 mb-3"
          />

          <p className="font-display text-xl text-ink-0">
            NO INCOMING PROPOSALS
          </p>

          <p className="font-mono text-xs text-ink-2 mt-2 max-w-sm mx-auto">
            When another student submits a proposal for one of your
            Jugaads, it will appear here automatically.
          </p>
        </div>
      ) : (
        /* ============================================================
           REAL DATABASE PROPOSALS
        ============================================================ */

        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-technical text-[9px] text-amber">
              PROPOSALS RECEIVED
            </span>

            <span className="font-mono text-[8px] text-ink-3">
              ({proposals.length})
            </span>

            <span className="h-px flex-1 bg-metal-1/40" />
          </div>

          <div className="space-y-3">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                conversationId={conversationIds[proposal.id]}
                onAccept={() =>
                  setConfirmAction({
                    variant: 'accept',
                    proposal,
                  })
                }
                onReject={() =>
                  setConfirmAction({
                    variant: 'reject',
                    proposal,
                  })
                }
                onCounter={() =>
                  setCounterTarget(proposal)
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* ============================================================
          COUNTER OFFER MODAL
      ============================================================ */}

      {counterTarget && (
        <CounterOfferModal
          proposal={counterTarget}
          onClose={() => setCounterTarget(null)}
          onSubmit={handleCounterOffer}
        />
      )}

      {/* ============================================================
          CONFIRM ACCEPT / REJECT
      ============================================================ */}

      {confirmAction && (
        <ConfirmActionModal
          variant={confirmAction.variant}
          proposal={confirmAction.proposal}
          onClose={() => setConfirmAction(null)}
          onConfirm={async () => {
            const proposal = confirmAction.proposal;

            if (confirmAction.variant === 'accept') {
              await handleAccept(proposal);
            }

            if (confirmAction.variant === 'reject') {
              await handleReject(proposal);
            }

            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
}

/* ================================================================
   PROPOSAL CARD
================================================================ */

function ProposalCard({
  proposal,
  conversationId,
  onAccept,
  onReject,
  onCounter,
}) {
  const status = proposal.status || 'pending';

  const cfg =
    PROPOSAL_STATUS[status] ||
    PROPOSAL_STATUS.pending;

  const isAccepted = status === 'accepted';
  const isRejected = status === 'rejected';
  const isWithdrawn = status === 'withdrawn';

  const initials = getInitials(proposal.helper_name);

  return (
    <article
      className="surface-metal-brushed rounded-2xl p-5"
      style={{
        border: '1px solid var(--metal-1)',
      }}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* ========================================================
           HELPER INFORMATION
        ======================================================== */}

        <div className="flex items-start gap-3 flex-1">
          <span className="grid place-items-center w-11 h-11 rounded-full bg-amber text-bg-0 font-display text-[10px] shrink-0">
            {initials}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg">
                {proposal.helper_name || 'Student'}
              </p>

              <span
                className="font-technical text-[7px] px-2 py-0.5 rounded"
                style={{
                  color: `var(--${cfg.color})`,
                  background: `color-mix(in srgb, var(--${cfg.color}) 12%, transparent)`,
                }}
              >
                {cfg.label}
              </span>
            </div>

            {/* Email */}
            {proposal.helper_email && (
              <p className="font-mono text-[8px] text-ink-3 mt-1">
                {proposal.helper_email}
              </p>
            )}

            {/* Location */}
            {proposal.helper_location && (
              <p className="font-mono text-[8px] text-ink-3 mt-1">
                {proposal.helper_location}
              </p>
            )}

            {/* Jugaad */}
            <p className="font-mono text-[9px] text-ink-2 mt-3">
              Proposal for{' '}
              <span className="text-amber">
                {proposal.jugaad_title || 'Your Jugaad'}
              </span>
            </p>

            {/* Proposal message */}
            {proposal.proposal_message && (
              <div className="mt-3 surface-panel rounded-lg p-3">
                <p className="font-technical text-[7px] text-ink-3 mb-1">
                  PROPOSAL MESSAGE
                </p>

                <p className="font-mono text-[10px] text-ink-2 leading-relaxed">
                  "{proposal.proposal_message}"
                </p>
              </div>
            )}

            {/* Estimated completion */}
            {proposal.estimated_completion && (
              <div className="flex items-center gap-1 mt-3">
                <Clock
                  size={11}
                  className="text-ink-3"
                />

                <span className="font-mono text-[9px] text-ink-3">
                  Completion: {proposal.estimated_completion}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
           PRICE
        ======================================================== */}

        <div className="md:text-right shrink-0">
          <p className="font-technical text-[7px] text-ink-3">
            PROPOSED PRICE
          </p>

          <p className="font-display text-2xl text-amber mt-1">
            ₹{Number(proposal.proposed_price || 0).toLocaleString('en-IN')}
          </p>

          <p className="font-mono text-[8px] text-ink-3 mt-1">
            {formatTimeAgo(proposal.created_at)}
          </p>
        </div>
      </div>

      {/* ============================================================
          LATEST COUNTER OFFER
      ============================================================ */}

      {proposal.latest_counter_amount != null && (
        <div className="mt-4 surface-wood rounded-xl p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-technical text-[8px] text-paper/80">
                LATEST COUNTER OFFER
              </p>

              {proposal.latest_counter_message && (
                <p className="font-mono text-[9px] text-paper/70 mt-1">
                  {proposal.latest_counter_message}
                </p>
              )}
            </div>

            <p className="font-display text-lg text-amber shrink-0">
              ₹
              {Number(
                proposal.latest_counter_amount
              ).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* ============================================================
          ACTIONS
      ======================================================== */}

      <div className="mt-4 pt-3 border-t border-metal-1/40 flex flex-wrap items-center gap-2">
        <span
          className="font-technical text-[8px] mr-auto flex items-center gap-1.5"
          style={{
            color: `var(--${cfg.color})`,
          }}
        >
          <LED
            color={cfg.color}
            size={5}
          />

          {cfg.label}
        </span>

        {/* Accepted */}
        {isAccepted && (
          <>
            {conversationId ? (
              <Link
                to={`/dashboard/messages/${conversationId}`}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]"
              >
                <MessageSquare size={12} />
                MESSAGE
              </Link>
            ) : (
              <Link
                to="/dashboard/messages"
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]"
              >
                <MessageSquare size={12} />
                MESSAGES
              </Link>
            )}
          </>
        )}

        {/* Pending */}
        {!isAccepted &&
          !isRejected &&
          !isWithdrawn && (
            <>
              <button
                type="button"
                onClick={onAccept}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px] hover:bg-mint/25 transition-colors"
              >
                <Check size={12} />
                ACCEPT
              </button>

              <button
                type="button"
                onClick={onReject}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px] hover:bg-coral/20 transition-colors"
              >
                <X size={12} />
                REJECT
              </button>

              <button
                type="button"
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