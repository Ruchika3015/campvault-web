import { DepthLayer, ForegroundLayer } from '@/components/primitives/DepthLayer';
import { PaperNote } from '@/components/primitives/PaperNote';
import { LED, LEDMeter, Particle, Rivet, Screen, MachineSwitch, Cable } from '@/components/primitives/Details';
import { PROBLEM_NOTES } from '@/data/mockData';
import { ArrowDown, Zap } from 'lucide-react';

// Request slips placed asymmetrically — different depths, some partially off-screen
const FLOAT_NOTES = [
  { note: PROBLEM_NOTES[0], top: '6%', right: '4%', rot: -7, delay: '0s' },
  { note: PROBLEM_NOTES[1], top: '24%', right: '-2%', rot: 6, delay: '0.5s' },
  { note: PROBLEM_NOTES[8], top: '42%', right: '10%', rot: -4, delay: '1s' },
  { note: PROBLEM_NOTES[3], top: '58%', right: '2%', rot: 8, delay: '0.3s' },
  { note: PROBLEM_NOTES[9], bottom: '14%', right: '20%', rot: -5, delay: '0.8s' },
  { note: PROBLEM_NOTES[4], bottom: '4%', right: '6%', rot: 4, delay: '1.4s' },
  { note: PROBLEM_NOTES[5], top: '12%', left: '-3%', rot: 5, delay: '0.6s' },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen overflow-hidden grain preserve-3d"
    >
      {/* ===== BACKGROUND LAYER — walls, diagrams, faint lettering, light ===== */}
      <DepthLayer depth={-200} className="absolute inset-0 pointer-events-none" blur={1.5}>
        {/* warm key light — muted amber */}
        <div
          className="absolute top-[8%] left-[25%] w-[900px] h-[700px] rounded-full anim-breathe"
          style={{
            background: 'radial-gradient(circle, rgba(214,138,60,0.14), transparent 60%)',
            filter: 'blur(70px)',
          }}
        />
        {/* cool rim — very subtle green */}
        <div
          className="absolute bottom-[-15%] right-[-8%] w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(93,184,154,0.07), transparent 60%)',
            filter: 'blur(70px)',
          }}
        />
        {/* secondary warm glow lower-right where the engine sits */}
        <div
          className="absolute bottom-[5%] right-[15%] w-[500px] h-[400px] rounded-full anim-breathe"
          style={{
            background: 'radial-gradient(circle, rgba(214,138,60,0.08), transparent 60%)',
            filter: 'blur(50px)',
            animationDelay: '1.5s',
          }}
        />
      </DepthLayer>

      {/* technical diagram grid on the wall */}
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      {/* faint giant background lettering */}
      <div className="bg-lettering">JUGAAD</div>

      {/* architectural wall outlines — structural frame */}
      <DepthLayer depth={-160} className="absolute inset-0 pointer-events-none" blur={1}>
        {/* wall frame — vertical structural lines */}
        <div className="absolute top-0 left-[8%] w-px h-full" style={{ background: 'linear-gradient(180deg, transparent, var(--metal-2) 15%, var(--metal-2) 85%, transparent)', opacity: 0.15 }} />
        <div className="absolute top-0 right-[5%] w-px h-full" style={{ background: 'linear-gradient(180deg, transparent, var(--metal-2) 15%, var(--metal-2) 85%, transparent)', opacity: 0.15 }} />
        {/* horizontal beam */}
        <div className="absolute top-[18%] left-0 right-0 h-px" style={{ background: 'var(--metal-2)', opacity: 0.1 }} />
        <div className="absolute bottom-[22%] left-0 right-0 h-px" style={{ background: 'var(--metal-2)', opacity: 0.1 }} />
        {/* thin technical annotations */}
        <div className="absolute top-[19%] left-[10%] font-mono text-[8px] text-ink-3/30 tracking-wider">SECTION A-02</div>
        <div className="absolute bottom-[23%] right-[8%] font-mono text-[8px] text-ink-3/30 tracking-wider">REF: CJ-X24</div>
      </DepthLayer>

      {/* atmospheric haze + depth fog */}
      <div className="absolute inset-0 haze pointer-events-none" />
      <div className="absolute inset-0 depth-fog pointer-events-none" />

      {/* ===== MIDGROUND — the Jugaad Engine machine (partially visible, right side) ===== */}
      <DepthLayer depth={-60} className="absolute inset-0 pointer-events-none hidden md:block" blur={0.5}>
        {/* Large machine housing — bottom right, partially off-screen */}
        <div
          className="absolute bottom-[-8%] right-[-4%] w-[480px] h-[420px] rounded-3xl surface-metal-brushed metal-scratches opacity-90"
          style={{ transform: 'perspective(800px) rotateY(-8deg) rotateX(2deg)' }}
        >
          {/* rivets on the machine housing */}
          <Rivet size={10} className="absolute top-4 left-4" />
          <Rivet size={10} className="absolute top-4 right-4" />
          <Rivet size={8} className="absolute top-4 left-1/2" />
          <Rivet size={8} className="absolute bottom-4 left-4" />
          <Rivet size={8} className="absolute bottom-4 right-4" />

          {/* serial plate */}
          <div className="absolute top-3 left-16 font-mono text-[7px] text-ink-3 tracking-wider">CJ-ENGINE-X24</div>

          {/* circular mechanical core — always rotating */}
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-32 h-32 grid place-items-center">
            <div
              className="absolute inset-0 rounded-full anim-rotor"
              style={{
                background: 'conic-gradient(from 0deg, var(--amber), transparent 25%, var(--mint) 50%, transparent 75%, var(--amber))',
                filter: 'blur(3px)',
                opacity: 0.6,
              }}
            />
            <div
              className="absolute inset-5 rounded-full anim-rotor-rev"
              style={{
                background: 'conic-gradient(from 180deg, var(--amber-deep), transparent 30%, var(--coral) 60%, transparent 90%)',
                filter: 'blur(2px)',
                opacity: 0.4,
              }}
            />
            <div className="absolute inset-8 rounded-full" style={{ background: 'var(--bg-1)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9)' }} />
            <div
              className="relative z-10 grid place-items-center w-10 h-10 rounded-full anim-core-pulse"
              style={{
                background: 'radial-gradient(circle, var(--amber-soft), var(--amber) 60%, var(--amber-deep))',
                boxShadow: 'var(--glow-amber)',
              }}
            >
              <Zap size={16} className="text-bg-0" />
            </div>
            {/* orbiting particles — always moving */}
            <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full anim-orbit" style={{ ['--orbit-r']: '44px', ['--orbit-d']: '5s', background: 'var(--mint)', boxShadow: 'var(--glow-mint)' }} />
            <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full anim-orbit" style={{ ['--orbit-r']: '54px', ['--orbit-d']: '7s', background: 'var(--amber)', boxShadow: 'var(--glow-amber)' }} />
          </div>

          {/* indicator lights row */}
          <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 flex items-center gap-2">
            <LED color="amber" pulse size={5} />
            <LED color="amber" pulse size={5} style={{ animationDelay: '0.3s' }} />
            <LED color="off" size={5} />
            <LED color="mint" pulse size={5} style={{ animationDelay: '0.6s' }} />
            <LED color="mint" pulse size={5} />
          </div>

          {/* signal trace line — always running */}
          <div className="absolute bottom-[20%] left-6 right-6 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
            <div className="h-full w-1/4 anim-signal" style={{ background: 'linear-gradient(90deg, transparent, var(--amber), transparent)' }} />
          </div>

          {/* small status display */}
          <div className="absolute bottom-[10%] left-6">
            <Screen tone="amber" className="rounded-md p-2 w-28 h-12" flicker>
              <p className="font-mono text-[7px] text-amber-soft leading-tight">
                QUEUE: 12<br />
                <span className="text-mint">ACTIVE: 7</span>
              </p>
            </Screen>
          </div>

          {/* small label */}
          <div className="absolute bottom-[10%] right-6 font-technical text-[7px] text-ink-3">
            MATCHING APPARATUS
          </div>
        </div>

        {/* vertical cable run right side */}
        <div className="absolute top-0 right-[14%] w-px h-full" style={{ background: 'linear-gradient(180deg, transparent, var(--metal-2) 20%, var(--metal-2) 80%, transparent)', opacity: 0.3 }} />
        {/* horizontal cable stubs */}
        <div className="absolute top-[28%] right-[10%] w-[8%] h-px" style={{ background: 'var(--metal-2)', opacity: 0.25 }} />
        <div className="absolute top-[52%] right-[16%] w-[6%] h-px" style={{ background: 'var(--metal-2)', opacity: 0.25 }} />
      </DepthLayer>

      {/* ===== MIDGROUND — cables and pipes ===== */}
      <DepthLayer depth={-30} className="absolute inset-0 pointer-events-none hidden md:block">
        <Cable className="top-[32%] left-0 w-[16%]" />
        <Cable className="bottom-[24%] right-[2%] w-[22%]" color="var(--amber-deep)" />
        <Cable className="top-[48%] left-[5%] w-[10%]" color="var(--mint-deep)" />
        {/* a pipe — thicker cable */}
        <div className="absolute top-[68%] left-0 w-[20%] h-1 rounded-full" style={{ background: 'repeating-linear-gradient(90deg, var(--metal-1) 0 8px, var(--metal-0) 8px 10px)', opacity: 0.4 }} />
      </DepthLayer>

      {/* ===== INTAKE SLOT — lower right, near the machine ===== */}
      <DepthLayer depth={20} className="absolute bottom-[16%] right-[6%] hidden lg:flex flex-col items-center gap-2 pointer-events-auto">
        <div className="font-technical text-[8px] text-ink-3">INTAKE // REQUEST</div>
        <div
          className="relative w-40 h-3 rounded-lg"
          style={{
            background: 'linear-gradient(180deg, var(--bg-0) 0%, var(--bg-2) 100%)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* glow inside the slot */}
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-1 rounded-full" style={{ background: 'var(--amber)', opacity: 0.3, filter: 'blur(2px)' }} />
        </div>
        <div className="flex items-center gap-1.5">
          <LED color="amber" pulse size={5} />
          <span className="font-technical text-[7px] text-ink-3">DROP REQUEST</span>
        </div>
      </DepthLayer>

      {/* a request slip positioned near the intake slot */}
      <div className="hidden lg:block absolute bottom-[20%] right-[10%] anim-float-slow pointer-events-auto" style={{ ['--rot']: '-5deg', animationDelay: '0.4s' }}>
        <PaperNote note={PROBLEM_NOTES[9]} rotate={-5} small className="w-40" />
      </div>

      {/* atmospheric dust — gentle floating */}
      <DepthLayer depth={30} className="absolute inset-0 pointer-events-none">
        {[
          { top: '16%', left: '22%', s: 3, c: 'rgba(214,138,60,0.35)', d: '0s' },
          { top: '38%', left: '62%', s: 2, c: 'rgba(93,184,154,0.25)', d: '1.2s' },
          { top: '68%', left: '18%', s: 3, c: 'rgba(214,138,60,0.2)', d: '0.6s' },
          { top: '48%', left: '42%', s: 2, c: 'rgba(242,237,228,0.2)', d: '1.8s' },
          { top: '28%', left: '78%', s: 2, c: 'rgba(214,138,60,0.25)', d: '2.2s' },
          { top: '76%', left: '52%', s: 2, c: 'rgba(93,184,154,0.2)', d: '1s' },
        ].map((p, i) => (
          <Particle key={i} size={p.s} color={p.c} className="anim-float" style={{ top: p.top, left: p.left, animationDelay: p.d }} />
        ))}
      </DepthLayer>

      {/* ===== FOREGROUND — physical request slips at varying depths ===== */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {FLOAT_NOTES.map((f, i) => (
          <div
            key={i}
            className="absolute anim-float-slow pointer-events-auto"
            style={{
              top: f.top, right: f.right, bottom: f.bottom, left: f.left,
              ['--rot']: `${f.rot}deg`,
              animationDelay: f.delay,
              zIndex: f.bottom ? 15 : 10,
            }}
          >
            <PaperNote note={f.note} rotate={f.rot} className="w-44" small={i % 2 === 1} />
          </div>
        ))}
      </div>

      {/* ===== FOREGROUND — small campus details ===== */}
      <DepthLayer depth={80} className="absolute top-[14%] left-[6%] hidden xl:block pointer-events-none">
        <div className="font-mono text-[9px] text-ink-3/40 leading-relaxed" style={{ transform: 'rotate(-2deg)' }}>
          <div>// hostel_block_b</div>
          <div className="text-ink-3/30">deadline: tonight</div>
        </div>
      </DepthLayer>

      <DepthLayer depth={70} className="absolute bottom-[10%] left-[8%] hidden xl:block pointer-events-none">
        <div className="font-editorial text-[11px] text-ink-3/40" style={{ transform: 'rotate(3deg)' }}>
          ~ C++ scribble on the wall
        </div>
      </DepthLayer>

      {/* ===== MAIN COMPOSITION — asymmetrical, left-aligned (UNCHANGED) ===== */}
      <ForegroundLayer depth={60} className="relative z-20 min-h-screen flex items-center px-6 sm:px-12 lg:px-20 pt-28 pb-20 pointer-events-none">
        <div className="max-w-2xl pointer-events-auto">
          {/* technical label */}
          <div className="flex items-center gap-3 mb-10 anim-reveal">
            <LED color="mint" pulse size={7} />
            <span className="font-technical text-[10px] text-ink-2">
              01 — The Jugaad Exchange
            </span>
            <span className="h-px w-12 bg-metal-2" />
            <span className="font-technical text-[10px] text-ink-3">STATUS: READY</span>
          </div>

          {/* editorial statement — the visual anchor */}
          <h1 className="font-display text-ink-0 anim-reveal" style={{ animationDelay: '0.1s' }}>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              Your problem.
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-amber mt-1">
              Someone's skill.
            </span>
            <span className="block font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink-1 mt-2 normal-case">
              That's a Jugaad.
            </span>
          </h1>

          {/* description */}
          <p className="mt-8 max-w-md text-sm sm:text-base text-ink-2 leading-relaxed anim-reveal" style={{ animationDelay: '0.3s' }}>
            A student-to-student exchange where a problem walks in and a skill walks out.
            Post what you need. Find who can do it. Get it done.
          </p>

          {/* counter — subtle */}
          <div className="mt-10 flex items-center gap-3 anim-reveal" style={{ animationDelay: '0.45s' }}>
            <span className="font-mono text-xs text-ink-0">1,247</span>
            <span className="font-technical text-[9px] text-ink-3">Jugaads solved this week</span>
          </div>

          {/* scroll cue */}
          <a
            href="#engine"
            className="mt-16 inline-flex items-center gap-2 text-ink-3 hover:text-ink-1 transition-colors anim-reveal"
            style={{ animationDelay: '0.75s' }}
            aria-label="Scroll to the Jugaad Engine"
          >
            <span className="font-technical text-[9px]">Scroll to enter</span>
            <ArrowDown size={14} className="anim-float" />
          </a>
        </div>
      </ForegroundLayer>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent, var(--bg-0))' }} />
    </section>
  );
}
