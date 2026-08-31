import {
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

import {
  LED,
  Rivet,
} from '@/components/primitives/Details';

import {
  mockDashboardNotifications,
} from '@/data/jugaadMockData';

import { api } from '@/services/api';

import {
  Home,
  Search,
  Plus,
  ClipboardList,
  Inbox,
  Send,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Settings,
} from 'lucide-react';

import {
  useState,
  useEffect,
  useCallback,
} from 'react';


/* ================================================================
   NAVIGATION ITEMS
================================================================ */

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'HOME',
    icon: Home,
    path: '/dashboard',
  },

  {
    id: 'find-jugaad',
    label: 'FIND A JUGAAD',
    icon: Search,
    path: '/dashboard/find-jugaad',
  },

  {
    id: 'post-jugaad',
    label: 'POST A JUGAAD',
    icon: Plus,
    path: '/dashboard/post-jugaad',
  },

  {
    id: 'my-jugaads',
    label: 'MY JUGAADS',
    icon: ClipboardList,
    path: '/dashboard/my-jugaads',
  },

  {
    id: 'requests',
    label: 'REQUESTS',
    icon: Inbox,
    path: '/dashboard/requests',
  },

  {
    id: 'my-requests',
    label: 'MY REQUESTS',
    icon: Send,
    path: '/dashboard/my-requests',
  },

  {
    id: 'profile',
    label: 'PROFILE',
    icon: User,
    path: '/profile',
  },

  {
    id: 'settings',
    label: 'SETTINGS',
    icon: Settings,
    path: '/settings',
  },
];


/* ================================================================
   WORKSHOP NAVIGATION
================================================================ */

