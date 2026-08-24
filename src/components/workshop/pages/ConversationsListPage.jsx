import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

function extractConversations(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.conversations)) {
    return response.conversations;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.conversations)) {
    return response.data.conversations;
  }

  return [];
}

function formatLastMessage(conversation) {
  if (conversation?.last_message) {
    return conversation.last_message;
  }

  return 'No messages yet — say hello!';
}

function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return '₹0';
  }

  return `₹${value}`;
}

export function ConversationsListPage() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.getConversations();

      const list = extractConversations(response);

      console.log('CONVERSATIONS FROM BACKEND:', response);
      console.log('NORMALIZED CONVERSATIONS:', list);

      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);

      setError(
        err?.message ||
          'Unable to load conversations. Please try again.'
      );

      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const visibleConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      return Boolean(
        conversation?.id ||
          conversation?.conversation_id
      );
    });
  }, [conversations]);

  const openConversation = (conversation) => {
    const conversationId =
      conversation?.id ??
      conversation?.conversation_id;

    if (!conversationId) {
      console.error(
        'Conversation has no conversation ID:',
        conversation
      );
      return;
    }

    navigate(`/dashboard/messages/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0908] px-6 py-16 text-[#f4efe7]">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-3 font-technical text-[10px] uppercase tracking-[0.28em] text-[#7fe0c0]">
            06 — ACCEPTED COLLABORATIONS
          </div>

          <h1 className="text-5xl font-black uppercase tracking-[-0.04em] md:text-6xl">
            Messages.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#aaa39a]">
            Loading your accepted collaborations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0908] px-6 py-16 text-[#f4efe7]">
      <div className="mx-auto max-w-[1180px]">

        {/* HEADER */}
        <div className="mb-3 font-technical text-[10px] uppercase tracking-[0.28em] text-[#7fe0c0]">
          06 — ACCEPTED COLLABORATIONS
        </div>

        <h1 className="text-5xl font-black uppercase tracking-[-0.04em] md:text-6xl">
          Messages.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-[#aaa39a]">
          Conversations unlock only when a poster accepts your
          request. Every thread belongs to one Jugaad.
        </p>

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!error && visibleConversations.length === 0 && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-lg font-semibold">
              No accepted collaborations yet.
            </p>

            <p className="mt-2 text-sm text-[#aaa39a]">
              Once a proposal is accepted, the other person will
              appear here.
            </p>
          </div>
        )}

        {/* CONVERSATIONS */}
        <div className="mt-9 space-y-4">
          {visibleConversations.map((conversation) => {
            /*
             * IMPORTANT:
             *
             * The backend already gives us the OTHER PERSON.
             *
             * Example:
             *
             * other_user_id: "2"
             * other_user_name: "Ishita Agarwal"
             * other_user_email: "ishita05agarwal@gmail.com"
             *
             * Therefore we must NOT use:
             *
             * conversation.user
             * conversation.poster
             * conversation.proposer
             *
             * unless the backend actually sends those fields.
             */

            const conversationId =
              conversation?.id ??
              conversation?.conversation_id;

            const personName =
              conversation?.other_user_name ||
              'User';

            const personEmail =
              conversation?.other_user_email ||
              '';

            const personId =
              conversation?.other_user_id ??
              '';

            const jugaadTitle =
              conversation?.jugaad_title ||
              'Jugaad';

            const jugaadId =
              conversation?.jugaad_id ??
              '';

            const proposalId =
              conversation?.proposal_id ??
              '';

            const lastMessage =
              formatLastMessage(conversation);

            const initials = getInitials(personName);

            return (
              <button
                key={conversationId}
                type="button"
                onClick={() =>
                  openConversation(conversation)
                }
                className="group flex w-full items-center gap-5 rounded-[22px] border border-white/10 bg-white/[0.06] px-5 py-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/20 hover:bg-white/[0.09] md:px-6"
              >
                {/* AVATAR */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#62d5b1] text-lg font-black text-[#07110d]">
                  {initials}
                </div>

                {/* CONTENT */}
                <div className="min-w-0 flex-1">

                  {/* PERSON */}
                  <div className="truncate text-xl font-bold text-[#f4efe7]">
                    {personName}
                  </div>

                  {/* JUGAAD */}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#aaa39a]">
                    <span>
                      {jugaadTitle}
                    </span>

                    <span>•</span>

                    <span>
                      {formatMoney(
                        conversation?.amount ??
                          conversation?.budget ??
                          conversation?.price
                      )}
                    </span>
                  </div>

                  {/* MESSAGE */}
                  <div className="mt-3 truncate text-sm text-[#aaa39a]">
                    {lastMessage}
                  </div>

                  {/* DEBUG-FRIENDLY META, visually subtle */}
                  {(personId ||
                    jugaadId ||
                    proposalId ||
                    personEmail) && (
                    <div className="mt-2 hidden text-[10px] text-white/30">
                      user: {personId} · jugaad: {jugaadId} ·
                      proposal: {proposalId} · {personEmail}
                    </div>
                  )}
                </div>

                {/* ARROW */}
                <div className="shrink-0 text-2xl text-[#aaa39a] transition group-hover:translate-x-1 group-hover:text-white">
                  →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ConversationsListPage;