import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { useProposals } from '@/context/ProposalContext';
import {
  ArrowLeft,
  Send,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react';

function getInitials(user) {
  if (!user || typeof user !== 'object') {
    return 'U';
  }

  if (
    typeof user.initials === 'string' &&
    user.initials.trim()
  ) {
    return user.initials
      .trim()
      .slice(0, 2)
      .toUpperCase();
  }

  const name =
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    '';

  if (!name) {
    return 'U';
  }

  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'U';
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`
    .toUpperCase();
}

function getUserName(user) {
  if (!user || typeof user !== 'object') {
    return 'User';
  }

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

function getJugaadTitle(conversation) {
  return (
    conversation?.jugaadTitle ||
    conversation?.jugaad?.title ||
    conversation?.title ||
    conversation?.jugaad_name ||
    'Jugaad'
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

function getStatus(conversation) {
  return (
    conversation?.status ||
    conversation?.proposalStatus ||
    'accepted'
  );
}

function getOtherUser(conversation) {
  if (!conversation || typeof conversation !== 'object') {
    return null;
  }

  return (
    conversation.otherUser ||
    conversation.other_user ||
    conversation.user ||
    conversation.participant ||
    conversation.partner ||
    conversation.poster ||
    conversation.helper ||
    null
  );
}

function getMessages(conversation) {
  if (!conversation || typeof conversation !== 'object') {
    return [];
  }

  if (Array.isArray(conversation.messages)) {
    return conversation.messages.filter(Boolean);
  }

  return [];
}

function getMessageText(message) {
  if (!message || typeof message !== 'object') {
    return '';
  }

  if (typeof message.text === 'string') {
    return message.text;
  }

  if (typeof message.message === 'string') {
    return message.message;
  }

  if (typeof message.content === 'string') {
    return message.content;
  }

  return '';
}

function isOwnMessage(message) {
  if (!message || typeof message !== 'object') {
    return false;
  }

  if (message.from === 'me') {
    return true;
  }

  if (message.sender === 'me') {
    return true;
  }

  if (message.senderId === 'me') {
    return true;
  }

  if (message.isMine === true) {
    return true;
  }

  return false;
}

export function ConversationPage() {
  const { conversationId } = useParams();

  const proposalContext = useProposals() || {};

  const conversations = Array.isArray(
    proposalContext.conversations
  )
    ? proposalContext.conversations
    : [];

  const base = conversations.find(
    (conversation) =>
      String(getConversationId(conversation)) ===
      String(conversationId)
  );

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  /*
   * Conversations may load asynchronously.
   * Update local messages whenever the selected
   * conversation changes.
   */
  useEffect(() => {
    if (!base) {
      setMessages([]);
      return;
    }

    setMessages(getMessages(base));
  }, [base]);

  /*
   * Safe fallback values.
   * Nothing below should access properties
   * directly from an undefined object.
   */
  const otherUser = getOtherUser(base);

  const otherUserName = getUserName(otherUser);

  const otherUserInitials = getInitials(otherUser);

  const jugaadTitle = getJugaadTitle(base);

  const agreedAmount = getAmount(base);

  const status = getStatus(base);

  const send = (event) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    const newMessage = {
      id: `local-${Date.now()}`,
      from: 'me',
      text: trimmedText,
      timestamp: new Date().toISOString(),
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      newMessage,
    ]);

    setText('');
  };

  /*
   * Conversation not found.
   */
  if (!base) {
    return (
      <div>
        <section className="pt-12 pb-5">
          <Link
            to="/dashboard/messages"
            className="inline-flex items-center gap-1.5 font-technical text-[8px] text-ink-3 hover:text-ink-0 mb-5"
          >
            <ArrowLeft size={12} />
            ALL MESSAGES
          </Link>

          <div className="surface-panel rounded-2xl p-6">
            <p className="font-mono text-sm text-ink-2">
              This conversation is not available.
            </p>

            <p className="font-mono text-[10px] text-ink-3 mt-2">
              The conversation may not have loaded yet,
              or it may only become available after a
              proposal is accepted.
            </p>

            <Link
              to="/dashboard/messages"
              className="inline-flex items-center gap-2 mt-5 px-4 py-3 rounded-lg bg-mint text-bg-0 font-technical text-[8px]"
            >
              BACK TO MESSAGES
              <ArrowLeft size={12} />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* ============================================================
          HEADER
      ============================================================ */}

      <section className="pt-12 pb-5">
        <Link
          to="/dashboard/messages"
          className="inline-flex items-center gap-1.5 font-technical text-[8px] text-ink-3 hover:text-ink-0 mb-5"
        >
          <ArrowLeft size={12} />
          ALL MESSAGES
        </Link>

        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-full bg-mint text-bg-0 font-display text-[10px] shrink-0">
            {otherUserInitials}
          </span>

          <div className="min-w-0">
            <h1 className="font-display text-2xl truncate">
              {otherUserName}
            </h1>

            <p className="font-mono text-[9px] text-ink-3 mt-1 truncate">
              {jugaadTitle}
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          CHAT + DETAILS
      ============================================================ */}

      <div className="grid lg:grid-cols-[1fr_260px] gap-5">
        {/* ========================================================
            CHAT
        ======================================================== */}

        <div className="surface-metal-brushed rounded-2xl p-4 sm:p-6">
          <div className="min-h-[390px] max-h-[550px] overflow-y-auto space-y-4 flex flex-col">
            {messages.length === 0 ? (
              <div className="m-auto text-center">
                <p className="font-mono text-xs text-ink-3">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                if (!message) {
                  return null;
                }

                const messageId =
                  message.id ||
                  message._id ||
                  `message-${index}`;

                const messageText =
                  getMessageText(message);

                const mine =
                  isOwnMessage(message);

                return (
                  <div
                    key={String(messageId)}
                    className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                      mine
                        ? 'self-end bg-amber text-bg-0 rounded-tr-sm'
                        : 'self-start surface-panel rounded-tl-sm'
                    }`}
                  >
                    <p className="font-mono text-xs leading-relaxed break-words">
                      {messageText || ' '}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* ======================================================
              SEND MESSAGE
          ====================================================== */}

          <form
            onSubmit={send}
            className="flex items-center gap-2 mt-5 pt-4 border-t border-metal-1/40"
          >
            <input
              type="text"
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              placeholder="Write a message..."
              className="flex-1 rounded-lg bg-bg-1 border border-metal-1 px-3 py-3 font-mono text-xs outline-none text-ink-0"
            />

            <button
              type="submit"
              disabled={!text.trim()}
              className="grid place-items-center w-11 h-11 rounded-lg bg-mint text-bg-0 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>

        {/* ========================================================
            JUGAAD DETAILS
        ======================================================== */}

        <aside className="surface-panel rounded-2xl p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <LED
              color="mint"
              pulse
              size={5}
            />

            <span className="font-technical text-[8px] text-mint">
              CONNECTED
            </span>
          </div>

          <p className="font-technical text-[8px] text-ink-3">
            JUGAAD
          </p>

          <p className="font-editorial text-base mt-1">
            {jugaadTitle}
          </p>

          <div className="flex items-center gap-1 mt-4">
            <IndianRupee
              size={14}
              className="text-amber"
            />

            <span className="font-display text-2xl text-amber">
              {agreedAmount}
            </span>

            <span className="font-mono text-[8px] text-ink-3">
              AGREED
            </span>
          </div>

          <div className="mt-5 pt-4 border-t border-metal-1/40 flex items-center gap-2 text-mint">
            <CheckCircle2 size={14} />

            <span className="font-technical text-[8px]">
              {String(status).toUpperCase()}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}