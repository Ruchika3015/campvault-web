import { DepthLayer, ForegroundLayer } from '@/components/primitives/DepthLayer';
import { PaperNote } from '@/components/primitives/PaperNote';
import { Screen, LED, LEDMeter, Rivet, Sticker, Particle } from '@/components/primitives/Details';
import { TactileButton } from '@/components/primitives/TactileButton';
import { useInView } from '@/hooks/useEnvironment';
import { PROBLEM_NOTES, MATCHES } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Handshake,
  Trophy,
  Star,
  Wallet,
  ArrowRight,
  ArrowDown,
  Quote,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

export function Storytelling() {
  return (
    <div id="explore" className="relative preserve-3d">
      <StoryProblem />
      <Connector label="request enters the engine" />
      <StoryJugaad />
      <Connector label="engine activates" />
      <StoryMatch />
      <Connector label="a student is chosen" />
      <StoryConnection />
      <Connector label="the work is done" />
      <StoryResult />
    </div>
  );
}

const ACCENT_LIGHT = {
  coral: 'rgba(199,93,93,0.10)',
  amber: 'rgba(214,138,60,0.12)',
  mint: 'rgba(93,184,154,0.10)',
};

function SectionShell({ id, index, label, title, accent, children, depth = 0 }) {
  const { ref, inView } = useInView({ threshold: 0.2 });
  const accentColor = `var(--${accent})`;
  return (
    <section
      id={id}
      ref={ref}
      className="relative min-h-[80vh] flex items-center justify-center py-24 px-4 overflow-hidden grain preserve-3d"
    >
      {/* per-section ambient light — evolves with the story */}
      <DepthLayer depth={-150} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle, ${ACCENT_LIGHT[accent]}, transparent 60%)`,
            filter: 'blur(60px)',
            opacity: inView ? 1 : 0.3,
          }}
        />
      </DepthLayer>
      <div className="absolute inset-0 tech-diagram pointer-events-none" />
      <div className="absolute inset-0 haze pointer-events-none" />

      <ForegroundLayer depth={depth} className={`relative z-10 w-full max-w-5xl transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-ink-3">{index}</span>
          <span className="font-technical text-[10px]" style={{ color: accentColor }}>
            {label}
          </span>
          <span className="h-px w-10 bg-metal-2" />
          <LED color={accent} pulse size={6} />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight text-ink-0 mb-10 max-w-2xl">
          {title}
        </h2>
        {children}
      </ForegroundLayer>
    </section>
  );
}

