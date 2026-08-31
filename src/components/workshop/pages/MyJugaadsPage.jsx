import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import {
  mockMyPostedJugaads,
  JUGAAD_STATUS,
  timeAgo,
} from '@/data/jugaadMockData';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

import {
  ClipboardList,
  ArrowLeft,
  ChevronRight,
  UserCheck,
  HandCoins,
  Check,
  X,
  MessageSquare,
  Clock,
  Tag,
} from 'lucide-react';

import { useProposals } from '@/context/ProposalContext';
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

  'counter-offer': {
    color: 'amber',
    label: 'COUNTER OFFER',
  },

  withdrawn: {
    color: 'ink',
    label: 'WITHDRAWN',
  },
};

/*
 * Backend conversation IDs are PostgreSQL bigint values.
 * Never manufacture a conversation ID on the frontend.
 */
function getValidConversationId(source) {
  if (!source) {
    return null;
  }

  const rawId =
    source.conversationId ??
    source.conversation_id ??
    source.conversation?.id ??
    source.conversation?.conversationId ??
    source.conversation?.conversation_id ??
    null;

  if (rawId === null || rawId === undefined) {
    return null;
  }

  const value = String(rawId).trim();

  if (!/^\d+$/.test(value)) {
    return null;
  }

  return value;
}

/*
 * Get Jugaad ID from a proposal regardless of backend naming.
 */
function getProposalJugaadId(proposal) {
  return (
    proposal?.jugaadId ??
    proposal?.jugaad_id ??
    proposal?.jugaad?.id ??
    proposal?.jugaad?.jugaadId ??
    null
  );
}

/*
 * Convert a proposal into the same structure used by
 * interestedStudents.
 *
 * This is the important part of the fix:
 *
 * INTERESTED / BARGAIN
 *        ↓
 * proposal
 *        ↓
 * converted student request
 *        ↓
 * MY JUGAADS → INTERESTED STUDENTS
 */
function proposalToStudentRequest(proposal) {
  if (!proposal) {
    return null;
  }

  const helper = proposal.helper || proposal.student || proposal.user || {};

  const requestType =
    proposal.requestType ||
    proposal.request_type ||
    (proposal.proposedPrice != null ||
    proposal.proposed_price != null ||
    proposal.amount != null
      ? 'bargain'
      : 'interested');

  const proposedAmount =
    proposal.proposedPrice ??
    proposal.proposed_price ??
    proposal.amount ??
    proposal.proposedAmount ??
    0;

  return {
    id:
      proposal.helperId ??
      proposal.helper_id ??
      helper.id ??
      proposal.userId ??
      proposal.user_id ??
      `proposal-${proposal.id}`,

    proposalId: proposal.id,

    name:
      helper.name ||
      helper.fullName ||
      helper.username ||
      proposal.helperName ||
      proposal.helper_name ||
      proposal.studentName ||
      proposal.student_name ||
      'Student',

    fullName:
      helper.fullName ||
      helper.name ||
      proposal.helperName ||
      proposal.helper_name ||
      'Student',

    username: helper.username,

    initials:
      helper.initials ||
      helper.avatarInitials ||
      proposal.initials ||
      getInitials(
        helper.name ||
          helper.fullName ||
          proposal.helperName ||
          proposal.helper_name ||
          'Student'
      ),

    skills:
      Array.isArray(proposal.skills)
        ? proposal.skills
        : Array.isArray(helper.skills)
          ? helper.skills
          : [],

    rating:
      proposal.rating ??
      helper.rating ??
      helper.averageRating ??
      0,

    message:
      proposal.explanation ||
      proposal.message ||
      proposal.proposalMessage ||
      proposal.proposal_message ||
      '',

    requestType,

    proposedAmount,

    status: proposal.status || 'pending',

    conversationId:
      proposal.conversationId ??
      proposal.conversation_id ??
      null,

    proposal,
  };
}

