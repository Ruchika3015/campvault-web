import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { useProposals } from '@/context/ProposalContext';
import { REQUEST_STATUS, timeAgo } from '@/data/jugaadMockData';
import {
  MessageSquare,
  HandCoins,
  Check,
  X,
  Clock,
  Tag,
  Undo2,
} from 'lucide-react';
import { ConfirmActionModal } from '@/components/workshop/pages/ConfirmActionModal';

const STATUS_CFG = {
  ...REQUEST_STATUS,

  waiting: {
    color: 'amber',
    label: 'PENDING',
  },

  withdrawn: {
    color: 'ink',
    label: 'WITHDRAWN',
  },
};

function getPoster(request) {
  // Support all possible backend/frontend shapes.
  const poster =
    request?.poster ||
    request?.owner ||
    request?.jugaad?.poster ||
    request?.jugaad?.owner ||
    request?.jugaad?.user ||
    request?.user ||
    request?.creator ||
    null;

  if (!poster) {
    return {
      name: 'Unknown User',
      initials: 'U',
    };
  }

  const name =
    poster.name ||
    poster.full_name ||
    poster.fullName ||
    poster.username ||
    poster.email ||
    'Unknown User';

  const initials =
    poster.initials ||
    poster.avatarInitials ||
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() ||
    'U';

  return {
    name,
    initials,
  };
}

function safeTimeAgo(value) {
  if (!value) {
    return 'recently';
  }

  try {
    return timeAgo(value);
  } catch {
    return 'recently';
  }
}

/*
 * The backend uses PostgreSQL bigint for conversation IDs.
 *
 * Therefore values such as:
 *   "conv1"
 *   "conv-1"
 *   "abc"
 *
 * are NOT valid conversation IDs.
 *
 * Only allow numeric IDs here.
 */
function getValidConversationId(request) {
  const rawId =
    request?.conversationId ??
    request?.conversation_id ??
    request?.conversation?.id;

  if (rawId === null || rawId === undefined) {
    return null;
  }

  const value = String(rawId).trim();

  if (!/^\d+$/.test(value)) {
    return null;
  }

  return value;
}

