import { Link } from 'react-router-dom';
import { DepthLayer } from '@/components/primitives/DepthLayer';
import { LED, Rivet } from '@/components/primitives/Details';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export function JoinCTA() {
  return (
    <section className="relative py-24 px-4 sm:px-8 lg:px-16 overflow-hidden grain preserve-3d border-t border-metal-2/40">
      <DepthLayer depth={-100} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(22,163,74,0.12), transparent 60%)',
            filter: 'blur(75px)',
          }}
        />
      </DepthLayer>
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="surface-metal-brushed rounded-3xl p-8 sm:p-14 border-2 border-metal-2 shadow-xl relative overflow-hidden text-center">
          <Rivet size={8} className="absolute top-4 left-4" />
          <Rivet size={8} className="absolute top-4 right-4" />
          <Rivet size={8} className="absolute bottom-4 left-4" />
          <Rivet size={8} className="absolute bottom-4 right-4" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/15 border border-amber/30 text-amber text-xs font-mono mb-6">
            <Sparkles size={14} />
            <span>CAMPUS NETWORK IS LIVE</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl text-ink-0 leading-[1.05] tracking-tight max-w-3xl mx-auto">
            TURN CAMPUS PROBLEMS
            <br />
            <span className="text-amber">INTO CAMPUS OPPORTUNITIES.</span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-ink-1 max-w-2xl mx-auto leading-relaxed">
            Join hundreds of verified university peers trading technical skills, completing projects,
            and earning directly without platform middleman cuts.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 rounded-xl font-technical text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber text-bg-0 hover:brightness-110 shadow-lg hover:shadow-amber/25 transition-all group flex items-center gap-2"
            >
              <span>CREATE FREE ACCOUNT</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="px-8 py-4 rounded-xl font-technical text-xs sm:text-sm font-bold uppercase tracking-wider bg-bg-1 text-ink-0 hover:bg-bg-2 border-2 border-metal-2 shadow-sm transition-all"
            >
              <span>SIGN IN TO WORKSPACE</span>
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t-2 border-metal-2/40 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs font-mono text-ink-2">
            <span className="inline-flex items-center gap-2">
              <Zap size={14} className="text-amber" />
              Instant 30-Second Setup
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={14} className="text-mint" />
              Verified College Members
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral" />
              Zero Platform Commission
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
