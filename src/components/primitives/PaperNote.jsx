import { useState } from 'react';

/**
 * A physical paper request slip — looks like real paper, not a UI card.
 * Slight rotation, imperfect torn edges, tape, realistic shadow, paper texture.
 * Lifts toward the viewer on hover (only the hovered note moves).
 */
export function PaperNote({
  note,
  rotate = -3,
  scale = 1,
  className = '',
  style,
  small = false,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="surface-paper paper-fiber obj-lift relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: `rotate(${rotate}deg) scale(${hovered ? scale * 1.05 : scale})`,
        clipPath:
          'polygon(1% 0, 97% 1%, 100% 5%, 99% 95%, 96% 100%, 4% 99%, 0 93%, 2% 3%)',
        boxShadow: hovered
          ? '0 1px 0 rgba(255,255,255,0.5) inset, 0 28px 44px -14px rgba(0,0,0,0.8), 0 6px 12px -3px rgba(0,0,0,0.5)'
          : '0 1px 0 rgba(255,255,255,0.5) inset, 0 16px 30px -12px rgba(0,0,0,0.65), 0 3px 6px -2px rgba(0,0,0,0.4)',
        padding: small ? '10px 12px' : '14px 16px',
        ...style,
      }}
    >
      {/* tape */}
      <span
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 opacity-50"
        style={{
          background: 'rgba(220,200,140,0.45)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transform: 'rotate(-4deg)',
        }}
        aria-hidden
      />
      {/* dog-ear corner */}
      <span
        className="absolute bottom-0 right-0"
        style={{
          width: 14,
          height: 14,
          background: 'linear-gradient(135deg, transparent 50%, rgba(42,36,24,0.15) 50%)',
        }}
        aria-hidden
      />
      <div className="flex items-start gap-2">
        {note.emoji && <span className="text-base leading-none">{note.emoji}</span>}
        <p
          className="font-editorial leading-snug text-paper-ink"
          style={{ fontSize: small ? 12 : 13 }}
        >
          {note.text}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className="font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 text-bg-0"
          style={{ background: 'var(--amber)' }}
        >
          {note.tag}
        </span>
        <span className="font-mono text-[7px] text-paper-ink/40">#{note.id}</span>
      </div>
    </div>
  );
}
