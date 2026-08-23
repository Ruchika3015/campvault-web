import { LED, Rivet, Screen } from '@/components/primitives/Details';
import { Zap, Cpu } from 'lucide-react';

/**
 * The Jugaad Engine — the visual centerpiece of the workshop.
 * A unique futuristic machine with a glowing core, rotating components,
 * indicator lights, intake slot, output area, and small screens.
 * Animates continuously on its own — no mouse reactivity.
 */
export function WorkshopEngine({ onFind, onPost }) {
  return (
    <div className="relative surface-metal-brushed metal-scratches rounded-3xl p-5 sm:p-7 preserve-3d">
      <Rivet size={10} className="absolute top-3 left-3" />
      <Rivet size={10} className="absolute top-3 right-3" />
      <Rivet size={10} className="absolute bottom-3 left-3" />
      <Rivet size={10} className="absolute bottom-3 right-3" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-metal-2/40">
        <div className="flex items-center gap-2.5">
          <Cpu size={16} className="text-amber" />
          <span className="font-display text-sm tracking-tight text-ink-0">JUGAAD ENGINE</span>
        </div>
        <div className="flex items-center gap-2">
          <LED color="mint" pulse size={6} />
          <span className="font-technical text-[8px] text-mint">ONLINE</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[auto_1fr_auto] gap-5 items-center">
        {/* INTAKE SLOT */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-technical text-[7px] text-ink-3">INTAKE</span>
          <button
            onClick={onPost}
            className="station relative w-20 h-3 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, var(--bg-0), var(--bg-2))',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9)',
            }}
            aria-label="Drop a request"
          >
            <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 rounded-full" style={{ background: 'var(--amber)', opacity: 0.25, filter: 'blur(1px)' }} />
          </button>
          <LED color="amber" pulse size={4} />
          <span className="font-technical text-[6px] text-ink-3">DROP</span>
        </div>

        {/* CORE — always animating */}
        <div className="relative flex items-center justify-center py-4">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 grid place-items-center">
            {/* outer ring — slow rotation */}
            <div
              className="absolute inset-0 rounded-full anim-rotor"
              style={{
                background: 'conic-gradient(from 0deg, var(--amber), transparent 25%, var(--mint) 50%, transparent 75%, var(--amber))',
                filter: 'blur(3px)',
                opacity: 0.6,
              }}
            />
            {/* inner ring — reverse rotation */}
            <div
              className="absolute inset-5 rounded-full anim-rotor-rev"
              style={{
                background: 'conic-gradient(from 180deg, var(--amber-deep), transparent 30%, var(--coral) 60%, transparent 90%)',
                filter: 'blur(2px)',
                opacity: 0.4,
              }}
            />
            {/* core housing */}
            <div className="absolute inset-9 rounded-full" style={{ background: 'var(--bg-1)', boxShadow: 'inset 0 0 24px rgba(0,0,0,0.9)' }} />
            {/* heart — always pulsing */}
            <div
              className="relative z-10 grid place-items-center w-12 h-12 rounded-full anim-core-pulse"
              style={{
                background: 'radial-gradient(circle, var(--amber-soft), var(--amber) 60%, var(--amber-deep))',
                boxShadow: 'var(--glow-amber)',
              }}
            >
              <Zap size={18} className="text-bg-0" />
            </div>
            {/* orbiting particles */}
            <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full anim-orbit" style={{ ['--orbit-r']: '48px', ['--orbit-d']: '5s', background: 'var(--mint)', boxShadow: 'var(--glow-mint)' }} />
            <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full anim-orbit" style={{ ['--orbit-r']: '58px', ['--orbit-d']: '7s', background: 'var(--amber)', boxShadow: 'var(--glow-amber)' }} />
            <span className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full anim-orbit" style={{ ['--orbit-r']: '42px', ['--orbit-d']: '4s', background: 'var(--coral)', boxShadow: 'var(--glow-coral)', animationDirection: 'reverse' }} />
          </div>
        </div>

        {/* OUTPUT */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-technical text-[7px] text-ink-3">OUTPUT</span>
          <button
            onClick={onFind}
            className="station relative w-20 h-12 rounded-lg surface-panel grid place-items-center"
            aria-label="Find a Jugaad"
          >
            <Screen tone="mint" className="rounded-md w-16 h-8 grid place-items-center" flicker>
              <span className="font-mono text-[7px] text-mint-soft">MATCH</span>
            </Screen>
          </button>
          <LED color="mint" pulse size={4} />
          <span className="font-technical text-[6px] text-ink-3">FIND</span>
        </div>
      </div>

      {/* Signal trace — always running */}
      <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
        <div className="h-full w-1/4 anim-signal" style={{ background: 'linear-gradient(90deg, transparent, var(--amber), transparent)' }} />
      </div>

      {/* Status line */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LED color="amber" blink size={4} />
          <span className="font-technical text-[7px] text-ink-3">PROCESSING</span>
        </div>
        <span className="font-mono text-[7px] text-ink-3">CJ-ENGINE-X24 · S/N 0042</span>
      </div>
    </div>
  );
}
