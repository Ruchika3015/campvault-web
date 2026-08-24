import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { useProposals } from '@/context/ProposalContext';
import { MessageSquare, ArrowRight } from 'lucide-react';

export function ConversationsListPage() {
  const { conversations = [] } = useProposals();

  // Only keep valid conversation objects.
  const list = Array.isArray(conversations)
    ? conversations.filter(Boolean)
    : [];

  const getInitials = (user) => {
    if (!user) {
      return 'U';
    }

    // Use backend-provided initials when available.
    if (
      typeof user.initials === 'string' &&
      user.initials.trim()
    ) {
      return user.initials.trim().slice(0, 2).toUpperCase();
    }

    // Otherwise generate initials from name.
    const name =
      user.name ||
      user.fullName ||
      user.username ||
      '';

    if (typeof name === 'string' && name.trim()) {
      const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      return parts
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase() || 'U';
    }

    return 'U';
  };

  const getUserName = (user) => {
    if (!user) {
      return 'User';
    }

    return (
      user.name ||
      user.fullName ||
      user.username ||
      'User'
    );
  };

  const getLastMessage = (conversation) => {
    const messages = Array.isArray(conversation?.messages)
      ? conversation.messages
      : [];

    if (messages.length === 0) {
      return 'No messages yet — say hello!';
    }

    const lastMessage = messages[messages.length - 1];

    if (!lastMessage) {
      return 'No messages yet — say hello!';
    }

    return (
      lastMessage.text ||
      lastMessage.message ||
      lastMessage.content ||
      'No messages yet — say hello!'
    );
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
            06 — ACCEPTED COLLABORATIONS
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl">
          MESSAGES.
        </h1>

        <p className="mt-4 max-w-xl text-sm text-ink-2">
          Conversations unlock only when a poster accepts your
          request. Every thread belongs to one Jugaad.
        </p>
      </section>

      {list.length === 0 ? (
        <div className="py-16 text-center">
          <MessageSquare
            size={32}
            className="mx-auto text-ink-3 mb-3"
          />

          <p className="font-mono text-sm text-ink-2">
            No conversations yet. Accept a proposal to start
            messaging.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((conversation, index) => {
            if (!conversation) {
              return null;
            }

            const conversationId =
              conversation.id ||
              conversation._id ||
              `conversation-${index}`;

            const otherUser =
              conversation.otherUser ||
              conversation.user ||
              conversation.poster ||
              conversation.helper ||
              {};

            const userName = getUserName(otherUser);
            const initials = getInitials(otherUser);

            const jugaadTitle =
              conversation.jugaadTitle ||
              conversation.jugaad?.title ||
              conversation.title ||
              'Jugaad';

            const agreedAmount =
              conversation.agreedAmount ??
              conversation.agreed_price ??
              conversation.proposedAmount ??
              conversation.proposed_price ??
              conversation.amount ??
              0;

            const lastMessage =
              getLastMessage(conversation);

            return (
              <Link
                key={conversationId}
                to={`/dashboard/messages/${conversationId}`}
                className="surface-metal-brushed rounded-2xl p-5 flex items-center gap-4 hover:border-mint/40 transition-colors"
                style={{
                  border: '1px solid var(--metal-1)',
                }}
              >
                {/* USER AVATAR */}
                <span className="grid place-items-center w-12 h-12 rounded-full bg-mint text-bg-0 font-display text-sm shrink-0">
                  {initials}
                </span>

                {/* CONVERSATION INFO */}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg">
                    {userName}
                  </p>

                  <p className="font-mono text-[9px] text-ink-3 mt-1">
                    {jugaadTitle} · ₹{agreedAmount}
                  </p>

                  <p className="font-mono text-[10px] text-ink-2 mt-3 truncate">
                    {lastMessage}
                  </p>
                </div>

                {/* ARROW */}
                <ArrowRight
                  size={17}
                  className="text-ink-3 shrink-0"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}