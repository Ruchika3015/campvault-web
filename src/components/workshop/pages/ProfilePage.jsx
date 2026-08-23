import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LED, Rivet } from '@/components/primitives/Details';
import {
  mockUser, mockSkills, mockAchievements, mockEarnings,
} from '@/data/workshopMockData';
import {
  mockProfileData, mockProfileLinks, mockProfileProjects,
  mockProfileCertifications, mockProfileStats, LINK_PLATFORMS,
  CATEGORY_COLORS,
} from '@/data/jugaadMockData';
import {
  User, Pencil, Plus, Trash2, X, Save, Star, Wallet, Award,
  Briefcase, Link2, Github, Globe, Linkedin, FileText, Upload,
  MapPin, TrendingUp, CheckCircle2, ExternalLink, GraduationCap,
  Code as Codeforces,
} from 'lucide-react';

const LINK_ICONS = {
  LinkedIn: Linkedin, GitHub: Github, Portfolio: Globe,
  Resume: FileText, 'Personal Website': Globe, Behance: Globe,
  LeetCode: Codeforces, CodeChef: Codeforces, Codeforces: Codeforces,
  Instagram: Globe, Other: Link2,
};

export function ProfilePage() {
  const { user: authUser } = useAuth();
  const profile = { ...mockUser, ...mockProfileData, ...(authUser || {}) };
  const avatar = profile.name?.slice(0, 2).toUpperCase() || profile.avatar;

  const [editing, setEditing] = useState(false);
  const [skills, setSkills] = useState(mockSkills);
  const [links, setLinks] = useState(mockProfileLinks);
  const [projects, setProjects] = useState(mockProfileProjects);
  const [certifications, setCertifications] = useState(mockProfileCertifications);
  const [form, setForm] = useState({
    name: profile.name || '', bio: profile.bio || '', location: profile.location || '',
    branch: profile.branch || profile.department || '', year: profile.year || '',
    college: profile.college || '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkForm, setLinkForm] = useState({ platform: 'GitHub', url: '' });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', technologies: '', link: '', github: '' });
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({ title: '', organization: '', date: '', link: '' });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills((s) => [...s, { id: `s${Date.now()}`, name: newSkill.trim(), level: 'Beginner', category: 'OTHER', proficiency: 30 }]);
    setNewSkill('');
  };
  const removeSkill = (id) => setSkills((s) => s.filter((x) => x.id !== id));

  const addLink = () => {
    if (!linkForm.url.trim()) return;
    setLinks((l) => [...l, { id: `lnk${Date.now()}`, platform: linkForm.platform, url: linkForm.url.trim(), icon: 'link' }]);
    setLinkForm({ platform: 'GitHub', url: '' });
    setShowLinkForm(false);
  };
  const removeLink = (id) => setLinks((l) => l.filter((x) => x.id !== id));

  const addProject = () => {
    if (!projectForm.name.trim()) return;
    setProjects((p) => [...p, {
      id: `prj${Date.now()}`, name: projectForm.name.trim(),
      description: projectForm.description, technologies: projectForm.technologies.split(',').map((t) => t.trim()).filter(Boolean),
      link: projectForm.link, github: projectForm.github,
    }]);
    setProjectForm({ name: '', description: '', technologies: '', link: '', github: '' });
    setShowProjectForm(false);
  };
  const removeProject = (id) => setProjects((p) => p.filter((x) => x.id !== id));

  const addCert = () => {
    if (!certForm.title.trim()) return;
    setCertifications((c) => [...c, { id: `cert${Date.now()}`, ...certForm }]);
    setCertForm({ title: '', organization: '', date: '', link: '' });
    setShowCertForm(false);
  };
  const removeCert = (id) => setCertifications((c) => c.filter((x) => x.id !== id));

  return (
    <div>
      {/* ── Header ── */}
      <section className="pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <LED color="amber" pulse size={7} />
          <span className="font-technical text-[9px] text-ink-2">STUDENT PROFILE</span>
        </div>

        <div className="surface-metal-brushed rounded-2xl p-6 sm:p-8 relative">
          <Rivet size={8} className="absolute top-3 left-3" />
          <Rivet size={8} className="absolute top-3 right-3" />
          <Rivet size={8} className="absolute bottom-3 left-3" />
          <Rivet size={8} className="absolute bottom-3 right-3" />

          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Avatar */}
            <div className="grid place-items-center w-20 h-20 rounded-2xl font-display text-bg-0 text-2xl shrink-0" style={{ background: 'linear-gradient(135deg, var(--amber), var(--amber-deep))', boxShadow: 'var(--glow-amber)' }}>
              {avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Full name" className="w-full rounded-lg bg-bg-1 border border-metal-1 px-3 py-2.5 font-mono text-sm outline-none text-ink-0" />
                  <input value={form.bio} onChange={(e) => update('bio', e.target.value)} placeholder="Short bio" className="w-full rounded-lg bg-bg-1 border border-metal-1 px-3 py-2.5 font-mono text-xs outline-none text-ink-0" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input value={form.college} onChange={(e) => update('college', e.target.value)} placeholder="College" className="rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
                    <input value={form.branch} onChange={(e) => update('branch', e.target.value)} placeholder="Branch" className="rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
                    <input value={form.year} onChange={(e) => update('year', e.target.value)} placeholder="Year" className="rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
                    <input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Location" className="rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="machine-control machine-control--primary" style={{ padding: '8px 14px' }}><span className="ctrl-led" /><Save size={12} />SAVE</button>
                    <button onClick={() => setEditing(false)} className="machine-control machine-control--ghost" style={{ padding: '8px 14px' }}><span className="ctrl-led" />CANCEL</button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-3xl sm:text-4xl">{form.name}</h1>
                  <p className="font-mono text-xs text-ink-2 mt-2">{form.branch} · {form.year}</p>
                  <p className="font-mono text-xs text-ink-3 mt-1">{form.college}</p>
                  {form.bio && <p className="font-editorial text-sm text-ink-1 mt-3 italic">"{form.bio}"</p>}
                  {form.location && (
                    <p className="flex items-center gap-1.5 font-mono text-[10px] text-ink-3 mt-2"><MapPin size={11} />{form.location}</p>
                  )}
                  <button onClick={() => setEditing(true)} className="mt-4 machine-control machine-control--ghost" style={{ padding: '8px 14px' }}>
                    <span className="ctrl-led" /><Pencil size={12} />EDIT PROFILE
                  </button>
                </>
              )}
            </div>

            {/* Completion */}
            <div className="surface-panel rounded-xl p-4 min-w-[180px]">
              <p className="font-technical text-[8px] text-ink-3">PROFILE COMPLETION</p>
              <p className="font-display text-3xl text-amber mt-1">{mockProfileData.profileCompletion}%</p>
              <div className="h-1.5 rounded-full bg-bg-3 mt-2 overflow-hidden">
                <div className="h-full rounded-full anim-meter-fill" style={{ width: `${mockProfileData.profileCompletion}%`, background: 'var(--amber)' }} />
              </div>
              <p className="font-mono text-[8px] text-ink-3 mt-2 leading-snug">{mockProfileData.completionHint}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
        <StatBlock label="JUGAADS POSTED" value={mockProfileStats.jugaadsPosted} icon={<TrendingUp size={14} />} color="amber" />
        <StatBlock label="COMPLETED" value={mockProfileStats.jugaadsCompleted} icon={<CheckCircle2 size={14} />} color="mint" />
        <StatBlock label="ACCEPTED" value={mockProfileStats.jugaadsAccepted} icon={<Briefcase size={14} />} color="amber" />
        <StatBlock label="RATING" value={`${mockProfileStats.rating}★`} icon={<Star size={14} />} color="amber" />
        <StatBlock label="EARNINGS" value={`₹${mockProfileStats.totalEarnings}`} icon={<Wallet size={14} />} color="mint" />
        <StatBlock label="SCORE" value={profile.jugaadScore} icon={<Award size={14} />} color="coral" />
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Skills ── */}
        <section className="surface-panel rounded-2xl p-5">
          <SectionHeader icon={<User size={13} />} label="SKILLS" />
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill) => {
              const color = CATEGORY_COLORS[skill.category] || 'amber';
              return (
                <div key={skill.id} className="group surface-metal rounded-lg px-3 py-2 flex items-center gap-2" style={{ border: `1px solid color-mix(in srgb, var(--${color}) 25%, transparent)` }}>
                  <span className="font-mono text-[10px] text-ink-0">{skill.name}</span>
                  <span className="font-technical text-[7px]" style={{ color: `var(--${color})` }}>{skill.level}</span>
                  <div className="w-10 h-1 rounded-full overflow-hidden bg-bg-3">
                    <div className="h-full rounded-full" style={{ width: `${skill.proficiency}%`, background: `var(--${color})` }} />
                  </div>
                  <button onClick={() => removeSkill(skill.id)} className="text-ink-3 hover:text-coral-soft transition-colors" aria-label="Remove skill"><Trash2 size={10} /></button>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} placeholder="Add a skill..." className="flex-1 rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
            <button onClick={addSkill} className="machine-control machine-control--primary" style={{ padding: '8px 14px' }}><span className="ctrl-led" /><Plus size={12} />ADD</button>
          </div>
        </section>

        {/* ── Links & Profiles ── */}
        <section className="surface-panel rounded-2xl p-5">
          <SectionHeader icon={<Link2 size={13} />} label="LINKS & PROFILES" />
          <div className="space-y-2 mb-4">
            {links.length === 0 && <p className="font-mono text-[10px] text-ink-3 py-2">No links added yet.</p>}
            {links.map((link) => {
              const Icon = LINK_ICONS[link.platform] || Link2;
              return (
                <div key={link.id} className="group flex items-center gap-3 surface-metal rounded-lg px-3 py-2.5">
                  <Icon size={14} className="text-amber shrink-0" />
                  <span className="font-mono text-[10px] text-ink-1 w-24 shrink-0">{link.platform}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] text-mint hover:text-mint-soft truncate flex-1 flex items-center gap-1">{link.url} <ExternalLink size={9} className="shrink-0" /></a>
                  <button onClick={() => removeLink(link.id)} className="text-ink-3 hover:text-coral-soft transition-colors shrink-0" aria-label="Remove link"><Trash2 size={10} /></button>
                </div>
              );
            })}
          </div>
          {showLinkForm ? (
            <div className="space-y-2">
              <select value={linkForm.platform} onChange={(e) => setLinkForm((f) => ({ ...f, platform: e.target.value }))} className="w-full rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0">
                {LINK_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input value={linkForm.url} onChange={(e) => setLinkForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." className="w-full rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
              <div className="flex gap-2">
                <button onClick={addLink} className="machine-control machine-control--primary" style={{ padding: '8px 14px' }}><span className="ctrl-led" /><Plus size={12} />ADD LINK</button>
                <button onClick={() => setShowLinkForm(false)} className="machine-control machine-control--ghost" style={{ padding: '8px 14px' }}><span className="ctrl-led" />CANCEL</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowLinkForm(true)} className="machine-control machine-control--ghost" style={{ padding: '8px 14px' }}><span className="ctrl-led" /><Plus size={12} />ADD LINK</button>
          )}

          {/* Resume upload */}
          <div className="mt-5 pt-4 border-t border-metal-1/40">
            <p className="font-technical text-[8px] text-ink-3 mb-2">RESUME</p>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-mint/30 text-mint font-technical text-[8px] hover:bg-mint/10"><Upload size={12} />UPLOAD RESUME</button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-metal-1 text-ink-3 font-technical text-[8px] hover:text-ink-0"><FileText size={12} />VIEW RESUME</button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-coral/30 text-coral font-technical text-[8px] hover:bg-coral/10"><Trash2 size={12} />REMOVE</button>
            </div>
            <p className="font-mono text-[8px] text-ink-3 mt-2">File upload requires backend support. UI is ready for integration.</p>
          </div>
        </section>

        {/* ── Projects ── */}
        <section className="surface-panel rounded-2xl p-5">
          <SectionHeader icon={<Briefcase size={13} />} label="MY PROJECTS" />
          <div className="space-y-3 mb-4">
            {projects.length === 0 && <p className="font-mono text-[10px] text-ink-3 py-2">No projects added yet.</p>}
            {projects.map((p) => (
              <div key={p.id} className="surface-metal rounded-xl p-4 group">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-sm">{p.name}</p>
                  <button onClick={() => removeProject(p.id)} className="text-ink-3 hover:text-coral-soft transition-colors shrink-0" aria-label="Delete project"><Trash2 size={11} /></button>
                </div>
                <p className="font-mono text-[10px] text-ink-2 mt-2 leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {p.technologies.map((t) => <span key={t} className="font-technical text-[7px] px-2 py-1 rounded bg-bg-2 text-ink-2 border border-metal-1">{t}</span>)}
                </div>
                <div className="flex gap-3 mt-3">
                  {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-mono text-[9px] text-mint hover:text-mint-soft"><Github size={11} />GitHub</a>}
                  {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-mono text-[9px] text-amber hover:text-amber-soft"><Globe size={11} />Live</a>}
                </div>
              </div>
            ))}
          </div>
          {showProjectForm ? (
            <div className="space-y-2">
              <input value={projectForm.name} onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))} placeholder="Project name" className="w-full rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
              <textarea value={projectForm.description} onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none resize-none text-ink-0" />
              <input value={projectForm.technologies} onChange={(e) => setProjectForm((f) => ({ ...f, technologies: e.target.value }))} placeholder="Technologies (comma-separated)" className="w-full rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
              <div className="grid sm:grid-cols-2 gap-2">
                <input value={projectForm.link} onChange={(e) => setProjectForm((f) => ({ ...f, link: e.target.value }))} placeholder="Project link" className="rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
                <input value={projectForm.github} onChange={(e) => setProjectForm((f) => ({ ...f, github: e.target.value }))} placeholder="GitHub link" className="rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
              </div>
              <div className="flex gap-2">
                <button onClick={addProject} className="machine-control machine-control--primary" style={{ padding: '8px 14px' }}><span className="ctrl-led" /><Plus size={12} />ADD PROJECT</button>
                <button onClick={() => setShowProjectForm(false)} className="machine-control machine-control--ghost" style={{ padding: '8px 14px' }}><span className="ctrl-led" />CANCEL</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowProjectForm(true)} className="machine-control machine-control--ghost" style={{ padding: '8px 14px' }}><span className="ctrl-led" /><Plus size={12} />ADD PROJECT</button>
          )}
        </section>

        {/* ── Certifications & Achievements ── */}
        <section className="surface-panel rounded-2xl p-5">
          <SectionHeader icon={<Award size={13} />} label="CERTIFICATIONS & ACHIEVEMENTS" />
          <div className="space-y-2 mb-4">
            {certifications.map((c) => (
              <div key={c.id} className="surface-metal rounded-xl p-3 flex items-start gap-3 group">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-amber/10 text-amber shrink-0"><GraduationCap size={14} /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm">{c.title}</p>
                  <p className="font-mono text-[9px] text-ink-3 mt-1">{c.organization} · {c.date}</p>
                  {c.link && <a href={c.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-mono text-[9px] text-mint hover:text-mint-soft mt-1"><ExternalLink size={9} />View Certificate</a>}
                </div>
                <button onClick={() => removeCert(c.id)} className="text-ink-3 hover:text-coral-soft transition-colors shrink-0" aria-label="Remove"><Trash2 size={10} /></button>
              </div>
            ))}
            {mockAchievements.filter((a) => a.unlocked).map((a) => (
              <div key={a.id} className="surface-metal rounded-xl p-3 flex items-center gap-3">
                <span className="text-lg">{a.emoji}</span>
                <div>
                  <p className="font-technical text-[9px] text-ink-0">{a.title}</p>
                  <p className="font-mono text-[8px] text-ink-3">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {showCertForm ? (
            <div className="space-y-2">
              <input value={certForm.title} onChange={(e) => setCertForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title" className="w-full rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
              <input value={certForm.organization} onChange={(e) => setCertForm((f) => ({ ...f, organization: e.target.value }))} placeholder="Issuing organization" className="w-full rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
              <div className="grid sm:grid-cols-2 gap-2">
                <input type="month" value={certForm.date} onChange={(e) => setCertForm((f) => ({ ...f, date: e.target.value }))} className="rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
                <input value={certForm.link} onChange={(e) => setCertForm((f) => ({ ...f, link: e.target.value }))} placeholder="Certificate link" className="rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0" />
              </div>
              <div className="flex gap-2">
                <button onClick={addCert} className="machine-control machine-control--primary" style={{ padding: '8px 14px' }}><span className="ctrl-led" /><Plus size={12} />ADD</button>
                <button onClick={() => setShowCertForm(false)} className="machine-control machine-control--ghost" style={{ padding: '8px 14px' }}><span className="ctrl-led" />CANCEL</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCertForm(true)} className="machine-control machine-control--ghost" style={{ padding: '8px 14px' }}><span className="ctrl-led" /><Plus size={12} />ADD CERTIFICATION</button>
          )}
        </section>
      </div>

      {/* Earnings summary */}
      <section className="mt-6 surface-wood rounded-2xl p-5">
        <SectionHeader icon={<Wallet size={13} />} label="EARNINGS" color="paper" />
        <div className="grid grid-cols-2 gap-3">
          <div className="surface-panel rounded-xl p-3">
            <p className="font-technical text-[7px] text-ink-3">TOTAL EARNED</p>
            <p className="font-display text-xl text-amber mt-1">₹{mockEarnings.totalEarned.toLocaleString()}</p>
          </div>
          <div className="surface-panel rounded-xl p-3">
            <p className="font-technical text-[7px] text-ink-3">THIS MONTH</p>
            <p className="font-display text-xl text-mint mt-1">₹{mockEarnings.thisMonth.toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-1.5 mt-3">
          {mockEarnings.recent.map((e) => (
            <div key={e.id} className="flex items-center gap-2.5 surface-panel rounded-lg px-3 py-2">
              <span className="text-sm">{e.emoji}</span>
              <span className="font-mono text-[10px] text-ink-1 flex-1">{e.text}</span>
              <span className="font-mono text-[10px] text-mint">+₹{e.amount}</span>
              <span className="font-mono text-[8px] text-ink-3">{e.date}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <Link to="/dashboard" className="machine-control machine-control--ghost"><span className="ctrl-led" />BACK TO WORKSPACE</Link>
      </div>
    </div>
  );
}

function SectionHeader({ icon, label, color = 'amber' }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span style={{ color: `var(--${color})` }}>{icon}</span>
      <span className="font-technical text-[9px] text-ink-0">{label}</span>
      <span className="h-px flex-1 bg-metal-1/30" />
    </div>
  );
}

function StatBlock({ label, value, icon, color }) {
  return (
    <div className="surface-panel rounded-xl p-3">
      <div className="flex justify-between items-start">
        <span style={{ color: `var(--${color})` }}>{icon}</span>
        <span className="font-display text-xl" style={{ color: `var(--${color})` }}>{value}</span>
      </div>
      <p className="font-technical text-[7px] text-ink-3 mt-3">{label}</p>
    </div>
  );
}
