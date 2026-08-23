import { useState } from 'react';
import { X, Send, IndianRupee, Clock, Tag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CAMPUS_SKILLS, CATEGORY_COLORS } from '@/data/jugaadMockData';

export function ProposalModal({ item, helper, onClose, onSend }) {
  const [explanation, setExplanation] = useState('');
  const [proposedPrice, setProposedPrice] = useState(item.amount ? String(item.amount) : '');
  const [completionTime, setCompletionTime] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const color = CATEGORY_COLORS[item.category] || 'amber';

  const toggleSkill = (skillName) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      setCustomSkill('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!explanation.trim()) {
      setError('Please explain why they should choose you before sending.');
      return;
    }
    if (!proposedPrice || Number(proposedPrice) <= 0) {
      setError('Please enter a valid proposed price.');
      return;
    }
    if (!completionTime.trim()) {
      setError('Please specify an expected completion time.');
      return;
    }
    setError('');
    onSend({
      jugaadId: item.id,
      jugaadTitle: item.title,
      category: item.category,
      poster: item.poster,
      amount: item.amount,
      helper,
      explanation: explanation.trim(),
      proposedPrice: Number(proposedPrice),
      completionTime: completionTime.trim(),
      skills: selectedSkills,
    });
    setSent(true);
  };

  return (
    <div className="workshop-overlay" onClick={onClose}>
      <div
        className="workshop-panel surface-metal-brushed rounded-2xl p-6 w-full max-w-lg mx-4 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-ink-3 hover:text-ink-0 z-10">
          <X size={18} />
        </button>

        {sent ? (
          <div className="text-center py-10">
            <div className="mx-auto grid place-items-center w-14 h-14 rounded-full bg-mint/15 text-mint mb-4">
              <CheckCircle2 size={24} />
            </div>
            <p className="font-display text-2xl">PROPOSAL SENT</p>
            <p className="font-mono text-[10px] text-ink-2 mt-2 max-w-xs mx-auto">
              {item.poster.name} will review your proposal. You'll see the status update in My Requests.
            </p>
            <button onClick={onClose} className="machine-control machine-control--ghost mt-6">
              <span className="ctrl-led" />
              CLOSE
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-metal-1/40 pb-4 mb-5">
              <span className="grid place-items-center w-10 h-10 rounded-lg" style={{ background: `color-mix(in srgb, var(--${color}) 14%, transparent)`, color: `var(--${color})` }}>
                <Send size={19} />
              </span>
              <div>
                <p className="font-technical text-[10px] text-ink-0">SEND YOUR PROPOSAL</p>
                <p className="font-mono text-[9px] text-ink-3 mt-0.5">CJ-PROPOSAL-X24</p>
              </div>
            </div>

            {/* Jugaad details */}
            <div className="surface-panel rounded-xl p-4 mb-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="font-display text-lg text-ink-0 leading-tight">{item.title}</h2>
                <span className="font-technical text-[7px] px-2 py-1 rounded shrink-0" style={{ background: `var(--${color})`, color: 'var(--bg-0)' }}>
                  {item.category}
                </span>
              </div>
              <p className="font-mono text-[9px] text-ink-3 mb-3">
                Posted by <span className="text-ink-1">{item.poster.name}</span> · {item.poster.college}
              </p>
              <p className="font-mono text-[10px] text-ink-2 leading-relaxed mb-3">{item.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono text-ink-3">
                <span className="flex items-center gap-1">
                  <span className="font-technical text-[7px] text-ink-3">BUDGET</span>
                  <span className="font-display text-lg text-amber">₹{item.amount}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Tag size={11} />
                  {item.skillRequired}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Why should they choose you */}
              <div>
                <label className="font-technical text-[8px] text-ink-2 block mb-2">
                  WHY SHOULD THEY CHOOSE YOU?
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={4}
                  placeholder="Tell the poster why you're the right person for this Jugaad. Mention your relevant skills, experience, or what makes your approach useful."
                  className="w-full rounded-lg bg-bg-1 border border-metal-1 p-3 font-mono text-xs outline-none resize-none focus:border-amber/40 text-ink-0"
                  style={{ lineHeight: '1.6' }}
                />
              </div>

              {/* Proposed price + completion time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-technical text-[8px] text-ink-2 block mb-2">
                    YOUR PROPOSED PRICE
                  </label>
                  <div className="flex items-center rounded-lg bg-bg-1 border border-metal-1">
                    <IndianRupee size={14} className="ml-3 text-ink-3" />
                    <input
                      type="number"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      placeholder={String(item.amount || 500)}
                      className="w-full bg-transparent px-2 py-3 font-mono text-sm outline-none text-ink-0"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-technical text-[8px] text-ink-2 block mb-2">
                    EXPECTED COMPLETION TIME
                  </label>
                  <div className="flex items-center rounded-lg bg-bg-1 border border-metal-1">
                    <Clock size={14} className="ml-3 text-ink-3" />
                    <input
                      type="text"
                      value={completionTime}
                      onChange={(e) => setCompletionTime(e.target.value)}
                      placeholder="e.g. 2 days"
                      className="w-full bg-transparent px-2 py-3 font-mono text-sm outline-none text-ink-0"
                    />
                  </div>
                </div>
              </div>

              {/* Relevant skills */}
              <div>
                <label className="font-technical text-[8px] text-ink-2 block mb-2">
                  RELEVANT SKILLS (OPTIONAL)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {CAMPUS_SKILLS.map((skill) => {
                    const active = selectedSkills.includes(skill.name);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.name)}
                        className={`px-2.5 py-1.5 rounded-md font-technical text-[7px] transition-colors ${
                          active
                            ? 'bg-amber text-bg-0'
                            : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/30'
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                    placeholder="Add a custom skill..."
                    className="flex-1 rounded-lg bg-bg-1 border border-metal-1 px-3 py-2 font-mono text-xs outline-none text-ink-0"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    className="px-3 py-2 rounded-lg border border-amber/30 text-amber font-technical text-[8px] hover:bg-amber/10"
                  >
                    ADD
                  </button>
                </div>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedSkills.map((s) => (
                      <span key={s} className="flex items-center gap-1 px-2 py-1 rounded-md bg-mint/10 text-mint font-mono text-[8px]">
                        {s}
                        <button type="button" onClick={() => toggleSkill(s)} className="hover:text-coral">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 surface-panel rounded-lg p-3" style={{ borderColor: 'rgba(199,93,93,0.3)' }}>
                  <AlertTriangle size={14} className="text-coral shrink-0 mt-0.5" />
                  <span className="font-mono text-[10px] text-coral-soft leading-relaxed">{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="machine-control machine-control--ghost flex-1 justify-center"
                  style={{ padding: '13px 18px' }}
                >
                  <span className="ctrl-led" />
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="machine-control machine-control--primary flex-[1.5] justify-center"
                  style={{ padding: '13px 18px' }}
                >
                  <span className="ctrl-led" />
                  <span className="flex items-center gap-2">
                    <Send size={14} />
                    SEND PROPOSAL
                  </span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
