import { Link } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { useProposals } from '@/context/ProposalContext';
import { MessageSquare, ArrowRight } from 'lucide-react';

export function ConversationsListPage() {
  const { conversations } = useProposals();
  const list = conversations.length > 0 ? conversations : [];

  return (
    <div>
      <section className="pt-12 pb-7">
        <div className="flex items-center gap-3 mb-4">
          <LED color="mint" pulse size={7} />
          <span className="font-technical text-[9px] text-ink-2">06 — ACCEPTED COLLABORATIONS</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl">MESSAGES.</h1>
        <p className="mt-4 max-w-xl text-sm text-ink-2">
          Conversations unlock only when a poster accepts your request. Every thread belongs to one Jugaad.
        </p>
      </section>

      {list.length === 0 ? (
        <div className="py-16 text-center">
          <MessageSquare size={32} className="mx-auto text-ink-3 mb-3" />
          <p className="font-mono text-sm text-ink-2">No conversations yet. Accept a proposal to start messaging.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <Link
              key={c.id}
              to={`/dashboard/messages/${c.id}`}
              className="surface-metal-brushed rounded-2xl p-5 flex items-center gap-4 hover:border-mint/40 transition-colors"
              style={{ border: '1px solid var(--metal-1)' }}
            >
              <span className="grid place-items-center w-12 h-12 rounded-full bg-mint text-bg-0 font-display text-sm">
                {c.otherUser.initials}
              </span>
              <div className="flex-1">
                <p className="font-display text-lg">{c.otherUser.name}</p>
                <p className="font-mono text-[9px] text-ink-3 mt-1">
                  {c.jugaadTitle} · ₹{c.agreedAmount}
                </p>
                <p className="font-mono text-[10px] text-ink-2 mt-3 truncate">
                  {c.messages[c.messages.length - 1]?.text || 'No messages yet — say hello!'}
                </p>
              </div>
              <ArrowRight size={17} className="text-ink-3" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
