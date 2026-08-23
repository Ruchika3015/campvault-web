import { LED, Rivet } from '@/components/primitives/Details';
import { mockActivity } from '@/data/workshopMockData';
import { Radio } from 'lucide-react';

/**
 * Live Exchange — subtle machine messages, not a social media feed.
 */
export function LiveExchange() {
  return (
    <div className="surface-panel rounded-2xl p-5 relative overflow-hidden">
      <Rivet size={7} className="absolute top-2 left-2" />
      <Rivet size={7} className="absolute top-2 right-2" />
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-metal-2/30">
        <div className="flex items-center gap-2">
          <Radio size={13} className="text-mint" />
          <span className="font-technical text-[8px] text-ink-1">LIVE EXCHANGE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <LED color="mint" pulse size={4} />
          <span className="font-mono text-[7px] text-mint">SIGNAL LIVE</span>
        </div>
      </div>
      <div className="space-y-3">
        {mockActivity.map((activity, i) => (
          <div key={activity.id} className="flex items-center gap-2.5" style={{ opacity: 1 - i * 0.08 }}>
            <span className="text-sm leading-none">{activity.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9px] text-ink-1 truncate">{activity.text}</p>
              <p className="font-mono text-[7px] text-ink-3">{activity.time}</p>
            </div>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? 'bg-mint anim-act-dot' : i % 2 ? 'bg-amber' : 'bg-ink-3'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
