import {
  useState,
  useEffect,
  useCallback,
} from 'react';

import { LED } from '@/components/primitives/Details';

import {
  mockDiscoveryFeed,
  CATEGORY_COLORS,
  timeAgo,
  daysUntil,
} from '@/data/jugaadMockData';

import { api } from '@/services/api';

import {
  Search,
  X,
  HandCoins,
  Clock,
  Star,
  Undo2,
  CheckCircle2,
} from 'lucide-react';

import { BargainModal } from '@/components/workshop/pages/BargainModal';

import { useAuth } from '@/context/AuthContext';
import { useProposals } from '@/context/ProposalContext';


// ================================================================
// SAFETY / NORMALIZATION
// ================================================================

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const poster =
    raw.poster &&
    typeof raw.poster === 'object'
      ? raw.poster
      : null;

  const creator =
    raw.creator &&
    typeof raw.creator === 'object'
      ? raw.creator
      : null;

  /*
   * IMPORTANT:
   * poster_name is the name of the person who CREATED/POSTED
   * this Jugaad.
   *
   * It must NOT use the logged-in user's name.
   */
  const posterName =
    raw.poster_name ??
    raw.posterName ??
    poster?.name ??
    creator?.name ??
    raw.creator_name ??
    raw.creatorName ??
    null;

  const posterId =
    raw.poster_id ??
    raw.posterId ??
    poster?.id ??
    creator?.id ??
    raw.creator_id ??
    raw.creatorId ??
    null;

  const posterEmail =
    raw.poster_email ??
    raw.posterEmail ??
    poster?.email ??
    creator?.email ??
    raw.creator_email ??
    raw.creatorEmail ??
    null;

  const posterRating =
    raw.poster_rating ??
    raw.posterRating ??
    poster?.rating ??
    creator?.rating ??
    raw.rating ??
    null;

  return {
    ...raw,

    id:
      raw.id ??
      raw.jugaadId ??
      raw.jugaad_id ??
      `jugaad-${Math.random()
        .toString(36)
        .slice(2)}`,

    title:
      typeof raw.title === 'string'
        ? raw.title
        : 'Untitled opportunity',

    description:
      typeof raw.description === 'string'
        ? raw.description
        : 'No description available.',

    category:
      typeof raw.category === 'string'
        ? raw.category
        : 'OTHER',

    skillRequired:
      typeof raw.skillRequired === 'string'
        ? raw.skillRequired
        : typeof raw.skill_required === 'string'
          ? raw.skill_required
          : Array.isArray(
                raw.required_skills
            )
            ? raw.required_skills.join(', ')
            : 'General',

    amount:
      raw.amount ??
      raw.budget ??
      raw.price ??
      0,

    deadline:
      raw.deadline ??
      raw.dueDate ??
      raw.due_date ??
      null,

    postedAt:
      raw.postedAt ??
      raw.posted_at ??
      raw.created_at ??
      raw.createdAt ??
      null,

    matchPercentage:
      raw.matchPercentage ??
      raw.match_percentage ??
      null,

    /*
     * Store the ACTUAL POSTER.
     */
    posterName,
    posterId,
    posterEmail,
    posterRating,

    poster:
      poster || posterName
        ? {
            ...(poster || {}),
            id:
              poster?.id ??
              posterId,
            name:
              poster?.name ??
              posterName,
            email:
              poster?.email ??
              posterEmail,
            rating:
              poster?.rating ??
              posterRating,
          }
        : null,

    creator,
  };
}


function normalizeFeed(data) {
  let list = [];

  if (Array.isArray(data)) {
    list = data;
  } else if (Array.isArray(data?.jugaads)) {
    list = data.jugaads;
  } else if (Array.isArray(data?.data)) {
    list = data.data;
  } else if (Array.isArray(data?.items)) {
    list = data.items;
  } else if (Array.isArray(data?.results)) {
    list = data.results;
  }

  return list
    .map(normalizeItem)
    .filter(Boolean);
}


function safeDaysUntil(deadline) {
  if (!deadline) {
    return 'No deadline';
  }

  try {
    return daysUntil(deadline);
  } catch {
    return 'No deadline';
  }
}


function safeTimeAgo(date) {
  if (!date) {
    return '';
  }

  try {
    return timeAgo(date);
  } catch {
    return '';
  }
}


// ================================================================
// MAIN PAGE
// ================================================================

