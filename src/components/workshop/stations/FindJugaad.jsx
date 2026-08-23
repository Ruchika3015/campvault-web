import { useState } from 'react';
import { LED, Rivet, Screen, Sticker } from '@/components/primitives/Details';
import { mockMatches, SEARCH_CATEGORIES, SEARCH_SUGGESTIONS } from '@/data/workshopMockData';
import { Search, Star, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

/**
 * Find a Jugaad — a physical search terminal.
 * Click to activate, search, see the engine scan, then reveal matches.
 */
export function FindJugaadStation({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | scanning | done
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (phase === 'scanning') return;
    setPhase('scanning');
    setResults([]);
    await new Promise((r) => setTimeout(r, 1800));
    // Pick 3 mock matches
    const picks = mockMatches.slice(0, 3);
    setResults(picks);
    setPhase('done');
  };

  const reset = () => {
    setPhase('idle');
    setResults([]);
    setQuery('');
    setCategory('');
  };

  if (!open) return null;

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
            <Search size={14} className="text-amber" />
            <span className="font-technical text-[10px] text-ink-0">FIND A JUGAAD</span>
          </div>
          <div className="flex items-center gap-2">
            <LED color={phase === 'scanning' ? 'amber' : phase === 'done' ? 'mint' : 'off'} pulse={phase !== 'idle'} size={5} />
            <span className="font-mono text-[7px] text-ink-3">CJ-SEARCH-X24</span>
          </div>
        </div>

        <p className="font-editorial text-sm text-ink-2 mb-5">
          Someone on campus already knows how.
        </p>

        {/* Search field */}
        <form onSubmit={handleSearch}>
          <div className="flex items-center gap-2 mb-2">
            <LED color="amber" pulse size={4} />
            <span className="font-technical text-[8px] text-ink-3">WHAT DO YOU NEED?</span>
          </div>
          <div
            className="flex items-center rounded-lg mb-4"
            style={{
              background: 'var(--bg-1)',
              border: '1px solid rgba(82,74,66,0.5)',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            <Search size={14} className="ml-3 text-ink-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a skill, task or help..."
              className="w-full bg-transparent px-3 py-3 text-sm text-ink-0 placeholder:text-ink-3/50 font-mono outline-none"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {SEARCH_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1.5 rounded-md font-technical text-[8px] transition-all ${
                  category === cat
                    ? 'text-bg-0'
                    : 'text-ink-3 hover:text-ink-1'
                }`}
                style={
                  category === cat
                    ? { background: 'linear-gradient(135deg, var(--amber), var(--amber-deep))' }
                    : { background: 'var(--bg-2)', border: '1px solid var(--metal-1)' }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Suggestions */}
          {phase === 'idle' && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {SEARCH_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="px-2 py-1 rounded font-mono text-[9px] text-ink-3 hover:text-ink-1 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={phase === 'scanning' || !query}
            className={`machine-control machine-control--primary w-full justify-center ${phase === 'scanning' ? 'opacity-70' : ''} ${!query ? 'opacity-40 cursor-not-allowed' : ''}`}
            style={{ padding: '12px 20px' }}
          >
            <span className="ctrl-led" />
            <span className="flex items-center gap-2">
              {phase === 'scanning' ? (<><Loader2 size={14} className="animate-spin" /> SCANNING CAMPUS...</>) :
               phase === 'done' ? (<><CheckCircle2 size={14} /> MATCH FOUND</>) :
               (<><ArrowRight size={14} /> FIND MATCHES</>)}
            </span>
          </button>
        </form>

        {/* Scanning animation */}
        {phase === 'scanning' && (
          <div className="mt-5 surface-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <LED color="amber" blink size={5} />
              <span className="font-mono text-[9px] text-amber-soft anim-scan-pulse">SCANNING 12,480 STUDENTS...</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-3)' }}>
              <div className="h-full w-1/3 anim-signal" style={{ background: 'linear-gradient(90deg, transparent, var(--amber), transparent)' }} />
            </div>
          </div>
        )}

        {/* Results */}
        {phase === 'done' && results.length > 0 && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <LED color="mint" pulse size={5} />
              <span className="font-technical text-[8px] text-mint">{results.length} MATCHES FOUND</span>
            </div>
            {results.map((m, i) => (
              <div
                key={m.id}
                className="surface-panel rounded-xl p-4 anim-match-pop"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid place-items-center w-10 h-10 rounded-xl font-display text-bg-0 text-sm shrink-0"
                    style={{
                      background: m.accent === 'mint' ? 'linear-gradient(135deg, var(--mint), var(--mint-deep))'
                        : m.accent === 'coral' ? 'linear-gradient(135deg, var(--coral), #a04040)'
                        : 'linear-gradient(135deg, var(--amber), var(--amber-deep))',
                      boxShadow: 'var(--glow-mint)',
                    }}
                  >
                    {m.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm text-ink-0">{m.name}</p>
                    <p className="font-mono text-[10px] text-ink-2">{m.skill}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber fill-amber" />
                    <span className="font-mono text-xs text-ink-0">{m.rating}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-ink-3">{m.completed} Jugaads done</span>
                  <Sticker color={m.accent === 'coral' ? 'coral' : m.accent === 'mint' ? 'mint' : 'amber'} rotate={-2}>
                    {m.tag}
                  </Sticker>
                </div>
              </div>
            ))}
            <button
              onClick={reset}
              className="machine-control machine-control--ghost w-full justify-center"
              style={{ padding: '10px 16px' }}
            >
              <span className="ctrl-led" />
              <span className="flex items-center gap-2">NEW SEARCH</span>
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
