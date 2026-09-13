import { useState, useEffect } from 'react';
import { LED } from '@/components/primitives/Details';
import { api } from '@/services/api';

const DEFAULT_ITEMS = [
  { emoji: '⚡', text: 'Live gig marketplace online', status: 'live' },
  { emoji: '🔒', text: 'OTP verified completions active', status: 'done' },
  { emoji: '💼', text: 'Instant student-to-student escrow', status: 'live' },
  { emoji: '🎯', text: 'Verified student network', status: 'done' },
];

export function LiveTicker() {
  const [items, setItems] = useState(DEFAULT_ITEMS);

  useEffect(() => {
    let mounted = true;
    api.getGigs()
      .then((res) => {
        if (!mounted) return;
        const gigs = Array.isArray(res) ? res : res?.gigs || res?.data?.gigs || [];
        if (gigs.length > 0) {
          const liveItems = gigs.slice(0, 10).map((g) => ({
            emoji: '💼',
            text: `${g.title} · ₹${g.budget || 'Open'} [${g.category || 'Gig'}]`,
            status: g.status === 'completed' ? 'done' : 'live',
          }));
          setItems([...liveItems, ...liveItems]);
        } else {
          setItems([...DEFAULT_ITEMS, ...DEFAULT_ITEMS]);
        }
      })
      .catch(() => {
        if (mounted) setItems([...DEFAULT_ITEMS, ...DEFAULT_ITEMS]);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="relative surface-metal-brushed border-y border-metal-2/30 py-3 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--metal-0), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(-90deg, var(--metal-0), transparent)' }} />
      <div className="flex items-center gap-3 mb-2 px-6">
        <LED color="mint" pulse size={7} />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-2">Live feed · Gigs active across campus</span>
      </div>
      <div className="flex anim-ticker whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-6 shrink-0">
            <span className="text-base">{item.emoji}</span>
            <span className="font-mono text-sm text-ink-1">{item.text}</span>
            <span
              className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={
                item.status === 'done'
                  ? { background: 'rgba(91,233,201,0.15)', color: 'var(--mint)' }
                  : { background: 'rgba(34,197,94,0.18)', color: 'var(--amber)' }
              }
            >
              {item.status === 'done' ? 'done' : 'live'}
            </span>
            <span className="text-metal-edge">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}