export function FindJugaadPage() {

  const {
    user,
    isDemoMode,
    isAuthenticated,
  } = useAuth();

  const {
    sendProposal,
    getProposalForJugaad,
    refreshData,
  } = useProposals();


  const [feedItems, setFeedItems] =
    useState(() => {

      if (!isDemoMode) {
        return [];
      }

      return normalizeFeed(
        mockDiscoveryFeed
      );
    });


  const [loading, setLoading] =
    useState(!isDemoMode);


  const [hidden, setHidden] =
    useState([]);


  const [bargain, setBargain] =
    useState(null);


  const [proposalItem, setProposalItem] =
    useState(null);


  const [undo, setUndo] =
    useState(null);


  const [query, setQuery] =
    useState('');


  const [category, setCategory] =
    useState('ALL');


  // ================================================================
  // LOAD DISCOVERY FEED
  // ================================================================

  const fetchFeed = useCallback(
    async () => {

      if (isDemoMode) {

        setFeedItems(
          normalizeFeed(
            mockDiscoveryFeed
          )
        );

        setLoading(false);

        return;
      }


      if (!isAuthenticated) {

        setFeedItems([]);

        setLoading(false);

        return;
      }


      setLoading(true);


      try {

        const response =
          await api.getDiscoveryFeed();


        console.log(
          'DISCOVERY FEED RESPONSE:',
          response
        );


        const normalized =
          normalizeFeed(
            response
          );


        console.log(
          'NORMALIZED DISCOVERY FEED:',
          normalized
        );


        setFeedItems(
          normalized
        );

      } catch (error) {

        console.error(
          'Failed to load Jugaad feed:',
          error
        );

        setFeedItems([]);

      } finally {

        setLoading(false);
      }

    },
    [
      isDemoMode,
      isAuthenticated,
    ]
  );


  useEffect(() => {

    fetchFeed();

  }, [fetchFeed]);


  // ================================================================
  // CURRENT LOGGED-IN USER
  //
  // ONLY used as the HELPER when sending a proposal.
  //
  // It is NOT used as the poster displayed on cards.
  // ================================================================

  const helper = user
    ? {
        id:
          user?.id ??
          'user',

        name:
          user?.name ??
          user?.email ??
          'Student',

        initials:
          String(
            user?.name ??
            user?.email ??
            'S'
          )
            .slice(0, 2)
            .toUpperCase(),
      }

    : {
        id: 'guest',
        name: 'Guest',
        initials: 'GU',
      };


  // ================================================================
  // FILTERING
  // ================================================================

  const visible =
    feedItems.filter(
      (item) => {

        if (!item) {
          return false;
        }


        if (
          item.id !== undefined &&
          hidden.includes(item.id)
        ) {
          return false;
        }


        const search =
          query
            .trim()
            .toLowerCase();


        const matchesQuery =
          !search ||
          String(
            item.title ?? ''
          )
            .toLowerCase()
            .includes(search) ||

          String(
            item.skillRequired ?? ''
          )
            .toLowerCase()
            .includes(search) ||

          String(
            item.description ?? ''
          )
            .toLowerCase()
            .includes(search);


        const matchesCategory =
          category === 'ALL' ||
          item.category ===
            category;


        return (
          matchesQuery &&
          matchesCategory
        );
      }
    );


  // ================================================================
  // HIDE OPPORTUNITY
  // ================================================================

  const hide = async (id) => {

    if (
      id === undefined ||
      id === null
    ) {
      return;
    }


    setHidden(
      (current) => {

        if (
          current.includes(id)
        ) {
          return current;
        }

        return [
          ...current,
          id,
        ];
      }
    );


    setUndo(id);


    if (!isDemoMode) {

      try {

        await api.markNotInterested(
          id
        );

      } catch (error) {

        console.error(
          'Failed to mark not interested:',
          error
        );
      }
    }


    setTimeout(
      () => {

        setUndo(
          (current) =>
            current === id
              ? null
              : current
        );

      },
      5000
    );
  };


  // ================================================================
  // SEND PROPOSAL
  // ================================================================

  const handleSendProposal =
    async (payload) => {

      try {

        console.log(
          'FIND JUGAAD - sending proposal:',
          payload
        );


        await sendProposal({
          ...payload,
          helper,
        });


        console.log(
          'FIND JUGAAD - proposal sent successfully'
        );


        await fetchFeed();


        if (refreshData) {
          await refreshData();
        }


        setBargain(null);
        setProposalItem(null);

      } catch (error) {

        console.error(
          'FIND JUGAAD - failed to send proposal:',
          error
        );


        throw error;
      }
    };


  // ================================================================
  // SECTIONS
  // ================================================================

  const sections = [

    [
      'RECOMMENDED FOR YOU',

      visible.filter(
        (item) =>
          Number(
            item?.matchPercentage ??
            0
          ) >= 80
      ),
    ],


    [
      'BEST SKILL MATCHES',

      visible.filter(
        (item) => {

          const percentage =
            Number(
              item?.matchPercentage ??
              0
            );


          return (
            percentage >= 70 &&
            percentage < 80
          );
        }
      ),
    ],


    [
      'RECENTLY POSTED',

      visible
        .filter(
          (item) => {

            if (
              !item?.postedAt
            ) {
              return false;
            }


            return (
              String(
                item.postedAt
              ) >=
              '2026-08-21'
            );
          }
        )
        .slice(0, 4),
    ],


    [
      'ENDING SOON',

      visible.filter(
        (item) => {

          const remaining =
            safeDaysUntil(
              item?.deadline
            );


          return (
            remaining === 'today' ||
            remaining === '1 day left' ||
            remaining === '2 days left'
          );
        }
      ),
    ],


    [
      'MORE OPPORTUNITIES',
      visible,
    ],
  ];


  // ================================================================
  // RENDER
  // ================================================================

  return (
    <div>

      {/* ==========================================================
          HEADER
      ========================================================== */}

      <section className="pt-12 pb-7">

        <div className="flex items-center gap-3 mb-4">

          <LED
            color="amber"
            pulse
            size={7}
          />

          <span className="font-technical text-[9px] text-ink-2">
            02 — CAMPUS OPPORTUNITY FEED
          </span>

        </div>


        <h1 className="font-display text-4xl sm:text-5xl">

          FIND A

          <br />

          <span className="text-amber">
            JUGAAD.
          </span>

        </h1>


        <p className="mt-4 max-w-xl text-sm text-ink-2">
          Opportunities selected for you.
          Discover work posted by other
          students, then choose how you want
          to approach it.
        </p>

      </section>


      {/* ==========================================================
          SEARCH + CATEGORY
      ========================================================== */}

      <div className="surface-panel rounded-xl p-3 flex flex-col sm:flex-row gap-3 mb-8">

        <div className="flex items-center flex-1 rounded-lg bg-bg-1 border border-metal-1">

          <Search
            size={14}
            className="ml-3 text-ink-3"
          />


          <input
            value={query}

            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }

            placeholder="Search opportunities or skills..."

            className="w-full bg-transparent px-3 py-2.5 font-mono text-xs outline-none text-ink-0"
          />

        </div>


        <div className="flex flex-wrap gap-1.5">

          {[
            'ALL',
            'CODE',
            'DESIGN',
            'VIDEO',
            'ACADEMICS',
            'PRESENTATION',
            'OTHER',
          ].map(
            (currentCategory) => (

              <button
                key={
                  currentCategory
                }

                type="button"

                onClick={() =>
                  setCategory(
                    currentCategory
                  )
                }

                className={`px-2.5 py-2 rounded-md font-technical text-[8px] ${
                  category ===
                  currentCategory
                    ? 'bg-amber text-bg-0'
                    : 'bg-bg-2 text-ink-3 border border-metal-1'
                }`}
              >
                {currentCategory}
              </button>

            )
          )}

        </div>

      </div>


      {/* ==========================================================
          UNDO
      ========================================================== */}

      {undo !== null && (

        <div className="mb-4 flex items-center justify-between surface-wood rounded-lg px-4 py-3">

          <span className="font-mono text-[10px] text-paper">
            Opportunity hidden from your feed.
          </span>


          <button
            type="button"

            onClick={() => {

              setHidden(
                (current) =>
                  current.filter(
                    (id) =>
                      id !== undo
                  )
              );

              setUndo(null);
            }}

            className="flex items-center gap-1.5 font-technical text-[8px] text-amber"
          >
            <Undo2 size={12} />

            UNDO
          </button>

        </div>

      )}


      {/* ==========================================================
          FEED
      ========================================================== */}

      {loading ? (

        <div className="py-16 text-center">

          <p className="font-mono text-sm text-ink-2">
            Loading opportunities...
          </p>

        </div>

      ) : (

        <div className="space-y-9">

          {sections.map(
            ([title, items]) => {

              if (
                !Array.isArray(
                  items
                ) ||
                items.length === 0
              ) {
                return null;
              }


              return (

                <section
                  key={title}
                >

                  <div className="flex items-center gap-2 mb-3">

                    <span className="font-technical text-[9px] text-ink-0">
                      {title}
                    </span>


                    <span className="font-mono text-[8px] text-ink-3">
                      ({items.length})
                    </span>


                    <span className="h-px flex-1 bg-metal-1/40" />

                  </div>


                  <div className="grid lg:grid-cols-2 gap-3">

                    {items.map(
                      (item) => {

                        if (!item) {
                          return null;
                        }


                        let existingProposal =
                          null;


                        try {

                          existingProposal =
                            getProposalForJugaad(
                              item.id
                            );

                        } catch (error) {

                          console.error(
                            'Failed to get proposal:',
                            error
                          );
                        }


                        return (

                          <OpportunityCard
                            key={item.id}

                            item={item}

                            existingProposal={
                              existingProposal
                            }

                            onHide={() =>
                              hide(
                                item.id
                              )
                            }

                            onBargain={() =>
                              setBargain(
                                item
                              )
                            }

                            onInterest={() => {

                              console.log(
                                'INTERESTED clicked:',
                                item
                              );

                              setProposalItem(
                                item
                              );
                            }}
                          />

                        );
                      }
                    )}

                  </div>

                </section>

              );
            }
          )}

        </div>
      )}


      {/* ==========================================================
          EMPTY STATE
      ========================================================== */}

      {!loading &&
        visible.length === 0 && (

          <div className="py-16 text-center">

            <Search
              size={32}
              className="mx-auto text-ink-3 mb-3"
            />

            <p className="font-mono text-sm text-ink-2">
              No opportunities match this view.
            </p>

          </div>

        )}


      {/* ==========================================================
          BARGAIN MODAL
      ========================================================== */}

      {bargain && (

        <BargainModal

          item={bargain}

          mode="bargain"

          onClose={() =>
            setBargain(null)
          }

          onSend={
            handleSendProposal
          }

        />

      )}


      {/* ==========================================================
          INTERESTED / PROPOSAL MODAL
      ========================================================== */}

      {proposalItem && (

        <BargainModal

          item={proposalItem}

          mode="interest"

          onClose={() =>
            setProposalItem(null)
          }

          onSend={
            handleSendProposal
          }

        />

      )}

    </div>
  );
}


