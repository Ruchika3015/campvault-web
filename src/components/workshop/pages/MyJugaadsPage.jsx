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
    receivedProposals = [],
    acceptProposal,
    rejectProposal,
    counterProposal,
    refreshData,
    conversations,
  } = useProposals();

  const [jugaadsList, setJugaadsList] = useState(
    isDemoMode ? mockMyPostedJugaads : []
  );

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
      setJugaadsList([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [jugaadsResult] = await Promise.all([
        api.getMyJugaads(),
        refreshData(),
      ]);

      const list =
        jugaadsResult?.jugaads ||
        jugaadsResult?.data?.jugaads ||
        jugaadsResult?.data ||
        (Array.isArray(jugaadsResult)
          ? jugaadsResult
          : []);

      setJugaadsList(
        Array.isArray(list) ? list : []
      );
    } catch (error) {
      console.error(
        'Failed to load my jugaads/proposals:',
        error
      );

      setJugaadsList([]);
    } finally {
      setLoading(false);
    }
  }, [
    isDemoMode,
    isAuthenticated,
    refreshData,
  ]);

  useEffect(() => {
    fetchMyJugaads();
  }, [fetchMyJugaads]);

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
      Array.isArray(receivedProposals)
        ? receivedProposals.filter((p) => {
            const proposalJugaadId =
              getProposalJugaadId(p);

            return (
              proposalJugaadId !== null &&
              String(proposalJugaadId) ===
                String(item.id)
            );
          })
        : [];

    return (
      <Detail
        item={item}
        proposals={itemProposals}
        conversations={conversations}
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
              Array.isArray(receivedProposals)
                ? receivedProposals.filter((p) => {
                    const proposalJugaadId =
                      getProposalJugaadId(p);

                    return (
                      proposalJugaadId !== null &&
                      String(proposalJugaadId) ===
                        String(item.id)
                    );
                  })
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
  conversations,
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
   * Convert proposals to student requests.
   *
   * This makes INTERESTED and BARGAIN
   * appear in the same section.
   */
  const proposalStudents = Array.isArray(
    proposals
  )
    ? proposals
        .map(proposalToStudentRequest)
        .filter(Boolean)
        .map((student) => {
          const proposalId =
            student?.proposalId ??
            student?.proposal?.id;

          const matchingConversation =
            Array.isArray(conversations)
              ? conversations.find((conversation) => {
                  const conversationProposalId =
                    conversation?.proposal_id ??
                    conversation?.proposalId ??
                    conversation?.proposal?.id;

                  return (
                    proposalId != null &&
                    conversationProposalId != null &&
                    String(proposalId) ===
                      String(conversationProposalId)
                  );
                })
              : null;

          const conversationId =
            getValidConversationId(
              matchingConversation
            );

          if (!conversationId) {
            return student;
          }

          return {
            ...student,
            conversationId,
            proposal: {
              ...student.proposal,
              conversationId,
            },
          };
        })
    : [];

  /*
   * Merge direct requests and proposals.
   *
   * Avoid duplicates where the same student
   * already exists in interestedStudents.
   */
  const mergedStudents = [];

  // Merge direct interested students with their matching
  // proposals. This is important because the same student
  // can exist in both arrays. If we keep only the direct
  // student object, the proposal status (accepted/rejected)
  // is lost and the action buttons appear again.
  directStudents.forEach((student) => {
    const studentId =
      student?.id ??
      student?.userId ??
      student?.user_id;

    const matchingProposal = proposalStudents.find(
      (proposalStudent) => {
        const proposalStudentId =
          proposalStudent?.id;

        if (
          studentId == null ||
          proposalStudentId == null
        ) {
          return false;
        }

        return (
          String(studentId) ===
          String(proposalStudentId)
        );
      }
    );

    if (matchingProposal) {
      mergedStudents.push({
        ...student,
        ...matchingProposal,

        id:
          student.id ??
          matchingProposal.id,

        name:
          student.name ??
          matchingProposal.name,

        fullName:
          student.fullName ??
          matchingProposal.fullName,

        username:
          student.username ??
          matchingProposal.username,

        initials:
          student.initials ??
          matchingProposal.initials,

        skills:
          Array.isArray(student.skills) &&
          student.skills.length > 0
            ? student.skills
            : matchingProposal.skills,

        rating:
          student.rating ??
          matchingProposal.rating,

        message:
          student.message ||
          matchingProposal.message,

        // Keep the real proposal information.
        proposalId:
          matchingProposal.proposalId,

        proposal:
          matchingProposal.proposal,

        status:
          matchingProposal.status,

        proposalStatus:
          matchingProposal.status,

        conversationId:
          matchingProposal.conversationId,
      });
    } else {
      mergedStudents.push(student);
    }
  });

  // Add proposal students that are not already present
  // in the direct interested-student list.
  proposalStudents.forEach((proposalStudent) => {
    const proposalStudentId =
      proposalStudent?.id;

    const alreadyExists =
      mergedStudents.some((student) => {
        const existingStudentId =
          student?.id ??
          student?.userId ??
          student?.user_id;

        if (
          existingStudentId == null ||
          proposalStudentId == null
        ) {
          return false;
        }

        return (
          String(existingStudentId) ===
          String(proposalStudentId)
        );
      });

    if (!alreadyExists) {
      mergedStudents.push(proposalStudent);
    }
  });

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
              · posted{' '}
              {timeAgo(item.postedAt)}
            </p>
          </div>

          <div className="surface-panel rounded-xl px-5 py-3">
            <p className="font-technical text-[7px] text-ink-3">
              BUDGET
            </p>

            <p className="font-display text-2xl text-amber">
              ₹
              {acceptedStudent?.agreedAmount ||
                item.amount}
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
                  (student, index) => (
                    <StudentRequest
                      key={
                        student?.proposalId ||
                        student?.id ||
                        index
                      }
                      student={student}
                      assigned={
                        acceptedStudent?.id != null &&
                        student?.id != null &&
                        String(acceptedStudent.id) ===
                          String(student.id)
                      }
                      locked={
                        !!acceptedStudent &&
                        acceptedStudent?.id != null &&
                        student?.id != null &&
                        String(acceptedStudent.id) !==
                          String(student.id)
                      }
                      onAccept={() => {
                        const proposal = proposals.find(
                          (p) =>
                            String(p.id) ===
                            String(student?.proposalId)
                        );

                        if (proposal) {
                          onAcceptProposal(proposal);
                        } else {
                          console.error(
                            'Proposal not found for ACCEPT:',
                            student
                          );
                        }
                      }}
                      onReject={() => {
                        const proposal = proposals.find(
                          (p) =>
                            String(p.id) ===
                            String(student?.proposalId)
                        );

                        if (proposal) {
                          onRejectProposal(proposal);
                        } else {
                          console.error(
                            'Proposal not found for REJECT:',
                            student
                          );
                        }
                      }}
                      onCounter={() => {
                        const proposal = proposals.find(
                          (p) =>
                            String(p.id) ===
                            String(student?.proposalId)
                        );

                        if (proposal) {
                          onCounterProposal(proposal);
                        } else {
                          console.error(
                            'Proposal not found for COUNTER:',
                            student
                          );
                        }
                      }}
                    />
                  )
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
  onAccept,
  onReject,
  onCounter,
}) {
  const skills = Array.isArray(student?.skills)
    ? student.skills
    : [];

  // Always use the real proposal status returned by the backend.
  // This prevents ACCEPT / REJECT / COUNTER from appearing again
  // after a proposal has already been accepted.
  const proposalStatus =
    student?.proposal?.status ||
    student?.proposalStatus ||
    student?.proposal_status ||
    student?.status ||
    'pending';

  const isAccepted =
    String(proposalStatus).toLowerCase() === 'accepted';

  const isRejected =
    String(proposalStatus).toLowerCase() === 'rejected';

  const isWithdrawn =
    String(proposalStatus).toLowerCase() === 'withdrawn';

  // A proposal whose backend status is accepted is assigned
  // even if acceptedStudent has not refreshed yet.
  const isAssigned = Boolean(assigned) || isAccepted;

  const conversationId = getValidConversationId(
    student?.proposal || student
  );

  const isBargain =
    student?.requestType === 'bargain' ||
    student?.request_type === 'bargain' ||
    student?.proposal?.proposedPrice != null ||
    student?.proposal?.proposed_price != null ||
    student?.proposedAmount != null ||
    student?.proposed_amount != null;

  const proposedAmount =
    student?.proposedAmount ??
    student?.proposed_amount ??
    student?.proposal?.proposedPrice ??
    student?.proposal?.proposed_price ??
    student?.proposal?.amount ??
    0;

  const hasProposal =
    student?.proposalId != null ||
    student?.proposal?.id != null;

  return (
    <div className="surface-panel rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-9 h-9 rounded-full bg-amber text-bg-0 font-display text-[9px] shrink-0">
          {student?.initials ||
            getInitials(
              student?.name ||
                student?.fullName ||
                student?.username ||
                'Student'
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

            {isAccepted && (
              <span className="font-technical text-[7px] text-mint px-1.5 py-0.5 rounded bg-mint/10">
                ACCEPTED
              </span>
            )}

            {isRejected && (
              <span className="font-technical text-[7px] text-coral px-1.5 py-0.5 rounded bg-coral/10">
                REJECTED
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

      {/* ACCEPTED PROPOSAL → MESSAGE */}
      {isAccepted && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-metal-1/40">
          {conversationId ? (
            <Link
              to={`/dashboard/messages/${conversationId}`}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px] hover:bg-mint/25 transition-colors"
            >
              <MessageSquare size={12} />
              MESSAGE
            </Link>
          ) : (
            <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-bg-2 text-ink-3 font-technical text-[8px]">
              <MessageSquare size={12} />
              CONVERSATION UNAVAILABLE
            </span>
          )}
        </div>
      )}

      {/* PENDING PROPOSAL → ACCEPT / REJECT / COUNTER */}
      {!isAssigned &&
        !locked &&
        !isRejected &&
        !isWithdrawn && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-metal-1/40">
            <button
              type="button"
              onClick={onAccept}
              disabled={!hasProposal}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-mint/15 text-mint font-technical text-[8px] hover:bg-mint/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check size={12} />
              ACCEPT
            </button>

            <button
              type="button"
              onClick={onReject}
              disabled={!hasProposal}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-coral/10 text-coral font-technical text-[8px] hover:bg-coral/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X size={12} />
              REJECT
            </button>

            {isBargain && (
              <button
                type="button"
                onClick={onCounter}
                disabled={!hasProposal}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-[8px] hover:bg-amber/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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