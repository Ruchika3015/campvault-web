import { useState } from 'react';
import { LED, Rivet } from '@/components/primitives/Details';
import { TASK_CATEGORIES } from '@/data/workshopMockData';
import { Plus, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

/**
 * Post a Task — a physical request drop box.
 * Opens a panel where the user fills in a request and drops it into the exchange.
 * Mock submission — no backend connection yet.
 */
export function PostTaskStation({ open, onClose }) {
  const [form, setForm] = useState({ need: '', description: '', category: '', budget: '' });
  const [phase, setPhase] = useState('idle'); // idle | dropping | done
  const [requestId, setRequestId] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phase !== 'idle') return;
    if (!form.need || !form.category) return;
    setPhase('dropping');
    await new Promise((r) => setTimeout(r, 1500));
    const id = `JG-${Math.floor(1000 + Math.random() * 900)}`;
    setRequestId(id);
    setPhase('done');
  };

  const reset = () => {
    setPhase('idle');
    setRequestId('');
    setForm({ need: '', description: '', category: '', budget: '' });
  };

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

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
            <Plus size={14} className="text-mint" />
            <span className="font-technical text-[9px] text-ink-1">POST A TASK</span>
          </div>
          <div className="flex items-center gap-2">
            <LED color={phase === 'done' ? 'mint' : 'amber'} pulse size={5} />
            <span className="font-mono text-[7px] text-ink-3">CJ-DROP-X24</span>
          </div>
        </div>

        {phase !== 'done' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* What do you need? */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LED color="amber" pulse size={4} />
                <span className="font-technical text-[8px] text-ink-3">WHAT DO YOU NEED?</span>
              </div>
              <input
                type="text"
                value={form.need}
                onChange={(e) => update('need', e.target.value)}
                placeholder="e.g. Edit my fest video"
                className="w-full rounded-lg px-3 py-3 text-sm text-ink-0 placeholder:text-ink-3/50 font-mono outline-none"
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid rgba(82,74,66,0.5)',
                  boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LED color="amber" pulse size={4} />
                <span className="font-technical text-[8px] text-ink-3">DESCRIPTION</span>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Add details about what you need..."
                rows={3}
                className="w-full rounded-lg px-3 py-3 text-sm text-ink-0 placeholder:text-ink-3/50 font-mono outline-none resize-none"
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid rgba(82,74,66,0.5)',
                  boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
                }}
              />
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LED color="amber" pulse size={4} />
                <span className="font-technical text-[8px] text-ink-3">CATEGORY</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TASK_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => update('category', cat)}
                    className={`px-2.5 py-1.5 rounded-md font-technical text-[8px] transition-all ${
                      form.category === cat ? 'text-bg-0' : 'text-ink-3 hover:text-ink-1'
                    }`}
                    style={
                      form.category === cat
                        ? { background: 'linear-gradient(135deg, var(--amber), var(--amber-deep))' }
                        : { background: 'var(--bg-2)', border: '1px solid var(--metal-1)' }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LED color="amber" pulse size={4} />
                <span className="font-technical text-[8px] text-ink-3">BUDGET</span>
              </div>
              <input
                type="text"
                value={form.budget}
                onChange={(e) => update('budget', e.target.value)}
                placeholder="₹500"
                className="w-full rounded-lg px-3 py-3 text-sm text-ink-0 placeholder:text-ink-3/50 font-mono outline-none"
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid rgba(82,74,66,0.5)',
                  boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={phase === 'dropping' || !form.need || !form.category}
              className={`machine-control machine-control--primary w-full justify-center ${phase === 'dropping' ? 'opacity-70' : ''} ${(!form.need || !form.category) ? 'opacity-40 cursor-not-allowed' : ''}`}
              style={{ padding: '14px 20px' }}
            >
              <span className="ctrl-led" />
              <span className="flex items-center gap-2">
                {phase === 'dropping' ? (<><Loader2 size={14} className="animate-spin" /> DROPPING INTO EXCHANGE...</>) :
                 (<><ArrowRight size={14} /> DROP INTO EXCHANGE</>)}
              </span>
            </button>
          </form>
        ) : (
          /* Success state */
          <div className="text-center py-6">
            <div className="grid place-items-center w-16 h-16 rounded-2xl mx-auto mb-5 anim-match-pop" style={{ background: 'linear-gradient(135deg, var(--mint), var(--mint-deep))', boxShadow: 'var(--glow-mint)' }}>
              <CheckCircle2 size={28} className="text-bg-0" />
            </div>
            <h3 className="font-display text-2xl text-ink-0 mb-2">REQUEST ACCEPTED</h3>
            <p className="font-mono text-lg text-amber mb-4">{requestId}</p>
            <div className="inline-flex items-center gap-2 surface-panel rounded-lg px-4 py-2.5">
              <LED color="amber" blink size={5} />
              <span className="font-technical text-[9px] text-ink-2">STATUS: SEARCHING FOR A JUGAAD</span>
            </div>
            <p className="mt-4 font-mono text-[9px] text-ink-3">Your request is now in the exchange.</p>
            <button
              onClick={reset}
              className="machine-control machine-control--ghost mt-5"
              style={{ padding: '10px 16px' }}
            >
              <span className="ctrl-led" />
              POST ANOTHER
            </button>
          </div>
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
