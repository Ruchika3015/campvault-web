import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { useProposals } from '@/context/ProposalContext';
import {
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

function getInitials(user) {
  if (!user) return 'U';

  if (typeof user.initials === 'string' && user.initials.trim()) {
    return user.initials.trim().slice(0, 2).toUpperCase();
  }

  const name =
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    '';

  if (!name) return 'U';

  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getUserName(user) {
  if (!user) return 'User';

  return (
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    'User'
  );
}

function getConversationId(conversation) {
  return (
    conversation?.id ||
    conversation?._id ||
    conversation?.conversationId ||
    conversation?.conversation_id ||
    null
  );
}

function getTitle(conversation) {
  return (
    conversation?.jugaadTitle ||
    conversation?.jugaad?.title ||
    conversation?.title ||
    conversation?.jugaad_name ||
    'Jugaad'
  );
}

function getStatus(conversation) {
  return (
    conversation?.status ||
    conversation?.proposalStatus ||
    'accepted'
  );
}

function getAmount(conversation) {
  return (
    conversation?.agreedAmount ??
    conversation?.agreed_price ??
    conversation?.proposedAmount ??
    conversation?.proposed_price ??
    conversation?.amount ??
    0
  );
}

function getOtherUser(conversation) {
  return (
    conversation?.otherUser ||
    conversation?.other_user ||
    conversation?.user ||
    conversation?.participant ||
    conversation?.partner ||
    null
  );
}

function getLastMessage(conversation) {
  if (conversation?.lastMessage?.text) {
    return conversation.lastMessage.text;
  }

  if (conversation?.lastMessage?.message) {
    return conversation.lastMessage.message;
  }

  if (typeof conversation?.lastMessage === 'string') {
    return conversation.lastMessage;
  }

  if (Array.isArray(conversation?.messages)) {
    const last =
      conversation.messages[conversation.messages.length - 1];

    if (last) {
      return (
        last.text ||
        last.message ||
        last.content ||
        ''
      );
    }
  }

  return '';
}

export function ConversationsPage() {
  const proposalContext = useProposals() || {};

  const conversations = Array.isArray(
    proposalContext.conversations
  )
    ? proposalContext.conversations
    : [];

  return (
    <div>
      {/* ============================================================
          HEADER
      ============================================================ */}

      <section className="pt-12 pb-7">
        <div className="flex items-center gap-3 mb-4">
          <LED
            color="mint"
            pulse
            size={7}
          />

          <span className="font-technical text-[9px] text-ink-2">
            06 — ACTIVE CONNECTIONS
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl">
          MESSAGES
          <br />
          <span className="text-mint">/ CONNECTIONS.</span>
        </h1>

        <p className="mt-4 max-w-xl text-sm text-ink-2">
          Continue conversations with people you have connected
          with through accepted Jugaads.
        </p>
      </section>

      {/* ============================================================
          EMPTY STATE
      ============================================================ */}

      {conversations.length === 0 ? (
        <div className="surface-panel rounded-2xl p-8 text-center">
          <div className="mx-auto grid place-items-center w-14 h-14 rounded-full bg-mint/10 text-mint">
            <MessageSquare size={22} />
          </div>

          <h2 className="font-display text-xl mt-4">
            NO ACTIVE CONVERSATIONS
          </h2>

          <p className="font-mono text-[10px] text-ink-3 mt-2 max-w-md mx-auto">
            Conversations appear here after a proposal has been
            accepted.
          </p>

          <Link
            to="/dashboard/find-jugaad"
            className="inline-flex items-center gap-2 mt-5 px-4 py-3 rounded-lg bg-mint text-bg-0 font-technical text-[8px]"
          >
            FIND JUGAAD
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        /* ==========================================================
           CONVERSATION LIST
        ========================================================== */

        <div className="space-y-3">
          {conversations.map((conversation, index) => {
            if (!conversation) {
              return null;
            }

            const conversationId =
              getConversationId(conversation);

            /*
             * If backend returned malformed data without an ID,
             * don't render a broken Link.
             */
            if (!conversationId) {
              return (
                <article
                  key={`invalid-conversation-${index}`}
                  className="surface-panel rounded-2xl p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center w-11 h-11 rounded-full bg-ink-3/20 text-ink-2 font-display text-[10px]">
                      ?
                    </span>

                    <div>
                      <h2 className="font-display text-lg">
                        Conversation unavailable
                      </h2>

                      <p className="font-mono text-[9px] text-ink-3 mt-1">
                        This conversation is missing an ID.
                      </p>
                    </div>
                  </div>
                </article>
              );
            }

            const otherUser =
              getOtherUser(conversation);

            const initials =
              getInitials(otherUser);

            const userName =
              getUserName(otherUser);

            const title =
              getTitle(conversation);

            const status =
              getStatus(conversation);

            const amount =
              getAmount(conversation);

            const lastMessage =
              getLastMessage(conversation);

            return (
              <Link
                key={String(conversationId)}
                to={`/dashboard/messages/${conversationId}`}
                className="block"
              >
                <article className="surface-panel rounded-2xl p-5 hover:border-mint/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* ==================================================
                        AVATAR
                    ================================================== */}

                    <span className="grid place-items-center w-12 h-12 rounded-full bg-mint text-bg-0 font-display text-[10px] shrink-0">
                      {initials}
                    </span>

                    {/* ==================================================
                        MAIN INFO
                    ================================================== */}

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg truncate">
                          {userName}
                        </h2>

                        <span className="font-technical text-[7px] px-2 py-1 rounded bg-mint/10 text-mint">
                          {String(status).toUpperCase()}
                        </span>
                      </div>

                      <p className="font-editorial text-base mt-1 truncate">
                        {title}
                      </p>

                      {lastMessage ? (
                        <p className="font-mono text-[9px] text-ink-3 mt-2 truncate">
                          {lastMessage}
                        </p>
                      ) : (
                        <p className="font-mono text-[9px] text-ink-3 mt-2">
                          No messages yet. Start the conversation.
                        </p>
                      )}
                    </div>

                    {/* ==================================================
                        AMOUNT + OPEN
                    ================================================== */}

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-display text-xl text-amber">
                          ₹{amount}
                        </p>

                        <p className="font-mono text-[7px] text-ink-3">
                          AGREED
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1.5 font-technical text-[8px] text-mint">
                        OPEN
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>

                  {/* ==================================================
                      ACCEPTED INDICATOR
                  ================================================== */}

                  <div className="mt-4 pt-3 border-t border-metal-1/40 flex items-center gap-2">
                    <CheckCircle2
                      size={13}
                      className="text-mint"
                    />

                    <span className="font-mono text-[8px] text-ink-3">
                      Connection active
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}