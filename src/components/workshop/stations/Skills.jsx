import { useState } from 'react';
import { LED, Rivet, LEDMeter } from '@/components/primitives/Details';
import { mockSkills } from '@/data/workshopMockData';
import { Plus, Wrench, X } from 'lucide-react';

const CATEGORY_COLORS = {
  CODE: 'mint',
  DESIGN: 'amber',
  VIDEO: 'coral',
  ACADEMICS: 'mint',
  PRESENTATION: 'amber',
  OTHER: 'mint',
};

/**
 * Skills — a physical skill toolbox.
 * Shows skills as tools with meters. Add skill opens a small panel.
 */
export function SkillsStation({ open, onClose }) {
  const [skills, setSkills] = useState(mockSkills);
  const [adding, setAdding] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'CODE' });

  if (!open) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;
    setSkills((s) => [...s, {
      id: `s${Date.now()}`,
      name: newSkill.name.trim(),
      level: 1,
      category: newSkill.category,
    }]);
    setNewSkill({ name: '', category: 'CODE' });
    setAdding(false);
  };

  return (
    <div className="workshop-overlay" onClick={onClose}>
      <div
        className="workshop-panel relative w-full max-w-lg mx-4 surface-metal-brushed metal-scratches rounded-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <Rivet size={9} className="absolute top-3 left-3" />
        <Rivet size={9} className="absolute top-3 right-3" />
        <Rivet size={9} className="absolute bottom-3 left-3" />
        <Rivet size={9} className="absolute bottom-3 right-3" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-metal-2/40">
          <div className="flex items-center gap-2">
            <Wrench size={14} className="text-mint" />
            <span className="font-technical text-[9px] text-ink-1">MY SKILLS</span>
          </div>
          <span className="font-mono text-[7px] text-ink-3">CJ-TOOLBOX-X24</span>
        </div>

        {/* Skills as tools */}
        <div className="space-y-2.5">
          {skills.map((skill, i) => {
            const color = CATEGORY_COLORS[skill.category] || 'amber';
            return (
              <div
                key={skill.id}
                className="surface-panel rounded-xl p-3.5 flex items-center gap-3 anim-reveal"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <LED color={color} pulse size={5} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-ink-0">{skill.name}</p>
                  <p className="font-technical text-[7px] text-ink-3 mt-0.5">{skill.category}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <LEDMeter level={skill.level} count={5} color={color} size={5} />
                  <span className="font-mono text-[9px] text-ink-2 w-6 text-right">{skill.level}/5</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add skill button / form */}
        {adding ? (
          <form onSubmit={handleAdd} className="mt-4 surface-panel rounded-xl p-4 anim-reveal">
            <div className="flex items-center gap-2 mb-3">
              <LED color="mint" pulse size={4} />
              <span className="font-technical text-[8px] text-ink-2">ADD NEW SKILL</span>
            </div>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill((s) => ({ ...s, name: e.target.value }))}
              placeholder="Skill name (e.g. JavaScript)"
              autoFocus
              className="w-full rounded-lg px-3 py-2.5 text-sm text-ink-0 placeholder:text-ink-3/50 font-mono outline-none mb-3"
              style={{ background: 'var(--bg-1)', border: '1px solid rgba(82,74,66,0.5)' }}
            />
            <div className="flex flex-wrap gap-1.5 mb-4">
              {Object.keys(CATEGORY_COLORS).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewSkill((s) => ({ ...s, category: cat }))}
                  className={`px-2.5 py-1.5 rounded-md font-technical text-[8px] transition-all ${newSkill.category === cat ? 'text-bg-0' : 'text-ink-3 hover:text-ink-1'}`}
                  style={newSkill.category === cat ? { background: 'linear-gradient(135deg, var(--mint), var(--mint-deep))' } : { background: 'var(--bg-2)', border: '1px solid var(--metal-1)' }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="machine-control machine-control--secondary flex-1 justify-center" style={{ padding: '10px 16px' }}>
                <span className="ctrl-led" />
                ADD SKILL
              </button>
              <button type="button" onClick={() => setAdding(false)} className="machine-control machine-control--ghost" style={{ padding: '10px 16px' }}>
                <X size={14} />
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="machine-control machine-control--secondary w-full justify-center mt-4"
            style={{ padding: '12px 20px', borderStyle: 'dashed' }}
          >
            <span className="ctrl-led" />
            <span className="flex items-center gap-2">
              <Plus size={14} /> ADD SKILL
            </span>
          </button>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 grid place-items-center w-7 h-7 rounded-full surface-metal text-ink-2 hover:text-ink-0 text-xs"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
