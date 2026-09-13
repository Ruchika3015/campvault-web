import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { TactileButton } from '@/components/primitives/TactileButton';
import { LED, Rivet } from '@/components/primitives/Details';
import {
  ArrowRight, User, Mail, Lock, Building2, GraduationCap, BookOpen,
  AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';

export function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);

  const [form, setForm] = useState({
    name: '', email: '', password: '', college: '', branch: '', yearOfStudy: '',
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | registering | success
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    api
      .getColleges()
      .then((data) => {
        const list = data?.colleges || data?.data || data || [];
        setColleges(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setColleges([]);
      });
  }, []);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (!form.college.trim()) e.college = 'Enter your college name.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phase !== 'idle') return;
    setSubmitError('');

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      setPhase('registering');
      const data = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        college: form.college.trim(),
        branch: form.branch.trim() || undefined,
        yearOfStudy: form.yearOfStudy || undefined,
      });
      setPhase('success');
      await new Promise((r) => setTimeout(r, 900));
      if (data.token) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', {
          replace: true,
          state: { message: 'Account created successfully. Enter the exchange.' },
        });
      }
    } catch (err) {
      setPhase('idle');
      if (err.status === 409) {
        setSubmitError('An account with this email already exists.');
      } else if (err.status === 400) {
        setSubmitError(err.message || 'Please check the form fields.');
      } else if (err.status === 0) {
        setSubmitError('Exchange unavailable. Check your connection and try again.');
      } else {
        setSubmitError(err.message || 'Something went wrong on the exchange. Please try again.');
      }
    }
  };

  const busy = phase === 'registering';

  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden grain preserve-3d flex flex-col lg:flex-row items-center lg:items-stretch justify-center">
      {/* ===== Background ===== */}
      <div className="absolute inset-0 tech-diagram pointer-events-none" />

      {/* Large background logo watermark with reduced transparency */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
        <img
          src="/logo.svg"
          alt=""
          aria-hidden="true"
          className="w-[520px] sm:w-[750px] lg:w-[1000px] max-w-none object-contain logo-watermark"
        />
      </div>

      <div className="bg-lettering opacity-[0.02]">JOIN</div>
      <div className="absolute inset-0 haze pointer-events-none" />
      <div className="absolute inset-0 depth-fog pointer-events-none" />

      <div
        className="absolute top-[10%] right-[15%] w-[600px] h-[500px] rounded-full anim-breathe pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(93,184,154,0.08), transparent 60%)', filter: 'blur(70px)' }}
      />
      <div
        className="absolute bottom-[5%] left-[10%] w-[500px] h-[400px] rounded-full anim-breathe pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.14), transparent 60%)', filter: 'blur(60px)', animationDelay: '1s' }}
      />

      {/* ===== LEFT — editorial ===== */}
      <div className="relative z-10 hidden lg:flex flex-1 items-center px-12 lg:px-20 pt-24 pb-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-10 anim-reveal">
            <LED color="mint" pulse size={7} />
            <span className="font-technical text-[10px] text-ink-2">03 — The Registration Station</span>
            <span className="h-px w-12 bg-metal-2" />
            <span className="font-technical text-[10px] text-ink-3">NEW OPERATOR</span>
          </div>

          <h1 className="font-display text-ink-0 anim-reveal" style={{ animationDelay: '0.1s' }}>
            <span className="block text-4xl lg:text-5xl xl:text-6xl leading-[0.95] tracking-tight">
              JOIN THE
            </span>
            <span className="block text-4xl lg:text-5xl xl:text-6xl leading-[0.95] tracking-tight text-mint">
              EXCHANGE.
            </span>
          </h1>

          <p className="mt-6 max-w-sm text-sm text-ink-2 leading-relaxed anim-reveal" style={{ animationDelay: '0.3s' }}>
            Your skills can solve someone else's problem. Register and join Campusvault.
          </p>

          <div className="mt-12 anim-reveal" style={{ animationDelay: '0.45s' }}>
            <Link
              to="/"
              className="font-technical text-[9px] text-ink-3 hover:text-ink-1 transition-colors"
            >
              ← Back to Exchange
            </Link>
          </div>
        </div>
      </div>

      {/* ===== RIGHT — registration terminal ===== */}
      <div className="relative z-10 w-full max-w-md lg:flex-1 lg:max-w-lg flex items-center justify-center px-4 sm:px-8 lg:px-12 py-10 lg:py-24">
        <div className="w-full max-w-sm anim-reveal" style={{ animationDelay: '0.2s' }}>
          {/* mobile headline */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-2 mb-3">
              <LED color="mint" pulse size={6} />
              <span className="font-technical text-[9px] text-ink-2">03 — Registration Station</span>
            </div>
            <h1 className="font-display text-3xl tracking-tight text-ink-0">
              JOIN THE <span className="text-mint">EXCHANGE.</span>
            </h1>
          </div>

          <div className="relative surface-metal-brushed metal-scratches rounded-2xl p-6 sm:p-8">
            <Rivet size={9} className="absolute top-3 left-3" />
            <Rivet size={9} className="absolute top-3 right-3" />
            <Rivet size={9} className="absolute bottom-3 left-3" />
            <Rivet size={9} className="absolute bottom-3 right-3" />

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-metal-2/40">
              <div className="flex items-center gap-2">
                <User size={14} className="text-mint" />
                <span className="font-technical text-[9px] text-ink-1">OPERATOR REGISTRATION</span>
              </div>
              <span className="font-mono text-[7px] text-ink-3">CJ-REG-X24</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TerminalField
                label="FULL NAME" type="text" value={form.name}
                onChange={(v) => update('name', v)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                active={focused === 'name'} icon={<User size={14} />}
                placeholder="Your full name" disabled={busy}
                error={errors.name}
              />
              <TerminalField
                label="EMAIL" type="email" value={form.email}
                onChange={(v) => update('email', v)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                active={focused === 'email'} icon={<Mail size={14} />}
                placeholder="you@college.edu" disabled={busy}
                error={errors.email}
              />
              <TerminalField
                label="PASSWORD" type="password" value={form.password}
                onChange={(v) => update('password', v)}
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                active={focused === 'password'} icon={<Lock size={14} />}
                placeholder="Min 6 characters" disabled={busy}
                error={errors.password}
              />
              <TerminalField
                label="COLLEGE" type="text" value={form.college}
                onChange={(v) => update('college', v)}
                onFocus={() => setFocused('college')} onBlur={() => setFocused(null)}
                active={focused === 'college'} icon={<Building2 size={14} />}
                placeholder="Your college name" disabled={busy}
                error={errors.college}
                list="college-suggestions"
              />
              {colleges.length > 0 && (
                <datalist id="college-suggestions">
                  {colleges.map((c, i) => (
                    <option key={i} value={typeof c === 'string' ? c : (c.name || c.college_name || c.label || c)} />
                  ))}
                </datalist>
              )}
              <TerminalField
                label="BRANCH (OPTIONAL)" type="text" value={form.branch}
                onChange={(v) => update('branch', v)}
                onFocus={() => setFocused('branch')} onBlur={() => setFocused(null)}
                active={focused === 'branch'} icon={<BookOpen size={14} />}
                placeholder="e.g. Computer Science" disabled={busy}
              />

              {/* Year of Study selector */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <LED color={focused === 'year' ? 'mint' : 'off'} pulse={focused === 'year'} size={5} />
                  <span
                    className="font-technical text-[8px] transition-colors duration-300"
                    style={{ color: focused === 'year' ? 'var(--mint-soft)' : 'var(--text-3)' }}
                  >
                    YEAR OF STUDY (OPTIONAL) {focused === 'year' && '· ACTIVE'}
                  </span>
                </div>
                <div
                  className="relative flex items-center rounded-lg transition-all duration-300"
                  style={{
                    background: 'var(--bg-1)',
                    border: `1px solid ${focused === 'year' ? 'rgba(93,184,154,0.4)' : 'rgba(82,74,66,0.5)'}`,
                    boxShadow: focused === 'year' ? 'inset 0 0 12px rgba(93,184,154,0.06)' : 'inset 0 1px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  <span className="pl-3 text-ink-2" style={{ color: focused === 'year' ? 'var(--mint)' : undefined }}>
                    <GraduationCap size={14} />
                  </span>
                  <select
                    value={form.yearOfStudy}
                    onChange={(e) => update('yearOfStudy', e.target.value)}
                    onFocus={() => setFocused('year')}
                    onBlur={() => setFocused(null)}
                    disabled={busy}
                    className="w-full bg-transparent px-3 py-3 text-sm text-ink-0 font-mono outline-none appearance-none cursor-pointer"
                    style={{ color: form.yearOfStudy ? 'var(--text-0)' : 'var(--text-3)' }}
                  >
                    <option value="" className="bg-bg-2 text-ink-3">Select year</option>
                    <option value="1st" className="bg-bg-2 text-ink-0">1st Year</option>
                    <option value="2nd" className="bg-bg-2 text-ink-0">2nd Year</option>
                    <option value="3rd" className="bg-bg-2 text-ink-0">3rd Year</option>
                    <option value="4th" className="bg-bg-2 text-ink-0">4th Year</option>
                    <option value="5th+" className="bg-bg-2 text-ink-0">5th+ Year</option>
                  </select>
                </div>
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="flex items-start gap-2 surface-panel rounded-lg p-3 anim-reveal">
                  <AlertTriangle size={14} className="text-coral shrink-0 mt-0.5" />
                  <span className="font-mono text-[10px] text-coral-soft leading-relaxed">{submitError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className={`machine-control machine-control--secondary w-full justify-center ${busy ? 'opacity-70' : ''}`}
                style={{ padding: '14px 20px' }}
              >
                <span className="ctrl-led" />
                <span className="flex items-center gap-2">
                  {phase === 'registering' ? (<><Loader2 size={14} className="animate-spin" /> REGISTERING...</>) :
                   phase === 'success' ? (<><CheckCircle2 size={14} /> OPERATOR PROFILE CREATED</>) :
                   (<><ArrowRight size={14} /> ENTER CAMPUSVAULT</>)}
                </span>
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-metal-2/40" />
              <span className="font-technical text-[8px] text-ink-2">ALREADY IN?</span>
              <div className="flex-1 h-px bg-metal-2/40" />
            </div>

            <div className="mt-5 text-center">
              <p className="font-mono text-[10px] text-ink-2">
                Already have an account?{' '}
                <Link to="/login" className="text-amber hover:text-amber-soft transition-colors font-bold">
                  ENTER THE EXCHANGE
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center gap-2">
            <Link
              to="/"
              className="lg:hidden font-technical text-[9px] text-ink-2 hover:text-ink-0 transition-colors mb-1"
            >
              ← Back to Exchange
            </Link>
            <span className="font-technical text-[7px] text-ink-2">CAMPUSVAULT EXCHANGE · STUDENT ROLE ASSIGNED AUTOMATICALLY</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalField({ label, type, value, onChange, onFocus, onBlur, active, icon, placeholder, disabled, error, list }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <LED color={active ? 'mint' : 'off'} pulse={active} size={5} />
        <span
          className="font-technical text-[8px] transition-colors duration-300"
          style={{ color: active ? 'var(--mint-soft)' : 'var(--text-2)' }}
        >
          {label} {active && '· ACTIVE'}
        </span>
      </div>
      <div
        className="relative flex items-center rounded-lg transition-all duration-300"
        style={{
          background: 'var(--bg-1)',
          border: `1px solid ${active ? 'rgba(93,184,154,0.4)' : error ? 'rgba(251,113,133,0.45)' : 'rgba(82,74,66,0.5)'}`,
          boxShadow: active ? 'inset 0 0 12px rgba(93,184,154,0.06)' : 'inset 0 1px 4px rgba(0,0,0,0.3)',
        }}
      >
        <span className="pl-3 text-ink-2" style={{ color: active ? 'var(--mint)' : undefined }}>
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
          list={list}
        />
      </div>
      {error && <p className="mt-1.5 font-mono text-[9px] text-coral-soft">{error}</p>}
    </div>
  );
}
