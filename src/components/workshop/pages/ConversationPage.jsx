import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import EmojiPicker from 'emoji-picker-react';

import { api } from '@/services/api';

/* ================================================================
   HELPERS
================================================================ */

function getInitials(name) {
  const value =
    String(name || '').trim();

  if (!value) {
    return 'U';
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part
        .charAt(0)
        .toUpperCase()
    )
    .join('');
}


function extractList(
  response,
  key
) {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(
      response?.[key]
    )
  ) {
    return response[key];
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.[key]
    )
  ) {
    return response.data[key];
  }

  return [];
}


function extractMessages(
  response
) {
  return extractList(
    response,
    'messages'
  );
}


function normalizeConversation(
  conversation
) {
  if (
    !conversation ||
    typeof conversation !== 'object'
  ) {
    return null;
  }

  return {
    ...conversation,

    id:
      conversation.id ??
      conversation.conversationId ??
      conversation.conversation_id ??
      conversation._id,

    other_user_name:
      conversation.other_user_name ??
      conversation.otherUser?.name ??
      conversation.user?.name,

    other_user_id:
      conversation.other_user_id ??
      conversation.otherUser?._id ??
      conversation.otherUser?.id ??
      conversation.user?._id ??
      conversation.user?.id,

    other_user_email:
      conversation.other_user_email ??
      conversation.otherUser?.email ??
      conversation.user?.email,

    jugaad_title:
      conversation.jugaad_title ??
      conversation.gig_title ??
      conversation.jugaadTitle ??
      conversation.gigTitle,

    jugaad_id:
      conversation.jugaad_id ??
      conversation.jugaadId ??
      conversation.gigId,

    proposal_id:
      conversation.proposal_id ??
      conversation.proposalId,
  };
}


function getMessageText(
  message
) {
  return (
    message?.text ||
    message?.message ||
    message?.content ||
    ''
  );
}


function getSenderId(
  message
) {
  return (
    message?.sender?._id ??
    message?.sender?.id ??
    (
      typeof message?.sender === 'string'
        ? message?.sender
        : null
    ) ??
    message?.sender_id ??
    message?.senderId ??
    message?.user_id ??
    message?.userId ??
    message?.from_user_id ??
    message?.fromUserId ??
    null
  );
}


function getMessageId(
  message,
  index
) {
  return (
    message?._id ??
    message?.id ??
    message?.message_id ??
    `message-${index}`
  );
}


function getMessageDate(
  message
) {
  const value =
    message?.created_at ||
    message?.createdAt ||
    message?.sent_at ||
    message?.sentAt;

  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}


function getDateKey(
  date
) {
  if (!date) {
    return '';
  }

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, '0'),
    String(
      date.getDate()
    ).padStart(2, '0'),
  ].join('-');
}


function getDateLabel(
  date
) {
  if (!date) {
    return '';
  }

  const today =
    new Date();

  const todayKey =
    getDateKey(today);

  const dateKey =
    getDateKey(date);

  if (
    dateKey ===
    todayKey
  ) {
    return 'TODAY';
  }

  const yesterday =
    new Date(today);

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  if (
    dateKey ===
    getDateKey(yesterday)
  ) {
    return 'YESTERDAY';
  }

  return date.toLocaleDateString(
    [],
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );
}


function getMessageTime(
  message
) {
  const value =
    message?.created_at ||
    message?.createdAt ||
    message?.sent_at ||
    message?.sentAt;

  if (!value) {
    return '';
  }

  try {
    return new Date(
      value
    ).toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  } catch {
    return '';
  }
}


/* ================================================================
   CONVERSATION PAGE
================================================================ */