export function WorkshopNav() {
  const {
    user,
    logout,
    isDemoMode,
    isAuthenticated,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();


  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const [
    notifOpen,
    setNotifOpen,
  ] = useState(false);

  const [
    msgOpen,
    setMsgOpen,
  ] = useState(false);


  const [
    notifications,
    setNotifications,
  ] = useState(
    isDemoMode
      ? mockDashboardNotifications
      : []
  );


  /* ==============================================================
     FETCH NOTIFICATIONS
  ============================================================== */

  const fetchNotifications =
    useCallback(
      async () => {

        if (isDemoMode) {
          setNotifications(
            mockDashboardNotifications
          );

          return;
        }


        if (!isAuthenticated) {
          setNotifications([]);

          return;
        }


        try {

          const data =
            await api.getNotifications();


          const list =
            data?.notifications ||
            data?.data ||
            (
              Array.isArray(data)
                ? data
                : []
            );


          setNotifications(
            Array.isArray(list)
              ? list
              : []
          );

        } catch (error) {

          /*
           * Notification fetching is
           * background-only, so don't
           * break the navbar if it fails.
           */

          console.error(
            'Failed to fetch notifications:',
            error
          );
        }
      },
      [
        isDemoMode,
        isAuthenticated,
      ]
    );


  /* ==============================================================
     INITIAL NOTIFICATION LOAD
  ============================================================== */

  useEffect(() => {
    fetchNotifications();
  }, [
    fetchNotifications,
  ]);


  /* ==============================================================
     UNREAD NOTIFICATIONS
  ============================================================== */

  const unreadNotifs =
    notifications.filter(
      (notification) =>
        notification.unread ||
        notification.is_read === false ||
        notification.read === false
    ).length;


  /* ==============================================================
     MARK ALL NOTIFICATIONS READ
  ============================================================== */

  const handleMarkAllRead =
    async () => {

      if (isDemoMode) {

        setNotifications(
          (prev) =>
            prev.map(
              (notification) => ({
                ...notification,
                unread: false,
                is_read: true,
                read: true,
              })
            )
        );

        setNotifOpen(false);

        return;
      }


      try {

        await Promise.allSettled(
          notifications
            .filter(
              (notification) =>
                notification.unread ||
                notification.is_read === false ||
                notification.read === false
            )
            .map(
              (notification) =>
                api.markNotificationRead(
                  notification.id
                )
            )
        );


        setNotifications(
          (prev) =>
            prev.map(
              (notification) => ({
                ...notification,
                unread: false,
                is_read: true,
                read: true,
              })
            )
        );

      } catch (error) {

        console.error(
          'Failed to mark notifications as read:',
          error
        );
      }


      setNotifOpen(false);
    };


  /* ==============================================================
     ACTIVE NAVIGATION ITEM
  ============================================================== */

  const getActiveId =
    () => {

      const path =
        location.pathname;


      if (
        path ===
        '/dashboard'
      ) {
        return 'dashboard';
      }


      if (
        path.includes(
          'find-jugaad'
        )
      ) {
        return 'find-jugaad';
      }


      if (
        path.includes(
          'post-jugaad'
        )
      ) {
        return 'post-jugaad';
      }


      if (
        path.includes(
          'my-jugaads'
        )
      ) {
        return 'my-jugaads';
      }


      if (
        path.includes(
          'my-requests'
        )
      ) {
        return 'my-requests';
      }


      if (
        path.includes(
          'requests'
        )
      ) {
        return 'requests';
      }


      if (
        path.includes(
          'messages'
        )
      ) {
        return 'messages';
      }


      if (
        path.includes(
          'profile'
        )
      ) {
        return 'profile';
      }


      if (
        path.includes(
          'settings'
        )
      ) {
        return 'settings';
      }


      return null;
    };


  const activeId =
    getActiveId();


  /* ==============================================================
     LOGOUT
  ============================================================== */

  const handleLogout =
    () => {

      logout();

      navigate('/');
    };


  /* ==============================================================
     CLOSE ALL OVERLAYS
  ============================================================== */

  const closeAll =
    () => {

      setMobileOpen(false);

      setNotifOpen(false);

      setMsgOpen(false);
    };


  /* ==============================================================
     NOTIFICATION LINK
  ============================================================== */

  const getNotifLink =
    (notification) => {

      if (
        notification.conversationId ||
        notification.conversation_id
      ) {

        const conversationId =
          notification.conversationId ||
          notification.conversation_id;

        return `/dashboard/messages/${conversationId}`;
      }


      if (
        notification.jugaadId &&
        notification.jugaadId.startsWith(
          'JG-1'
        )
      ) {
        return '/dashboard/my-jugaads';
      }


      if (
        notification.jugaadId &&
        notification.jugaadId.startsWith(
          'JG-2'
        )
      ) {
        return '/dashboard/my-requests';
      }


      return '/dashboard';
    };


  /* ================================================================
     CURRENT USER NAME
  ================================================================ */

  /*
   * Important:
   *
   * Never use "Operator" as a fake fallback.
   *
   * The authenticated user's actual name
   * should always be displayed.
   */

  const displayName =
    user?.name?.trim() ||
    'Guest';


  const initials =
    user?.name
      ?.trim()
      ?.slice(0, 2)
      ?.toUpperCase() ||
    'U';


  /* ================================================================
     RENDER
  ================================================================ */

  return (
    <>
      {/* ============================================================
          DESKTOP / MAIN NAVBAR
      ============================================================ */}

      <header className="sticky top-0 z-50 px-4 pt-4">

        <nav className="surface-metal-brushed metal-scratches relative max-w-7xl mx-auto rounded-2xl px-4 sm:px-5 py-2.5 flex items-center justify-between gap-2">

          {/* RIVETS */}

          <Rivet
            size={7}
            className="absolute top-2 left-2"
          />

          <Rivet
            size={7}
            className="absolute top-2 right-2"
          />

          <Rivet
            size={7}
            className="absolute bottom-2 left-2"
          />

          <Rivet
            size={7}
            className="absolute bottom-2 right-2"
          />


          {/* ========================================================
              BRAND
          ======================================================== */}

          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0"
          >

            <span
              className="grid place-items-center w-7 h-7 rounded-lg"
              style={{
                background:
                  'linear-gradient(135deg, var(--amber), var(--amber-deep))',
              }}
            >

              <span className="font-display text-bg-0 text-xs leading-none">
                J
              </span>

            </span>


            <div className="hidden sm:flex flex-col leading-none">

              <span className="font-display text-xs tracking-tight text-ink-0">
                CAMPUS
                <span className="text-amber">
                  VAULT
                </span>
              </span>


              <span className="font-technical text-[6px] text-ink-3 mt-0.5">
                WORKSHOP
              </span>

            </div>

          </Link>


          {/* ========================================================
              DESKTOP NAV ITEMS
          ======================================================== */}

          <div className="hidden lg:flex items-center gap-0.5">

            {NAV_ITEMS.map(
              (item) => {

                const isActive =
                  activeId ===
                  item.id;


                return (
                  <Link
                    key={
                      item.id
                    }
                    to={
                      item.path
                    }
                    className={`
                      group
                      relative
                      flex
                      items-center
                      gap-1.5
                      px-2.5
                      py-2
                      rounded-lg
                      transition-colors
                      ${
                        isActive
                          ? 'text-amber-soft'
                          : 'text-ink-1 hover:text-ink-0'
                      }
                    `}
                  >

                    {item.icon && (
                      <item.icon
                        size={12}
                      />
                    )}


                    <span className="font-technical text-[8px]">
                      {
                        item.label
                      }
                    </span>


                    {isActive && (
                      <LED
                        color="amber"
                        size={4}
                        className="absolute -top-0.5 left-1/2 -translate-x-1/2"
                      />
                    )}

                  </Link>
                );
              }
            )}

          </div>


          {/* ========================================================
              RIGHT SIDE
          ======================================================== */}

          <div className="hidden lg:flex items-center gap-1.5 shrink-0">

            {/* ======================================================
                NOTIFICATIONS
            ====================================================== */}

            <button
              type="button"
              onClick={() => {
                setNotifOpen(
                  (value) =>
                    !value
                );

                setMsgOpen(false);
              }}
              className="relative grid place-items-center w-8 h-8 rounded-lg text-ink-1 hover:text-ink-0 transition-colors"
              style={{
                background:
                  notifOpen
                    ? 'rgba(214,138,60,0.08)'
                    : 'rgba(255,255,255,0.03)',
              }}
              aria-label="Notifications"
            >

              <Bell
                size={14}
              />


              {unreadNotifs >
                0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 grid place-items-center w-3.5 h-3.5 rounded-full text-[7px] font-bold text-bg-0"
                  style={{
                    background:
                      'var(--coral)',
                  }}
                >
                  {
                    unreadNotifs
                  }
                </span>
              )}

            </button>


            {/* ======================================================
                MESSAGES
            ====================================================== */}

            <Link
              to="/dashboard/messages"
              onClick={
                closeAll
              }
              className="relative grid place-items-center w-8 h-8 rounded-lg text-ink-1 hover:text-mint-soft transition-colors"
              style={{
                background:
                  activeId ===
                  'messages'
                    ? 'rgba(93,184,154,0.08)'
                    : 'rgba(255,255,255,0.03)',
              }}
              aria-label="Messages"
            >

              <MessageSquare
                size={14}
              />

            </Link>


            <div className="w-px h-5 bg-metal-1/40 mx-0.5" />


            {/* ======================================================
                USER
            ====================================================== */}

            <Link
              to="/profile"
              onClick={
                closeAll
              }
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
              style={{
                background:
                  activeId ===
                  'profile'
                    ? 'rgba(214,138,60,0.08)'
                    : 'rgba(255,255,255,0.03)',
              }}
            >

              <span
                className="grid place-items-center w-6 h-6 rounded-full text-bg-0 font-display text-[9px]"
                style={{
                  background:
                    'linear-gradient(135deg, var(--amber), var(--amber-deep))',
                }}
              >
                {initials}
              </span>


              <span className="font-mono text-[9px] text-ink-0 max-w-[100px] truncate">
                {displayName}
              </span>


              {isDemoMode && (
                <span
                  className="font-technical text-[6px] text-amber px-1.5 py-0.5 rounded"
                  style={{
                    border:
                      '1px solid rgba(214,138,60,0.4)',
                    background:
                      'rgba(214,138,60,0.1)',
                  }}
                >
                  DEMO
                </span>
              )}

            </Link>


            {/* ======================================================
                LOGOUT
            ====================================================== */}

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="grid place-items-center w-8 h-8 rounded-lg text-ink-1 hover:text-coral-soft transition-colors"
              style={{
                background:
                  'rgba(255,255,255,0.03)',
              }}
              aria-label="Logout"
            >

              <LogOut
                size={14}
              />

            </button>

          </div>


          {/* ========================================================
              MOBILE TOGGLE
          ======================================================== */}

          <button
            type="button"
            className="lg:hidden grid place-items-center w-8 h-8 rounded-lg text-ink-0"
            style={{
              background:
                'rgba(255,255,255,0.04)',
              border:
                '1px solid rgba(107,118,137,0.4)',
            }}
            onClick={() =>
              setMobileOpen(
                (value) =>
                  !value
              )
            }
            aria-label={
              mobileOpen
                ? 'Close'
                : 'Open menu'
            }
          >

            {mobileOpen ? (
              <X size={16} />
            ) : (
              <Menu size={16} />
            )}

          </button>

        </nav>


        {/* ==========================================================
            NOTIFICATIONS PANEL
        ========================================================== */}

        {notifOpen && (
          <div className="hidden lg:block absolute top-full right-20 mt-2 w-80 surface-panel rounded-2xl p-4 anim-reveal z-50 shadow-2xl">

            <div className="flex items-center justify-between mb-3 pb-3 border-b border-metal-2/30">

              <div className="flex items-center gap-2">

                <Bell
                  size={13}
                  className="text-amber"
                />

                <span className="font-technical text-[9px] text-ink-0">
                  NOTIFICATIONS
                </span>

              </div>


              <button
                type="button"
                className="font-technical text-[7px] text-mint hover:text-mint-soft transition-colors"
                onClick={
                  handleMarkAllRead
                }
              >
                MARK ALL READ
              </button>

            </div>


            <div className="space-y-2.5 max-h-64 overflow-y-auto">

              {notifications.length ===
              0 ? (

                <div className="py-8 text-center font-mono text-[10px] text-ink-3">
                  No notifications yet.
                </div>

              ) : (

                notifications.map(
                  (notification) => (

                    <Link
                      key={
                        notification.id
                      }
                      to={
                        getNotifLink(
                          notification
                        )
                      }
                      onClick={() =>
                        setNotifOpen(
                          false
                        )
                      }
                      className="flex items-start gap-2.5 surface-metal rounded-lg p-2.5 hover:border-amber/30 transition-colors"
                      style={{
                        border:
                          '1px solid transparent',
                      }}
                    >

                      <span className="text-sm leading-none mt-0.5">
                        {
                          notification.emoji ||
                          '🔔'
                        }
                      </span>


                      <div className="flex-1 min-w-0">

                        <p className="font-mono text-[10px] text-ink-1 leading-snug">
                          {
                            notification.text ||
                            notification.message ||
                            notification.title
                          }
                        </p>


                        <p className="font-mono text-[8px] text-ink-3 mt-0.5">
                          {
                            timeAgoShort(
                              notification.timestamp ||
                              notification.created_at ||
                              notification.createdAt
                            )
                          }
                        </p>

                      </div>


                      {(
                        notification.unread ||
                        notification.is_read === false ||
                        notification.read === false
                      ) && (

                        <span className="w-2 h-2 rounded-full bg-coral shrink-0 mt-1" />

                      )}

                    </Link>

                  )
                )

              )}

            </div>


            <button
              type="button"
              onClick={() =>
                setNotifOpen(
                  false
                )
              }
              className="absolute -top-2 -right-2 grid place-items-center w-7 h-7 rounded-full surface-metal text-ink-2 hover:text-ink-0 text-xs"
              aria-label="Close"
            >
              ✕
            </button>

          </div>
        )}


        {/* ==========================================================
            MOBILE MENU
        ========================================================== */}

        {mobileOpen && (
          <div className="lg:hidden absolute top-full left-4 right-4 mt-2 surface-panel rounded-2xl p-4 flex flex-col gap-1 anim-reveal z-50">

            <span className="font-technical text-[7px] text-ink-3 px-3 pt-1 pb-0.5">
              WORKSHOP
            </span>


            {NAV_ITEMS.map(
              (item) => {

                const isActive =
                  activeId ===
                  item.id;


                return (
                  <Link
                    key={
                      item.id
                    }
                    to={
                      item.path
                    }
                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }
                    className={`
                      flex
                      items-center
                      gap-2.5
                      px-3
                      py-2.5
                      rounded-lg
                      transition-colors
                      ${
                        isActive
                          ? 'text-amber-soft bg-white/5'
                          : 'text-ink-0 hover:text-amber-soft'
                      }
                    `}
                  >

                    {item.icon && (
                      <item.icon
                        size={14}
                      />
                    )}


                    <span className="font-technical text-[10px]">
                      {
                        item.label
                      }
                    </span>


                    {isActive && (
                      <LED
                        color="amber"
                        size={4}
                      />
                    )}

                  </Link>
                );
              }
            )}


            <div className="h-px bg-metal-1 my-1" />


            <span className="font-technical text-[7px] text-ink-3 px-3 pt-1 pb-0.5">
              PERSONAL
            </span>


            <Link
              to="/dashboard/messages"
              onClick={() =>
                setMobileOpen(
                  false
                )
              }
              className={`
                flex
                items-center
                gap-2.5
                px-3
                py-2.5
                rounded-lg
                transition-colors
                ${
                  activeId ===
                  'messages'
                    ? 'text-mint-soft bg-white/5'
                    : 'text-ink-0 hover:text-mint-soft'
                }
              `}
            >

              <MessageSquare
                size={14}
              />

              <span className="font-technical text-[10px]">
                MESSAGES
              </span>

            </Link>


            <Link
              to="/profile"
              onClick={() =>
                setMobileOpen(
                  false
                )
              }
              className={`
                flex
                items-center
                gap-2.5
                px-3
                py-2.5
                rounded-lg
                transition-colors
                ${
                  activeId ===
                  'profile'
                    ? 'text-amber-soft bg-white/5'
                    : 'text-ink-0 hover:text-amber-soft'
                }
              `}
            >

              <User
                size={14}
              />

              <span className="font-technical text-[10px]">
                PROFILE
              </span>

            </Link>


            <Link
              to="/settings"
              onClick={() =>
                setMobileOpen(
                  false
                )
              }
              className={`
                flex
                items-center
                gap-2.5
                px-3
                py-2.5
                rounded-lg
                transition-colors
                ${
                  activeId ===
                  'settings'
                    ? 'text-amber-soft bg-white/5'
                    : 'text-ink-0 hover:text-amber-soft'
                }
              `}
            >

              <Settings
                size={14}
              />

              <span className="font-technical text-[10px]">
                SETTINGS
              </span>

            </Link>


            <div className="h-px bg-metal-1 my-1" />


            <button
              type="button"
              onClick={
                handleLogout
              }
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-ink-1 hover:text-coral-soft transition-colors"
            >

              <LogOut
                size={14}
              />

              <span className="font-technical text-[10px]">
                EXIT WORKSHOP
              </span>

            </button>

          </div>
        )}

      </header>
    </>
  );
}


/* ================================================================
   RELATIVE TIME
================================================================ */

function timeAgoShort(
  isoString
) {
  if (!isoString) {
    return '';
  }


  const now =
    new Date();

  const then =
    new Date(
      isoString
    );


  if (
    Number.isNaN(
      then.getTime()
    )
  ) {
    return '';
  }


  const diffMs =
    now.getTime() -
    then.getTime();


  const diffMin =
    Math.floor(
      diffMs /
        60000
    );


  const diffHr =
    Math.floor(
      diffMin / 60
    );


  const diffDay =
    Math.floor(
      diffHr / 24
    );


  if (diffMin < 1) {
    return 'just now';
  }


  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }


  if (diffHr < 24) {
    return `${diffHr}h ago`;
  }


  return `${diffDay}d ago`;
}


export default WorkshopNav;