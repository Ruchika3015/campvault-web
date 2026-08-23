import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LED } from '@/components/primitives/Details';
import {
  mockSettings, PREFERRED_CATEGORIES, BUDGET_RANGES, WORK_TYPES,
  NOTIF_FREQUENCIES, PROFILE_VISIBILITY_OPTIONS,
} from '@/data/jugaadMockData';
import {
  Settings as SettingsIcon, User, Bell, Shield, Lock, Palette,
  Sliders, Accessibility, Database, LogOut, Save, Eye, EyeOff,
  Trash2, Download, AlertTriangle, Check, X, ChevronRight,
} from 'lucide-react';

const SETTINGS_KEY = 'campusjugaad_settings';
const THEME_KEY = 'campusjugaad_theme';

const CATEGORIES = [
  { id: 'account', label: 'ACCOUNT', icon: User },
  { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell },
  { id: 'privacy', label: 'PRIVACY', icon: Shield },
  { id: 'security', label: 'SECURITY', icon: Lock },
  { id: 'appearance', label: 'APPEARANCE', icon: Palette },
  { id: 'preferences', label: 'PREFERENCES', icon: Sliders },
  { id: 'accessibility', label: 'ACCESSIBILITY', icon: Accessibility },
  { id: 'data', label: 'DATA & ACCOUNT', icon: Database },
];

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      // merge with defaults to ensure new keys exist
      return {
        notifications: { ...mockSettings.notifications, ...saved.notifications },
        privacy: { ...mockSettings.privacy, ...saved.privacy },
        appearance: { ...mockSettings.appearance, ...saved.appearance },
        preferences: { ...mockSettings.preferences, ...saved.preferences },
        accessibility: { ...mockSettings.accessibility, ...saved.accessibility },
      };
    }
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(mockSettings));
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else if (theme === 'system') {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    root.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
  } else {
    root.setAttribute('data-theme', 'dark');
  }
  localStorage.setItem(THEME_KEY, theme);
}

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState('account');
  const [settings, setSettings] = useState(loadSettings);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const updateSettings = useCallback((category, key, value) => {
    setSettings((s) => {
      const next = { ...s, [category]: { ...s[category], [key]: value } };
      saveSettings(next);
      return next;
    });
    showSavedToast();
  }, []);

  const showSavedToast = useCallback(() => {
    setToast('Settings saved');
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Apply theme on mount and when appearance.theme changes
  useEffect(() => {
    applyTheme(settings.appearance.theme);
  }, [settings.appearance.theme]);

  // Apply accessibility data attributes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-reduce-motion', settings.appearance.reduceMotion ? 'true' : 'false');
    root.setAttribute('data-larger-text', settings.accessibility.largerText ? 'true' : 'false');
    root.setAttribute('data-high-contrast', settings.accessibility.highContrast ? 'true' : 'false');
  }, [settings.appearance.reduceMotion, settings.accessibility.largerText, settings.accessibility.highContrast]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.appearance.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => applyTheme('system');
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else if (mq.removeListener) mq.removeListener(handler);
    };
  }, [settings.appearance.theme]);

  return (
    <div>
      <section className="pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <LED color="amber" pulse size={7} />
          <span className="font-technical text-[9px] text-ink-2">SETTINGS CENTER</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl">SETTINGS.</h1>
        <p className="mt-3 text-sm text-ink-2 max-w-lg">How your CampusJugaad account works. Changes save automatically.</p>
      </section>

      <div className="grid lg:grid-cols-[200px_1fr] gap-5">
        {/* Left nav */}
        <nav className="surface-panel rounded-2xl p-3 h-fit lg:sticky lg:top-24">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {CATEGORIES.map((cat) => {
              const isActive = active === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActive(cat.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap lg:w-full ${isActive ? 'text-amber-soft' : 'text-ink-2 hover:text-ink-0'}`}
                  style={{ background: isActive ? 'rgba(214,138,60,0.08)' : 'transparent' }}
                >
                  <cat.icon size={14} />
                  <span className="font-technical text-[9px]">{cat.label}</span>
                  {isActive && <LED color="amber" size={4} className="hidden lg:block ml-auto" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right panel */}
        <div className="surface-metal-brushed rounded-2xl p-5 sm:p-7 min-h-[400px]">
          {active === 'account' && <AccountPanel user={user} settings={settings} updateSettings={updateSettings} handleLogout={handleLogout} />}
          {active === 'notifications' && <NotificationsPanel settings={settings} updateSettings={updateSettings} />}
          {active === 'privacy' && <PrivacyPanel settings={settings} updateSettings={updateSettings} />}
          {active === 'security' && <SecurityPanel handleLogout={handleLogout} />}
          {active === 'appearance' && <AppearancePanel settings={settings} updateSettings={updateSettings} />}
          {active === 'preferences' && <PreferencesPanel settings={settings} updateSettings={updateSettings} />}
          {active === 'accessibility' && <AccessibilityPanel settings={settings} updateSettings={updateSettings} />}
          {active === 'data' && <DataPanel handleLogout={handleLogout} />}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Link to="/dashboard" className="machine-control machine-control--ghost"><span className="ctrl-led" />BACK TO WORKSPACE</Link>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 surface-panel rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg" style={{ border: '1px solid var(--mint)' }}>
          <Check size={14} className="text-mint" />
          <span className="font-mono text-[11px] text-ink-1">{toast}</span>
        </div>
      )}
    </div>
  );
}

function PanelHeader({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 mb-6 pb-5 border-b border-metal-1/40">
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-amber/10 text-amber shrink-0"><Icon size={18} /></span>
      <div>
        <h2 className="font-display text-xl">{title}</h2>
        <p className="font-mono text-[10px] text-ink-3 mt-1">{desc}</p>
      </div>
    </div>
  );
}

// Standard modern switch component
function Switch({ on, onChange, label, ariaLabel }) {
  const [focused, setFocused] = useState(false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel || label}
      onClick={() => onChange(!on)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 outline-none ${focused ? 'ring-2 ring-amber/40 ring-offset-1 ring-offset-bg-0' : ''}`}
      style={{
        background: on ? 'var(--mint)' : 'var(--bg-3)',
        border: '1px solid var(--metal-1)',
      }}
    >
      <span
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-bg-0 shadow-md transition-all duration-200"
        style={{
          left: on ? 'calc(100% - 18px)' : '2px',
        }}
      />
    </button>
  );
}

// Setting row with switch
function Toggle({ on, onChange, label, desc }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3 border-b border-metal-1/30 last:border-0 cursor-pointer"
      onClick={() => onChange(!on)}
    >
      <div className="min-w-0">
        <p className="font-mono text-[11px] text-ink-1">{label}</p>
        {desc && <p className="font-mono text-[9px] text-ink-3 mt-1">{desc}</p>}
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <Switch on={on} onChange={onChange} label={label} />
      </div>
    </div>
  );
}

function AccountPanel({ user, settings, updateSettings, handleLogout }) {
  const navigate = useNavigate();
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwChanged, setPwChanged] = useState(false);

  const submitPw = (e) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.new || pwForm.new !== pwForm.confirm) return;
    setPwChanged(true);
    setPwForm({ current: '', new: '', confirm: '' });
    setTimeout(() => {
      setPwChanged(false);
      setShowPwModal(false);
    }, 1500);
  };

  return (
    <div>
      <PanelHeader icon={User} title="Account" desc="Manage your core account information." />

      {/* Account info display */}
      <div className="surface-panel rounded-xl p-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-12 h-12 rounded-full bg-amber text-bg-0 font-display text-sm">
            {user?.name?.slice(0, 2).toUpperCase() || 'DS'}
          </span>
          <div>
            <p className="font-display text-lg">{user?.name || 'Demo Student'}</p>
            <p className="font-mono text-[9px] text-ink-3 mt-0.5">{user?.email || 'demo@campusjugaad.demo'}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-3 mb-5">
        <ActionRow icon={User} label="Edit Profile" desc="Update your name, bio, skills, and links" onClick={() => navigate('/dashboard/profile')} />
        <ActionRow icon={Lock} label="Change Password" desc="Update your account password" onClick={() => setShowPwModal(true)} />
        <ActionRow icon={LogOut} label="Logout" desc="Sign out of your current session" onClick={handleLogout} />
      </div>

      {/* Profile visibility */}
      <div className="pt-4 border-t border-metal-1/40">
        <p className="font-technical text-[8px] text-ink-3 mb-2">PROFILE VISIBILITY</p>
        <div className="flex flex-wrap gap-2">
          {PROFILE_VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings('privacy', 'profileVisibility', opt.value)}
              className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${settings.privacy.profileVisibility === opt.value ? 'bg-amber text-bg-0' : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Change password modal */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setShowPwModal(false)}>
          <div className="surface-metal-brushed rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()} style={{ border: '1px solid var(--metal-1)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl">Change Password</h3>
              <button onClick={() => setShowPwModal(false)} className="text-ink-3 hover:text-ink-0" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitPw} className="space-y-4">
              <PasswordField label="CURRENT PASSWORD" value={pwForm.current} onChange={(v) => setPwForm((f) => ({ ...f, current: v }))} show={showPw.current} toggle={() => setShowPw((s) => ({ ...s, current: !s.current }))} />
              <PasswordField label="NEW PASSWORD" value={pwForm.new} onChange={(v) => setPwForm((f) => ({ ...f, new: v }))} show={showPw.new} toggle={() => setShowPw((s) => ({ ...s, new: !s.new }))} />
              <PasswordField label="CONFIRM NEW PASSWORD" value={pwForm.confirm} onChange={(v) => setPwForm((f) => ({ ...f, confirm: v }))} show={showPw.confirm} toggle={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))} />
              {pwForm.new && pwForm.confirm && pwForm.new !== pwForm.confirm && (
                <p className="font-mono text-[9px] text-coral">Passwords do not match.</p>
              )}
              <button
                type="submit"
                disabled={!pwForm.current || !pwForm.new || pwForm.new !== pwForm.confirm}
                className="machine-control machine-control--primary disabled:opacity-40"
                style={{ padding: '10px 16px' }}
              >
                <span className="ctrl-led" />
                {pwChanged ? <><Check size={13} />SAVED</> : <><Save size={13} />CHANGE PASSWORD</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionRow({ icon: Icon, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 surface-panel rounded-xl p-3.5 text-left hover:border-amber/30 transition-colors"
      style={{ border: '1px solid var(--metal-1)' }}
    >
      <span className="grid place-items-center w-9 h-9 rounded-lg bg-amber/10 text-amber shrink-0"><Icon size={15} /></span>
      <div className="flex-1">
        <p className="font-mono text-[11px] text-ink-1">{label}</p>
        <p className="font-mono text-[9px] text-ink-3 mt-0.5">{desc}</p>
      </div>
      <ChevronRight size={14} className="text-ink-3 shrink-0" />
    </button>
  );
}

function NotificationsPanel({ settings, updateSettings }) {
  const n = settings.notifications;
  const set = (k, v) => updateSettings('notifications', k, v);
  const items = [
    ['newInterestRequests', 'Interest Request Notifications', 'When someone is interested in your Jugaad'],
    ['jugaadRecommendations', 'Proposal Notifications', 'When you receive a new proposal'],
    ['requestAccepted', 'Accepted Proposal Notifications', 'When a poster accepts your proposal'],
    ['requestRejected', 'Rejected Proposal Notifications', 'When a poster rejects your proposal'],
    ['counterOffers', 'Counter-Offer Notifications', 'When a counter offer is received'],
    ['messages', 'New Message Notifications', 'New messages in your conversations'],
    ['jugaadUpdates', 'Jugaad / Task Notifications', 'Status changes on your Jugaads and tasks'],
  ];
  return (
    <div>
      <PanelHeader icon={Bell} title="Notifications" desc="Control which notifications you receive." />
      <div className="space-y-1 mb-6">
        {items.map(([key, label, desc]) => (
          <Toggle key={key} on={n[key]} onChange={(v) => set(key, v)} label={label} desc={desc} />
        ))}
      </div>
      <div className="pt-4 border-t border-metal-1/40">
        <p className="font-technical text-[8px] text-ink-3 mb-3">DELIVERY CHANNELS</p>
        <Toggle on={n.emailNotifications} onChange={(v) => set('emailNotifications', v)} label="Email Notifications" desc="Receive notifications via email" />
        <Toggle on={n.inAppNotifications} onChange={(v) => set('inAppNotifications', v)} label="In-App Notifications" desc="Show notifications inside CampusJugaad" />
      </div>
    </div>
  );
}

function PrivacyPanel({ settings, updateSettings }) {
  const p = settings.privacy;
  const set = (k, v) => updateSettings('privacy', k, v);
  return (
    <div>
      <PanelHeader icon={Shield} title="Privacy" desc="Control who can see your information and reach you." />
      <div className="mb-5">
        <p className="font-technical text-[8px] text-ink-3 mb-2">PROFILE VISIBILITY</p>
        <div className="flex flex-wrap gap-2">
          {PROFILE_VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('profileVisibility', opt.value)}
              className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${p.profileVisibility === opt.value ? 'bg-amber text-bg-0' : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[9px] text-ink-3 mt-2">Public = anyone can find you · Campus Only = only verified students · Private = only you</p>
      </div>
      <div className="space-y-1">
        <Toggle on={p.showEmail} onChange={(v) => set('showEmail', v)} label="Show Email" desc="Display your email on your profile" />
        <Toggle on={p.showPhone} onChange={(v) => set('showPhone', v)} label="Show Phone" desc="Display your phone number on your profile" />
        <Toggle on={p.showSocialLinks} onChange={(v) => set('showSocialLinks', v)} label="Show Social Links" desc="Display your professional links" />
        <Toggle on={p.showSkills} onChange={(v) => set('showSkills', v)} label="Show Skills" desc="Display your skills on your profile" />
        <Toggle on={p.showCompletedJugaads} onChange={(v) => set('showCompletedJugaads', v)} label="Show Completed Jugaads" desc="Display your completed Jugaads" />
        <Toggle on={p.allowInterestRequests} onChange={(v) => set('allowInterestRequests', v)} label="Allow Interest Requests" desc="Let students send interest requests on your Jugaads" />
        <Toggle on={p.allowMessagesAfterAcceptance} onChange={(v) => set('allowMessagesAfterAcceptance', v)} label="Allow Messages After Acceptance" desc="Unlock messaging once a request is accepted" />
      </div>
    </div>
  );
}

function SecurityPanel({ handleLogout }) {
  return (
    <div>
      <PanelHeader icon={Lock} title="Security" desc="Protect your account and manage sessions." />
      <div className="space-y-3 mb-6">
        <ActionRow icon={Lock} label="Change Password" desc="Update your account password" onClick={() => {
          // Navigate to account panel to open password modal
          const event = new CustomEvent('open-password-modal');
          window.dispatchEvent(event);
        }} />
      </div>
      <div className="pt-5 border-t border-metal-1/40">
        <p className="font-technical text-[8px] text-ink-3 mb-3">ACTIVE SESSIONS</p>
        <div className="surface-panel rounded-xl p-3 flex items-center gap-3 mb-3">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-mint/10 text-mint"><Check size={14} /></span>
          <div className="flex-1">
            <p className="font-mono text-[10px] text-ink-1">Current Session · This device</p>
            <p className="font-mono text-[8px] text-ink-3">Active now</p>
          </div>
        </div>
        <button onClick={handleLogout} className="machine-control machine-control--ghost" style={{ padding: '8px 14px' }}>
          <span className="ctrl-led" /><LogOut size={12} />LOG OUT
        </button>
      </div>
    </div>
  );
}

function AppearancePanel({ settings, updateSettings }) {
  const a = settings.appearance;
  return (
    <div>
      <PanelHeader icon={Palette} title="Appearance" desc="Customize how CampusJugaad looks and feels." />
      <div className="mb-5">
        <p className="font-technical text-[8px] text-ink-3 mb-2">THEME</p>
        <div className="flex flex-wrap gap-2">
          {[{ v: 'dark', l: 'Dark' }, { v: 'light', l: 'Light' }, { v: 'system', l: 'System' }].map((opt) => (
            <button
              key={opt.v}
              onClick={() => updateSettings('appearance', 'theme', opt.v)}
              className={`px-4 py-2.5 rounded-lg font-technical text-[9px] transition-colors ${a.theme === opt.v ? 'bg-amber text-bg-0' : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'}`}
            >
              {opt.l}
            </button>
          ))}
        </div>
        <p className="font-mono text-[8px] text-ink-3 mt-2">Dark is the default workshop theme. Light switches to a brighter palette. System follows your OS preference.</p>
      </div>
      <Toggle on={a.reduceMotion} onChange={(v) => updateSettings('appearance', 'reduceMotion', v)} label="Reduce Motion" desc="Minimize animations and transitions" />
    </div>
  );
}

function PreferencesPanel({ settings, updateSettings }) {
  const p = settings.preferences;
  const toggleCategory = (cat) => {
    const cats = p.preferredCategories.includes(cat)
      ? p.preferredCategories.filter((c) => c !== cat)
      : [...p.preferredCategories, cat];
    updateSettings('preferences', 'preferredCategories', cats);
  };
  return (
    <div>
      <PanelHeader icon={Sliders} title="Preferences" desc="Tune your discovery feed and recommendation signals." />
      <div className="mb-5">
        <p className="font-technical text-[8px] text-ink-3 mb-2">PREFERRED CATEGORIES</p>
        <div className="flex flex-wrap gap-2">
          {PREFERRED_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${p.preferredCategories.includes(cat) ? 'bg-amber text-bg-0' : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <p className="font-technical text-[8px] text-ink-3 mb-2">PREFERRED WORK TYPE</p>
        <div className="flex flex-wrap gap-2">
          {WORK_TYPES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings('preferences', 'preferredWorkType', opt.value)}
              className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${p.preferredWorkType === opt.value ? 'bg-amber text-bg-0' : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <p className="font-technical text-[8px] text-ink-3 mb-2">PREFERRED BUDGET RANGE</p>
        <div className="flex flex-wrap gap-2">
          {BUDGET_RANGES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings('preferences', 'preferredBudgetRange', opt.value)}
              className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${p.preferredBudgetRange === opt.value ? 'bg-amber text-bg-0' : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <p className="font-technical text-[8px] text-ink-3 mb-2">NOTIFICATION FREQUENCY</p>
        <div className="flex flex-wrap gap-2">
          {NOTIF_FREQUENCIES.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings('preferences', 'notificationFrequency', opt.value)}
              className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${p.notificationFrequency === opt.value ? 'bg-amber text-bg-0' : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccessibilityPanel({ settings, updateSettings }) {
  const a = settings.accessibility;
  return (
    <div>
      <PanelHeader icon={Accessibility} title="Accessibility" desc="Adjust the interface for your needs." />
      <div className="space-y-1">
        <Toggle on={settings.appearance.reduceMotion} onChange={(v) => updateSettings('appearance', 'reduceMotion', v)} label="Reduce Motion" desc="Minimize animations and transitions" />
        <Toggle on={a.largerText} onChange={(v) => updateSettings('accessibility', 'largerText', v)} label="Larger Text" desc="Increase base font size for readability" />
        <Toggle on={a.highContrast} onChange={(v) => updateSettings('accessibility', 'highContrast', v)} label="High Contrast" desc="Boost contrast between text and background" />
        <Toggle on={a.keyboardNavigation} onChange={(v) => updateSettings('accessibility', 'keyboardNavigation', v)} label="Keyboard Navigation Support" desc="Enhance focus indicators for keyboard users" />
      </div>
    </div>
  );
}

function DataPanel({ handleLogout }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div>
      <PanelHeader icon={Database} title="Data & Account" desc="Manage your data and account lifecycle." />
      <div className="space-y-3 mb-6">
        <DataAction icon={Download} label="Download My Data" desc="Export a copy of your CampusJugaad data" onClick={() => {
          const data = localStorage.getItem(SETTINGS_KEY) || '{}';
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'campusjugaad-data.json';
          a.click();
          URL.revokeObjectURL(url);
        }} />
        <DataAction icon={Download} label="Export Profile" desc="Download your profile as a portable file" onClick={() => {
          const profile = { exportedAt: new Date().toISOString(), settings: JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
          const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'campusjugaad-profile.json';
          a.click();
          URL.revokeObjectURL(url);
        }} />
        <DataAction icon={LogOut} label="Logout" desc="Sign out of your current session" onClick={handleLogout} />
      </div>
      <div className="pt-5 border-t border-coral/30">
        <p className="font-technical text-[8px] text-coral mb-3 flex items-center gap-1.5"><AlertTriangle size={11} />DANGER ZONE</p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-coral/40 text-coral font-technical text-[9px] hover:bg-coral/10 transition-colors w-full">
            <Trash2 size={14} />DELETE ACCOUNT
          </button>
        ) : (
          <div className="surface-panel rounded-xl p-4 border border-coral/40">
            <p className="font-mono text-[11px] text-ink-1 mb-3">Are you sure you want to delete your CampusJugaad account? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => { setConfirmDelete(false); handleLogout(); }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-coral text-bg-0 font-technical text-[9px] hover:bg-coral-soft">
                <Trash2 size={12} />YES, DELETE
              </button>
              <button onClick={() => setConfirmDelete(false)} className="machine-control machine-control--ghost" style={{ padding: '8px 14px' }}><span className="ctrl-led" />CANCEL</button>
            </div>
            <p className="font-mono text-[8px] text-ink-3 mt-3">This will clear your local data and log you out.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Shared field components
function PasswordField({ label, value, onChange, show, toggle }) {
  return (
    <div>
      <label className="font-technical text-[8px] text-ink-3 block mb-2">{label}</label>
      <div className="flex items-center rounded-lg bg-bg-1 border border-metal-1">
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent px-3 py-2.5 font-mono text-xs outline-none text-ink-0" />
        <button type="button" onClick={toggle} className="px-3 text-ink-3 hover:text-ink-0 shrink-0" aria-label={show ? 'Hide' : 'Show'}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

function DataAction({ icon: Icon, label, desc, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 surface-panel rounded-xl p-3.5 text-left hover:border-amber/30 transition-colors" style={{ border: '1px solid var(--metal-1)' }}>
      <span className="grid place-items-center w-9 h-9 rounded-lg bg-amber/10 text-amber shrink-0"><Icon size={15} /></span>
      <div>
        <p className="font-mono text-[11px] text-ink-1">{label}</p>
        <p className="font-mono text-[9px] text-ink-3 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
