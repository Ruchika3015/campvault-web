import { useState } from 'react';
import { LED, Rivet, Sticker } from '@/components/primitives/Details';
import { mockMyJugaads, MONTHS, STATUS_OPTIONS } from '@/data/workshopMockData';
import { ClipboardList, Search, List, Calendar, CalendarDays } from 'lucide-react';

const STATUS_CONFIG = {
  open: { color: 'coral', label: 'OPEN' },
  'in-progress': { color: 'amber', label: 'IN PROGRESS' },
  matched: { color: 'mint', label: 'MATCH FOUND' },
  completed: { color: 'mint', label: 'COMPLETED' },
  cancelled: { color: 'coral', label: 'CANCELLED' },
};

function getYear(dateStr) {
  return new Date(dateStr).getFullYear();
}
function getMonthIndex(dateStr) {
  return new Date(dateStr).getMonth();
}

export function MyJugaadsStation({ open, onClose }) {
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [view, setView] = useState('list'); // list | month | year

  if (!open) return null;

  const years = ['ALL', ...Array.from(new Set(mockMyJugaads.map((t) => getYear(t.date)))).sort((a, b) => b - a)];

  const filtered = mockMyJugaads.filter((task) => {
    if (search && !task.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (yearFilter !== 'ALL' && getYear(task.date) !== Number(yearFilter)) return false;
    if (monthFilter !== 'ALL' && getMonthIndex(task.date) !== MONTHS.indexOf(monthFilter)) return false;
    if (statusFilter !== 'ALL' && STATUS_CONFIG[task.status].label !== statusFilter) return false;
    return true;
  });

  const resetFilters = () => {
    setSearch('');
    setYearFilter('ALL');
    setMonthFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <div className="workshop-overlay" onClick={onClose}>
      <div
        className="workshop-panel relative w-full max-w-2xl mx-4 surface-wood rounded-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Rivet size={9} className="absolute top-3 left-3" />
        <Rivet size={9} className="absolute top-3 right-3" />
        <Rivet size={9} className="absolute bottom-3 left-3" />
        <Rivet size={9} className="absolute bottom-3 right-3" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-metal-2/40">
          <div className="flex items-center gap-2">
            <ClipboardList size={14} className="text-amber" />
            <span className="font-technical text-[10px] text-ink-0">MY JUGAADS</span>
          </div>
          <span className="font-mono text-[8px] text-ink-2">{filtered.length} shown</span>
        </div>

        {/* Search */}
        <div className="flex items-center rounded-lg mb-4" style={{ background: 'var(--bg-1)', border: '1px solid rgba(82,74,66,0.5)', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)' }}>
          <Search size={14} className="ml-3 text-ink-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your Jugaads..."
            className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-0 placeholder:text-ink-3/60 font-mono outline-none"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1.5 mb-4">
          <ViewButton active={view === 'list'} onClick={() => setView('list')} icon={<List size={12} />} label="LIST" />
          <ViewButton active={view === 'month'} onClick={() => setView('month')} icon={<Calendar size={12} />} label="MONTH" />
          <ViewButton active={view === 'year'} onClick={() => setView('year')} icon={<CalendarDays size={12} />} label="YEAR" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <FilterSelect label="YEAR" value={yearFilter} options={years.map(String)} onChange={setYearFilter} />
          <FilterSelect label="MONTH" value={monthFilter} options={['ALL', ...MONTHS]} onChange={setMonthFilter} />
          <FilterSelect label="STATUS" value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
          {(search || yearFilter !== 'ALL' || monthFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button onClick={resetFilters} className="font-technical text-[8px] text-coral-soft hover:text-coral transition-colors px-2 py-1.5">
              CLEAR
            </button>
          )}
        </div>

        {/* Content */}
        {view === 'list' && <ListView tasks={filtered} />}
        {view === 'month' && <MonthView tasks={filtered} />}
        {view === 'year' && <YearView tasks={filtered} />}

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

function ViewButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-technical text-[8px] transition-all ${active ? 'text-bg-0' : 'text-ink-2 hover:text-ink-0'}`}
      style={active ? { background: 'linear-gradient(135deg, var(--amber), var(--amber-deep))' } : { background: 'var(--bg-2)', border: '1px solid var(--metal-1)' }}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-1.5 surface-panel rounded-lg px-2.5 py-1.5">
      <span className="font-technical text-[7px] text-ink-3">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent font-mono text-[9px] text-ink-0 outline-none cursor-pointer"
        style={{ color: 'var(--ink-0)' }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: 'var(--bg-1)', color: 'var(--ink-0)' }}>
            {opt === 'ALL' ? 'ALL' : opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function ListView({ tasks }) {
  if (tasks.length === 0) return <EmptyState />;
  return (
    <div className="space-y-3">
      {tasks.map((task, i) => {
        const cfg = STATUS_CONFIG[task.status];
        return (
          <div
            key={task.id}
            className="surface-paper paper-fiber relative anim-reveal"
            style={{
              animationDelay: `${i * 0.06}s`,
              transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
              clipPath: 'polygon(1% 0, 97% 1%, 100% 5%, 99% 95%, 96% 100%, 4% 99%, 0 93%, 2% 3%)',
              padding: '14px 16px',
            }}
          >
            <span className="absolute -top-1.5 left-4 w-3 h-3 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, #c75d5d, #8a3030)', boxShadow: '0 2px 4px rgba(0,0,0,0.4)' }} />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1">
                <span className="text-base leading-none mt-0.5">{task.emoji}</span>
                <div>
                  <p className="font-editorial text-sm text-paper-ink leading-snug">{task.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-mono text-[8px] text-paper-ink/70">{task.id}</span>
                    <span className="font-mono text-[8px] text-paper-ink/50">·</span>
                    <span className="font-mono text-[8px] text-paper-ink/70">{task.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Sticker color={cfg.color === 'coral' ? 'coral' : cfg.color === 'amber' ? 'amber' : 'mint'} rotate={-2}>
                  {cfg.label}
                </Sticker>
                {task.assignee && <span className="font-mono text-[8px] text-paper-ink/70">→ {task.assignee}</span>}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-mono text-[7px] uppercase tracking-wider px-1.5 py-0.5 text-bg-0 rounded" style={{ background: 'var(--amber-deep)' }}>
                {task.tag}
              </span>
              <span className="font-mono text-[8px] text-paper-ink/70">{task.budget}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthView({ tasks }) {
  if (tasks.length === 0) return <EmptyState />;
  const byMonth = {};
  tasks.forEach((t) => {
    const m = MONTHS[getMonthIndex(t.date)];
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(t);
  });
  return (
    <div className="space-y-4">
      {Object.entries(byMonth).map(([month, items]) => (
        <div key={month}>
          <div className="flex items-center gap-2 mb-2">
            <LED color="amber" pulse size={4} />
            <span className="font-technical text-[9px] text-ink-0">{month}</span>
            <span className="font-mono text-[8px] text-ink-3">({items.length})</span>
          </div>
          <div className="space-y-2 pl-4 border-l-2 border-metal-1/40">
            {items.map((task, i) => {
              const cfg = STATUS_CONFIG[task.status];
              return (
                <div key={task.id} className="surface-paper paper-fiber relative anim-reveal" style={{ animationDelay: `${i * 0.06}s`, transform: `rotate(${i % 2 ? 0.5 : -0.5}deg)`, clipPath: 'polygon(1% 0, 97% 1%, 100% 5%, 99% 95%, 96% 100%, 4% 99%, 0 93%, 2% 3%)', padding: '10px 14px' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{task.emoji}</span>
                    <p className="font-editorial text-sm text-paper-ink flex-1">{task.text}</p>
                    <Sticker color={cfg.color === 'coral' ? 'coral' : cfg.color === 'amber' ? 'amber' : 'mint'} rotate={-2}>{cfg.label}</Sticker>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function YearView({ tasks }) {
  if (tasks.length === 0) return <EmptyState />;
  const byYear = {};
  tasks.forEach((t) => {
    const y = getYear(t.date);
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(t);
  });
  return (
    <div className="space-y-5">
      {Object.entries(byYear).sort((a, b) => b[0] - a[0]).map(([year, items]) => (
        <div key={year}>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-display text-2xl text-amber">{year}</span>
            <span className="font-mono text-[9px] text-ink-2">({items.length} Jugaads)</span>
          </div>
          <div className="space-y-2 pl-4 border-l-2 border-metal-1/40">
            {items.map((task, i) => {
              const cfg = STATUS_CONFIG[task.status];
              const monthName = MONTHS[getMonthIndex(task.date)];
              return (
                <div key={task.id} className="surface-paper paper-fiber relative anim-reveal" style={{ animationDelay: `${i * 0.06}s`, transform: `rotate(${i % 2 ? 0.5 : -0.5}deg)`, clipPath: 'polygon(1% 0, 97% 1%, 100% 5%, 99% 95%, 96% 100%, 4% 99%, 0 93%, 2% 3%)', padding: '10px 14px' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{task.emoji}</span>
                    <div className="flex-1">
                      <p className="font-editorial text-sm text-paper-ink">{task.text}</p>
                      <p className="font-mono text-[8px] text-paper-ink/60 mt-0.5">{monthName} · {task.date}</p>
                    </div>
                    <Sticker color={cfg.color === 'coral' ? 'coral' : cfg.color === 'amber' ? 'amber' : 'mint'} rotate={-2}>{cfg.label}</Sticker>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <ClipboardList size={32} className="mx-auto text-ink-3 mb-3" />
      <p className="font-mono text-sm text-ink-2">No Jugaads match your filters.</p>
    </div>
  );
}
