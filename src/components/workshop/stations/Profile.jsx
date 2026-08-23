import { useState } from 'react';
import { LED, Rivet, Sticker } from '@/components/primitives/Details';
import { useAuth } from '@/context/AuthContext';
import { mockUser, mockSkills, mockAchievements, mockEarnings, mockNotes } from '@/data/workshopMockData';
import { User, Star, Plus, Trash2, Award, Wallet, BookOpen, Wrench } from 'lucide-react';

const SKILL_COLORS = { CODE: 'mint', DESIGN: 'amber', VIDEO: 'coral', ACADEMICS: 'mint', PRESENTATION: 'amber', OTHER: 'coral' };
const TIER_COLORS = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2' };

export function ProfileStation({ open, onClose }) {
  const { user: authUser } = useAuth();
  const [skills, setSkills] = useState(mockSkills);
  const [notes, setNotes] = useState(mockNotes);
  const [newSkill, setNewSkill] = useState('');
  const [newNote, setNewNote] = useState('');

  if (!open) return null;

  const profile = { ...mockUser, ...(authUser || {}) };
  const avatar = profile.name?.slice(0, 2).toUpperCase() || mockUser.avatar;

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([...skills, { id: `s${Date.now()}`, name: newSkill.trim(), level: 'Beginner', category: 'OTHER', proficiency: 30 }]);
    setNewSkill('');
  };
  const removeSkill = (id) => setSkills(skills.filter((s) => s.id !== id));

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes([...notes, { id: `n${Date.now()}`, text: newNote.trim() }]);
    setNewNote('');
  };
  const removeNote = (id) => setNotes(notes.filter((n) => n.id !== id));

  return (
    <div className="workshop-overlay" onClick={onClose}>
      <div
        className="workshop-panel relative w-full max-w-2xl mx-4 surface-metal-brushed metal-scratches rounded-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Rivet size={9} className="absolute top-3 left-3" />
        <Rivet size={9} className="absolute top-3 right-3" />
        <Rivet size={9} className="absolute bottom-3 left-3" />
        <Rivet size={9} className="absolute bottom-3 right-3" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-metal-2/40">
          <div className="flex items-center gap-2">
            <User size={14} className="text-amber" />
            <span className="font-technical text-[10px] text-ink-0">PROFILE</span>
          </div>
          <span className="font-mono text-[8px] text-ink-2">CJ-PROFILE-X24</span>
        </div>

        {/* Personal Information */}
        <div className="flex items-center gap-4 mb-6">
          <div className="grid place-items-center w-16 h-16 rounded-2xl font-display text-bg-0 text-xl shrink-0" style={{ background: 'linear-gradient(135deg, var(--amber), var(--amber-deep))', boxShadow: 'var(--glow-amber)' }}>
            {avatar}
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl text-ink-0 leading-tight">{profile.name}</h3>
            <p className="font-mono text-[10px] text-ink-1 mt-1">{profile.college}</p>
            <p className="font-mono text-[9px] text-ink-2">{profile.department} · {profile.year}</p>
            <p className="font-mono text-[9px] text-ink-3">{profile.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <StatBlock label="JUGAAD SCORE" value={profile.jugaadScore} color="amber" />
          <StatBlock label="COMPLETED" value={profile.jugaadsCompleted} color="mint" />
          <StatBlock label="RATING" value={`${profile.rating}★`} color="amber" />
        </div>

        {/* Skills */}
        <SectionHeader icon={<Wrench size={12} />} label="SKILLS" />
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((skill) => {
            const color = SKILL_COLORS[skill.category] || 'amber';
            return (
              <div key={skill.id} className="group relative surface-panel rounded-lg px-3 py-2 flex items-center gap-2" style={{ border: `1px solid color-mix(in srgb, var(--${color}) 25%, transparent)` }}>
                <span className="font-mono text-[10px] text-ink-0">{skill.name}</span>
                <span className="font-technical text-[7px]" style={{ color: `var(--${color})` }}>{skill.level}</span>
                <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
                  <div className="h-full rounded-full anim-meter-fill" style={{ width: `${skill.proficiency}%`, background: `var(--${color})` }} />
                </div>
                <button onClick={() => removeSkill(skill.id)} className="opacity-0 group-hover:opacity-100 text-ink-3 hover:text-coral-soft transition-opacity" aria-label="Remove skill">
                  <Trash2 size={10} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            placeholder="Add a skill..."
            className="flex-1 rounded-lg px-3 py-2 text-sm text-ink-0 placeholder:text-ink-3/60 font-mono outline-none"
            style={{ background: 'var(--bg-1)', border: '1px solid rgba(82,74,66,0.5)' }}
          />
          <button onClick={addSkill} className="machine-control machine-control--primary" style={{ padding: '8px 14px' }}>
            <span className="ctrl-led" />
            <span className="flex items-center gap-1.5"><Plus size={12} /> ADD</span>
          </button>
        </div>

        {/* Achievements */}
        <SectionHeader icon={<Award size={12} />} label="ACHIEVEMENTS" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
          {mockAchievements.map((a) => (
            <div key={a.id} className={`surface-panel rounded-xl p-3 text-center relative ${!a.unlocked ? 'opacity-40' : ''}`}>
              <div className="grid place-items-center w-10 h-10 rounded-full mx-auto mb-2" style={{ background: a.unlocked ? `radial-gradient(circle, ${TIER_COLORS[a.tier]}33, transparent)` : 'var(--bg-3)' }}>
                <span className="text-lg">{a.emoji}</span>
              </div>
              <p className="font-technical text-[8px] text-ink-0">{a.title}</p>
              <p className="font-mono text-[7px] text-ink-3 mt-0.5">{a.unlocked ? 'UNLOCKED' : 'LOCKED'}</p>
              {a.unlocked && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: TIER_COLORS[a.tier] }} />}
            </div>
          ))}
        </div>

        {/* Earnings */}
        <SectionHeader icon={<Wallet size={12} />} label="EARNINGS" />
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className="surface-panel rounded-xl p-3">
            <p className="font-technical text-[7px] text-ink-3">TOTAL EARNED</p>
            <p className="font-display text-xl text-amber mt-1">₹{mockEarnings.totalEarned.toLocaleString()}</p>
          </div>
          <div className="surface-panel rounded-xl p-3">
            <p className="font-technical text-[7px] text-ink-3">THIS MONTH</p>
            <p className="font-display text-xl text-mint mt-1">₹{mockEarnings.thisMonth.toLocaleString()}</p>
          </div>
        </div>
        <div className="space-y-1.5 mb-6">
          {mockEarnings.recent.map((e) => (
            <div key={e.id} className="flex items-center gap-2.5 surface-panel rounded-lg px-3 py-2">
              <span className="text-sm">{e.emoji}</span>
              <span className="font-mono text-[10px] text-ink-1 flex-1">{e.text}</span>
              <span className="font-mono text-[10px] text-mint">+₹{e.amount}</span>
              <span className="font-mono text-[8px] text-ink-3">{e.date}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        <SectionHeader icon={<BookOpen size={12} />} label="NOTES" />
        <div className="space-y-2 mb-3">
          {notes.map((n) => (
            <div key={n.id} className="group flex items-center gap-2.5 surface-paper paper-fiber rounded-lg px-3 py-2.5" style={{ clipPath: 'polygon(1% 0, 97% 1%, 100% 5%, 99% 95%, 96% 100%, 4% 99%, 0 93%, 2% 3%)' }}>
              <span className="absolute -top-1 left-3 w-2 h-2 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, #c75d5d, #8a3030)' }} />
              <span className="font-editorial text-sm text-paper-ink flex-1">{n.text}</span>
              <button onClick={() => removeNote(n.id)} className="text-paper-ink/40 hover:text-coral-soft transition-colors" aria-label="Delete note">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addNote()}
            placeholder="Add a note..."
            className="flex-1 rounded-lg px-3 py-2 text-sm text-ink-0 placeholder:text-ink-3/60 font-mono outline-none"
            style={{ background: 'var(--bg-1)', border: '1px solid rgba(82,74,66,0.5)' }}
          />
          <button onClick={addNote} className="machine-control machine-control--primary" style={{ padding: '8px 14px' }}>
            <span className="ctrl-led" />
            <span className="flex items-center gap-1.5"><Plus size={12} /> ADD</span>
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 grid place-items-center w-8 h-8 rounded-full surface-metal text-ink-1 hover:text-ink-0 text-sm font-bold"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function SectionHeader({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-amber">{icon}</span>
      <span className="font-technical text-[8px] text-ink-0">{label}</span>
      <span className="h-px flex-1 bg-metal-1/30" />
    </div>
  );
}

function StatBlock({ label, value, color }) {
  return (
    <div className="surface-panel rounded-xl p-3 text-center">
      <p className="font-display text-xl" style={{ color: `var(--${color})` }}>{value}</p>
      <p className="font-technical text-[7px] text-ink-2 mt-0.5">{label}</p>
    </div>
  );
}
