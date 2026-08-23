import { LED, Rivet } from '@/components/primitives/Details';
import { mockAchievements } from '@/data/workshopMockData';
import { Award, Lock } from 'lucide-react';

const TIER_STYLES = {
  bronze: { border: 'rgba(184,115,51,0.4)', glow: '0 0 12px rgba(184,115,51,0.2)', label: 'BRONZE' },
  silver: { border: 'rgba(192,192,192,0.4)', glow: '0 0 12px rgba(192,192,192,0.15)', label: 'SILVER' },
  gold: { border: 'rgba(214,174,60,0.45)', glow: 'var(--glow-amber)', label: 'GOLD' },
  platinum: { border: 'rgba(93,184,154,0.4)', glow: 'var(--glow-mint)', label: 'PLATINUM' },
};

/**
 * Achievements — a physical shelf of trophies, badges, and pins.
 * Unlocked items glow; locked items are dimmed with a lock.
 */
export function AchievementsStation({ open, onClose }) {
  if (!open) return null;

  const unlocked = mockAchievements.filter((a) => a.unlocked);
  const locked = mockAchievements.filter((a) => !a.unlocked);

  return (
    <div className="workshop-overlay" onClick={onClose}>
      <div
        className="workshop-panel relative w-full max-w-lg mx-4 surface-shelf rounded-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Rivet size={9} className="absolute top-3 left-3" />
        <Rivet size={9} className="absolute top-3 right-3" />
        <Rivet size={9} className="absolute bottom-3 left-3" />
        <Rivet size={9} className="absolute bottom-3 right-3" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-metal-2/40">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-amber" />
            <span className="font-technical text-[9px] text-ink-1">ACHIEVEMENTS</span>
          </div>
          <div className="flex items-center gap-2">
            <LED color="amber" pulse size={5} />
            <span className="font-mono text-[7px] text-ink-3">{unlocked.length}/{mockAchievements.length} UNLOCKED</span>
          </div>
        </div>

        {/* Unlocked shelf */}
        <div className="mb-2">
          <span className="font-technical text-[7px] text-mint">UNLOCKED</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {unlocked.map((ach, i) => {
            const tier = TIER_STYLES[ach.tier];
            return (
              <div
                key={ach.id}
                className="surface-panel rounded-xl p-4 text-center anim-reveal relative"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  border: `1px solid ${tier.border}`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), ${tier.glow}`,
                }}
              >
                {/* Trophy emoji */}
                <div className="text-3xl mb-2 anim-float" style={{ animationDelay: `${i * 0.5}s` }}>
                  {ach.emoji}
                </div>
                <p className="font-display text-xs text-ink-0 leading-tight mb-1">{ach.title}</p>
                <p className="font-mono text-[8px] text-ink-3 leading-snug mb-2">{ach.desc}</p>
                <span
                  className="inline-block font-technical text-[6px] px-1.5 py-0.5 rounded text-bg-0"
                  style={{ background: `var(--${ach.tier === 'gold' ? 'amber' : ach.tier === 'platinum' ? 'mint' : 'metal-2'})` }}
                >
                  {tier.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Locked shelf */}
        <div className="mb-2">
          <span className="font-technical text-[7px] text-ink-3">LOCKED</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {locked.map((ach) => {
            const tier = TIER_STYLES[ach.tier];
            return (
              <div
                key={ach.id}
                className="surface-panel rounded-xl p-4 text-center relative opacity-40"
                style={{ border: `1px solid ${tier.border}` }}
              >
                <div className="text-3xl mb-2 grayscale">
                  <Lock size={28} className="mx-auto text-ink-3" />
                </div>
                <p className="font-display text-xs text-ink-2 leading-tight mb-1">{ach.title}</p>
                <p className="font-mono text-[8px] text-ink-3 leading-snug">{ach.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 grid place-items-center w-7 h-7 rounded-full surface-metal text-ink-2 hover:text-ink-0 text-xs"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