export function ConversationPage() {
  const {
    conversationId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    conversation,
    setConversation,
  ] = useState(null);

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    text,
    setText,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    showEmojiPicker,
    setShowEmojiPicker,
  ] = useState(false);

  const messagesEndRef =
    useRef(null);

  const emojiPickerRef =
    useRef(null);


  /* ==============================================================
     LOAD CONVERSATION
  ============================================================== */

  const loadConversation =
    async () => {
      try {
        setLoading(true);
        setError('');

        const [
          conversationsResponse,
          messagesResponse,
        ] = await Promise.all([
          api.getConversations(),

          api.getConversationMessages(
            conversationId
          ),
        ]);

        const conversations =
          extractList(
            conversationsResponse,
            'conversations'
          );

        const foundConversation =
          conversations
            .map(
              normalizeConversation
            )
            .find(
              (item) =>
                String(
                  item?.id
                ) ===
                String(
                  conversationId
                )
            );

        const messageConversation =
          normalizeConversation(
            messagesResponse?.conversation ??
            messagesResponse?.data?.conversation
          );

        setConversation(
          foundConversation ||
          messageConversation ||
          null
        );

        setMessages(
          extractMessages(
            messagesResponse
          )
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


  /* ==============================================================
     REFRESH MESSAGES ONLY
  ============================================================== */

  const refreshMessages =
    async () => {
      if (!conversationId) {
        return;
      }

      try {
        const response =
          await api.getConversationMessages(
            conversationId
          );

        const latestMessages =
          extractMessages(
            response
          );

        setMessages(
          latestMessages
        );
      } catch (err) {
        console.error(
          'Background message refresh failed:',
          err
        );
      }
    };


  /* ==============================================================
     MARK MESSAGES AS READ
  ============================================================== */

  const markMessagesAsRead =
    async () => {
      if (!conversationId) {
        return;
      }

      try {
        await api.markConversationAsRead(
          conversationId
        );

        /*
         * Refresh immediately after marking
         * messages as read so the sender/receiver
         * has the newest read_at values.
         */
        await refreshMessages();
      } catch (err) {
        console.error(
          'Failed to mark messages as read:',
          err
        );
      }
    };


  /* ==============================================================
     INITIAL LOAD + READ + AUTO REFRESH
  ============================================================== */

  useEffect(() => {
    if (!conversationId) {
      setError(
        'Conversation ID is missing.'
      );

      setLoading(false);

      return;
    }

    /*
     * Load conversation.
     */
    loadConversation();

    /*
     * Mark messages as read when
     * this conversation is opened.
     */
    markMessagesAsRead();

    /*
     * Poll every 2 seconds.
     *
     * New messages appear automatically.
     */
    const intervalId =
      setInterval(
        async () => {
          await refreshMessages();
        },
        2000
      );

    /*
     * Stop polling when leaving
     * the conversation.
     */
    return () => {
      clearInterval(
        intervalId
      );
    };
  }, [
    conversationId,
  ]);


  /* ==============================================================
     AUTO SCROLL TO LATEST MESSAGE
  ============================================================== */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);


  /* ==============================================================
     CLOSE EMOJI PICKER WHEN CLICKING OUTSIDE
  ============================================================== */

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(
            event.target
          )
        ) {
          setShowEmojiPicker(false);
        }
      };

    if (showEmojiPicker) {
      document.addEventListener(
        'mousedown',
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, [
    showEmojiPicker,
  ]);


  /* ==============================================================
     SEND MESSAGE
  ============================================================== */

  const handleSend =
    async (event) => {
      event?.preventDefault();

      const trimmedText =
        text.trim();

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

        const returnedMessages =
          extractMessages(
            response
          );

        if (
          returnedMessages.length >
          0
        ) {
          setMessages(
            (current) => {
              const existingIds =
                new Set(
                  current.map(
                    (
                      message,
                      index
                    ) =>
                      String(
                        getMessageId(
                          message,
                          index
                        )
                      )
                  )
                );

              const newMessages =
                returnedMessages.filter(
                  (
                    message,
                    index
                  ) =>
                    !existingIds.has(
                      String(
                        getMessageId(
                          message,
                          index
                        )
                      )
                    )
                );

              return [
                ...current,
                ...newMessages,
              ];
            }
          );
        } else {
          await refreshMessages();
        }

        setText('');

        setShowEmojiPicker(
          false
        );
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


  /* ==============================================================
     EMOJI
  ============================================================== */

  const handleEmojiClick =
    (emojiData) => {
      setText(
        (currentText) =>
          `${currentText}${emojiData.emoji}`
      );
    };


  /* ==============================================================
     KEYBOARD
  ============================================================== */

  const handleComposerKeyDown =
    (event) => {
      /*
       * Enter = send
       *
       * Shift + Enter = new line
       */
      if (
        event.key === 'Enter' &&
        !event.shiftKey
      ) {
        event.preventDefault();

        if (
          !sending &&
          text.trim()
        ) {
          handleSend(event);
        }
      }
    };


  /* ==============================================================
     OTHER PERSON
  ============================================================== */

  const personName =
    conversation?.other_user_name ||
    'User';

  const personId =
    conversation?.other_user_id ??
    '';

  const personEmail =
    conversation?.other_user_email ||
    '';

  const jugaadTitle =
    conversation?.jugaad_title ||
    conversation?.gig_title ||
    'Gig';

  const jugaadId =
    conversation?.jugaad_id ??
    '';

  const proposalId =
    conversation?.proposal_id ??
    '';

  const initials =
    getInitials(
      personName
    );


  /* ==============================================================
     CURRENT USER
  ============================================================== */

  let currentUserId =
    null;

  try {
    const storedUser =
      localStorage.getItem(
        'cj_user'
      );

    if (storedUser) {
      const parsed =
        JSON.parse(
          storedUser
        );

      currentUserId =
        parsed?.id ??
        parsed?.user_id ??
        parsed?.userId ??
        null;
    }
  } catch {
    currentUserId =
      null;
  }


  /* ==============================================================
     LOADING
  ============================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-0 px-6 py-16 text-ink-0">
        <div className="mx-auto max-w-[1180px]">

          <div className="font-technical text-[10px] uppercase tracking-[0.28em] text-mint-soft">
            LOADING CONVERSATION
          </div>

          <div className="mt-6 text-4xl font-black uppercase">
            Messages.
          </div>

        </div>
      </div>
    );
  }


  /* ================================================================
     PAGE
  ================================================================ */

  return (
    <div className="min-h-screen bg-bg-0 px-6 py-12 text-ink-0 md:px-10">

      <div className="mx-auto max-w-[1180px]">

        {/* =========================================================
            BACK
        ========================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate(
              '/dashboard/messages'
            )
          }
          className="mb-8 font-technical text-[10px] uppercase tracking-[0.22em] text-ink-2 transition hover:text-ink-0"
        >
          ← All messages
        </button>


        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="mb-8 flex items-center gap-4">

          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-black"
            style={{
              background:
                'linear-gradient(135deg, var(--mint), var(--mint-deep))',
              color:
                'var(--bg-0)',
            }}
          >
            {initials}
          </div>

          <div className="min-w-0">

            <h1 className="truncate text-3xl font-black uppercase tracking-[-0.03em]">
              {personName}
            </h1>

            <p className="mt-1 truncate text-sm text-ink-2">
              {jugaadTitle}
            </p>

          </div>

        </div>


        {/* =========================================================
            ERROR
        ========================================================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-coral/20 bg-coral/10 px-5 py-4 text-sm text-coral-soft">
            {error}
          </div>
        )}


        {/* =========================================================
            MAIN GRID
        ========================================================= */}

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

          {/* =======================================================
              CHAT
          ======================================================= */}

          <section className="overflow-hidden rounded-[22px] border border-metal-1/40 bg-bg-1">

            {/* =====================================================
                MESSAGES
            ===================================================== */}

            <div className="min-h-[480px] max-h-[600px] overflow-y-auto p-6">

              {messages.length === 0 ? (

                <div className="flex min-h-[430px] items-center justify-center text-center text-sm text-ink-2">
                  No messages yet. Start the conversation!
                </div>

              ) : (

                <div className="space-y-4">

                  {messages.map(
                    (
                      message,
                      index
                    ) => {

                      const senderId =
                        getSenderId(
                          message
                        );


                      /*
                       * personId is the other
                       * participant.
                       */

                      const isMine =
                        senderId !== null &&
                        personId !== '' &&
                        String(
                          senderId
                        ) !==
                        String(
                          personId
                        );


                      /*
                       * Prefer logged-in user ID
                       * when available.
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


                      const messageDate =
                        getMessageDate(
                          message
                        );


                      const currentDateKey =
                        getDateKey(
                          messageDate
                        );


                      const previousMessage =
                        messages[
                          index - 1
                        ];


                      const previousDate =
                        getMessageDate(
                          previousMessage
                        );


                      const previousDateKey =
                        getDateKey(
                          previousDate
                        );


                      const shouldShowDate =
                        currentDateKey !== '' &&
                        currentDateKey !==
                          previousDateKey;


                      /*
                       * READ STATUS
                       *
                       * For our messages:
                       *
                       * read_at == null
                       *       → grey ✓✓
                       *
                       * read_at exists
                       *       → blue ✓✓
                       */

                      const isRead =
                        Boolean(
                          message?.read_at ||
                          message?.readAt
                        );


                      return (
                        <div
                          key={getMessageId(
                            message,
                            index
                          )}
                        >

                          {/* =========================================
                              DATE SEPARATOR
                          ========================================= */}

                          {shouldShowDate && (
                            <div className="my-5 flex items-center justify-center">

                              <div className="rounded-full border border-metal-1/40 bg-bg-2 px-4 py-1.5 font-technical text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-2">
                                {getDateLabel(
                                  messageDate
                                )}
                              </div>

                            </div>
                          )}


                          {/* =========================================
                              MESSAGE ROW
                          ========================================= */}

                          <div
                            className={`flex w-full ${
                              resolvedIsMine
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >

                            {/* =====================================
                                MESSAGE BUBBLE
                            ===================================== */}

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
                                      bg-mint
                                      text-bg-0
                                    `
                                    : `
                                      rounded-bl-md
                                      border
                                      border-metal-1/40
                                      bg-bg-2
                                      text-ink-0
                                    `
                                }
                              `}
                            >

                              {/* MESSAGE */}

                              <div className="break-words whitespace-pre-wrap text-sm leading-6">
                                {messageText}
                              </div>


                              {/* TIME + TICKS */}

                              {(
                                time ||
                                resolvedIsMine
                              ) && (

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
                                          text-bg-0/60
                                        `
                                        : `
                                          justify-start
                                          text-ink-2
                                        `
                                    }
                                  `}
                                >

                                  {time && (
                                    <span>
                                      {time}
                                    </span>
                                  )}


                                  {/* ==================================
                                      READ RECEIPT
                                  ================================== */}

                                  {resolvedIsMine && (
                                    <span
                                      className={
                                        isRead
                                          ? 'font-bold text-blue-400'
                                          : 'font-bold text-bg-0/60'
                                      }
                                      title={
                                        isRead
                                          ? 'Read'
                                          : 'Sent'
                                      }
                                    >
                                      ✓✓
                                    </span>
                                  )}

                                </div>

                              )}

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                  {/* AUTO SCROLL TARGET */}

                  <div
                    ref={messagesEndRef}
                  />

                </div>

              )}

            </div>


            {/* =====================================================
                COMPOSER
            ===================================================== */}

            <form
              onSubmit={
                handleSend
              }
              className="relative border-t border-metal-1/40 p-4"
            >

              {/* ================================================
                  EMOJI PICKER
              ================================================ */}

              {showEmojiPicker && (
                <div
                  ref={
                    emojiPickerRef
                  }
                  className="absolute bottom-[76px] left-4 z-50"
                >

                  <EmojiPicker
                    onEmojiClick={
                      handleEmojiClick
                    }
                    theme="dark"
                    width={320}
                    height={400}
                    lazyLoadEmojis
                  />

                </div>
              )}


              <div className="flex items-end gap-2">

                {/* ==============================================
                    EMOJI BUTTON
                ============================================== */}

                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker(
                      (current) =>
                        !current
                    )
                  }
                  disabled={sending}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-metal-1/40 bg-bg-2 text-xl transition hover:bg-bg-3 disabled:opacity-40"
                  aria-label="Open emoji picker"
                  title="Emoji"
                >
                  😊
                </button>


                {/* ==============================================
                    MESSAGE INPUT
                ============================================== */}

                <textarea
                  value={text}
                  onChange={(event) =>
                    setText(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleComposerKeyDown
                  }
                  placeholder="Write a message..."
                  disabled={sending}
                  rows={1}
                  className="max-h-32 min-h-12 min-w-0 flex-1 resize-none rounded-xl border border-metal-1/40 bg-bg-2 px-4 py-3 text-sm leading-6 text-ink-0 outline-none placeholder:text-ink-3 focus:border-mint/60"
                />


                {/* ==============================================
                    SEND BUTTON
                ============================================== */}

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !text.trim()
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mint text-xl text-bg-0 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                  title="Send"
                >
                  {sending
                    ? '…'
                    : '➤'}
                </button>

              </div>

            </form>

          </section>


          {/* =======================================================
              SIDE PANEL
          ======================================================= */}

          <aside className="h-fit rounded-[22px] border border-metal-1/40 bg-bg-1 p-6">

            <div className="font-technical text-[9px] uppercase tracking-[0.25em] text-mint">
              ● Connected
            </div>


            {/* JUGAAD */}

            <div className="mt-7">

              <div className="font-technical text-[9px] uppercase tracking-[0.25em] text-ink-3">
                Gig
              </div>

              <div className="mt-2 text-xl font-bold">
                {jugaadTitle}
              </div>

            </div>


            <div className="my-7 h-px bg-metal-1/30" />


            {/* PERSON */}

            <div>

              <div className="font-technical text-[9px] uppercase tracking-[0.25em] text-ink-3">
                Person
              </div>

              <div className="mt-2 text-base font-semibold">
                {personName}
              </div>

              {personEmail && (
                <div className="mt-1 break-all text-xs text-ink-2">
                  {personEmail}
                </div>
              )}

            </div>


            <div className="my-7 h-px bg-metal-1/30" />


            {/* STATUS */}

            <div>

              <div className="font-technical text-[9px] uppercase tracking-[0.25em] text-ink-3">
                Status
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-mint">

                <span>
                  ✓
                </span>

                <span>
                  {conversation?.jugaad_status ||
                    'Accepted'}
                </span>

              </div>

            </div>


            {/* DEBUG INFO */}

            <div className="mt-7 hidden text-[10px] text-white/30">

              conversation:
              {' '}
              {conversationId}

              <br />

              other user:
              {' '}
              {personId}

              <br />

              gig:
              {' '}
              {jugaadId}

              <br />

              proposal:
              {' '}
              {proposalId}

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}


export default ConversationPage;