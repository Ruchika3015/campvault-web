import { useState } from 'react';
import { Link } from 'react-router-dom';

import { LED } from '@/components/primitives/Details';

import { useProposals } from '@/context/ProposalContext';

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


// ================================================================
// STATUS CONFIG
// ================================================================

const STATUS_CFG = {

  accepted: {
    color: 'mint',
    label: 'ACCEPTED',
  },

  'price-agreed': {
    color: 'mint',
    label: 'ACCEPTED',
  },

  'in-progress': {
    color: 'amber',
    label: 'IN PROGRESS',
  },

  completed: {
    color: 'mint',
    label: 'COMPLETED',
  },

  negotiating: {
    color: 'amber',
    label: 'NEGOTIATING',
  },

  pending: {
    color: 'amber',
    label: 'PENDING',
  },

  waiting: {
    color: 'amber',
    label: 'PENDING',
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


// ================================================================
// GET POSTER
//
// IMPORTANT:
// Backend returns:
//     poster_name
//
// This is the person who posted the Jugaad.
//
// Do NOT use the logged-in helper here.
// ================================================================

function getPoster(request = {}) {

  const name =
    request?.poster_name ??
    request?.posterName ??
    request?.poster?.name ??
    request?.owner?.name ??
    request?.jugaad?.poster?.name ??
    request?.jugaad?.owner?.name ??
    request?.creator?.name ??
    request?.creator_name ??
    request?.creatorName ??
    'Unknown User';


  const cleanName =
    String(name).trim() ||
    'Unknown User';


  const initialsSource =
    request?.poster_initials ??
    request?.posterInitials ??
    request?.poster?.initials ??
    request?.poster?.avatarInitials ??
    null;


  let initials = initialsSource;


  if (!initials) {

    initials = cleanName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join('')
      .toUpperCase();

  }


  if (!initials) {
    initials = 'U';
  }


  return {
    name: cleanName,
    initials,
  };

}


// ================================================================
// SAFE RELATIVE TIME
//
// Uses the ACTUAL backend timestamp.
//
// Example:
//     2026-08-27T14:04:40.385Z
//
// Browser converts it to the user's local time automatically.
// ================================================================

function safeTimeAgo(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'date unavailable';
  }


  const date =
    value instanceof Date
      ? value
      : new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'date unavailable';
  }


  const now =
    Date.now();


  const difference =
    now -
    date.getTime();


  // Small clock differences should still be "just now".
  if (difference < 60000) {
    return 'just now';
  }


  const seconds =
    Math.floor(
      difference / 1000
    );


  const minutes =
    Math.floor(
      seconds / 60
    );


  if (minutes < 60) {
    return `${minutes}m ago`;
  }


  const hours =
    Math.floor(
      minutes / 60
    );


  if (hours < 24) {
    return `${hours}h ago`;
  }


  const days =
    Math.floor(
      hours / 24
    );


  if (days < 30) {
    return `${days}d ago`;
  }


  const months =
    Math.floor(
      days / 30
    );


  if (months < 12) {
    return `${months}mo ago`;
  }


  const years =
    Math.floor(
      months / 12
    );


  return `${years}y ago`;

}


// ================================================================
// GET VALID CONVERSATION ID
//
// PostgreSQL conversation IDs are bigint.
// Never use fake values like "conv1".
// ================================================================

function getValidConversationId(
  request = {}
) {

  const rawId =
    request?.conversation_id ??
    request?.conversationId ??
    request?.conversation?.id;


  if (
    rawId === null ||
    rawId === undefined ||
    rawId === ''
  ) {
    return null;
  }


  const value =
    String(rawId).trim();


  if (
    !/^\d+$/.test(value)
  ) {
    return null;
  }


  return value;

}


// ================================================================
// MAIN PAGE
// ================================================================

