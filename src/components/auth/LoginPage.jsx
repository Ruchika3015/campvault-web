import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LED, Rivet } from '@/components/primitives/Details';
import { ArrowRight, Lock, Mail, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

export function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const successMessage = location.state?.message;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | connecting | authenticating | connected
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phase !== 'idle') return;
    setError('');

    if (!email || !password) {
      setError('Enter your email and password to proceed.');
      return;
    }

    try {
      setPhase('connecting');
      await new Promise((r) => setTimeout(r, 400));
      setPhase('authenticating');
      await login(email, password);
      setPhase('connected');
      await new Promise((r) => setTimeout(r, 500));
      navigate(from, { replace: true });
    } catch (err) {
      setPhase('idle');
      if (err.status === 401) {
        setError('Invalid email or password.');
      } else if (err.status === 404) {
        setError('No account found with this email. Try creating one.');
      } else if (err.status === 0) {
        setError('Exchange unavailable. Check your connection and try again.');
      } else if (err.status === 400) {
        setError(err.message || 'Please check your credentials.');
      } else {
        setError(err.message || 'Something went wrong on the exchange. Please try again.');
      }
    }
  };

  const busy = phase !== 'idle' && phase !== 'connected';

  const handleDemoLogin = async () => {
    if (busy) return;
    setError('');
    setPhase('connecting');
    await new Promise((r) => setTimeout(r, 300));
    setPhase('authenticating');
    await new Promise((r) => setTimeout(r, 400));
    demoLogin();
    setPhase('connected');
    await new Promise((r) => setTimeout(r, 400));
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden grain preserve-3d flex items-stretch">
      {/* ===== Background — same machine-room atmosphere ===== */}
      <div className="absolute inset-0 tech-diagram pointer-events-none" />
      <div className="bg-lettering">ENTRY</div>
      <div className="absolute inset-0 haze pointer-events-none" />
      <div className="absolute inset-0 depth-fog pointer-events-none" />

      {/* ambient warm light */}
      <div
        className="absolute top-[15%] left-[20%] w-[600px] h-[500px] rounded-full anim-breathe pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(214,138,60,0.10), transparent 60%)', filter: 'blur(70px)' }}
      />

      {/* ===== LEFT — editorial statement ===== */}
      <div className="relative z-10 flex-1 flex items-center px-6 sm:px-12 lg:px-20 pt-24 pb-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-10 anim-reveal">
            <LED color="amber" pulse size={7} />
            <span className="font-technical text-[10px] text-ink-2">02 — The Entry Terminal</span>
            <span className="h-px w-12 bg-metal-2" />
            <span className="font-technical text-[10px] text-ink-3">ACCESS CONTROL</span>
          </div>

          <h1 className="font-display text-ink-0 anim-reveal" style={{ animationDelay: '0.1s' }}>
            <span className="block text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-tight">
              READY TO
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-amber">
              JUGAAD?
            </span>
          </h1>

          <p className="mt-6 max-w-sm text-sm text-ink-2 leading-relaxed anim-reveal" style={{ animationDelay: '0.3s' }}>
            Enter the exchange. Your next Jugaad is waiting.
          </p>

          {/* machine detail — indicator strip */}
          <div className="mt-12 flex items-center gap-4 anim-reveal" style={{ animationDelay: '0.45s' }}>
            <div className="surface-metal-brushed rounded-lg px-3 py-2 flex items-center gap-2 relative">
              <Rivet size={6} className="absolute top-1 left-1" />
              <Rivet size={6} className="absolute bottom-1 right-1" />
              <LED color={phase === 'connected' ? 'mint' : 'amber'} pulse size={5} />
              <span className="font-technical text-[8px] text-ink-3">
                {phase === 'idle' ? 'AWAITING INPUT' : phase === 'connected' ? 'CONNECTED' : 'LINK ACTIVE'}
              </span>
            </div>
            <Link
              to="/"
              className="font-technical text-[9px] text-ink-2 hover:text-ink-0 transition-colors"
            >
              ← Back to Exchange
            </Link>
          </div>
        </div>
      </div>

      {/* ===== RIGHT — authentication terminal ===== */}
      <div className="relative z-10 w-full max-w-md lg:flex-1 lg:max-w-lg flex items-center justify-center px-6 sm:px-12 lg:px-12 pt-24 pb-12">
        <div className="w-full max-w-sm anim-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="relative surface-metal-brushed metal-scratches rounded-2xl p-6 sm:p-8">
            <Rivet size={9} className="absolute top-3 left-3" />
            <Rivet size={9} className="absolute top-3 right-3" />
            <Rivet size={9} className="absolute bottom-3 left-3" />
            <Rivet size={9} className="absolute bottom-3 right-3" />

            {/* terminal header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-metal-2/40">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-amber" />
                <span className="font-technical text-[9px] text-ink-1">SECURE TERMINAL</span>
              </div>
              <span className="font-mono text-[7px] text-ink-3">CJ-AUTH-X24</span>
            </div>

            {/* success banner from signup */}
            {successMessage && (
              <div className="mb-5 flex items-center gap-2 surface-panel rounded-lg p-3 anim-reveal">
                <CheckCircle2 size={14} className="text-mint shrink-0" />
                <span className="font-mono text-[10px] text-mint">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL */}
              <TerminalField
                label="EMAIL"
                type="email"
                value={email}
                onChange={(v) => setEmail(v)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                active={focused === 'email'}
                icon={<Mail size={14} />}
                placeholder="you@college.edu"
                disabled={busy}
              />

              {/* PASSWORD */}
              <TerminalField
                label="PASSWORD"
                type="password"
                value={password}
                onChange={(v) => setPassword(v)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                active={focused === 'password'}
                icon={<Lock size={14} />}
                placeholder="••••••••"
                disabled={busy}
              />

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 surface-panel rounded-lg p-3 anim-reveal" style={{ borderColor: 'rgba(199,93,93,0.3)' }}>
                  <AlertTriangle size={14} className="text-coral shrink-0 mt-0.5" />
                  <span className="font-mono text-[10px] text-coral-soft leading-relaxed">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className={`machine-control machine-control--primary w-full justify-center ${busy ? 'opacity-70' : ''}`}
                style={{ padding: '14px 20px' }}
              >
                <span className="ctrl-led" />
                <span className="flex items-center gap-2">
                  {phase === 'connecting' ? 'CONNECTING...' :
                   phase === 'authenticating' ? 'AUTHENTICATING...' :
                   phase === 'connected' ? (<><CheckCircle2 size={14} /> CONNECTED</>) :
                   (<><ArrowRight size={14} /> ENTER THE EXCHANGE</>)}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-metal-2/40" />
              <span className="font-technical text-[8px] text-ink-3">NO ACCESS?</span>
              <div className="flex-1 h-px bg-metal-2/40" />
            </div>

            {/* Signup link */}
            <div className="mt-5 text-center">
              <p className="font-mono text-[10px] text-ink-3">
                Don't have an account?{' '}
                <Link to="/signup" className="text-mint hover:text-mint-soft transition-colors font-bold">
                  CREATE ACCOUNT
                </Link>
              </p>
            </div>

            {/* Demo login */}
            <div className="mt-5 pt-5 border-t border-metal-2/30">
              <button
                onClick={handleDemoLogin}
                disabled={busy}
                className={`machine-control machine-control--secondary w-full justify-center ${busy ? 'opacity-50' : ''}`}
                style={{ padding: '11px 18px', fontSize: '11px' }}
              >
                <span className="ctrl-led" />
                <span className="flex items-center gap-2">
                  <Zap size={13} />
                  CONTINUE WITH DEMO
                </span>
              </button>
              <p className="mt-2.5 text-center font-mono text-[8px] text-ink-3">
                Explore the workshop as a demo student
              </p>
            </div>

          </div>

          {/* sub-label below terminal */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="font-technical text-[7px] text-ink-3">AUTHENTICATED BY CAMPUSVAULT EXCHANGE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalField({ label, type, value, onChange, onFocus, onBlur, active, icon, placeholder, disabled }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <LED color={active ? 'amber' : 'off'} pulse={active} size={5} />
        <span
          className="font-technical text-[8px] transition-colors duration-300"
          style={{ color: active ? 'var(--amber-soft)' : 'var(--text-3)' }}
        >
          {label} {active && '· ACTIVE'}
        </span>
      </div>
      <div
        className="relative flex items-center rounded-lg transition-all duration-300"
        style={{
          background: 'var(--bg-1)',
          border: `1px solid ${active ? 'rgba(214,138,60,0.45)' : 'rgba(82,74,66,0.5)'}`,
          boxShadow: active ? 'inset 0 0 12px rgba(214,138,60,0.08)' : 'inset 0 1px 4px rgba(0,0,0,0.3)',
        }}
      >
        <span className="pl-3 text-ink-2" style={{ color: active ? 'var(--amber)' : undefined }}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent px-3 py-3 text-sm text-ink-0 placeholder:text-ink-2/80 font-mono outline-none"
          autoComplete={type === 'password' ? 'current-password' : 'email'}
        />
      </div>
    </div>
  );
}
