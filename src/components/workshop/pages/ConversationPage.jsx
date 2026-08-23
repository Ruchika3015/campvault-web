import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LED } from '@/components/primitives/Details';
import { useProposals } from '@/context/ProposalContext';
import { ArrowLeft, Send, IndianRupee, CheckCircle2 } from 'lucide-react';

export function ConversationPage() {
  const { conversationId } = useParams();
  const { conversations } = useProposals();
  const base = conversations.find((x) => x.id === conversationId);

  const [messages, setMessages] = useState(base?.messages || []);
  const [text, setText] = useState('');

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setMessages((v) =>
      v.concat({ id: `new-${Date.now()}`, from: 'me', text: text.trim(), timestamp: new Date().toISOString() })
    );
    setText('');
  };

  if (!base) {
    return (
      <div>
        <section className="pt-12 pb-5">
          <Link to="/dashboard/messages" className="inline-flex items-center gap-1.5 font-technical text-[8px] text-ink-3 hover:text-ink-0 mb-5">
            <ArrowLeft size={12} />
            ALL MESSAGES
          </Link>
          <p className="font-mono text-sm text-ink-2">This conversation is not available. It unlocks only after a proposal is accepted.</p>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="pt-12 pb-5">
        <Link to="/dashboard/messages" className="inline-flex items-center gap-1.5 font-technical text-[8px] text-ink-3 hover:text-ink-0 mb-5">
          <ArrowLeft size={12} />
          ALL MESSAGES
        </Link>
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-11 h-11 rounded-full bg-mint text-bg-0 font-display text-[10px]">
            {base.otherUser.initials}
          </span>
          <div>
            <h1 className="font-display text-2xl">{base.otherUser.name}</h1>
            <p className="font-mono text-[9px] text-ink-3 mt-1">{base.jugaadTitle}</p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1fr_260px] gap-5">
        <div className="surface-metal-brushed rounded-2xl p-4 sm:p-6">
          <div className="min-h-[390px] space-y-4 flex flex-col">
            {messages.length === 0 ? (
              <div className="m-auto text-center">
                <p className="font-mono text-xs text-ink-3">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[82%] rounded-2xl px-4 py-3 ${m.from === 'me' ? 'self-end bg-amber text-bg-0 rounded-tr-sm' : 'surface-panel rounded-tl-sm'}`}
                >
                  <p className="font-mono text-xs leading-relaxed">{m.text}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={send} className="flex items-center gap-2 mt-5 pt-4 border-t border-metal-1/40">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 rounded-lg bg-bg-1 border border-metal-1 px-3 py-3 font-mono text-xs outline-none text-ink-0"
            />
            <button className="grid place-items-center w-11 h-11 rounded-lg bg-mint text-bg-0" aria-label="Send">
              <Send size={15} />
            </button>
          </form>
        </div>

        <aside className="surface-panel rounded-2xl p-5 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <LED color="mint" pulse size={5} />
            <span className="font-technical text-[8px] text-mint">CONNECTED</span>
          </div>
          <p className="font-technical text-[8px] text-ink-3">JUGAAD</p>
          <p className="font-editorial text-base mt-1">{base.jugaadTitle}</p>
          <div className="flex items-center gap-1 mt-4">
            <IndianRupee size={14} className="text-amber" />
            <span className="font-display text-2xl text-amber">{base.agreedAmount}</span>
            <span className="font-mono text-[8px] text-ink-3">AGREED</span>
          </div>
          <div className="mt-5 pt-4 border-t border-metal-1/40 flex items-center gap-2 text-mint">
            <CheckCircle2 size={14} />
            <span className="font-technical text-[8px]">{base.status?.toUpperCase() || 'ACCEPTED'}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