export function MyRequestsPage() {
  const {
    myRequests = [],
    acceptCounter,
    rejectCounter,
    withdrawProposal,
  } = useProposals();

  const [confirmAction, setConfirmAction] = useState(null);

  const requests = Array.isArray(myRequests) ? myRequests : [];

  const handleWithdraw = (request) => {
    setConfirmAction({
      variant: 'withdraw',

      proposal: {
        id: request?.proposalId,

        helper: {
          name: 'You',
        },

        jugaadTitle:
          request?.jugaadTitle ||
          request?.jugaad?.title ||
          'Jugaad',

        proposedPrice:
          request?.proposedAmount ??
          request?.amount ??
          request?.proposed_price ??
          0,
      },
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) {
      return;
    }

    try {
      if (
        confirmAction.variant === 'withdraw' &&
        confirmAction.proposal?.id
      ) {
        await withdrawProposal(confirmAction.proposal.id);
      }
    } catch (error) {
      console.error(
        'Failed to perform proposal action:',
        error
      );
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div>
      <section className="pt-12 pb-7">
        <div className="flex items-center gap-3 mb-4">
          <LED
            color="mint"
            pulse
            size={7}
          />

          <span className="font-technical text-[9px] text-ink-2">
            05 — YOUR OUTGOING SIGNALS
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl">
          MY
          <br />
          <span className="text-mint">
            REQUESTS.
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-sm text-ink-2">
          Track every Jugaad where you raised your hand,
          made an offer, or started a collaboration.
        </p>
      </section>

      {requests.length === 0 ? (
        <div
          className="surface-panel rounded-2xl p-8 text-center"
          style={{
            border: '1px solid var(--metal-1)',
          }}
        >
          <p className="font-display text-lg text-ink-2">
            NO REQUESTS YET.
          </p>

          <p className="font-mono text-[10px] text-ink-3 mt-2">
            Your interests and proposals will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request, index) => (
            <RequestRow
              key={
                request?.id ||
                request?.proposalId ||
                request?.jugaadId ||
                `request-${index}`
              }
              request={request}
              acceptCounter={acceptCounter}
              rejectCounter={rejectCounter}
              onWithdraw={() => handleWithdraw(request)}
            />
          ))}
        </div>
      )}

      {confirmAction && (
        <ConfirmActionModal
          variant={confirmAction.variant}
          proposal={confirmAction.proposal}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}

function RequestRow({
  request = {},
  acceptCounter,
  rejectCounter,
  onWithdraw,
}) {
  const poster = getPoster(request);

  const status = request?.status || 'waiting';

  const cfg =
    STATUS_CFG[status] || {
      color: 'amber',
      label: status.toUpperCase(),
    };

  const isAccepted = [
    'accepted',
    'price-agreed',
    'in-progress',
    'completed',
  ].includes(status);

  const isNegotiating =
    status === 'negotiating';

  const isWithdrawn =
    status === 'withdrawn';

  const isPending =
    status === 'waiting' ||
    status === 'pending';

  const proposalId =
    request?.proposalId ||
    request?.proposal_id ||
    request?.id;

  const canWithdraw =
    Boolean(proposalId) &&
    !isWithdrawn &&
    (isPending || isNegotiating);

  const jugaadTitle =
    request?.jugaadTitle ||
    request?.jugaad_title ||
    request?.jugaad?.title ||
    request?.title ||
    'Untitled Jugaad';

  const category =
    request?.category ||
    request?.jugaad?.category ||
    'General';

  const proposedAmount =
    request?.agreedAmount ??
    request?.agreed_amount ??
    request?.proposedAmount ??
    request?.proposed_amount ??
    request?.amount ??
    request?.proposed_price ??
    0;

  const requestType =
    request?.requestType ||
    request?.request_type ||
    (
      request?.proposedAmount != null ||
      request?.proposed_amount != null ||
      request?.proposed_price != null
        ? 'proposal'
        : 'interest'
    );

  const explanation =
    request?.explanation ||
    request?.proposal_message ||
    request?.message ||
    '';

  const skills = Array.isArray(request?.skills)
    ? request.skills
    : [];

  const completionTime =
    request?.completionTime ||
    request?.completion_time ||
    request?.estimated_completion ||
    '';

  const requestedAt =
    request?.requestedAt ||
    request?.requested_at ||
    request?.createdAt ||
    request?.created_at;

  const negotiationHistory = Array.isArray(
    request?.negotiationHistory
  )
    ? request.negotiationHistory
    : Array.isArray(request?.negotiation_history)
      ? request.negotiation_history
      : [];

  /*
   * IMPORTANT:
   *
   * Do NOT use:
   *
   *   conversationId || 'conv1'
   *
   * because the backend expects a bigint.
   *
   * getValidConversationId() returns:
   *
   *   "1"   -> valid
   *   "2"   -> valid
   *   "conv1" -> null
   *   "conv-1" -> null
   */
  const conversationId =
    getValidConversationId(request);

  return (
    <article
      className="surface-panel rounded-2xl p-5"
      style={{
        border: '1px solid var(--metal-1)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* POSTER AVATAR */}
        <span className="grid place-items-center w-10 h-10 rounded-full bg-amber text-bg-0 font-display text-[9px] shrink-0">
          {poster.initials}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg">
              {jugaadTitle}
            </h2>

            <span
              className="font-technical text-[7px] px-2 py-1 rounded"
              style={{
                color: `var(--${cfg.color})`,
                background: `color-mix(in srgb, var(--${cfg.color}) 12%, transparent)`,
              }}
            >
              {cfg.label}
            </span>
          </div>

          <p className="font-mono text-[9px] text-ink-3 mt-1">
            Poster: {poster.name} · {category} ·{' '}
            {safeTimeAgo(requestedAt)}
          </p>

          {explanation && (
            <p className="font-mono text-[10px] text-ink-2 mt-2 leading-relaxed surface-panel rounded-lg p-3">
              "{explanation}"
            </p>
          )}

          {skills.length > 0 && (
            <p className="font-mono text-[9px] text-ink-3 mt-2 flex items-center gap-1 flex-wrap">
              <Tag size={10} />

              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                >
                  {skill}
                  {index < skills.length - 1
                    ? ' · '
                    : ''}
                </span>
              ))}
            </p>
          )}

          {completionTime && (
            <p className="font-mono text-[9px] text-ink-3 mt-1 flex items-center gap-1">
              <Clock size={11} />
              {completionTime}
            </p>
          )}
        </div>

        <div className="text-right shrink-0">
          <p className="font-display text-xl text-amber">
            ₹{Number(proposedAmount || 0).toFixed(2)}
          </p>

          <p className="font-mono text-[8px] text-ink-3">
            {requestType === 'bargain'
              ? 'BARGAIN'
              : requestType === 'proposal'
                ? 'PROPOSAL'
                : 'INTEREST'}
          </p>
        </div>
      </div>

      {/* NEGOTIATION HISTORY */}
      {isNegotiating &&
        negotiationHistory.length > 0 && (
          <div className="mt-4 surface-wood rounded-xl p-3">
            <p className="font-technical text-[8px] text-paper/80 mb-2">
              NEGOTIATION HISTORY
            </p>

            {negotiationHistory.map(
              (offer, index) => (
                <div
                  key={offer?.id || index}
                  className="flex items-center gap-2 py-1"
                >
                  <span className="font-mono text-[9px] text-paper flex-1">
                    {offer?.from === 'me'
                      ? 'You'
                      : 'Poster'}

                    {offer?.message
                      ? ` — ${offer.message}`
                      : ''}
                  </span>

                  <span className="font-display text-sm text-amber">
                    ₹
                    {Number(
                      offer?.amount || 0
                    ).toFixed(2)}
                  </span>
                </div>
              )
            )}
          </div>
        )}

      {/* ACTIONS */}
      <div className="mt-4 pt-3 border-t border-metal-1/40 flex flex-wrap gap-2">
        {/* MESSAGE AFTER ACCEPTANCE */}

        {isAccepted && conversationId && (
          <Link
            to={`/dashboard/messages/${conversationId}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px] hover:bg-mint/25 transition-colors"
          >
            <MessageSquare size={12} />
            MESSAGE
          </Link>
        )}

        {/* If accepted but backend has not supplied
            a real conversation ID, don't create a fake one. */}
        {isAccepted && !conversationId && (
          <span className="font-mono text-[9px] text-ink-3">
            Conversation unavailable.
          </span>
        )}

        {/* NEGOTIATION ACTIONS */}
        {isNegotiating && proposalId && (
          <>
            <button
              type="button"
              onClick={() => {
                try {
                  acceptCounter(proposalId);
                } catch (error) {
                  console.error(
                    'Failed to accept counter offer:',
                    error
                  );
                }
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px] hover:bg-mint/25 transition-colors"
            >
              <Check size={12} />
              ACCEPT OFFER
            </button>

            <button
              type="button"
              onClick={() => {
                try {
                  rejectCounter(proposalId);
                } catch (error) {
                  console.error(
                    'Failed to reject counter offer:',
                    error
                  );
                }
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px] hover:bg-coral/20 transition-colors"
            >
              <X size={12} />
              REJECT
            </button>

            <button
              type="button"
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-[8px] hover:bg-amber/10 transition-colors"
            >
              <HandCoins size={12} />
              COUNTER
            </button>
          </>
        )}

        {isNegotiating && !proposalId && (
          <span className="font-mono text-[9px] text-ink-3">
            Waiting for your response to the counter offer.
          </span>
        )}

        {/* WITHDRAW */}
        {canWithdraw && (
          <button
            type="button"
            onClick={onWithdraw}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px] hover:bg-coral/20 transition-colors ml-auto"
          >
            <Undo2 size={12} />
            WITHDRAW PROPOSAL
          </button>
        )}

        {isWithdrawn && (
          <span className="font-mono text-[9px] text-ink-3 ml-auto">
            This proposal was withdrawn.
          </span>
        )}
      </div>
    </article>
  );
}