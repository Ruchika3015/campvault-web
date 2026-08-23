import { useEnvironment } from '@/hooks/useEnvironment';

const colorClass = {
  amber: 'led--on-amber',
  mint: 'led--on-mint',
  coral: 'led--on-coral',
  off: '',
};

export function LED({
  color = 'off',
  size = 8,
  pulse = false,
  blink = false,
  className = '',
  style,
}) {
  const anim = blink ? 'anim-led-blink' : pulse ? 'anim-led-pulse' : '';
  return (
    <span
      className={`led ${colorClass[color]} ${anim} ${className}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden
    />
  );
}

export function LEDMeter({ level = 0, count = 6, color = 'amber', size = 7, className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <LED key={i} color={i < level ? color : 'off'} size={size} />
      ))}
    </div>
  );
}

export function Rivet({ size = 10, className = '', style }) {
  return (
    <span
      className={`rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 35% 30%, #6b7689, #1c2230 70%)',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.5), 0 1px 1px rgba(0,0,0,0.4)',
        ...style,
      }}
      aria-hidden
    />
  );
}

export function Screen({
  children,
  className = '',
  tone = 'dark',
  style,
  flicker = false,
}) {
  const toneBg =
    tone === 'mint'
      ? 'linear-gradient(180deg, rgba(91,233,201,0.10), rgba(91,233,201,0.02))'
      : tone === 'amber'
        ? 'linear-gradient(180deg, rgba(255,138,61,0.10), rgba(255,138,61,0.02))'
        : 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.18))';

  const borderColor =
    tone === 'mint'
      ? 'rgba(91,233,201,0.35)'
      : tone === 'amber'
        ? 'rgba(255,138,61,0.35)'
        : 'rgba(107,118,137,0.4)';

  return (
    <div
      className={`relative overflow-hidden scanlines ${flicker ? 'anim-screen-flicker' : ''} ${className}`}
      style={{
        background: toneBg,
        border: `1px solid ${borderColor}`,
        boxShadow:
          'inset 0 0 30px rgba(0,0,0,0.5), 0 10px 30px -10px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(2px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Sticker({
  children,
  rotate = -4,
  className = '',
  color = 'amber',
}) {
  const bg =
    color === 'mint'
      ? 'linear-gradient(135deg, var(--mint), var(--mint-deep))'
      : color === 'coral'
        ? 'linear-gradient(135deg, var(--coral), #c93a4a)'
        : 'linear-gradient(135deg, var(--amber), var(--amber-deep))';
  return (
    <span
      className={`inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-bg-0 px-2 py-1 ${className}`}
      style={{
        background: bg,
        transform: `rotate(${rotate}deg)`,
        clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)',
        boxShadow: '0 4px 10px -4px rgba(0,0,0,0.6)',
      }}
    >
      {children}
    </span>
  );
}

export function Particle({
  size = 3,
  color = 'rgba(255,138,61,0.7)',
  className = '',
  style,
}) {
  return (
    <span
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{ width: size, height: size, background: color, ...style }}
      aria-hidden
    />
  );
}

/**
 * A physical toggle switch that flips when hovered.
 */
export function MachineSwitch({ on = false, label = '', size = 28 }) {
  const { reducedMotion } = useEnvironment();
  return (
    <div className="flex flex-col items-center gap-1.5" aria-hidden>
      <div
        className="relative rounded-md surface-metal-brushed flex items-center justify-center"
        style={{ width: size, height: size * 1.3, padding: 2 }}
      >
        <span
          className="block rounded-sm"
          style={{
            width: size - 6,
            height: (size * 1.3 - 8) / 2,
            background: on
              ? 'linear-gradient(180deg, var(--mint-soft), var(--mint-deep))'
              : 'linear-gradient(180deg, var(--metal-edge), var(--metal-1))',
            boxShadow: on
              ? 'var(--glow-mint), inset 0 1px 0 rgba(255,255,255,0.3)'
              : 'inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.5)',
            transform: on ? 'translateY(-2px)' : 'translateY(0)',
            transformOrigin: 'center',
            transition: reducedMotion ? 'none' : 'transform 0.18s ease, background 0.2s ease',
          }}
        />
      </div>
      {label && (
        <span className="font-mono text-[8px] uppercase tracking-wider text-ink-3">{label}</span>
      )}
    </div>
  );
}

/**
 * A coiled cable detail — decorative, runs between machine parts.
 */
export function Cable({ className = '', color = 'var(--metal-2)', style }) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{
        height: 2,
        background: `repeating-linear-gradient(90deg, ${color} 0 6px, transparent 6px 9px)`,
        opacity: 0.5,
        ...style,
      }}
      aria-hidden
    />
  );
}