function getInitials(name) {
  if (!name) {
    return 'U';
  }

  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

export function MyJugaadsPage() {
  const {
    isDemoMode,
    isAuthenticated,
  } = useAuth();

  const {
    proposals = [],
    acceptProposal,
    rejectProposal,
    counterProposal,
  } = useProposals();

  const [jugaadsList, setJugaadsList] = useState(
    isDemoMode ? mockMyPostedJugaads : []
  );

  // Proposals are fetched directly for each Jugaad from the backend.
  // This is required because the global ProposalContext may not contain
  // proposals received for the currently logged-in poster.
  const [jugaadProposals, setJugaadProposals] = useState({});

  const [loading, setLoading] = useState(!isDemoMode);

  const [selected, setSelected] = useState(null);

  const [status, setStatus] = useState({});

  const [counterTarget, setCounterTarget] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);

  const fetchMyJugaads = useCallback(async () => {
    if (isDemoMode) {
      setJugaadsList(mockMyPostedJugaads);
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await api.getMyJugaads();

      const list =
        data?.jugaads ||
        data?.data ||
        (Array.isArray(data) ? data : []);

      setJugaadsList(
        Array.isArray(list) ? list : []
      );
    } catch (error) {
      console.error(
        'Failed to load my jugaads:',
        error
      );

      setJugaadsList([]);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, isAuthenticated]);

  /*
   * Fetch proposals/interest requests directly for every Jugaad owned
   * by the current user.
   *
   * This fixes the problem where INTERESTED/BARGAIN requests exist in
   * the backend but do not appear on the My Jugaads page.
   */
  const fetchJugaadProposals = useCallback(async (items) => {
    if (isDemoMode || !isAuthenticated) {
      return;
    }

    const list = Array.isArray(items) ? items : [];

    if (list.length === 0) {
      setJugaadProposals({});
      return;
    }

    const results = {};

    await Promise.all(
      list.map(async (item) => {
        if (!item?.id) {
          return;
        }

        try {
          const response = await api.getProposalsForJugaad(item.id);

          const data =
            response?.data ||
            response?.proposals ||
            (Array.isArray(response) ? response : []);

          results[String(item.id)] = Array.isArray(data)
            ? data
            : [];
        } catch (error) {
          console.error(
            `Failed to load proposals for Jugaad ${item.id}:`,
            error
          );

          results[String(item.id)] = [];
        }
      })
    );

    setJugaadProposals(results);
  }, [isDemoMode, isAuthenticated]);

  useEffect(() => {
    fetchMyJugaads();
  }, [fetchMyJugaads]);

  useEffect(() => {
    if (!loading) {
      fetchJugaadProposals(jugaadsList);
    }
  }, [loading, jugaadsList, fetchJugaadProposals]);

  /*
   * Update Jugaad status.
   */
  const handleUpdateStatus = async (
    itemId,
    newStatus
  ) => {
    setStatus((current) => ({
      ...current,
      [itemId]: newStatus,
    }));

    if (isDemoMode) {
      return;
    }

    try {
      if (
        typeof api.updateJugaadStatus ===
        'function'
      ) {
        await api.updateJugaadStatus(
          itemId,
          newStatus
        );
      }

      await fetchMyJugaads();
    } catch (error) {
      console.error(
        'Failed to update Jugaad status:',
        error
      );
    }
  };

  /*
   * Normalize posted Jugaads.
   */
  const items = (
    Array.isArray(jugaadsList)
      ? jugaadsList
      : []
  ).map((x) => ({
    ...x,

    // The backend returns the real Jugaad price in `budget`.
    amount:
      x.budget ??
      x.amount ??
      x.price ??
      0,

    // The backend timestamp is `created_at`.
    // Normalize it so the detail header never receives an undefined
    // value and never renders "posted Invalid Date".
    postedAt:
      x.postedAt ??
      x.posted_at ??
      x.createdAt ??
      x.created_at ??
      null,

    status:
      status[x.id] ||
      x.status ||
      'open',

    interestedStudents:
      x.interestedStudents ||
      x.interested_students ||
      x.requests ||
      [],
  }));

  if (loading) {
    return (
      <div>
        <Header
          title="MY JUGAADS"
          sub="The work you put into the exchange."
          icon={<ClipboardList />}
        />

        <div className="surface-metal-brushed rounded-2xl p-12 text-center">
          <p className="font-mono text-xs text-ink-3">
            LOADING YOUR JUGAADS...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Detail page.
   */
  if (selected) {
    const item =
      items.find(
        (x) => String(x.id) === String(selected)
      ) || items[0];

    if (!item) {
      return null;
    }

    /*
     * IMPORTANT FIX:
     *
     * Convert IDs to strings before comparing.
     *
     * This handles:
     * 123 === "123"
     *
     * which otherwise fails with strict ===.
     */
    const itemProposals =
      Array.isArray(
        jugaadProposals[String(item.id)]
      )
        ? jugaadProposals[String(item.id)]
        : [];

    return (
      <Detail
        item={item}
        proposals={itemProposals}
        onBack={() => setSelected(null)}
        onStatus={(newStatus) =>
          handleUpdateStatus(
            item.id,
            newStatus
          )
        }
        onAcceptProposal={(proposal) =>
          setConfirmAction({
            variant: 'accept',
            proposal,
          })
        }
        onRejectProposal={(proposal) =>
          setConfirmAction({
            variant: 'reject',
            proposal,
          })
        }
        onCounterProposal={(proposal) =>
          setCounterTarget(proposal)
        }
        confirmAction={confirmAction}
        setConfirmAction={setConfirmAction}
        onConfirmAction={async () => {
          if (!confirmAction) {
            return;
          }

          try {
            if (
              confirmAction.variant ===
                'accept' &&
              confirmAction.proposal?.id
            ) {
              await acceptProposal(
                confirmAction.proposal.id
              );
            } else if (
              confirmAction.variant ===
                'reject' &&
              confirmAction.proposal?.id
            ) {
              await rejectProposal(
                confirmAction.proposal.id
              );
            }

            await fetchMyJugaads();

            // Refresh the received requests after accept/reject.
            await fetchJugaadProposals(jugaadsList);
          } catch (error) {
            console.error(
              'Failed to process proposal:',
              error
            );
          } finally {
            setConfirmAction(null);
          }
        }}
      />
    );
  }

  return (
    <div>
      <Header
        title="MY JUGAADS"
        sub="The work you put into the exchange."
        icon={<ClipboardList />}
      />

      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[9px] text-ink-3">
          {items.length} posted opportunities
        </p>

        <Link
          to="/dashboard/post-jugaad"
          className="machine-control machine-control--primary"
          style={{
            padding: '8px 12px',
          }}
        >
          <span className="ctrl-led" />
          POST NEW
        </Link>
      </div>

      {items.length === 0 ? (
        <div
          className="surface-metal-brushed rounded-2xl p-12 text-center"
          style={{
            border:
              '1px solid var(--metal-1)',
          }}
        >
          <ClipboardList
            size={36}
            className="mx-auto text-ink-3 mb-3"
          />

          <p className="font-display text-xl text-ink-0">
            NO POSTED JUGAADS
          </p>

          <p className="font-mono text-xs text-ink-2 mt-2 max-w-sm mx-auto">
            You haven't posted any tasks yet.
            Drop a task into the exchange to
            get help from campus students.
          </p>

          <Link
            to="/dashboard/post-jugaad"
            className="machine-control machine-control--primary inline-flex mt-6"
            style={{
              padding: '10px 16px',
            }}
          >
            <span className="ctrl-led" />
            POST YOUR FIRST JUGAAD
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-3">
          {items.map((item) => {
            const itemProposals =
              Array.isArray(
                jugaadProposals[String(item.id)]
              )
                ? jugaadProposals[String(item.id)]
                : [];

            const statusConfig =
              JUGAAD_STATUS[item.status] ||
              JUGAAD_STATUS.open;

            const directRequests =
              Array.isArray(
                item.interestedStudents
              )
                ? item.interestedStudents
                : [];

            /*
             * Total requests includes:
             *
             * direct interested students
             * +
             * proposals/bargains
             */
            const requestCount =
              directRequests.length +
              itemProposals.length;

            return (
              <button
                key={item.id}
                onClick={() =>
                  setSelected(item.id)
                }
                className="surface-metal-brushed rounded-2xl p-5 text-left hover:border-amber/40 transition-colors"
                style={{
                  border:
                    '1px solid var(--metal-1)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg">
                      {item.title}
                    </p>

                    <p className="font-mono text-[9px] text-ink-3 mt-1">
                      {item.id} ·{' '}
                      {item.skillRequired ||
                        item.category}
                    </p>
                  </div>

                  <span
                    className="font-technical text-[7px] px-2 py-1 rounded"
                    style={{
                      color: `var(--${statusConfig.color})`,
                      background: `color-mix(in srgb, var(--${statusConfig.color}) 12%, transparent)`,
                    }}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                <p className="font-mono text-[10px] text-ink-2 mt-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-3 mt-4">
                  <span className="font-display text-lg text-amber">
                    ₹{item.amount}
                  </span>

                  <span className="font-mono text-[9px] text-ink-3">
                    {requestCount} requests
                  </span>

                  {itemProposals.length > 0 && (
                    <span className="font-technical text-[7px] text-amber px-1.5 py-0.5 rounded bg-amber/10">
                      {itemProposals.length}{' '}
                      PROPOSALS
                    </span>
                  )}

                  <ChevronRight
                    size={14}
                    className="ml-auto text-ink-3"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {counterTarget && (
        <CounterOfferModal
          proposal={counterTarget}
          onClose={() =>
            setCounterTarget(null)
          }
          onSubmit={async (
            price,
            msg
          ) => {
            try {
              await counterProposal(
                counterTarget.id,
                price,
                msg
              );

              await fetchMyJugaads();
              await fetchJugaadProposals(jugaadsList);
            } catch (error) {
              console.error(
                'Failed to send counter offer:',
                error
              );
            } finally {
              setCounterTarget(null);
            }
          }}
        />
      )}
    </div>
  );
}

function Header({
  title,
  sub,
  icon,
}) {
  return (
    <section className="pt-12 pb-7">
      <div className="flex items-center gap-3 mb-4">
        <LED
          color="amber"
          pulse
          size={7}
        />

        <span className="font-technical text-[9px] text-ink-2">
          WORKSHOP // PERSONAL LEDGER
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-amber">
          {icon}
        </span>

        <h1 className="font-display text-4xl sm:text-5xl">
          {title}
        </h1>
      </div>

      <p className="mt-3 text-sm text-ink-2">
        {sub}
      </p>
    </section>
  );
}

function Detail({
  item,
  proposals,
  onBack,
  onStatus,
  onAcceptProposal,
  onRejectProposal,
  onCounterProposal,
  confirmAction,
  setConfirmAction,
  onConfirmAction,
}) {
  const acceptedStudent =
    item?.acceptedStudent || null;

  const acceptedConversationId =
    getValidConversationId(
      acceptedStudent
    );

  /*
   * Direct requests from backend.
   */
  const directStudents = Array.isArray(
    item?.interestedStudents
  )
    ? item.interestedStudents
    : [];

  /*
   * Only show real interested students here.
   *
   * The PROPOSALS RECEIVED section already shows proposal records.
   * Keeping proposal fallbacks in INTERESTED STUDENTS creates duplicate
   * rows such as a second generic "Student" entry.
   *
   * Direct interestedStudents are the real interest records and are the
   * source used for this section.
   */
  const mergedStudents = directStudents.filter(Boolean);

  return (
    <div>
      <section className="pt-12 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-technical text-[8px] text-ink-3 hover:text-ink-0 mb-5"
        >
          <ArrowLeft size={12} />
          BACK TO MY JUGAADS
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LED
                color={
                  JUGAAD_STATUS[
                    item.status
                  ]?.color || 'amber'
                }
                pulse
                size={5}
              />

              <span
                className="font-technical text-[8px]"
                style={{
                  color: `var(--${
                    JUGAAD_STATUS[
                      item.status
                    ]?.color || 'amber'
                  })`,
                }}
              >
                {JUGAAD_STATUS[
                  item.status
                ]?.label || item.status}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl">
              {item.title}
            </h1>

            <p className="font-mono text-[9px] text-ink-3 mt-2">
              {item.id} ·{' '}
              {item.skillRequired ||
                item.category}{' '}
              {item.postedAt ? (
                <>
                  · posted{' '}
                  {timeAgo(item.postedAt)}
                </>
              ) : null}
            </p>
          </div>

          <div className="surface-panel rounded-xl px-5 py-3">
            <p className="font-technical text-[7px] text-ink-3">
              BUDGET
            </p>

            <p className="font-display text-2xl text-amber">
              ₹
              {acceptedStudent?.agreedAmount ??
                item.amount ??
                item.budget ??
                0}
            </p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[.75fr_1.25fr] gap-5">
        <div className="surface-panel rounded-2xl p-5">
          <p className="font-technical text-[9px] mb-3">
            JUGAAD DETAILS
          </p>

          <p className="font-mono text-xs text-ink-2 leading-relaxed">
            {item.description}
          </p>

          <div className="mt-5 pt-4 border-t border-metal-1/40">
            <p className="font-technical text-[8px] text-ink-3">
              ASSIGNMENT STATUS
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {[
                'open',
                'receiving-requests',
                'assigned',
                'in-progress',
                'completed',
                'cancelled',
              ].map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    onStatus(s)
                  }
                  className={`px-2.5 py-2 rounded-md font-technical text-[7px] ${
                    item.status === s
                      ? 'bg-amber text-bg-0'
                      : 'bg-bg-2 text-ink-3 border border-metal-1'
                  }`}
                >
                  {JUGAAD_STATUS[s]
                    ?.label || s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {proposals.length > 0 && (
            <div className="surface-metal-brushed rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-technical text-[9px] text-amber">
                  PROPOSALS RECEIVED
                </p>

                <span className="font-mono text-[8px] text-ink-3">
                  {proposals.length}{' '}
                  proposals
                </span>
              </div>

              <div className="space-y-3">
                {proposals.map(
                  (proposal) => (
                    <ProposalDetailCard
                      key={proposal.id}
                      proposal={proposal}
                      onAccept={() =>
                        onAcceptProposal(
                          proposal
                        )
                      }
                      onReject={() =>
                        onRejectProposal(
                          proposal
                        )
                      }
                      onCounter={() =>
                        onCounterProposal(
                          proposal
                        )
                      }
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* 
           * IMPORTANT:
           *
           * This section now uses mergedStudents,
           * not only item.interestedStudents.
           *
           * Therefore:
           * INTERESTED → appears here
           * BARGAIN → appears here
           */}
          <div className="surface-metal-brushed rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="font-technical text-[9px]">
                INTERESTED STUDENTS
              </p>

              <span className="font-mono text-[8px] text-ink-3">
                {mergedStudents.length}{' '}
                requests
              </span>
            </div>

            <div className="space-y-3">
              {mergedStudents.length ===
              0 ? (
                <p className="font-mono text-[9px] text-ink-3 py-2">
                  No direct student requests
                  yet.
                </p>
              ) : (
                mergedStudents.map(
                  (student, index) => {
                    const studentId =
                      student?.id ??
                      student?.userId ??
                      student?.user_id ??
                      null;

                    const matchingProposal =
                      proposals.find((proposal) => {
                        const proposalStudentId =
                          proposal?.helperId ??
                          proposal?.helper_id ??
                          proposal?.userId ??
                          proposal?.user_id ??
                          proposal?.helper?.id ??
                          proposal?.student?.id ??
                          proposal?.user?.id ??
                          null;

                        return (
                          studentId != null &&
                          proposalStudentId != null &&
                          String(studentId) ===
                            String(proposalStudentId)
                        );
                      });

                    const studentForCard =
                      matchingProposal
                        ? {
                            ...student,
                            proposalId: matchingProposal.id,
                            proposal: matchingProposal,
                            proposalStatus: matchingProposal.status,
                            status: matchingProposal.status,
                            requestType:
                              matchingProposal.requestType ??
                              matchingProposal.request_type ??
                              student?.requestType,
                            proposedAmount:
                              matchingProposal.proposedPrice ??
                              matchingProposal.proposed_price ??
                              matchingProposal.amount ??
                              student?.proposedAmount,
                          }
                        : student;

                    return (
                      <StudentRequest
                        key={
                          studentForCard?.proposalId ||
                          studentForCard?.id ||
                          index
                        }
                        student={studentForCard}
                        assigned={
                          acceptedStudent?.id != null &&
                          studentForCard?.id != null &&
                          String(acceptedStudent.id) ===
                            String(studentForCard.id)
                        }
                        locked={
                          !!acceptedStudent &&
                          acceptedStudent?.id != null &&
                          studentForCard?.id != null &&
                          String(acceptedStudent.id) !==
                            String(studentForCard.id)
                        }
                        onAccept={() => {
                          if (matchingProposal) {
                            onAcceptProposal(matchingProposal);
                          }
                        }}
                        onReject={() => {
                          if (matchingProposal) {
                            onRejectProposal(matchingProposal);
                          }
                        }}
                        onCounter={() => {
                          if (matchingProposal) {
                            onCounterProposal(matchingProposal);
                          }
                        }}
                      />
                    );
                  }
                )
              )}
            </div>

            {acceptedStudent && (
              <div className="mt-4 surface-panel rounded-xl p-3 flex items-center gap-2 text-mint">
                <UserCheck size={15} />

                <span className="font-mono text-[10px]">
                  Assigned to{' '}
                  {acceptedStudent.name} · ₹
                  {
                    acceptedStudent.agreedAmount
                  }
                </span>

                {acceptedConversationId ? (
                  <Link
                    to={`/dashboard/messages/${acceptedConversationId}`}
                    className="ml-auto font-technical text-[8px] text-mint"
                  >
                    MESSAGE
                  </Link>
                ) : (
                  <span className="ml-auto font-mono text-[8px] text-ink-3">
                    Conversation unavailable
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

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
              onConfirmAction
            }
          />
        )}
      </div>
    </div>
  );
}

function ProposalDetailCard({
  proposal,
  onAccept,
  onReject,
  onCounter,
}) {
  const status =
    proposal?.status || 'pending';

  const cfg =
    PROPOSAL_STATUS[status] ||
    PROPOSAL_STATUS.pending;

  const isAccepted =
    status === 'accepted';

  const isRejected =
    status === 'rejected';

  const isWithdrawn =
    status === 'withdrawn';

  /*
   * Only use the real conversation ID
   * returned by the backend.
   */
  const conversationId =
    getValidConversationId(
      proposal
    );

  return (
    <div className="surface-panel rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-amber text-bg-0 font-display text-[9px] shrink-0">
          {proposal?.helper?.initials ||
            proposal?.helper?.avatarInitials ||
            'U'}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-sm">
              {proposal?.helper?.name ||
                proposal?.helper?.fullName ||
                proposal?.helper?.username ||
                'Student'}
            </p>

            <span
              className="font-technical text-[7px] px-1.5 py-0.5 rounded"
              style={{
                color: `var(--${cfg.color})`,
                background: `color-mix(in srgb, var(--${cfg.color}) 12%, transparent)`,
              }}
            >
              {cfg.label}
            </span>
          </div>

          {Array.isArray(
            proposal?.skills
          ) &&
            proposal.skills.length > 0 && (
              <p className="font-mono text-[8px] text-ink-3 mt-1 flex items-center gap-1">
                <Tag size={10} />

                {proposal.skills.join(
                  ' · '
                )}
              </p>
            )}

          {proposal?.explanation && (
            <p className="font-mono text-[10px] text-ink-2 mt-2 leading-relaxed">
              "{proposal.explanation}"
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-2 text-[9px] font-mono text-ink-3">
            <span className="font-display text-base text-amber">
              ₹
              {proposal?.proposedPrice ??
                proposal?.proposed_price ??
                proposal?.amount ??
                0}
            </span>

            {proposal?.completionTime && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {proposal.completionTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {status ===
        'counter-offer' &&
        Array.isArray(
          proposal?.offerHistory
        ) &&
        proposal.offerHistory.length >
          1 && (
          <div className="mt-3 surface-wood rounded-lg p-2">
            <p className="font-technical text-[7px] text-paper/70 mb-1">
              OFFER HISTORY
            </p>

            {proposal.offerHistory.map(
              (offer, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 py-0.5"
                >
                  <span className="font-mono text-[8px] text-paper flex-1">
                    {offer.from ===
                    'helper'
                      ? proposal
                          ?.helper?.name ||
                        'Helper'
                      : 'You'}

                    {offer.message
                      ? ` — ${offer.message}`
                      : ''}
                  </span>

                  <span className="font-display text-xs text-amber">
                    ₹{offer.amount}
                  </span>
                </div>
              )
            )}
          </div>
        )}

      <div className="flex gap-2 mt-3 pt-3 border-t border-metal-1/40">
        {isAccepted &&
          conversationId && (
            <Link
              to={`/dashboard/messages/${conversationId}`}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px] hover:bg-mint/25 transition-colors"
            >
              <MessageSquare size={12} />
              MESSAGE
            </Link>
          )}

        {isAccepted &&
          !conversationId && (
            <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-bg-2 text-ink-3 font-technical text-[8px]">
              <MessageSquare size={12} />
              CONVERSATION UNAVAILABLE
            </span>
          )}

        {!isAccepted &&
          !isRejected &&
          !isWithdrawn && (
            <>
              <button
                type="button"
                onClick={onAccept}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]"
              >
                <Check size={12} />
                ACCEPT
              </button>

              <button
                type="button"
                onClick={onReject}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px]"
              >
                <X size={12} />
                REJECT
              </button>

              <button
                type="button"
                onClick={onCounter}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-[8px]"
              >
                <HandCoins size={12} />
                COUNTER
              </button>
            </>
          )}
      </div>
    </div>
  );
}

function StudentRequest({
  student,
  assigned,
  locked,
}) {
  const skills = Array.isArray(
    student?.skills
  )
    ? student.skills
    : [];

  const isBargain =
    student?.requestType ===
      'bargain' ||
    student?.request_type ===
      'bargain' ||
    student?.proposal?.proposedPrice !=
      null ||
    student?.proposal?.proposed_price !=
      null;

  const proposedAmount =
    student?.proposedAmount ??
    student?.proposed_amount ??
    student?.proposal?.proposedPrice ??
    student?.proposal?.proposed_price ??
    student?.proposal?.amount ??
    0;

  return (
    <div className="surface-panel rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-amber text-bg-0 font-display text-[9px] shrink-0">
          {student?.initials ||
            getInitials(
              student?.name ||
                student?.fullName ||
                student?.username
            )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-sm">
              {student?.name ||
                student?.fullName ||
                student?.username ||
                'Student'}
            </p>

            {isBargain && (
              <span className="font-technical text-[7px] text-amber px-1.5 py-0.5 rounded bg-amber/10">
                BARGAIN
              </span>
            )}
          </div>

          <p className="font-mono text-[8px] text-ink-3 mt-1">
            {skills.length > 0
              ? skills.join(' · ')
              : 'Student'}{' '}
            · {student?.rating || 0}★
          </p>

          {student?.message && (
            <p className="font-mono text-[10px] text-ink-2 mt-2">
              "{student.message}"
            </p>
          )}
        </div>

        <span className="font-technical text-[7px] text-amber">
          {isBargain
            ? `OFFER ₹${proposedAmount}`
            : 'INTERESTED'}
        </span>
      </div>

      {!assigned && !locked && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-metal-1/40">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px]"
          >
            <Check size={12} />
            ACCEPT
          </button>

          <button
            type="button"
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px]"
          >
            <X size={12} />
            REJECT
          </button>

          {isBargain && (
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-[8px]"
            >
              <HandCoins size={12} />
              COUNTER
            </button>
          )}
        </div>
      )}
    </div>
  );
}