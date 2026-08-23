import { TICKER_ITEMS } from '@/data/mockData';
import { LED } from '@/components/primitives/Details';

export function LiveTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="relative surface-metal-brushed border-y border-metal-2/30 py-3 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, var(--metal-0), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(-90deg, var(--metal-0), transparent)' }} />
      <div className="flex items-center gap-3 mb-2 px-6">
        <LED color="mint" pulse size={7} />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-2">Live feed · Jugaads moving through the exchange</span>
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
                  : { background: 'rgba(255,138,61,0.15)', color: 'var(--amber)' }
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