// ================================================================
// OPPORTUNITY CARD
// ================================================================

function OpportunityCard({
  item,
  existingProposal,
  onInterest,
  onHide,
  onBargain,
}) {

  if (
    !item ||
    typeof item !== 'object'
  ) {
    return null;
  }


  const category =
    typeof item.category === 'string'
      ? item.category
      : 'OTHER';


  const color =
    CATEGORY_COLORS?.[
      category
    ] || 'amber';


  const proposalSent =
    Boolean(
      existingProposal
    );


  const proposalStatus =
    existingProposal?.status ??
    null;


  // ============================================================
  // POSTER
  // ============================================================
  //
  // THIS IS THE PERSON WHO POSTED THE JUGAAD.
  //
  // It is deliberately NOT taken from `user`.
  // ============================================================

  const posterName =
    item?.poster_name ??
    item?.posterName ??
    item?.poster?.name ??
    item?.creator_name ??
    item?.creatorName ??
    item?.creator?.name ??
    'Student';


  const posterInitials =
  (
    item?.poster?.initials ??
    item?.poster_initials ??
    item?.posterInitials ??
    String(posterName)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(
        (part) => part[0]
      )
      .join('')
      .slice(0, 2)
      .toUpperCase()
  ) || 'ST';


  const posterRating =
    item?.poster_rating ??
    item?.posterRating ??
    item?.poster?.rating ??
    item?.rating ??
    '4.8';


  const categoryChar =
    category.charAt(0) ||
    'J';


  // ============================================================
  // CARD
  // ============================================================

  return (

    <article

      className="surface-metal-brushed rounded-2xl p-5 relative"

      style={{
        border:
          `1px solid color-mix(in srgb, var(--${color}) 22%, transparent)`,
      }}

    >

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex items-start justify-between gap-3">

        <div className="flex gap-3">

          <span

            className="grid place-items-center w-11 h-11 rounded-xl shrink-0"

            style={{
              background:
                `color-mix(in srgb, var(--${color}) 14%, transparent)`,

              color:
                `var(--${color})`,
            }}

          >

            <span className="font-display text-lg">
              {categoryChar}
            </span>

          </span>


          <div>

            <h2 className="font-display text-lg text-ink-0 leading-tight">
              {item?.title ||
                'Untitled opportunity'}
            </h2>


            <div className="flex flex-wrap items-center gap-2 mt-1.5">

              <span

                className="font-technical text-[7px] px-1.5 py-1 rounded"

                style={{
                  background:
                    `var(--${color})`,

                  color:
                    'var(--bg-0)',
                }}

              >
                {category}
              </span>


              <span className="font-mono text-[8px] text-ink-3">
                {item?.skillRequired ||
                  'General'}
              </span>

            </div>

          </div>

        </div>


        {item?.matchPercentage !=
          null && (

          <span className="font-mono text-[9px] text-mint">
            {item.matchPercentage}%
            match
          </span>

        )}

      </div>


      {/* ========================================================
          DESCRIPTION
      ======================================================== */}

      <p className="font-mono text-[10px] leading-relaxed text-ink-2 mt-4">

        {item?.description ||
          'No description available.'}

      </p>


      {/* ========================================================
          META
      ======================================================== */}

      <div className="flex flex-wrap items-center gap-3 mt-4 text-[9px] font-mono text-ink-3">

        <span className="text-amber font-display text-lg">
          ₹{item?.amount ?? 0}
        </span>


        <span className="flex items-center gap-1">

          <Clock size={11} />

          {safeDaysUntil(
            item?.deadline
          )}

        </span>


        <span className="flex items-center gap-1">

          <Star
            size={11}
            className="text-amber fill-amber"
          />

          {posterRating}

        </span>


        {safeTimeAgo(
          item?.postedAt ??
          item?.created_at ??
          item?.createdAt
        ) && (

          <span>

            {safeTimeAgo(
              item?.postedAt ??
              item?.created_at ??
              item?.createdAt
            )}

          </span>

        )}

      </div>


      {/* ========================================================
          PROPOSAL STATUS
      ======================================================== */}

      {proposalSent && (

        <div className="mt-3 surface-panel rounded-lg px-3 py-2 flex items-center gap-2">

          <CheckCircle2

            size={13}

            className={
              proposalStatus ===
              'accepted'
                ? 'text-mint'
                : proposalStatus ===
                    'rejected'
                  ? 'text-coral'
                  : 'text-amber'
            }

          />


          <span className="font-mono text-[9px] text-ink-2">

            {proposalStatus ===
            'accepted'

              ? 'Proposal Accepted — check My Requests to message'

              : proposalStatus ===
                  'rejected'

                ? 'Proposal Rejected'

                : proposalStatus ===
                    'counter-offer'

                  ? 'Counter offer received — check My Requests'

                  : 'Proposal Sent — see status in My Requests'}

          </span>

        </div>

      )}


      {/* ========================================================
          FOOTER
      ======================================================== */}

      <div className="mt-4 pt-3 border-t border-metal-1/40 flex items-center gap-2">

        {/* Poster avatar */}

        <span className="grid place-items-center w-6 h-6 rounded-full bg-amber text-bg-0 font-display text-[8px]">
          {posterInitials}
        </span>


        {/* POSTER'S NAME */}

        <span className="font-mono text-[9px] text-ink-1 flex-1">
          {posterName}
        </span>


        {/* ======================================================
            NOT INTERESTED
        ====================================================== */}

        <button

          type="button"

          onClick={onHide}

          aria-label="Not interested"

          className="grid place-items-center w-8 h-8 rounded-lg text-ink-3 hover:text-coral hover:bg-coral/10"

        >

          <X size={14} />

        </button>


        {/* ======================================================
            BARGAIN
        ====================================================== */}

        <button

          type="button"

          onClick={onBargain}

          disabled={proposalSent}

          className="flex items-center gap-1 rounded-lg px-3 py-2 font-technical text-[8px] text-amber border border-amber/30 hover:bg-amber/10 disabled:opacity-40"

        >

          <HandCoins size={12} />

          BARGAIN

        </button>


        {/* ======================================================
            INTERESTED
        ====================================================== */}

        <button

          type="button"

          onClick={onInterest}

          disabled={proposalSent}

          className={`flex items-center gap-1 rounded-lg px-3 py-2 font-technical text-[8px] ${
            proposalSent
              ? 'bg-mint/15 text-mint border border-mint/30'
              : 'bg-amber text-bg-0 hover:bg-amber-soft'
          } disabled:cursor-default`}

        >

          {proposalSent ? (

            <CheckCircle2
              size={12}
            />

          ) : (

            <span className="text-xs">
              ♥
            </span>

          )}


          {proposalSent
            ? 'PROPOSAL SENT'
            : 'INTERESTED'}

        </button>

      </div>

    </article>
  );
}


export default FindJugaadPage;