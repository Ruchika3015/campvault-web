import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { api } from '@/services/api';

function getInitials(name) {
  const value = String(name || '').trim();

  if (!value) {
    return 'U';
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function extractList(response, key) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.[key])) {
    return response[key];
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.[key])) {
    return response.data[key];
  }

  return [];
}

function extractMessages(response) {
  return extractList(response, 'messages');
}

function getMessageText(message) {
  return (
    message?.text ||
    message?.message ||
    message?.content ||
    ''
  );
}

function getSenderId(message) {
  return (
    message?.sender_id ??
    message?.senderId ??
    message?.user_id ??
    message?.userId ??
    message?.from_user_id ??
    message?.fromUserId ??
    null
  );
}

function getMessageId(message, index) {
  return (
    message?.id ??
    message?.message_id ??
    `message-${index}`
  );
}

function getMessageTime(message) {
  const value =
    message?.created_at ||
    message?.createdAt ||
    message?.sent_at ||
    message?.sentAt;

  if (!value) {
    return '';
  }

  try {
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function ConversationPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  /*
   * Load:
   *
   * 1. Conversation information
   * 2. Messages
   *
   * The backend gives us:
   * - other_user_name
   * - other_user_id
   * - other_user_email
   * - jugaad_title
   * - jugaad_id
   * - proposal_id
   */
  const loadConversation = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        conversationsResponse,
        messagesResponse,
      ] = await Promise.all([
        api.getConversations(),
        api.getConversationMessages(conversationId),
      ]);

      const conversations = extractList(
        conversationsResponse,
        'conversations'
      );

      const foundConversation =
        conversations.find(
          (item) =>
            String(
              item?.id ??
                item?.conversation_id
            ) === String(conversationId)
        );

      console.log(
        'CONVERSATION ID:',
        conversationId
      );

      console.log(
        'ALL CONVERSATIONS:',
        conversations
      );

      console.log(
        'SELECTED CONVERSATION:',
        foundConversation
      );

      console.log(
        'MESSAGES:',
        messagesResponse
      );

      setConversation(
        foundConversation || null
      );

      setMessages(
        extractMessages(messagesResponse)
      );
    } catch (err) {
      console.error(
        'Failed to load conversation:',
        err
      );

      setError(
        err?.message ||
          'Unable to load this conversation.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) {
      setError(
        'Conversation ID is missing.'
      );
      setLoading(false);
      return;
    }

    loadConversation();
  }, [conversationId]);

  const handleSend = async (event) => {
    event?.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    if (!conversationId) {
      setError(
        'Conversation ID is missing.'
      );
      return;
    }

    try {
      setSending(true);
      setError('');

      const response =
        await api.sendMessage(
          conversationId,
          trimmedText
        );

      console.log(
        'MESSAGE SENT:',
        response
      );

      /*
       * If backend returns the new message,
       * add it immediately.
       *
       * Otherwise reload messages.
       */
      const returnedMessages =
        extractMessages(response);

      if (returnedMessages.length > 0) {
        setMessages((current) => [
          ...current,
          ...returnedMessages,
        ]);
      } else {
        const refreshed =
          await api.getConversationMessages(
            conversationId
          );

        setMessages(
          extractMessages(refreshed)
        );
      }

      setText('');
    } catch (err) {
      console.error(
        'Failed to send message:',
        err
      );

      setError(
        err?.message ||
          'Message could not be sent. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * OTHER PERSON
   *
   * We intentionally use the backend's
   * other_user_name and other_user_id.
   */
  const personName =
    conversation?.other_user_name ||
    'User';

  const personId =
    conversation?.other_user_id ?? '';

  const personEmail =
    conversation?.other_user_email ||
    '';

  const jugaadTitle =
    conversation?.jugaad_title ||
    'Jugaad';

  const jugaadId =
    conversation?.jugaad_id ?? '';

  const proposalId =
    conversation?.proposal_id ?? '';

  const initials =
    getInitials(personName);

  /*
   * We still try to find the logged-in user,
   * but message alignment does NOT depend
   * only on this value.
   */
  let currentUserId = null;

  try {
    const storedUser =
      localStorage.getItem('cj_user');

    if (storedUser) {
      const parsed =
        JSON.parse(storedUser);

      currentUserId =
        parsed?.id ??
        parsed?.user_id ??
        parsed?.userId ??
        null;
    }
  } catch {
    currentUserId = null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0908] px-6 py-16 text-[#f4efe7]">
        <div className="mx-auto max-w-[1180px]">
          <div className="font-technical text-[10px] uppercase tracking-[0.28em] text-[#7fe0c0]">
            LOADING CONVERSATION
          </div>

          <div className="mt-6 text-4xl font-black uppercase">
            Messages.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0908] px-6 py-12 text-[#f4efe7] md:px-10">
      <div className="mx-auto max-w-[1180px]">

        {/* ========================================================= */}
        {/* BACK */}
        {/* ========================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate('/dashboard/messages')
          }
          className="mb-8 font-technical text-[10px] uppercase tracking-[0.22em] text-[#aaa39a] transition hover:text-white"
        >
          ← All messages
        </button>

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div className="mb-8 flex items-center gap-4">

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#62d5b1] text-lg font-black text-[#07110d]">
            {initials}
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-3xl font-black uppercase tracking-[-0.03em]">
              {personName}
            </h1>

            <p className="mt-1 truncate text-sm text-[#aaa39a]">
              {jugaadTitle}
            </p>
          </div>

        </div>

        {/* ========================================================= */}
        {/* ERROR */}
        {/* ========================================================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN GRID */}
        {/* ========================================================= */}

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

          {/* ======================================================= */}
          {/* CHAT */}
          {/* ======================================================= */}

          <section className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.06]">

            {/* ===================================================== */}
            {/* MESSAGES */}
            {/* ===================================================== */}

            <div className="min-h-[480px] max-h-[600px] overflow-y-auto p-6">

              {messages.length === 0 ? (
                <div className="flex min-h-[430px] items-center justify-center text-center text-sm text-[#aaa39a]">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <div className="space-y-4">

                  {messages.map(
                    (message, index) => {

                      const senderId =
                        getSenderId(
                          message
                        );

                      /*
                       * IMPORTANT
                       *
                       * This conversation is between
                       * exactly two people.
                       *
                       * personId = OTHER person's ID.
                       *
                       * Therefore:
                       *
                       * senderId === personId
                       *      => OTHER PERSON
                       *      => LEFT
                       *
                       * senderId !== personId
                       *      => CURRENT USER
                       *      => RIGHT
                       *
                       * This fixes the issue where
                       * everything appeared on the left.
                       */

                      const isMine =
                        senderId !== null &&
                        personId !== '' &&
                        String(senderId) !==
                          String(personId);

                      /*
                       * Fallback:
                       *
                       * If sender IDs are unavailable,
                       * use currentUserId when possible.
                       */
                      const resolvedIsMine =
                        senderId !== null &&
                        currentUserId !== null
                          ? String(
                              senderId
                            ) ===
                            String(
                              currentUserId
                            )
                          : isMine;

                      const messageText =
                        getMessageText(
                          message
                        );

                      const time =
                        getMessageTime(
                          message
                        );

                      return (
                        <div
                          key={getMessageId(
                            message,
                            index
                          )}
                          className={`flex w-full ${
                            resolvedIsMine
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >

                          {/* ================================================= */}
                          {/* MESSAGE BUBBLE */}
                          {/* ================================================= */}

                          <div
                            className={`
                              max-w-[78%]
                              rounded-2xl
                              px-4
                              py-3
                              shadow-sm
                              ${
                                resolvedIsMine
                                  ? `
                                    rounded-br-md
                                    bg-[#62d5b1]
                                    text-[#07110d]
                                  `
                                  : `
                                    rounded-bl-md
                                    border
                                    border-white/10
                                    bg-[#292725]
                                    text-[#f4efe7]
                                  `
                              }
                            `}
                          >

                            {/* MESSAGE TEXT */}

                            <div className="break-words text-sm leading-6">
                              {messageText}
                            </div>

                            {/* TIME */}

                            {time && (
                              <div
                                className={`
                                  mt-1
                                  flex
                                  items-center
                                  gap-1
                                  text-[10px]
                                  ${
                                    resolvedIsMine
                                      ? `
                                        justify-end
                                        text-[#07110d]/60
                                      `
                                      : `
                                        justify-start
                                        text-[#aaa39a]
                                      `
                                  }
                                `}
                              >

                                <span>
                                  {time}
                                </span>

                                {/* READ/SENT MARK FOR OUR MESSAGE */}

                                {resolvedIsMine && (
                                  <span className="font-bold text-[#07110d]/70">
                                    ✓✓
                                  </span>
                                )}

                              </div>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* ===================================================== */}
            {/* COMPOSER */}
            {/* ===================================================== */}

            <form
              onSubmit={handleSend}
              className="flex gap-3 border-t border-white/10 p-5"
            >

              <input
                type="text"
                value={text}
                onChange={(event) =>
                  setText(
                    event.target.value
                  )
                }
                placeholder="Write a message..."
                disabled={sending}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-[#777] focus:border-[#62d5b1]/60"
              />

              <button
                type="submit"
                disabled={
                  sending ||
                  !text.trim()
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#62d5b1] text-xl text-[#07110d] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {sending ? '…' : '➤'}
              </button>

            </form>

          </section>

          {/* ======================================================= */}
          {/* SIDE PANEL */}
          {/* ======================================================= */}

          <aside className="h-fit rounded-[22px] border border-white/10 bg-white/[0.04] p-6">

            <div className="font-technical text-[9px] uppercase tracking-[0.25em] text-[#62d5b1]">
              ● Connected
            </div>

            {/* JUGAAD */}

            <div className="mt-7">

              <div className="font-technical text-[9px] uppercase tracking-[0.25em] text-[#777]">
                Jugaad
              </div>

              <div className="mt-2 text-xl font-bold">
                {jugaadTitle}
              </div>

            </div>

            <div className="my-7 h-px bg-white/10" />

            {/* PERSON */}

            <div>

              <div className="font-technical text-[9px] uppercase tracking-[0.25em] text-[#777]">
                Person
              </div>

              <div className="mt-2 text-base font-semibold">
                {personName}
              </div>

              {personEmail && (
                <div className="mt-1 break-all text-xs text-[#aaa39a]">
                  {personEmail}
                </div>
              )}

            </div>

            <div className="my-7 h-px bg-white/10" />

            {/* STATUS */}

            <div>

              <div className="font-technical text-[9px] uppercase tracking-[0.25em] text-[#777]">
                Status
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-[#62d5b1]">
                <span>✓</span>

                <span>
                  {conversation?.jugaad_status ||
                    'Accepted'}
                </span>
              </div>

            </div>

            {/* DEBUG INFO HIDDEN */}

            <div className="mt-7 hidden text-[10px] text-white/30">
              conversation: {conversationId}
              <br />
              other user: {personId}
              <br />
              jugaad: {jugaadId}
              <br />
              proposal: {proposalId}
            </div>

          </aside>

        </div>

      </div>
    </div>
  );
}

export default ConversationPage;