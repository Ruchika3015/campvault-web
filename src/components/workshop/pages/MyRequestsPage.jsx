import { useState } from 'react';
import { Link } from 'react-router-dom';

import { LED } from '@/components/primitives/Details';
import { useProposals } from '@/context/ProposalContext';
import {
  REQUEST_STATUS,
  timeAgo,
} from '@/data/jugaadMockData';

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

/* ================================================================
   POSTER
================================================================ */

function getPoster(request) {
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

/* ================================================================
   SAFE TIME
================================================================ */

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

/* ================================================================
   GET VALID NUMERIC CONVERSATION ID
================================================================ */

function getNumericConversationId(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const id = String(value).trim();

  if (!id) {
    return null;
  }

  /*
   * PostgreSQL bigint conversation IDs are numeric.
   */
  if (!/^\d+$/.test(id)) {
    return null;
  }

  return id;
}

/* ================================================================
   FIND CONVERSATION FOR THIS REQUEST
================================================================ */

function getConversationForRequest(
  request,
  conversations = []
) {
  if (
    !request ||
    !Array.isArray(conversations)
  ) {
    return null;
  }

  /*
   * --------------------------------------------------------------
   * 1. FIRST: conversation ID already inside request
   * --------------------------------------------------------------
   */

  const directConversationId =
    getNumericConversationId(
      request?.conversationId ??
        request?.conversation_id ??
        request?.conversation?.id ??
        request?.conversation?.conversationId ??
        request?.conversation?.conversation_id
    );

  if (directConversationId) {
    return {
      ...(
        request?.conversation || {}
      ),
      id: directConversationId,
    };
  }

  /*
   * --------------------------------------------------------------
   * 2. Get proposal ID
   * --------------------------------------------------------------
   */

  const proposalId =
    request?.proposalId ??
    request?.proposal_id ??
    request?.proposal?.id ??
    request?.proposal?.proposalId ??
    request?.proposal?.proposal_id ??
    request?.id ??
    null;

  /*
   * --------------------------------------------------------------
   * 3. Get Jugaad ID
   * --------------------------------------------------------------
   */

  const jugaadId =
    request?.jugaadId ??
    request?.jugaad_id ??
    request?.jugaad?.id ??
    request?.item?.id ??
    null;

  /*
   * --------------------------------------------------------------
   * 4. FIRST MATCH: proposal_id
   *
   * This is the safest match.
   * --------------------------------------------------------------
   */

  if (
    proposalId !== null &&
    proposalId !== undefined
  ) {
    const proposalMatch =
      conversations.find((conversation) => {
        const conversationProposalId =
          conversation?.proposalId ??
          conversation?.proposal_id ??
          conversation?.proposal?.id ??
          conversation?.proposal?.proposalId ??
          conversation?.proposal?.proposal_id ??
          conversation?.proposal?.data?.id ??
          null;

        if (
          conversationProposalId === null ||
          conversationProposalId === undefined
        ) {
          return false;
        }

        return (
          String(
            conversationProposalId
          ) === String(proposalId)
        );
      });

    if (proposalMatch) {
      return proposalMatch;
    }
  }

  /*
   * --------------------------------------------------------------
   * 5. SECOND MATCH: jugaad_id
   *
   * This is a fallback in case the conversations endpoint
   * doesn't expose proposal_id in the frontend shape.
   * --------------------------------------------------------------
   */

  if (
    jugaadId !== null &&
    jugaadId !== undefined
  ) {
    const jugaadMatch =
      conversations.find((conversation) => {
        const conversationJugaadId =
          conversation?.jugaadId ??
          conversation?.jugaad_id ??
          conversation?.jugaad?.id ??
          null;

        if (
          conversationJugaadId === null ||
          conversationJugaadId === undefined
        ) {
          return false;
        }

        return (
          String(
            conversationJugaadId
          ) === String(jugaadId)
        );
      });

    if (jugaadMatch) {
      return jugaadMatch;
    }
  }

  return null;
}

/* ================================================================
   GET CONVERSATION ID
================================================================ */

function getValidConversationId(
  request,
  conversations = []
) {
  /*
   * First try the actual request object.
   */
  const directId =
    getNumericConversationId(
      request?.conversationId ??
        request?.conversation_id ??
        request?.conversation?.id ??
        request?.conversation?.conversationId ??
        request?.conversation?.conversation_id
    );

  if (directId) {
    return directId;
  }

  /*
   * Then find the conversation from ProposalContext.
   */
  const conversation =
    getConversationForRequest(
      request,
      conversations
    );

  if (!conversation) {
    return null;
  }

  return getNumericConversationId(
    conversation?.id ??
      conversation?.conversationId ??
      conversation?.conversation_id
  );
}

/* ================================================================
   PAGE
================================================================ */

export function MyRequestsPage() {
  const {
    myRequests = [],
    conversations = [],
    acceptCounter,
    rejectCounter,
    withdrawProposal,
  } = useProposals();

  const [confirmAction, setConfirmAction] =
    useState(null);

  const requests = Array.isArray(myRequests)
    ? myRequests
    : [];

  /*
   * Debug information.
   *
   * This will help verify exactly what the frontend
   * receives from the backend.
   */
  console.log(
    'MY REQUESTS:',
    requests
  );

  console.log(
    'MY REQUESTS - CONVERSATIONS:',
    conversations
  );

  /* ================================================================
     WITHDRAW
  ================================================================ */

  const handleWithdraw = (request) => {
    setConfirmAction({
      variant: 'withdraw',

      proposal: {
        id:
          request?.proposalId ??
          request?.proposal_id ??
          request?.id,

        helper: {
          name: 'You',
        },

        jugaadTitle:
          request?.jugaadTitle ||
          request?.jugaad_title ||
          request?.jugaad?.title ||
          'Jugaad',

        proposedPrice:
          request?.proposedAmount ??
          request?.proposed_amount ??
          request?.amount ??
          request?.proposed_price ??
          0,
      },
    });
  };

  /* ================================================================
     CONFIRM ACTION
  ================================================================ */

  const handleConfirmAction = async () => {
    if (!confirmAction) {
      return;
    }

    try {
      if (
        confirmAction.variant === 'withdraw' &&
        confirmAction.proposal?.id
      ) {
        await withdrawProposal(
          confirmAction.proposal.id
        );
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
      {/* ==========================================================
          HEADER
      ========================================================== */}

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
          Track every Jugaad where you raised your
          hand, made an offer, or started a
          collaboration.
        </p>
      </section>

      {/* ==========================================================
          REQUESTS
      ========================================================== */}

      {requests.length === 0 ? (
        <div
          className="surface-panel rounded-2xl p-8 text-center"
          style={{
            border:
              '1px solid var(--metal-1)',
          }}
        >
          <p className="font-display text-lg text-ink-2">
            NO REQUESTS YET.
          </p>

          <p className="font-mono text-[10px] text-ink-3 mt-2">
            Your interests and proposals will
            appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(
            (request, index) => (
              <RequestRow
                key={
                  request?.id ||
                  request?.proposalId ||
                  request?.proposal_id ||
                  request?.jugaadId ||
                  request?.jugaad_id ||
                  `request-${index}`
                }
                request={request}
                conversations={conversations}
                acceptCounter={acceptCounter}
                rejectCounter={rejectCounter}
                onWithdraw={() =>
                  handleWithdraw(request)
                }
              />
            )
          )}
        </div>
      )}

      {/* ==========================================================
          CONFIRM MODAL
      ========================================================== */}

      {confirmAction && (
        <ConfirmActionModal
          variant={confirmAction.variant}
          proposal={
            confirmAction.proposal
          }
          onClose={() =>
            setConfirmAction(null)
          }
          onConfirm={
            handleConfirmAction
          }
        />
      )}
    </div>
  );
}

/* ================================================================
   REQUEST ROW
================================================================ */

function RequestRow({
  request = {},
  conversations = [],
  acceptCounter,
  rejectCounter,
  onWithdraw,
}) {
  const poster = getPoster(request);

  const status =
    request?.status || 'waiting';

  const cfg =
    STATUS_CFG[status] || {
      color: 'amber',
      label: String(
        status
      ).toUpperCase(),
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

  /* ==============================================================
     PROPOSAL ID
  ============================================================== */

  const proposalId =
    request?.proposalId ??
    request?.proposal_id ??
    request?.proposal?.id ??
    request?.proposal?.proposalId ??
    request?.proposal?.proposal_id ??
    request?.id ??
    null;

  const canWithdraw =
    Boolean(proposalId) &&
    !isWithdrawn &&
    (isPending || isNegotiating);

  /* ==============================================================
     JUGAAD
  ============================================================== */

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

  /* ==============================================================
     PRICE
  ============================================================== */

  const proposedAmount =
    request?.agreedAmount ??
    request?.agreed_amount ??
    request?.proposedAmount ??
    request?.proposed_amount ??
    request?.amount ??
    request?.proposed_price ??
    0;

  /* ==============================================================
     TYPE
  ============================================================== */

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

  /* ==============================================================
     MESSAGE
  ============================================================== */

  const explanation =
    request?.explanation ||
    request?.proposal_message ||
    request?.message ||
    '';

  /* ==============================================================
     SKILLS
  ============================================================== */

  const skills = Array.isArray(
    request?.skills
  )
    ? request.skills
    : [];

  /* ==============================================================
     COMPLETION
  ============================================================== */

  const completionTime =
    request?.completionTime ||
    request?.completion_time ||
    request?.estimated_completion ||
    '';

  /* ==============================================================
     REQUEST DATE
  ============================================================== */

  const requestedAt =
    request?.requestedAt ||
    request?.requested_at ||
    request?.createdAt ||
    request?.created_at;

  /* ==============================================================
     NEGOTIATION HISTORY
  ============================================================== */

  const negotiationHistory =
    Array.isArray(
      request?.negotiationHistory
    )
      ? request.negotiationHistory
      : Array.isArray(
          request?.negotiation_history
        )
        ? request.negotiation_history
        : [];

  /* ==============================================================
     CONVERSATION

     THIS IS THE IMPORTANT FIX.

     We do NOT only check request.conversation_id.

     We also search the conversations array returned
     by ProposalContext using proposal_id / jugaad_id.
  ============================================================== */

  const conversation =
    getConversationForRequest(
      request,
      conversations
    );

  const conversationId =
    getValidConversationId(
      request,
      conversations
    );

  /*
   * Debug only.
   */
  console.log(
    'MY REQUEST ROW:',
    {
      proposalId,
      jugaadId:
        request?.jugaadId ??
        request?.jugaad_id,
      status,
      conversation,
      conversationId,
    }
  );

  return (
    <article
      className="surface-panel rounded-2xl p-5"
      style={{
        border:
          '1px solid var(--metal-1)',
      }}
    >
      {/* ==========================================================
          TOP
      ========================================================== */}

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
                background:
                  `color-mix(in srgb, var(--${cfg.color}) 12%, transparent)`,
              }}
            >
              {cfg.label}
            </span>
          </div>

          <p className="font-mono text-[9px] text-ink-3 mt-1">
            Poster: {poster.name} ·{' '}
            {category} ·{' '}
            {safeTimeAgo(
              requestedAt
            )}
          </p>

          {/* EXPLANATION */}

          {explanation && (
            <p className="font-mono text-[10px] text-ink-2 mt-2 leading-relaxed surface-panel rounded-lg p-3">
              "{explanation}"
            </p>
          )}

          {/* SKILLS */}

          {skills.length > 0 && (
            <p className="font-mono text-[9px] text-ink-3 mt-2 flex items-center gap-1 flex-wrap">
              <Tag size={10} />

              {skills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                  >
                    {skill}

                    {index <
                    skills.length - 1
                      ? ' · '
                      : ''}
                  </span>
                )
              )}
            </p>
          )}

          {/* COMPLETION TIME */}

          {completionTime && (
            <p className="font-mono text-[9px] text-ink-3 mt-1 flex items-center gap-1">
              <Clock size={11} />
              {completionTime}
            </p>
          )}
        </div>

        {/* ========================================================
            PRICE
        ======================================================== */}

        <div className="text-right shrink-0">
          <p className="font-display text-xl text-amber">
            ₹
            {Number(
              proposedAmount || 0
            ).toFixed(2)}
          </p>

          <p className="font-mono text-[8px] text-ink-3">
            {requestType ===
            'bargain'
              ? 'BARGAIN'
              : requestType ===
                  'proposal'
                ? 'PROPOSAL'
                : 'INTEREST'}
          </p>
        </div>
      </div>

      {/* ==========================================================
          NEGOTIATION HISTORY
      ========================================================== */}

      {isNegotiating &&
        negotiationHistory.length >
          0 && (
          <div className="mt-4 surface-wood rounded-xl p-3">
            <p className="font-technical text-[8px] text-paper/80 mb-2">
              NEGOTIATION HISTORY
            </p>

            {negotiationHistory.map(
              (offer, index) => (
                <div
                  key={
                    offer?.id ||
                    index
                  }
                  className="flex items-center gap-2 py-1"
                >
                  <span className="font-mono text-[9px] text-paper flex-1">
                    {offer?.from ===
                    'me'
                      ? 'You'
                      : 'Poster'}

                    {offer?.message
                      ? ` — ${offer.message}`
                      : ''}
                  </span>

                  <span className="font-display text-sm text-amber">
                    ₹
                    {Number(
                      offer?.amount ||
                        0
                    ).toFixed(2)}
                  </span>
                </div>
              )
            )}
          </div>
        )}

      {/* ==========================================================
          ACTIONS
      ========================================================== */}

      <div className="mt-4 pt-3 border-t border-metal-1/40 flex flex-wrap gap-2">

        {/* ========================================================
            MESSAGE AFTER ACCEPTANCE
        ======================================================== */}

        {isAccepted &&
          conversationId && (
            <Link
              to={`/dashboard/messages/${conversationId}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px] hover:bg-mint/25 transition-colors"
            >
              <MessageSquare
                size={12}
              />

              MESSAGE
            </Link>
          )}

        {/* ========================================================
            ONLY SHOW UNAVAILABLE IF THERE REALLY IS NO
            CONVERSATION
        ======================================================== */}

        {isAccepted &&
          !conversationId && (
            <span className="font-mono text-[9px] text-ink-3">
              Conversation unavailable.
            </span>
          )}

        {/* ========================================================
            NEGOTIATION ACTIONS
        ======================================================== */}

        {isNegotiating &&
          proposalId && (
            <>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await acceptCounter(
                      proposalId
                    );
                  } catch (error) {
                    console.error(
                      'Failed to accept counter offer:',
                      error
                    );
                  }
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px] hover:bg-mint/25 transition-colors"
              >
                <Check
                  size={12}
                />

                ACCEPT OFFER
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await rejectCounter(
                      proposalId
                    );
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
                <HandCoins
                  size={12}
                />

                COUNTER
              </button>
            </>
          )}

        {isNegotiating &&
          !proposalId && (
            <span className="font-mono text-[9px] text-ink-3">
              Waiting for your
              response to the
              counter offer.
            </span>
          )}

        {/* ========================================================
            WITHDRAW
        ======================================================== */}

        {canWithdraw && (
          <button
            type="button"
            onClick={
              onWithdraw
            }
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px] hover:bg-coral/20 transition-colors ml-auto"
          >
            <Undo2
              size={12}
            />

            WITHDRAW PROPOSAL
          </button>
        )}

        {/* ========================================================
            WITHDRAWN
        ======================================================== */}

        {isWithdrawn && (
          <span className="font-mono text-[9px] text-ink-3 ml-auto">
            This proposal was withdrawn.
          </span>
        )}
      </div>
    </article>
  );
}

export default MyRequestsPage;