export function MyRequestsPage() {

  const {

    myRequests = [],

    acceptCounter,

    rejectCounter,

    withdrawProposal,

  } = useProposals();


  const [
    confirmAction,
    setConfirmAction,
  ] = useState(null);


  const requests =
    Array.isArray(myRequests)
      ? myRequests
      : [];


  // ================================================================
  // WITHDRAW
  // ================================================================

  const handleWithdraw =
    (request) => {

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
            request?.jugaadTitle ??
            request?.jugaad_title ??
            request?.jugaad?.title ??
            request?.title ??
            'Jugaad',

          proposedPrice:
            request?.agreedAmount ??
            request?.agreed_amount ??
            request?.proposedAmount ??
            request?.proposed_amount ??
            request?.proposed_price ??
            request?.amount ??
            0,

        },

      });

    };


  // ================================================================
  // CONFIRM ACTION
  // ================================================================

  const handleConfirmAction =
    async () => {

      if (!confirmAction) {
        return;
      }


      try {

        if (
          confirmAction.variant ===
            'withdraw' &&
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


  // ================================================================
  // RENDER
  // ================================================================

  return (

    <div>

      {/* ==========================================================
          PAGE HEADER
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
          Track every Jugaad where you raised your hand,
          made an offer, or started a collaboration.
        </p>

      </section>


      {/* ==========================================================
          EMPTY STATE
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
            Your interests and proposals will appear here.
          </p>

        </div>

      ) : (

        /* ========================================================
           REQUEST LIST
        ======================================================== */

        <div className="space-y-3">

          {requests.map(
            (
              request,
              index
            ) => (

              <RequestRow

                key={

                  request?.proposalId ??

                  request?.proposal_id ??

                  request?.id ??

                  request?.jugaadId ??

                  request?.jugaad_id ??

                  `request-${index}`

                }

                request={request}

                acceptCounter={
                  acceptCounter
                }

                rejectCounter={
                  rejectCounter
                }

                onWithdraw={() =>
                  handleWithdraw(
                    request
                  )
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

          variant={
            confirmAction.variant
          }

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


// ================================================================
// REQUEST ROW
// ================================================================

function RequestRow({

  request = {},

  acceptCounter,

  rejectCounter,

  onWithdraw,

}) {


  // ==============================================================
  // POSTER
  // ==============================================================

  const poster =
    getPoster(request);


  // ==============================================================
  // STATUS
  // ==============================================================

  const status =
    String(
      request?.status ??
      'pending'
    ).toLowerCase();


  const cfg =
    STATUS_CFG[status] ?? {

      color: 'amber',

      label:
        status
          .replace(
            /[-_]/g,
            ' '
          )
          .toUpperCase(),

    };


  // ==============================================================
  // STATUS FLAGS
  // ==============================================================

  const isAccepted = [

    'accepted',

    'price-agreed',

    'in-progress',

    'in_progress',

    'completed',

  ].includes(status);


  const isNegotiating =
    status === 'negotiating';


  const isWithdrawn =
    status === 'withdrawn';


  const isPending = [

    'waiting',

    'pending',

  ].includes(status);


  // ==============================================================
  // PROPOSAL ID
  // ==============================================================

  const proposalId =
    request?.proposalId ??
    request?.proposal_id ??
    request?.id;


  const canWithdraw =
    Boolean(proposalId) &&
    !isWithdrawn &&
    (
      isPending ||
      isNegotiating
    );


  // ==============================================================
  // JUGAAD DETAILS
  // ==============================================================

  const jugaadTitle =
    request?.jugaadTitle ??
    request?.jugaad_title ??
    request?.jugaad?.title ??
    request?.title ??
    'Untitled Jugaad';


  const category =
    request?.category ??
    request?.jugaad?.category ??
    'General';


  // ==============================================================
  // AMOUNT
  // ==============================================================

  const proposedAmount =
    request?.agreedAmount ??
    request?.agreed_amount ??
    request?.proposedAmount ??
    request?.proposed_amount ??
    request?.amount ??
    request?.proposed_price ??
    0;


  // ==============================================================
  // REQUEST TYPE
  // ==============================================================

  const requestType =
    request?.requestType ??
    request?.request_type ??
    (
      request?.proposedAmount != null ||
      request?.proposed_amount != null ||
      request?.proposed_price != null
        ? 'proposal'
        : 'interest'
    );


  // ==============================================================
  // MESSAGE / EXPLANATION
  // ==============================================================

  const explanation =
    request?.explanation ??
    request?.proposal_message ??
    request?.message ??
    '';


  // ==============================================================
  // SKILLS
  // ==============================================================

  const skills =
    Array.isArray(
      request?.skills
    )
      ? request.skills
      : Array.isArray(
          request?.required_skills
        )
        ? request.required_skills
        : [];


  // ==============================================================
  // COMPLETION TIME
  // ==============================================================

  const completionTime =
    request?.completionTime ??
    request?.completion_time ??
    request?.estimated_completion ??
    '';


  // ==============================================================
  // IMPORTANT:
  //
  // The backend proposal query returns:
  //
  //     p.created_at
  //
  // That is the real time the request was submitted.
  //
  // Prefer created_at above everything else.
  // ==============================================================

  const requestedAt =
    request?.created_at ??
    request?.createdAt ??
    request?.requested_at ??
    request?.requestedAt ??
    null;


  // ==============================================================
  // NEGOTIATION HISTORY
  // ==============================================================

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


  // ==============================================================
  // CONVERSATION ID
  //
  // Only show MESSAGE when proposal is accepted.
  // ==============================================================

  const conversationId =
    getValidConversationId(
      request
    );


  return (

    <article
      className="surface-panel rounded-2xl p-5"
      style={{
        border:
          '1px solid var(--metal-1)',
      }}
    >

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-start gap-3">

        {/* ======================================================
            POSTER AVATAR
        ====================================================== */}

        <span className="grid place-items-center w-10 h-10 rounded-full bg-amber text-bg-0 font-display text-[9px] shrink-0">

          {poster.initials}

        </span>


        {/* ======================================================
            INFORMATION
        ====================================================== */}

        <div className="flex-1 min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h2 className="font-display text-lg">

              {jugaadTitle}

            </h2>


            <span

              className="font-technical text-[7px] px-2 py-1 rounded"

              style={{
                color:
                  `var(--${cfg.color})`,

                background:
                  `color-mix(in srgb, var(--${cfg.color}) 12%, transparent)`,
              }}

            >

              {cfg.label}

            </span>

          </div>


          {/* ====================================================
              POSTER + REAL TIMESTAMP
          ==================================================== */}

          <p className="font-mono text-[9px] text-ink-3 mt-1">

            Poster:{' '}

            <span className="text-ink-1">

              {poster.name}

            </span>

            {' '}·{' '}

            {category}

            {' '}·{' '}

            {safeTimeAgo(
              requestedAt
            )}

          </p>


          {/* ====================================================
              PROPOSAL MESSAGE
          ==================================================== */}

          {explanation && (

            <p className="font-mono text-[10px] text-ink-2 mt-2 leading-relaxed surface-panel rounded-lg p-3">

              "{explanation}"

            </p>

          )}


          {/* ====================================================
              SKILLS
          ==================================================== */}

          {skills.length > 0 && (

            <p className="font-mono text-[9px] text-ink-3 mt-2 flex items-center gap-1 flex-wrap">

              <Tag size={10} />


              {skills.map(
                (
                  skill,
                  index
                ) => (

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


          {/* ====================================================
              COMPLETION TIME
          ==================================================== */}

          {completionTime && (

            <p className="font-mono text-[9px] text-ink-3 mt-1 flex items-center gap-1">

              <Clock size={11} />

              {completionTime}

            </p>

          )}

        </div>


        {/* ======================================================
            AMOUNT
        ====================================================== */}

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


      {/* =========================================================
          NEGOTIATION HISTORY
      ========================================================= */}

      {isNegotiating &&
        negotiationHistory.length > 0 && (

          <div className="mt-4 surface-wood rounded-xl p-3">

            <p className="font-technical text-[8px] text-paper/80 mb-2">

              NEGOTIATION HISTORY

            </p>


            {negotiationHistory.map(
              (
                offer,
                index
              ) => (

                <div

                  key={
                    offer?.id ??
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
                      offer?.amount ??
                      0
                    ).toFixed(2)}

                  </span>

                </div>

              )
            )}

          </div>

        )}


      {/* =========================================================
          ACTIONS
      ========================================================= */}

      <div className="mt-4 pt-3 border-t border-metal-1/40 flex flex-wrap gap-2">

        {/* ======================================================
            MESSAGE
            ONLY AFTER ACCEPTANCE
        ====================================================== */}

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


        {/* ======================================================
            ACCEPTED BUT NO CONVERSATION
        ====================================================== */}

        {isAccepted &&
          !conversationId && (

            <span className="font-mono text-[9px] text-ink-3">

              Conversation unavailable.

            </span>

          )}


        {/* ======================================================
            NEGOTIATION ACTIONS
        ====================================================== */}

        {isNegotiating &&
          proposalId && (

            <>

              {/* ACCEPT COUNTER */}

              <button

                type="button"

                onClick={() => {

                  try {

                    const result =
                      acceptCounter(
                        proposalId
                      );


                    if (
                      result?.catch
                    ) {

                      result.catch(
                        (error) =>
                          console.error(
                            'Failed to accept counter offer:',
                            error
                          )
                      );

                    }

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


              {/* REJECT COUNTER */}

              <button

                type="button"

                onClick={() => {

                  try {

                    const result =
                      rejectCounter(
                        proposalId
                      );


                    if (
                      result?.catch
                    ) {

                      result.catch(
                        (error) =>
                          console.error(
                            'Failed to reject counter offer:',
                            error
                          )
                      );

                    }

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


              {/* COUNTER */}

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


        {/* ======================================================
            NEGOTIATING WITHOUT PROPOSAL ID
        ====================================================== */}

        {isNegotiating &&
          !proposalId && (

            <span className="font-mono text-[9px] text-ink-3">

              Waiting for your response to the counter offer.

            </span>

          )}


        {/* ======================================================
            WITHDRAW
        ====================================================== */}

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


        {/* ======================================================
            WITHDRAWN
        ====================================================== */}

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