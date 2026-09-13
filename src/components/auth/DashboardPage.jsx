import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { TactileButton } from '@/components/primitives/TactileButton';
import { LED, Rivet } from '@/components/primitives/Details';
import { LogOut, Wrench, ArrowRight, Cpu } from 'lucide-react';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden grain preserve-3d">
      {/* Background */}
      <div className="absolute inset-0 tech-diagram pointer-events-none" />
      <div className="bg-lettering">WORKSHOP</div>
      <div className="absolute inset-0 haze pointer-events-none" />
      <div className="absolute inset-0 depth-fog pointer-events-none" />
      <div
        className="absolute top-[20%] left-[30%] w-[700px] h-[500px] rounded-full anim-breathe pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.14), transparent 60%)', filter: 'blur(70px)' }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 lg:px-20 pt-8">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Campusvault home" className="group shrink-0">
            <img
              src="/logo.svg"
              alt="Campusvault"
              className="h-10 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>
        <TactileButton variant="ghost" onClick={handleLogout} className="!py-2 !px-3.5">
          <LogOut size={14} />
          Logout
        </TactileButton>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center px-6 sm:px-12 lg:px-20 pt-16 pb-12 min-h-[calc(100vh-80px)]">
        <div className="max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-8 anim-reveal">
            <LED color="mint" pulse size={7} />
            <span className="font-technical text-[10px] text-ink-2">04 — The Campusvault Workshop</span>
            <span className="h-px w-12 bg-metal-2" />
            <span className="font-technical text-[10px] text-mint">ONLINE</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight text-ink-0 anim-reveal" style={{ animationDelay: '0.1s' }}>
            <span className="block">WELCOME,</span>
            <span className="block text-amber">{user?.name || 'OPERATOR'}.</span>
          </h1>

          <p className="mt-6 max-w-md text-sm text-ink-2 leading-relaxed anim-reveal" style={{ animationDelay: '0.3s' }}>
            The Campusvault Workshop is active. Explore live campus gigs, post requirements,
            and manage your exchanges directly from here.
          </p>

          {/* Temporary station panel */}
          <div className="mt-10 relative surface-metal-brushed metal-scratches rounded-2xl p-6 sm:p-8 anim-reveal" style={{ animationDelay: '0.45s' }}>
            <Rivet size={9} className="absolute top-3 left-3" />
            <Rivet size={9} className="absolute top-3 right-3" />
            <Rivet size={9} className="absolute bottom-3 left-3" />
            <Rivet size={9} className="absolute bottom-3 right-3" />

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-metal-2/40">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-mint" />
                <span className="font-technical text-[9px] text-ink-1">OPERATOR STATUS</span>
              </div>
              <span className="font-mono text-[7px] text-ink-3">CJ-WS-X24</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow label="NAME" value={user?.name || '—'} />
              <InfoRow label="EMAIL" value={user?.email || '—'} />
              <InfoRow label="ROLE" value={user?.role || 'student'} />
              <InfoRow label="STATUS" value="ACTIVE" highlight />
            </div>

            <div className="mt-6 flex items-center gap-3 surface-panel rounded-xl p-4">
              <Wrench size={20} className="text-amber shrink-0" />
              <span className="font-mono text-xs text-ink-2">
                Workshop modules arriving soon. The exchange is live.
              </span>
            </div>

            <div className="mt-6">
              <TactileButton variant="amber" onClick={() => navigate('/')}>
                <ArrowRight size={14} />
                Back to Exchange
              </TactileButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="surface-panel rounded-xl p-4">
      <p className="font-technical text-[8px] text-ink-3 mb-1">{label}</p>
      <p
        className="font-mono text-sm"
        style={{ color: highlight ? 'var(--mint)' : 'var(--text-0)' }}
      >
        {value}
      </p>
    </div>
  );
}
