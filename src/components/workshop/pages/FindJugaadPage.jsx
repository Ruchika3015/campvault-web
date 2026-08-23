import { useState, useEffect, useCallback } from 'react';
import { LED } from '@/components/primitives/Details';
import { mockDiscoveryFeed, CATEGORY_COLORS, timeAgo, daysUntil } from '@/data/jugaadMockData';
import { api } from '@/services/api';
import { Search, Heart, X, HandCoins, Clock, Star, Undo2, CheckCircle2 } from 'lucide-react';
import { BargainModal } from '@/components/workshop/pages/BargainModal';
import { ProposalModal } from '@/components/workshop/pages/ProposalModal';
import { useAuth } from '@/context/AuthContext';
import { useProposals } from '@/context/ProposalContext';

export function FindJugaadPage() {
  const { user, isDemoMode, isAuthenticated } = useAuth();
  const { sendProposal, getProposalForJugaad, refreshData } = useProposals();
  const [feedItems, setFeedItems] = useState(isDemoMode ? mockDiscoveryFeed : []);
  const [loading, setLoading] = useState(!isDemoMode);
  const [hidden, setHidden] = useState([]);
  const [bargain, setBargain] = useState(null);
  const [proposalItem, setProposalItem] = useState(null);
  const [undo, setUndo] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');

  const fetchFeed = useCallback(async () => {
    if (isDemoMode) {
      setFeedItems(mockDiscoveryFeed);
      setLoading(false);
      return;
    }
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const data = await api.getDiscoveryFeed();
      const list = data?.jugaads || data?.data || (Array.isArray(data) ? data : []);
      setFeedItems(Array.isArray(list) ? list : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, isAuthenticated]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const helper = user
    ? { id: user.id, name: user.name, initials: user.name?.slice(0, 2).toUpperCase() || 'U' }
    : { id: 'guest', name: 'Guest', initials: 'GU' };

  const visible = feedItems.filter(
    (x) =>
      !hidden.includes(x.id) &&
      (!query || (x.title && x.title.toLowerCase().includes(query.toLowerCase())) || (x.skillRequired && x.skillRequired.toLowerCase().includes(query.toLowerCase()))) &&
      (category === 'ALL' || x.category === category)
  );

  const hide = async (id) => {
    setHidden((v) => [...v, id]);
    setUndo(id);
    if (!isDemoMode) {
      try {
        await api.markNotInterested(id);
      } catch {
        // ignore
      }
    }
    setTimeout(() => setUndo((v) => (v === id ? null : v)), 5000);
  };

  const handleSendProposal = async (payload) => {
    await sendProposal({ ...payload, helper });
    await fetchFeed();
  };

  const sections = [
    ['RECOMMENDED FOR YOU', visible.filter((x) => x.matchPercentage >= 80)],
    ['BEST SKILL MATCHES', visible.filter((x) => x.matchPercentage >= 70 && x.matchPercentage < 80)],
    ['RECENTLY POSTED', visible.filter((x) => x.postedAt >= '2026-08-21').slice(0, 4)],
    ['ENDING SOON', visible.filter((x) => daysUntil(x.deadline) === 'today' || daysUntil(x.deadline) === '1 day left' || daysUntil(x.deadline) === '2 days left')],
    ['MORE OPPORTUNITIES', visible],
  ];

  return (
    <div>
      <section className="pt-12 pb-7">
        <div className="flex items-center gap-3 mb-4">
          <LED color="amber" pulse size={7} />
          <span className="font-technical text-[9px] text-ink-2">02 — CAMPUS OPPORTUNITY FEED</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl">
          FIND A<br />
          <span className="text-amber">JUGAAD.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-ink-2">
          Opportunities selected for you. Discover work posted by other students, then choose how you want to approach it.
        </p>
      </section>

      <div className="surface-panel rounded-xl p-3 flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex items-center flex-1 rounded-lg bg-bg-1 border border-metal-1">
          <Search size={14} className="ml-3 text-ink-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities or skills..."
            className="w-full bg-transparent px-3 py-2.5 font-mono text-xs outline-none text-ink-0"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'CODE', 'DESIGN', 'VIDEO', 'ACADEMICS', 'PRESENTATION', 'OTHER'].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2.5 py-2 rounded-md font-technical text-[8px] ${category === c ? 'bg-amber text-bg-0' : 'bg-bg-2 text-ink-3 border border-metal-1'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {undo && (
        <div className="mb-4 flex items-center justify-between surface-wood rounded-lg px-4 py-3">
          <span className="font-mono text-[10px] text-paper">Opportunity hidden from your feed.</span>
          <button
            onClick={() => {
              setHidden((v) => v.filter((x) => x !== undo));
              setUndo(null);
            }}
            className="flex items-center gap-1.5 font-technical text-[8px] text-amber"
          >
            <Undo2 size={12} />
            UNDO
          </button>
        </div>
      )}

      <div className="space-y-9">
        {sections.map(([title, items]) =>
          items.length > 0 ? (
            <section key={title}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-technical text-[9px] text-ink-0">{title}</span>
                <span className="font-mono text-[8px] text-ink-3">({items.length})</span>
                <span className="h-px flex-1 bg-metal-1/40" />
              </div>
              <div className="grid lg:grid-cols-2 gap-3">
                {items.map((item) => (
                  <OpportunityCard
                    key={item.id}
                    item={item}
                    existingProposal={getProposalForJugaad(item.id)}
                    onHide={() => hide(item.id)}
                    onBargain={() => setBargain(item)}
                    onInterest={() => setProposalItem(item)}
                  />
                ))}
              </div>
            </section>
          ) : null
        )}
      </div>

      {visible.length === 0 && (
        <div className="py-16 text-center">
          <Search size={32} className="mx-auto text-ink-3 mb-3" />
          <p className="font-mono text-sm text-ink-2">No opportunities match this view.</p>
        </div>
      )}

      {bargain && <BargainModal item={bargain} onClose={() => setBargain(null)} />}
      {proposalItem && (
        <ProposalModal
          item={proposalItem}
          helper={helper}
          onClose={() => setProposalItem(null)}
          onSend={handleSendProposal}
        />
      )}
    </div>
  );
}

function OpportunityCard({ item, existingProposal, onInterest, onHide, onBargain }) {
  const color = CATEGORY_COLORS[item.category] || 'amber';
  const proposalSent = !!existingProposal;
  const proposalStatus = existingProposal?.status;
  const posterName = item.poster?.name || item.creator?.name || 'Student';
  const posterInitials = item.poster?.initials || posterName.slice(0, 2).toUpperCase();
  const posterRating = item.poster?.rating ?? '4.8';
  const categoryChar = item.category ? item.category[0] : 'J';

  return (
    <article
      className="surface-metal-brushed rounded-2xl p-5 relative"
      style={{ border: `1px solid color-mix(in srgb, var(--${color}) 22%, transparent)` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span
            className="grid place-items-center w-11 h-11 rounded-xl shrink-0"
            style={{ background: `color-mix(in srgb, var(--${color}) 14%, transparent)`, color: `var(--${color})` }}
          >
            <span className="font-display text-lg">{categoryChar}</span>
          </span>
          <div>
            <h2 className="font-display text-lg text-ink-0 leading-tight">{item.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span
                className="font-technical text-[7px] px-1.5 py-1 rounded"
                style={{ background: `var(--${color})`, color: 'var(--bg-0)' }}
              >
                {item.category}
              </span>
              <span className="font-mono text-[8px] text-ink-3">{item.skillRequired || 'General'}</span>
            </div>
          </div>
        </div>
        {item.matchPercentage && <span className="font-mono text-[9px] text-mint">{item.matchPercentage}% match</span>}
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-ink-2 mt-4">{item.description}</p>

      <div className="flex flex-wrap items-center gap-3 mt-4 text-[9px] font-mono text-ink-3">
        <span className="text-amber font-display text-lg">₹{item.amount}</span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {daysUntil(item.deadline)}
        </span>
        <span className="flex items-center gap-1">
          <Star size={11} className="text-amber fill-amber" />
          {posterRating}
        </span>
        <span>{timeAgo(item.postedAt || item.created_at || item.createdAt)}</span>
      </div>

      {proposalSent && (
        <div className="mt-3 surface-panel rounded-lg px-3 py-2 flex items-center gap-2">
          <CheckCircle2 size={13} className={proposalStatus === 'accepted' ? 'text-mint' : proposalStatus === 'rejected' ? 'text-coral' : 'text-amber'} />
          <span className="font-mono text-[9px] text-ink-2">
            {proposalStatus === 'accepted' ? 'Proposal Accepted — check My Requests to message' :
             proposalStatus === 'rejected' ? 'Proposal Rejected' :
             proposalStatus === 'counter-offer' ? 'Counter offer received — check My Requests' :
             'Proposal Sent — see status in My Requests'}
          </span>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-metal-1/40 flex items-center gap-2">
        <span className="grid place-items-center w-6 h-6 rounded-full bg-amber text-bg-0 font-display text-[8px]">
          {posterInitials}
        </span>
        <span className="font-mono text-[9px] text-ink-1 flex-1">{posterName}</span>
        <button
          onClick={onHide}
          aria-label="Not interested"
          className="grid place-items-center w-8 h-8 rounded-lg text-ink-3 hover:text-coral hover:bg-coral/10"
        >
          <X size={14} />
        </button>
        <button
          onClick={onBargain}
          disabled={proposalSent}
          className="flex items-center gap-1 rounded-lg px-3 py-2 font-technical text-[8px] text-amber border border-amber/30 hover:bg-amber/10 disabled:opacity-40"
        >
          <HandCoins size={12} />
          BARGAIN
        </button>
        <button
          onClick={onInterest}
          disabled={proposalSent}
          className={`flex items-center gap-1 rounded-lg px-3 py-2 font-technical text-[8px] ${proposalSent ? 'bg-mint/15 text-mint border border-mint/30' : 'bg-amber text-bg-0 hover:bg-amber-soft'} disabled:cursor-default`}
        >
          <Heart size={12} fill={proposalSent ? 'currentColor' : 'none'} />
          {proposalSent ? 'PROPOSAL SENT' : 'INTERESTED'}
        </button>
      </div>
    </article>
  );
}