function StoryProblem() {
  return (
    <SectionShell
      id="story-problem"
      index="01"
      label="THE PROBLEM"
      accent="coral"
      depth={40}
      title={<>A student needs something. <span className="text-ink-2">Desperately.</span></>}
    >
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-5">
          <p className="text-lg text-ink-1 leading-relaxed">
            It's 1 AM. The fest is in two days. The video isn't edited. The code won't compile.
            The presentation is blank. And nobody in your hostel knows how to fix it.
          </p>
          <div className="surface-panel rounded-2xl p-5 max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <Quote size={14} className="text-coral" />
              <span className="font-technical text-[9px] text-ink-3">hostel_group.txt</span>
            </div>
            <p className="font-mono text-sm text-ink-1 leading-relaxed">
              "Bro, I need someone to edit this video 😭"<br />
              "Anyone good with C++? It's crashing"<br />
              "Need a PPT by morning, will pay"
            </p>
          </div>
        </div>
        <div className="relative h-72 flex items-center justify-center">
          <div className="absolute anim-float-slow" style={{ top: '4%', right: '6%', ['--rot']: '7deg' }}>
            <PaperNote note={PROBLEM_NOTES[1]} rotate={7} className="w-44" />
          </div>
          <div className="absolute anim-float-slow" style={{ ['--rot']: '-6deg', animationDelay: '0.5s' }}>
            <PaperNote note={PROBLEM_NOTES[0]} rotate={-6} className="w-56" />
          </div>
          <div className="absolute anim-float-slow" style={{ bottom: '0%', left: '2%', ['--rot']: '-3deg', animationDelay: '1s' }}>
            <PaperNote note={PROBLEM_NOTES[5]} rotate={-3} className="w-48" />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function StoryJugaad() {
  const { ref, inView } = useInView({ threshold: 0.3 });
  return (
    <SectionShell
      id="story-jugaad"
      index="02"
      label="THE JUGAAD"
      accent="amber"
      depth={50}
      title={<>The request enters the <span className="text-amber">Engine.</span></>}
    >
      <div className="grid md:grid-cols-[1fr_1fr] gap-8 items-center">
        <p className="text-lg text-ink-1 leading-relaxed max-w-md">
          Instead of posting into the void, the problem drops straight into the Jugaad Engine.
          It reads the request, tags the skills needed, and starts scanning the campus for
          students who can actually do it.
        </p>
        <div ref={ref} className="relative preserve-3d">
          <DepthLayer depth={60}>
            <div className="surface-metal-brushed metal-scratches rounded-2xl p-6 relative">
              <Rivet size={9} className="absolute top-2 left-2" />
              <Rivet size={9} className="absolute top-2 right-2" />
              <Rivet size={9} className="absolute bottom-2 left-2" />
              <Rivet size={9} className="absolute bottom-2 right-2" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className={inView ? 'text-amber' : 'text-ink-3'} />
                  <span className="font-technical text-[9px] text-ink-2">engine.intake</span>
                </div>
                <LEDMeter level={inView ? 4 : 1} count={5} color="amber" size={5} />
              </div>
              <Screen tone="amber" className="rounded-xl p-4 min-h-[170px] anim-screen-flicker">
                <p className="font-mono text-xs text-amber-soft leading-relaxed">
                  <span className="text-ink-3">$</span> parse --request "edit_fest_video"<br />
                  <span className="text-ink-2">→ tags: [video, editing, premiere]</span><br />
                  <span className="text-ink-2">→ urgency: high</span><br />
                  <span className="text-mint">→ scanning 12,480 students...</span><br />
                  <span className="text-ink-3">→ 7 candidates match</span>
                </p>
              </Screen>
              <div className="mt-3 flex items-center gap-2">
                <LED color="amber" pulse size={5} />
                <span className="font-technical text-[9px] text-ink-3">processing</span>
                <span className="font-mono text-[7px] text-ink-3 ml-auto">CJ-X24</span>
              </div>
            </div>
          </DepthLayer>
        </div>
      </div>
    </SectionShell>
  );
}

function StoryMatch() {
  const { ref, inView } = useInView({ threshold: 0.3 });
  const candidates = [MATCHES[0], MATCHES[1], MATCHES[2]];
  return (
    <SectionShell
      id="story-match"
      index="03"
      label="THE MATCH"
      accent="mint"
      depth={50}
      title={<>The Engine finds <span className="text-mint">students with the skill.</span></>}
    >
      <div className="space-y-6">
        <p className="text-lg text-ink-1 leading-relaxed max-w-2xl">
          Not freelancers. Not bots. Real students from your campus who've done this before —
          rated by other students, ranked by the Engine, ready to help.
        </p>
        <div ref={ref} className="grid sm:grid-cols-3 gap-4 preserve-3d">
          {candidates.map((m, i) => (
            <DepthLayer key={m.id} depth={inView ? 40 + i * 15 : 0}>
              <div
                className={`surface-panel rounded-2xl p-5 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} obj-lift`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="grid place-items-center w-11 h-11 rounded-xl font-display text-bg-0"
                    style={{
                      background: m.accent === 'mint' ? 'linear-gradient(135deg, var(--mint), var(--mint-deep))' : m.accent === 'coral' ? 'linear-gradient(135deg, var(--coral), #a04040)' : 'linear-gradient(135deg, var(--amber), var(--amber-deep))',
                      boxShadow: i === 0 ? 'var(--glow-mint)' : 'none',
                    }}
                  >
                    {m.initials}
                  </div>
                  <div>
                    <p className="font-display text-base text-ink-0">{m.name}</p>
                    <p className="font-mono text-[10px] text-ink-2">{m.skill}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-amber fill-amber" />
                    <span className="font-mono text-xs text-ink-0">{m.rating}</span>
                  </div>
                  <span className="font-mono text-[9px] text-ink-2">{m.completed} done</span>
                </div>
                {i === 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <Sticker color="mint" rotate={-2}>Best match</Sticker>
                    <CheckCircle2 size={11} className="text-mint" />
                  </div>
                )}
              </div>
            </DepthLayer>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function StoryConnection() {
  return (
    <SectionShell
      id="story-connection"
      index="04"
      label="THE CONNECTION"
      accent="amber"
      depth={50}
      title={<>The student picks someone. <span className="text-ink-2">They talk.</span></>}
    >
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative preserve-3d">
          <DepthLayer depth={50}>
            <div className="surface-panel rounded-2xl p-5 max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={14} className="text-amber" />
                <span className="font-technical text-[9px] text-ink-2">chat · live</span>
                <LED color="mint" pulse size={5} className="ml-auto" />
              </div>
              <div className="space-y-3">
                <Bubble side="left">Hey! Saw your request for the fest video — I edit in Premiere, done 17 of these.</Bubble>
                <Bubble side="right">Wait that fast? How much?</Bubble>
                <Bubble side="left">₹400, delivered by tomorrow night. I'll send a draft first.</Bubble>
                <Bubble side="right">Bro you're a lifesaver. Let's go 🙌</Bubble>
              </div>
            </div>
          </DepthLayer>
        </div>
        <div className="space-y-5">
          <p className="text-lg text-ink-1 leading-relaxed">
            No middlemen. No commission maze. Just a direct line to the person doing the work.
            Agree on the price, agree on the deadline, shake hands digitally.
          </p>
          <div className="flex items-center gap-3 surface-panel rounded-xl p-4 max-w-sm">
            <Handshake size={20} className="text-mint" />
            <span className="font-mono text-xs text-ink-1">Direct student-to-student. Always.</span>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function Bubble({ side, children }) {
  const left = side === 'left';
  return (
    <div className={`flex ${left ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${left ? 'rounded-bl-sm' : 'rounded-br-sm'}`}
        style={
          left
            ? { background: 'var(--bg-3)', color: 'var(--text-0)' }
            : { background: 'linear-gradient(135deg, var(--amber), var(--amber-deep))', color: 'var(--bg-0)' }
        }
      >
        {children}
      </div>
    </div>
  );
}

function StoryResult() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const handleFind = () => navigate(isAuthenticated ? '/find' : '/signup');
  const handlePost = () => navigate(isAuthenticated ? '/post' : '/signup');
  return (
    <SectionShell
      id="story-result"
      index="05"
      label="THE RESULT"
      accent="mint"
      depth={60}
      title={<>The Jugaad is <span className="text-mint">done.</span></>}
    >
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <p className="text-lg text-ink-1 leading-relaxed">
            The video lands. The code compiles. The presentation wows. One student gets the help
            they needed. Another student earns. Both walk away better off.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<Trophy size={18} className="text-mint" />} value="1,247" label="Jugaads solved" />
            <StatCard icon={<Wallet size={18} className="text-amber" />} value="₹3.2L" label="Paid to students" />
          </div>
        </div>
        <div className="relative preserve-3d">
          <DepthLayer depth={80}>
            <div className="surface-metal-brushed metal-scratches rounded-3xl p-8 relative text-center">
              <Rivet size={9} className="absolute top-3 left-3" />
              <Rivet size={9} className="absolute top-3 right-3" />
              <Rivet size={9} className="absolute bottom-3 left-3" />
              <Rivet size={9} className="absolute bottom-3 right-3" />
              <div className="grid place-items-center w-14 h-14 rounded-2xl mx-auto mb-5" style={{ background: 'linear-gradient(135deg, var(--mint), var(--mint-deep))', boxShadow: 'var(--glow-mint)' }}>
                <Trophy size={24} className="text-bg-0" />
              </div>
              <p className="font-display text-2xl sm:text-3xl text-ink-0 leading-tight">
                Your problem.
                <br />
                <span className="text-ink-2">Someone's skill.</span>
                <br />
                <span className="font-editorial text-ink-1">That's a Jugaad.</span>
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <TactileButton variant="amber" onClick={handleFind}>
                  <ArrowRight size={14} />
                  Find a Jugaad
                </TactileButton>
                <TactileButton variant="mint" onClick={handlePost}>
                  Post a Jugaad
                </TactileButton>
              </div>
            </div>
          </DepthLayer>
          <Particle size={3} color="rgba(93,184,154,0.4)" className="anim-float" style={{ top: '-10px', right: '10%' }} />
        </div>
      </div>
    </SectionShell>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="surface-panel rounded-2xl p-4">
      <div className="mb-2">{icon}</div>
      <p className="font-display text-2xl text-ink-0">{value}</p>
      <p className="font-technical text-[9px] text-ink-2">{label}</p>
    </div>
  );
}

function Connector({ label }) {
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="w-px h-10" style={{ background: 'linear-gradient(180deg, transparent, var(--metal-2))' }} />
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-amber anim-led-pulse" />
        <span className="font-technical text-[8px] text-ink-3">{label}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-mint anim-led-pulse" />
      </div>
      <ArrowDown size={14} className="text-ink-3" />
      <div className="w-px h-10" style={{ background: 'linear-gradient(180deg, var(--metal-2), transparent)' }} />
    </div>
  );
}
