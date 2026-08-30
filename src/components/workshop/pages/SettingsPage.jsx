import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  useNavigate,
  Link,
} from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

import { api } from '@/services/api';

import { LED } from '@/components/primitives/Details';

import {
  mockSettings,
  PREFERRED_CATEGORIES,
  BUDGET_RANGES,
  WORK_TYPES,
  NOTIF_FREQUENCIES,
  PROFILE_VISIBILITY_OPTIONS,
} from '@/data/jugaadMockData';

import {
  User,
  Bell,
  Shield,
  Lock,
  Palette,
  Sliders,
  Accessibility,
  Database,
  LogOut,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Download,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';


// ================================================================
// STORAGE KEYS
// ================================================================

const SETTINGS_KEY =
  'campusjugaad_settings';

const THEME_KEY =
  'campusjugaad_theme';


// ================================================================
// SETTINGS CATEGORIES
// ================================================================

const CATEGORIES = [
  {
    id: 'account',
    label: 'ACCOUNT',
    icon: User,
  },
  {
    id: 'notifications',
    label: 'NOTIFICATIONS',
    icon: Bell,
  },
  {
    id: 'privacy',
    label: 'PRIVACY',
    icon: Shield,
  },
  {
    id: 'security',
    label: 'SECURITY',
    icon: Lock,
  },
  {
    id: 'appearance',
    label: 'APPEARANCE',
    icon: Palette,
  },
  {
    id: 'preferences',
    label: 'PREFERENCES',
    icon: Sliders,
  },
  {
    id: 'accessibility',
    label: 'ACCESSIBILITY',
    icon: Accessibility,
  },
  {
    id: 'data',
    label: 'DATA & ACCOUNT',
    icon: Database,
  },
];


// ================================================================
// LOAD SETTINGS
// ================================================================

function loadSettings() {
  try {

    const raw =
      localStorage.getItem(
        SETTINGS_KEY
      );


    if (raw) {

      const saved =
        JSON.parse(raw);


      return {

        notifications: {
          ...mockSettings.notifications,
          ...(saved.notifications || {}),
        },

        privacy: {
          ...mockSettings.privacy,
          ...(saved.privacy || {}),
        },

        appearance: {
          ...mockSettings.appearance,
          ...(saved.appearance || {}),
        },

        preferences: {
          ...mockSettings.preferences,
          ...(saved.preferences || {}),
        },

        accessibility: {
          ...mockSettings.accessibility,
          ...(saved.accessibility || {}),
        },

      };
    }

  } catch (error) {

    console.error(
      'Failed to load settings:',
      error
    );

  }


  return JSON.parse(
    JSON.stringify(
      mockSettings
    )
  );
}


// ================================================================
// SAVE SETTINGS
// ================================================================

function saveSettings(
  settings
) {

  try {

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(
        settings
      )
    );

  } catch (error) {

    console.error(
      'Failed to save settings:',
      error
    );

  }
}


// ================================================================
// APPLY THEME
// ================================================================

function applyTheme(
  theme
) {

  const root =
    document.documentElement;


  if (
    theme === 'light'
  ) {

    root.setAttribute(
      'data-theme',
      'light'
    );

  } else if (
    theme === 'system'
  ) {

    const prefersLight =
      window.matchMedia &&
      window.matchMedia(
        '(prefers-color-scheme: light)'
      ).matches;


    root.setAttribute(
      'data-theme',
      prefersLight
        ? 'light'
        : 'dark'
    );

  } else {

    root.setAttribute(
      'data-theme',
      'dark'
    );

  }


  localStorage.setItem(
    THEME_KEY,
    theme
  );
}


// ================================================================
// SETTINGS PAGE
// ================================================================

export function SettingsPage() {

  const {
    user,
    logout,
  } = useAuth();


  const navigate =
    useNavigate();


  const [
    active,
    setActive,
  ] = useState(
    'account'
  );


  const [
    settings,
    setSettings,
  ] = useState(
    loadSettings
  );


  // ================================================================
  // NOTIFICATION PREFERENCES
  // ================================================================

  const [
    notificationPreferences,
    setNotificationPreferences,
  ] = useState({

    interestRequestNotifications: true,
    proposalNotifications: true,
    acceptedProposalNotifications: true,
    rejectedProposalNotifications: true,
    counterOfferNotifications: true,
    messageNotifications: true,
    jugaadTaskNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,

  });


  const [
    notificationPreferencesLoading,
    setNotificationPreferencesLoading,
  ] = useState(false);


  const [
    notificationPreferencesSaving,
    setNotificationPreferencesSaving,
  ] = useState(false);


  const [
    toast,
    setToast,
  ] = useState(null);


  const toastTimer =
    useRef(null);


  // ==============================================================
  // UPDATE SETTING
  // ==============================================================

  const updateSettings =
    useCallback(
      (
        category,
        key,
        value
      ) => {

        setSettings(
          (current) => {

            const next = {

              ...current,

              [category]: {

                ...current[category],

                [key]: value,

              },

            };


            saveSettings(
              next
            );


            return next;

          }
        );


        showSavedToast();

      },
      []
    );


  // ==============================================================
  // SHOW SAVED TOAST
  // ==============================================================

  const showSavedToast =
    useCallback(
      (
        message =
          'Settings saved'
      ) => {

        setToast(
          message
        );


        if (
          toastTimer.current
        ) {

          clearTimeout(
            toastTimer.current
          );

        }


        toastTimer.current =
          setTimeout(
            () => {

              setToast(
                null
              );

            },
            2500
          );

      },
      []
    );


  // ================================================================
  // LOAD NOTIFICATION PREFERENCES FROM BACKEND
  // ================================================================

  useEffect(() => {

    let cancelled = false;

    const loadNotificationPreferences = async () => {

      try {

        setNotificationPreferencesLoading(true);

        const response =
          await api.getNotificationPreferences();

        if (cancelled) {
          return;
        }

        const data =
          response?.data?.data ??
          response?.data ??
          response;

        setNotificationPreferences({

          interestRequestNotifications:
            Boolean(
              data?.interestRequestNotifications
            ),

          proposalNotifications:
            Boolean(
              data?.proposalNotifications
            ),

          acceptedProposalNotifications:
            Boolean(
              data?.acceptedProposalNotifications
            ),

          rejectedProposalNotifications:
            Boolean(
              data?.rejectedProposalNotifications
            ),

          counterOfferNotifications:
            Boolean(
              data?.counterOfferNotifications
            ),

          messageNotifications:
            Boolean(
              data?.messageNotifications
            ),

          jugaadTaskNotifications:
            Boolean(
              data?.jugaadTaskNotifications
            ),

          emailNotifications:
            Boolean(
              data?.emailNotifications
            ),

          inAppNotifications:
            Boolean(
              data?.inAppNotifications
            ),

        });

      } catch (error) {

        console.error(
          'Failed to load notification preferences:',
          error
        );

      } finally {

        if (!cancelled) {

          setNotificationPreferencesLoading(false);

        }

      }

    };


    if (user?.id) {

      loadNotificationPreferences();

    }


    return () => {

      cancelled = true;

    };

  }, [user?.id]);


  // ================================================================
  // UPDATE NOTIFICATION PREFERENCE
  // ================================================================

  const updateNotificationPreference = useCallback(
    async (key, value) => {

      const previous =
        notificationPreferences;

      const next = {
        ...previous,
        [key]: value,
      };

      setNotificationPreferences(next);

      try {

        setNotificationPreferencesSaving(true);

        const response =
          await api.updateNotificationPreferences(next);

        const saved =
          response?.data?.data ??
          response?.data ??
          response;

        setNotificationPreferences({

          interestRequestNotifications:
            Boolean(saved?.interestRequestNotifications),

          proposalNotifications:
            Boolean(saved?.proposalNotifications),

          acceptedProposalNotifications:
            Boolean(saved?.acceptedProposalNotifications),

          rejectedProposalNotifications:
            Boolean(saved?.rejectedProposalNotifications),

          counterOfferNotifications:
            Boolean(saved?.counterOfferNotifications),

          messageNotifications:
            Boolean(saved?.messageNotifications),

          jugaadTaskNotifications:
            Boolean(saved?.jugaadTaskNotifications),

          emailNotifications:
            Boolean(saved?.emailNotifications),

          inAppNotifications:
            Boolean(saved?.inAppNotifications),

        });

        showSavedToast('Notification preference saved');

      } catch (error) {

        console.error(
          'Failed to update notification preference:',
          error
        );

        setNotificationPreferences(previous);

        showSavedToast(
          'Failed to save notification preference'
        );

      } finally {

        setNotificationPreferencesSaving(false);

      }

    },
    [
      notificationPreferences,
      showSavedToast,
    ]
  );


  // ==============================================================
  // LOGOUT
  // ==============================================================

  const handleLogout =
    () => {

      logout();

      navigate('/');

    };


  // ==============================================================
  // APPLY THEME
  // ==============================================================

  useEffect(
    () => {

      applyTheme(
        settings
          .appearance
          .theme
      );

    },
    [
      settings
        .appearance
        .theme,
    ]
  );


  // ==============================================================
  // ACCESSIBILITY
  // ==============================================================

  useEffect(
    () => {

      const root =
        document.documentElement;


      root.setAttribute(
        'data-reduce-motion',
        settings.appearance
          .reduceMotion
          ? 'true'
          : 'false'
      );


      root.setAttribute(
        'data-larger-text',
        settings.accessibility
          .largerText
          ? 'true'
          : 'false'
      );


      root.setAttribute(
        'data-high-contrast',
        settings.accessibility
          .highContrast
          ? 'true'
          : 'false'
      );

    },
    [
      settings
        .appearance
        .reduceMotion,

      settings
        .accessibility
        .largerText,

      settings
        .accessibility
        .highContrast,
    ]
  );


  // ==============================================================
  // SYSTEM THEME LISTENER
  // ==============================================================

  useEffect(
    () => {

      if (
        settings
          .appearance
          .theme !== 'system'
      ) {

        return;

      }


      const mq =
        window.matchMedia(
          '(prefers-color-scheme: light)'
        );


      const handler =
        () => {

          applyTheme(
            'system'
          );

        };


      if (
        mq.addEventListener
      ) {

        mq.addEventListener(
          'change',
          handler
        );

      } else if (
        mq.addListener
      ) {

        mq.addListener(
          handler
        );

      }


      return () => {

        if (
          mq.removeEventListener
        ) {

          mq.removeEventListener(
            'change',
            handler
          );

        } else if (
          mq.removeListener
        ) {

          mq.removeListener(
            handler
          );

        }

      };

    },
    [
      settings
        .appearance
        .theme,
    ]
  );


  // ==============================================================
  // RENDER
  // ==============================================================

  return (

    <div>

      {/* ========================================================
          HEADER
      ======================================================== */}

      <section className="pt-12 pb-6">

        <div className="flex items-center gap-3 mb-4">

          <LED
            color="amber"
            pulse
            size={7}
          />

          <span className="font-technical text-[9px] text-ink-2">

            SETTINGS CENTER

          </span>

        </div>


        <h1 className="font-display text-4xl sm:text-5xl">

          SETTINGS.

        </h1>


        <p className="mt-3 text-sm text-ink-2 max-w-lg">

          Manage your CampusJugaad account,
          security, preferences, privacy,
          and accessibility.

        </p>

      </section>


      {/* ========================================================
          LAYOUT
      ======================================================== */}

      <div className="grid lg:grid-cols-[200px_1fr] gap-5">

        {/* ======================================================
            LEFT NAV
        ====================================================== */}

        <nav className="surface-panel rounded-2xl p-3 h-fit lg:sticky lg:top-24">

          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">

            {CATEGORIES.map(
              (cat) => {

                const isActive =
                  active ===
                  cat.id;


                return (

                  <button

                    key={
                      cat.id
                    }

                    type="button"

                    onClick={() =>
                      setActive(
                        cat.id
                      )
                    }

                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors whitespace-nowrap lg:w-full ${
                      isActive
                        ? 'text-amber-soft'
                        : 'text-ink-2 hover:text-ink-0'
                    }`}

                    style={{
                      background:
                        isActive
                          ? 'rgba(214,138,60,0.08)'
                          : 'transparent',
                    }}

                  >

                    <cat.icon
                      size={14}
                    />


                    <span className="font-technical text-[9px]">

                      {cat.label}

                    </span>


                    {isActive && (

                      <LED
                        color="amber"
                        size={4}
                        className="hidden lg:block ml-auto"
                      />

                    )}

                  </button>

                );

              }
            )}

          </div>

        </nav>


        {/* ======================================================
            RIGHT PANEL
        ====================================================== */}

        <div className="surface-metal-brushed rounded-2xl p-5 sm:p-7 min-h-[400px]">

          {active === 'account' && (

            <AccountPanel

              user={
                user
              }

              settings={
                settings
              }

              updateSettings={
                updateSettings
              }

              handleLogout={
                handleLogout
              }

              showSavedToast={
                showSavedToast
              }

            />

          )}


          {active === 'notifications' && (

            <NotificationsPanel

              settings={
                settings
              }

              updateSettings={
                updateSettings
              }

              notificationPreferences={
                notificationPreferences
              }

              updateNotificationPreference={
                updateNotificationPreference
              }

              notificationPreferencesLoading={
                notificationPreferencesLoading
              }

              notificationPreferencesSaving={
                notificationPreferencesSaving
              }

            />

          )}


          {active === 'privacy' && (

            <PrivacyPanel

              settings={
                settings
              }

              updateSettings={
                updateSettings
              }

            />

          )}


          {active === 'security' && (

            <SecurityPanel

              handleLogout={
                handleLogout
              }

              openAccountPassword={() =>
                setActive(
                  'account'
                )
              }

            />

          )}


          {active === 'appearance' && (

            <AppearancePanel

              settings={
                settings
              }

              updateSettings={
                updateSettings
              }

            />

          )}


          {active === 'preferences' && (

            <PreferencesPanel

              settings={
                settings
              }

              updateSettings={
                updateSettings
              }

            />

          )}


          {active === 'accessibility' && (

            <AccessibilityPanel

              settings={
                settings
              }

              updateSettings={
                updateSettings
              }

            />

          )}


          {active === 'data' && (

            <DataPanel

              handleLogout={
                handleLogout
              }

            />

          )}

        </div>

      </div>


      {/* ========================================================
          BACK BUTTON
      ======================================================== */}

      <div className="mt-6 flex justify-center">

        <Link

          to="/dashboard"

          className="machine-control machine-control--ghost"

        >

          <span className="ctrl-led" />

          BACK TO WORKSPACE

        </Link>

      </div>


      {/* ========================================================
          TOAST
      ======================================================== */}

      {toast && (

        <div

          className="fixed bottom-6 right-6 z-50 surface-panel rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg"

          style={{
            border:
              '1px solid var(--mint)',
          }}

        >

          <Check
            size={14}
            className="text-mint"
          />


          <span className="font-mono text-[11px] text-ink-1">

            {toast}

          </span>

        </div>

      )}

    </div>

  );
}


// ================================================================
// PANEL HEADER
// ================================================================

function PanelHeader({
  icon: Icon,
  title,
  desc,
}) {

  return (

    <div className="flex items-start gap-3 mb-6 pb-5 border-b border-metal-1/40">

      <span className="grid place-items-center w-10 h-10 rounded-xl bg-amber/10 text-amber shrink-0">

        <Icon size={18} />

      </span>


      <div>

        <h2 className="font-display text-xl">

          {title}

        </h2>


        <p className="font-mono text-[10px] text-ink-3 mt-1">

          {desc}

        </p>

      </div>

    </div>

  );
}


// ================================================================
// SWITCH
// ================================================================

function Switch({
  on,
  onChange,
  label,
  ariaLabel,
}) {

  const [
    focused,
    setFocused,
  ] = useState(false);


  return (

    <button

      type="button"

      role="switch"

      aria-checked={
        Boolean(on)
      }

      aria-label={
        ariaLabel ||
        label
      }

      onClick={() =>
        onChange(
          !on
        )
      }

      onFocus={() =>
        setFocused(true)
      }

      onBlur={() =>
        setFocused(false)
      }

      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 outline-none ${
        focused
          ? 'ring-2 ring-amber/40 ring-offset-1 ring-offset-bg-0'
          : ''
      }`}

      style={{
        background:
          on
            ? 'var(--mint)'
            : 'var(--bg-3)',

        border:
          '1px solid var(--metal-1)',
      }}

    >

      <span

        className="pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-bg-0 shadow-md transition-all duration-200"

        style={{
          left:
            on
              ? 'calc(100% - 18px)'
              : '2px',
        }}

      />

    </button>

  );
}


// ================================================================
// TOGGLE
// ================================================================

function Toggle({
  on,
  onChange,
  label,
  desc,
}) {

  return (

    <div

      className="flex items-center justify-between gap-4 py-3 border-b border-metal-1/30 last:border-0 cursor-pointer"

      onClick={() =>
        onChange(
          !on
        )
      }

    >

      <div className="min-w-0">

        <p className="font-mono text-[11px] text-ink-1">

          {label}

        </p>


        {desc && (

          <p className="font-mono text-[9px] text-ink-3 mt-1">

            {desc}

          </p>

        )}

      </div>


      <div
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <Switch

          on={Boolean(on)}

          onChange={
            onChange
          }

          label={
            label
          }

        />

      </div>

    </div>

  );
}


// ================================================================
// ACCOUNT PANEL
// ================================================================

function AccountPanel({
  user,
  settings,
  updateSettings,
  handleLogout,
  showSavedToast,
}) {

  const navigate =
    useNavigate();


  const [
    showPwModal,
    setShowPwModal,
  ] = useState(false);


  const [
    pwForm,
    setPwForm,
  ] = useState({

    current: '',

    new: '',

    confirm: '',

  });


  const [
    showPw,
    setShowPw,
  ] = useState({

    current: false,

    new: false,

    confirm: false,

  });


  const [
    pwLoading,
    setPwLoading,
  ] = useState(false);


  const [
    pwError,
    setPwError,
  ] = useState(null);


  const [
    pwSuccess,
    setPwSuccess,
  ] = useState(false);


  // ==============================================================
  // OPEN PASSWORD MODAL
  // ==============================================================

  const openPasswordModal =
    () => {

      setPwError(
        null
      );

      setPwSuccess(
        false
      );

      setPwForm({

        current: '',

        new: '',

        confirm: '',

      });

      setShowPwModal(
        true
      );

    };


  // ==============================================================
  // SUBMIT PASSWORD
  // ==============================================================

  const submitPw =
    async (
      event
    ) => {

      event.preventDefault();


      setPwError(
        null
      );


      if (
        !pwForm.current
      ) {

        setPwError(
          'Enter your current password.'
        );

        return;

      }


      if (
        !pwForm.new
      ) {

        setPwError(
          'Enter a new password.'
        );

        return;

      }


      if (
        pwForm.new.length <
        6
      ) {

        setPwError(
          'New password must be at least 6 characters.'
        );

        return;

      }


      if (
        pwForm.new !==
        pwForm.confirm
      ) {

        setPwError(
          'New passwords do not match.'
        );

        return;

      }


      if (
        pwForm.current ===
        pwForm.new
      ) {

        setPwError(
          'New password must be different from your current password.'
        );

        return;

      }


      setPwLoading(
        true
      );


      try {

        await api.changePassword({

          currentPassword:
            pwForm.current,

          newPassword:
            pwForm.new,

          confirmPassword:
            pwForm.confirm,

        });


        setPwSuccess(
          true
        );


        setPwForm({

          current: '',

          new: '',

          confirm: '',

        });


        showSavedToast(
          'Password changed successfully'
        );


        setTimeout(
          () => {

            setPwSuccess(
              false
            );

            setShowPwModal(
              false
            );

          },
          1200
        );


      } catch (error) {

        console.error(
          'Change password failed:',
          error
        );


        setPwError(

          error?.message ||

          error?.data?.message ||

          error?.data?.error ||

          'Unable to change password. Please try again.'

        );

      } finally {

        setPwLoading(
          false
        );

      }

    };


  return (

    <div>

      <PanelHeader

        icon={
          User
        }

        title="Account"

        desc="Manage your core account information."

      />


      {/* ========================================================
          ACCOUNT INFO
      ======================================================== */}

      <div className="surface-panel rounded-xl p-4 mb-5">

        <div className="flex items-center gap-3">

          <span className="grid place-items-center w-12 h-12 rounded-full bg-amber text-bg-0 font-display text-sm">

            {user?.name
              ?.slice(
                0,
                2
              )
              .toUpperCase() ||
              'ST'}

          </span>


          <div>

            <p className="font-display text-lg">

              {user?.name ||
                'Student'}

            </p>


            <p className="font-mono text-[9px] text-ink-3 mt-0.5">

              {user?.email ||
                'No email available'}

            </p>

          </div>

        </div>

      </div>


      {/* ========================================================
          QUICK ACTIONS
      ======================================================== */}

      <div className="space-y-3 mb-5">

        <ActionRow

          icon={User}

          label="Edit Profile"

          desc="Update your name, bio, skills, and links"

          onClick={() =>
            navigate(
              '/dashboard/profile'
            )
          }

        />


        <ActionRow

          icon={Lock}

          label="Change Password"

          desc="Update your account password"

          onClick={
            openPasswordModal
          }

        />


        <ActionRow

          icon={LogOut}

          label="Logout"

          desc="Sign out of your current session"

          onClick={
            handleLogout
          }

        />

      </div>


      {/* ========================================================
          PROFILE VISIBILITY
      ======================================================== */}

      <div className="pt-4 border-t border-metal-1/40">

        <p className="font-technical text-[8px] text-ink-3 mb-2">

          PROFILE VISIBILITY

        </p>


        <div className="flex flex-wrap gap-2">

          {PROFILE_VISIBILITY_OPTIONS.map(
            (opt) => (

              <button

                key={
                  opt.value
                }

                type="button"

                onClick={() =>
                  updateSettings(
                    'privacy',
                    'profileVisibility',
                    opt.value
                  )
                }

                className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${
                  settings
                    .privacy
                    .profileVisibility ===
                  opt.value

                    ? 'bg-amber text-bg-0'

                    : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'
                }`}

              >

                {opt.label}

              </button>

            )
          )}

        </div>

      </div>


      {/* ========================================================
          CHANGE PASSWORD MODAL
      ======================================================== */}

      {showPwModal && (

        <div

          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"

          onClick={() =>
            !pwLoading &&
            setShowPwModal(
              false
            )
          }

        >

          <div

            className="surface-metal-brushed rounded-2xl p-6 w-full max-w-md"

            onClick={(event) =>
              event.stopPropagation()
            }

            style={{
              border:
                '1px solid var(--metal-1)',
            }}

          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between mb-5">

              <h3 className="font-display text-xl">

                Change Password

              </h3>


              <button

                type="button"

                onClick={() =>
                  !pwLoading &&
                  setShowPwModal(
                    false
                  )
                }

                className="text-ink-3 hover:text-ink-0"

                aria-label="Close"

              >

                <X
                  size={18}
                />

              </button>

            </div>


            {/* ERROR */}

            {pwError && (

              <div className="mb-4 rounded-lg border border-coral/40 bg-coral/10 px-3 py-2">

                <p className="font-mono text-[9px] text-coral">

                  {pwError}

                </p>

              </div>

            )}


            {/* SUCCESS */}

            {pwSuccess && (

              <div className="mb-4 rounded-lg border border-mint/40 bg-mint/10 px-3 py-2 flex items-center gap-2">

                <Check
                  size={13}
                  className="text-mint"
                />

                <p className="font-mono text-[9px] text-mint">

                  Password changed successfully.

                </p>

              </div>

            )}


            <form

              onSubmit={
                submitPw
              }

              className="space-y-4"

            >

              <PasswordField

                label="CURRENT PASSWORD"

                value={
                  pwForm.current
                }

                onChange={(
                  value
                ) =>
                  setPwForm(
                    (form) => ({
                      ...form,
                      current:
                        value,
                    })
                  )
                }

                show={
                  showPw.current
                }

                toggle={() =>
                  setShowPw(
                    (state) => ({
                      ...state,
                      current:
                        !state.current,
                    })
                  )
                }

                disabled={
                  pwLoading
                }

              />


              <PasswordField

                label="NEW PASSWORD"

                value={
                  pwForm.new
                }

                onChange={(
                  value
                ) =>
                  setPwForm(
                    (form) => ({
                      ...form,
                      new:
                        value,
                    })
                  )
                }

                show={
                  showPw.new
                }

                toggle={() =>
                  setShowPw(
                    (state) => ({
                      ...state,
                      new:
                        !state.new,
                    })
                  )
                }

                disabled={
                  pwLoading
                }

              />


              <PasswordField

                label="CONFIRM NEW PASSWORD"

                value={
                  pwForm.confirm
                }

                onChange={(
                  value
                ) =>
                  setPwForm(
                    (form) => ({
                      ...form,
                      confirm:
                        value,
                    })
                  )
                }

                show={
                  showPw.confirm
                }

                toggle={() =>
                  setShowPw(
                    (state) => ({
                      ...state,
                      confirm:
                        !state.confirm,
                    })
                  )
                }

                disabled={
                  pwLoading
                }

              />


              {/* PASSWORD MATCH */}

              {pwForm.new &&
                pwForm.confirm &&
                pwForm.new !==
                  pwForm.confirm && (

                  <p className="font-mono text-[9px] text-coral">

                    Passwords do not match.

                  </p>

                )}


              <button

                type="submit"

                disabled={

                  pwLoading ||

                  !pwForm.current ||

                  !pwForm.new ||

                  !pwForm.confirm ||

                  pwForm.new !==
                    pwForm.confirm

                }

                className="machine-control machine-control--primary disabled:opacity-40"

                style={{
                  padding:
                    '10px 16px',
                }}

              >

                <span className="ctrl-led" />


                {pwLoading ? (

                  <>
                    <span>
                      SAVING...
                    </span>
                  </>

                ) : pwSuccess ? (

                  <>
                    <Check
                      size={13}
                    />

                    SAVED
                  </>

                ) : (

                  <>
                    <Save
                      size={13}
                    />

                    CHANGE PASSWORD
                  </>

                )}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}


// ================================================================
// ACTION ROW
// ================================================================

function ActionRow({
  icon: Icon,
  label,
  desc,
  onClick,
}) {

  return (

    <button

      type="button"

      onClick={
        onClick
      }

      className="w-full flex items-center gap-3 surface-panel rounded-xl p-3.5 text-left hover:border-amber/30 transition-colors"

      style={{
        border:
          '1px solid var(--metal-1)',
      }}

    >

      <span className="grid place-items-center w-9 h-9 rounded-lg bg-amber/10 text-amber shrink-0">

        <Icon
          size={15}
        />

      </span>


      <div className="flex-1">

        <p className="font-mono text-[11px] text-ink-1">

          {label}

        </p>


        <p className="font-mono text-[9px] text-ink-3 mt-0.5">

          {desc}

        </p>

      </div>


      <ChevronRight
        size={14}
        className="text-ink-3 shrink-0"
      />

    </button>

  );
}


// ================================================================
// NOTIFICATIONS
// ================================================================

function NotificationsPanel({
  settings,
  updateSettings,
  notificationPreferences,
  updateNotificationPreference,
  notificationPreferencesLoading,
  notificationPreferencesSaving,
}) {

  const n =
    notificationPreferences;

  const items = [

    [
      'interestRequestNotifications',
      'Interest Request Notifications',
      'When someone is interested in your Jugaad',
    ],

    [
      'proposalNotifications',
      'Proposal Notifications',
      'When you receive a new proposal',
    ],

    [
      'acceptedProposalNotifications',
      'Accepted Proposal Notifications',
      'When a poster accepts your proposal',
    ],

    [
      'rejectedProposalNotifications',
      'Rejected Proposal Notifications',
      'When a poster rejects your proposal',
    ],

    [
      'counterOfferNotifications',
      'Counter-Offer Notifications',
      'When a counter offer is received',
    ],

    [
      'messageNotifications',
      'New Message Notifications',
      'New messages in your conversations',
    ],

    [
      'jugaadTaskNotifications',
      'Jugaad / Task Notifications',
      'Status changes on your Jugaads and tasks',
    ],

  ];

  return (

    <div>

      <PanelHeader
        icon={Bell}
        title="Notifications"
        desc="Control which notifications you receive."
      />

      {notificationPreferencesLoading ? (

        <div className="surface-panel rounded-xl p-4 mb-6">

          <p className="font-mono text-[10px] text-ink-3">
            LOADING NOTIFICATION PREFERENCES...
          </p>

        </div>

      ) : (

        <>

          <div className="space-y-1 mb-6">

            {items.map(
              ([key, label, desc]) => (

                <Toggle
                  key={key}
                  on={Boolean(n?.[key])}
                  onChange={(value) =>
                    updateNotificationPreference(
                      key,
                      value
                    )
                  }
                  label={label}
                  desc={desc}
                />

              )
            )}

          </div>

          <div className="pt-4 border-t border-metal-1/40">

            <div className="flex items-center justify-between mb-3">

              <p className="font-technical text-[8px] text-ink-3">
                DELIVERY CHANNELS
              </p>

              {notificationPreferencesSaving && (

                <span className="font-mono text-[8px] text-amber">
                  SAVING...
                </span>

              )}

            </div>

            <Toggle
              on={Boolean(n?.emailNotifications)}
              onChange={(value) =>
                updateNotificationPreference(
                  'emailNotifications',
                  value
                )
              }
              label="Email Notifications"
              desc="Receive notifications via email"
            />

            <Toggle
              on={Boolean(n?.inAppNotifications)}
              onChange={(value) =>
                updateNotificationPreference(
                  'inAppNotifications',
                  value
                )
              }
              label="In-App Notifications"
              desc="Show notifications inside CampusJugaad"
            />

          </div>

        </>

      )}

    </div>

  );
}


// ================================================================
// PRIVACY
// ================================================================

function PrivacyPanel({
  settings,
  updateSettings,
}) {

  const p =
    settings.privacy;


  const set =
    (
      key,
      value
    ) =>
      updateSettings(
        'privacy',
        key,
        value
      );


  return (

    <div>

      <PanelHeader

        icon={Shield}

        title="Privacy"

        desc="Control who can see your information and reach you."

      />


      <div className="mb-5">

        <p className="font-technical text-[8px] text-ink-3 mb-2">

          PROFILE VISIBILITY

        </p>


        <div className="flex flex-wrap gap-2">

          {PROFILE_VISIBILITY_OPTIONS.map(
            (opt) => (

              <button

                key={
                  opt.value
                }

                type="button"

                onClick={() =>
                  set(
                    'profileVisibility',
                    opt.value
                  )
                }

                className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${
                  p.profileVisibility ===
                  opt.value

                    ? 'bg-amber text-bg-0'

                    : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'
                }`}

              >

                {opt.label}

              </button>

            )
          )}

        </div>


        <p className="font-mono text-[9px] text-ink-3 mt-2">

          Public = anyone can find you · Campus Only =
          only verified students · Private = only you

        </p>

      </div>


      <div className="space-y-1">

        <Toggle

          on={
            Boolean(
              p.showEmail
            )
          }

          onChange={(
            value
          ) =>
            set(
              'showEmail',
              value
            )
          }

          label="Show Email"

          desc="Display your email on your profile"

        />


        <Toggle

          on={
            Boolean(
              p.showPhone
            )
          }

          onChange={(
            value
          ) =>
            set(
              'showPhone',
              value
            )
          }

          label="Show Phone"

          desc="Display your phone number on your profile"

        />


        <Toggle

          on={
            Boolean(
              p.showSocialLinks
            )
          }

          onChange={(
            value
          ) =>
            set(
              'showSocialLinks',
              value
            )
          }

          label="Show Social Links"

          desc="Display your professional links"

        />


        <Toggle

          on={
            Boolean(
              p.showSkills
            )
          }

          onChange={(
            value
          ) =>
            set(
              'showSkills',
              value
            )
          }

          label="Show Skills"

          desc="Display your skills on your profile"

        />


        <Toggle

          on={
            Boolean(
              p.showCompletedJugaads
            )
          }

          onChange={(
            value
          ) =>
            set(
              'showCompletedJugaads',
              value
            )
          }

          label="Show Completed Jugaads"

          desc="Display your completed Jugaads"

        />


        <Toggle

          on={
            Boolean(
              p.allowInterestRequests
            )
          }

          onChange={(
            value
          ) =>
            set(
              'allowInterestRequests',
              value
            )
          }

          label="Allow Interest Requests"

          desc="Let students send interest requests on your Jugaads"

        />


        <Toggle

          on={
            Boolean(
              p.allowMessagesAfterAcceptance
            )
          }

          onChange={(
            value
          ) =>
            set(
              'allowMessagesAfterAcceptance',
              value
            )
          }

          label="Allow Messages After Acceptance"

          desc="Unlock messaging once a request is accepted"

        />

      </div>

    </div>

  );
}


// ================================================================
// SECURITY
// ================================================================

function SecurityPanel({
  handleLogout,
  openAccountPassword,
}) {

  return (

    <div>

      <PanelHeader

        icon={Lock}

        title="Security"

        desc="Protect your account and manage sessions."

      />


      <div className="space-y-3 mb-6">

        <ActionRow

          icon={Lock}

          label="Change Password"

          desc="Update your account password"

          onClick={
            openAccountPassword
          }

        />

      </div>


      <div className="pt-5 border-t border-metal-1/40">

        <p className="font-technical text-[8px] text-ink-3 mb-3">

          ACTIVE SESSION

        </p>


        <div className="surface-panel rounded-xl p-3 flex items-center gap-3 mb-3">

          <span className="grid place-items-center w-8 h-8 rounded-lg bg-mint/10 text-mint">

            <Check
              size={14}
            />

          </span>


          <div className="flex-1">

            <p className="font-mono text-[10px] text-ink-1">

              Current Session · This device

            </p>


            <p className="font-mono text-[8px] text-ink-3">

              Active now

            </p>

          </div>

        </div>


        <button

          type="button"

          onClick={
            handleLogout
          }

          className="machine-control machine-control--ghost"

          style={{
            padding:
              '8px 14px',
          }}

        >

          <span className="ctrl-led" />

          <LogOut
            size={12}
          />

          LOG OUT

        </button>

      </div>

    </div>

  );
}


// ================================================================
// APPEARANCE
// ================================================================

function AppearancePanel({
  settings,
  updateSettings,
}) {

  const a =
    settings.appearance;


  return (

    <div>

      <PanelHeader

        icon={Palette}

        title="Appearance"

        desc="Customize how CampusJugaad looks and feels."

      />


      <div className="mb-5">

        <p className="font-technical text-[8px] text-ink-3 mb-2">

          THEME

        </p>


        <div className="flex flex-wrap gap-2">

          {[

            {
              v: 'dark',
              l: 'Dark',
            },

            {
              v: 'light',
              l: 'Light',
            },

            {
              v: 'system',
              l: 'System',
            },

          ].map(
            (opt) => (

              <button

                key={
                  opt.v
                }

                type="button"

                onClick={() =>
                  updateSettings(
                    'appearance',
                    'theme',
                    opt.v
                  )
                }

                className={`px-4 py-2.5 rounded-lg font-technical text-[9px] transition-colors ${
                  a.theme ===
                  opt.v

                    ? 'bg-amber text-bg-0'

                    : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'
                }`}

              >

                {opt.l}

              </button>

            )
          )}

        </div>


        <p className="font-mono text-[8px] text-ink-3 mt-2">

          Dark is the default workshop theme.
          Light switches to a brighter palette.
          System follows your OS preference.

        </p>

      </div>


      <Toggle

        on={
          Boolean(
            a.reduceMotion
          )
        }

        onChange={(
          value
        ) =>
          updateSettings(
            'appearance',
            'reduceMotion',
            value
          )
        }

        label="Reduce Motion"

        desc="Minimize animations and transitions"

      />

    </div>

  );
}


// ================================================================
// PREFERENCES
// ================================================================

function PreferencesPanel({
  settings,
  updateSettings,
}) {

  const p =
    settings.preferences;


  const toggleCategory =
    (category) => {

      const cats =
        p.preferredCategories.includes(
          category
        )

          ? p.preferredCategories.filter(
              (value) =>
                value !==
                category
            )

          : [
              ...p.preferredCategories,
              category,
            ];


      updateSettings(

        'preferences',

        'preferredCategories',

        cats

      );

    };


  return (

    <div>

      <PanelHeader

        icon={Sliders}

        title="Preferences"

        desc="Tune your discovery feed and recommendation signals."

      />


      <div className="mb-5">

        <p className="font-technical text-[8px] text-ink-3 mb-2">

          PREFERRED CATEGORIES

        </p>


        <div className="flex flex-wrap gap-2">

          {PREFERRED_CATEGORIES.map(
            (category) => (

              <button

                key={
                  category
                }

                type="button"

                onClick={() =>
                  toggleCategory(
                    category
                  )
                }

                className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${
                  p.preferredCategories.includes(
                    category
                  )

                    ? 'bg-amber text-bg-0'

                    : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'
                }`}

              >

                {category}

              </button>

            )
          )}

        </div>

      </div>


      <div className="mb-5">

        <p className="font-technical text-[8px] text-ink-3 mb-2">

          PREFERRED WORK TYPE

        </p>


        <div className="flex flex-wrap gap-2">

          {WORK_TYPES.map(
            (opt) => (

              <button

                key={
                  opt.value
                }

                type="button"

                onClick={() =>
                  updateSettings(
                    'preferences',
                    'preferredWorkType',
                    opt.value
                  )
                }

                className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${
                  p.preferredWorkType ===
                  opt.value

                    ? 'bg-amber text-bg-0'

                    : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'
                }`}

              >

                {opt.label}

              </button>

            )
          )}

        </div>

      </div>


      <div className="mb-5">

        <p className="font-technical text-[8px] text-ink-3 mb-2">

          PREFERRED BUDGET RANGE

        </p>


        <div className="flex flex-wrap gap-2">

          {BUDGET_RANGES.map(
            (opt) => (

              <button

                key={
                  opt.value
                }

                type="button"

                onClick={() =>
                  updateSettings(
                    'preferences',
                    'preferredBudgetRange',
                    opt.value
                  )
                }

                className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${
                  p.preferredBudgetRange ===
                  opt.value

                    ? 'bg-amber text-bg-0'

                    : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'
                }`}

              >

                {opt.label}

              </button>

            )
          )}

        </div>

      </div>


      <div className="mb-5">

        <p className="font-technical text-[8px] text-ink-3 mb-2">

          NOTIFICATION FREQUENCY

        </p>


        <div className="flex flex-wrap gap-2">

          {NOTIF_FREQUENCIES.map(
            (opt) => (

              <button

                key={
                  opt.value
                }

                type="button"

                onClick={() =>
                  updateSettings(
                    'preferences',
                    'notificationFrequency',
                    opt.value
                  )
                }

                className={`px-3 py-2 rounded-lg font-technical text-[8px] transition-colors ${
                  p.notificationFrequency ===
                  opt.value

                    ? 'bg-amber text-bg-0'

                    : 'bg-bg-2 text-ink-3 border border-metal-1 hover:border-amber/40'
                }`}

              >

                {opt.label}

              </button>

            )
          )}

        </div>

      </div>

    </div>

  );
}


// ================================================================
// ACCESSIBILITY
// ================================================================

function AccessibilityPanel({
  settings,
  updateSettings,
}) {

  const a =
    settings.accessibility;


  return (

    <div>

      <PanelHeader

        icon={Accessibility}

        title="Accessibility"

        desc="Adjust the interface for your needs."

      />


      <div className="space-y-1">

        <Toggle

          on={
            Boolean(
              settings
                .appearance
                .reduceMotion
            )
          }

          onChange={(
            value
          ) =>
            updateSettings(
              'appearance',
              'reduceMotion',
              value
            )
          }

          label="Reduce Motion"

          desc="Minimize animations and transitions"

        />


        <Toggle

          on={
            Boolean(
              a.largerText
            )
          }

          onChange={(
            value
          ) =>
            updateSettings(
              'accessibility',
              'largerText',
              value
            )
          }

          label="Larger Text"

          desc="Increase base font size for readability"

        />


        <Toggle

          on={
            Boolean(
              a.highContrast
            )
          }

          onChange={(
            value
          ) =>
            updateSettings(
              'accessibility',
              'highContrast',
              value
            )
          }

          label="High Contrast"

          desc="Boost contrast between text and background"

        />


        <Toggle

          on={
            Boolean(
              a.keyboardNavigation
            )
          }

          onChange={(
            value
          ) =>
            updateSettings(
              'accessibility',
              'keyboardNavigation',
              value
            )
          }

          label="Keyboard Navigation Support"

          desc="Enhance focus indicators for keyboard users"

        />

      </div>

    </div>

  );
}


// ================================================================
// DATA & ACCOUNT
// ================================================================

function DataPanel({
  handleLogout,
}) {

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(false);


  return (

    <div>

      <PanelHeader

        icon={Database}

        title="Data & Account"

        desc="Manage your data and account lifecycle."

      />


      <div className="space-y-3 mb-6">

        <DataAction

          icon={Download}

          label="Download My Data"

          desc="Export a copy of your CampusJugaad data"

          onClick={() => {

            const data =
              localStorage.getItem(
                SETTINGS_KEY
              ) || '{}';


            const blob =
              new Blob(
                [data],
                {
                  type:
                    'application/json',
                }
              );


            const url =
              URL.createObjectURL(
                blob
              );


            const anchor =
              document.createElement(
                'a'
              );


            anchor.href =
              url;

            anchor.download =
              'campusjugaad-data.json';

            anchor.click();


            URL.revokeObjectURL(
              url
            );

          }}

        />


        <DataAction

          icon={Download}

          label="Export Profile"

          desc="Download your profile as a portable file"

          onClick={() => {

            let savedSettings =
              {};


            try {

              savedSettings =
                JSON.parse(
                  localStorage.getItem(
                    SETTINGS_KEY
                  ) || '{}'
                );

            } catch {

              savedSettings =
                {};

            }


            const profile = {

              exportedAt:
                new Date()
                  .toISOString(),

              settings:
                savedSettings,

            };


            const blob =
              new Blob(

                [
                  JSON.stringify(
                    profile,
                    null,
                    2
                  ),
                ],

                {
                  type:
                    'application/json',
                }

              );


            const url =
              URL.createObjectURL(
                blob
              );


            const anchor =
              document.createElement(
                'a'
              );


            anchor.href =
              url;

            anchor.download =
              'campusjugaad-profile.json';

            anchor.click();


            URL.revokeObjectURL(
              url
            );

          }}

        />


        <DataAction

          icon={LogOut}

          label="Logout"

          desc="Sign out of your current session"

          onClick={
            handleLogout
          }

        />

      </div>


      <div className="pt-5 border-t border-coral/30">

        <p className="font-technical text-[8px] text-coral mb-3 flex items-center gap-1.5">

          <AlertTriangle
            size={11}
          />

          DANGER ZONE

        </p>


        {!confirmDelete ? (

          <button

            type="button"

            onClick={() =>
              setConfirmDelete(
                true
              )
            }

            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-coral/40 text-coral font-technical text-[9px] hover:bg-coral/10 transition-colors w-full"

          >

            <Trash2
              size={14}
            />

            DELETE ACCOUNT

          </button>

        ) : (

          <div className="surface-panel rounded-xl p-4 border border-coral/40">

            <p className="font-mono text-[11px] text-ink-1 mb-3">

              Account deletion will permanently
              remove your account and associated data.

            </p>


            <div className="flex gap-2">

              <button

                type="button"

                onClick={() => {

                  /*
                   * Intentionally does NOT delete yet.
                   *
                   * The backend database foreign-key
                   * relationships must be verified first.
                   */

                  setConfirmDelete(
                    false
                  );

                }}

                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-coral text-bg-0 font-technical text-[9px] hover:bg-coral-soft"

              >

                <Trash2
                  size={12}
                />

                DELETE ACCOUNT

              </button>


              <button

                type="button"

                onClick={() =>
                  setConfirmDelete(
                    false
                  )
                }

                className="machine-control machine-control--ghost"

                style={{
                  padding:
                    '8px 14px',
                }}

              >

                <span className="ctrl-led" />

                CANCEL

              </button>

            </div>


            <p className="font-mono text-[8px] text-ink-3 mt-3">

              Account deletion will be connected after
              database deletion rules are verified.

            </p>

          </div>

        )}

      </div>

    </div>

  );
}


// ================================================================
// PASSWORD FIELD
// ================================================================

function PasswordField({
  label,
  value,
  onChange,
  show,
  toggle,
  disabled = false,
}) {

  return (

    <div>

      <label className="font-technical text-[8px] text-ink-3 block mb-2">

        {label}

      </label>


      <div className="flex items-center rounded-lg bg-bg-1 border border-metal-1">

        <input

          type={
            show
              ? 'text'
              : 'password'
          }

          value={
            value
          }

          onChange={(event) =>
            onChange(
              event.target.value
            )
          }

          disabled={
            disabled
          }

          autoComplete="off"

          className="w-full bg-transparent px-3 py-2.5 font-mono text-xs outline-none text-ink-0 disabled:opacity-50"

        />


        <button

          type="button"

          onClick={
            toggle
          }

          disabled={
            disabled
          }

          className="px-3 text-ink-3 hover:text-ink-0 shrink-0 disabled:opacity-40"

          aria-label={
            show
              ? 'Hide password'
              : 'Show password'
          }

        >

          {show ? (

            <EyeOff
              size={14}
            />

          ) : (

            <Eye
              size={14}
            />

          )}

        </button>

      </div>

    </div>

  );
}


// ================================================================
// DATA ACTION
// ================================================================

function DataAction({
  icon: Icon,
  label,
  desc,
  onClick,
}) {

  return (

    <button

      type="button"

      onClick={
        onClick
      }

      className="w-full flex items-center gap-3 surface-panel rounded-xl p-3.5 text-left hover:border-amber/30 transition-colors"

      style={{
        border:
          '1px solid var(--metal-1)',
      }}

    >

      <span className="grid place-items-center w-9 h-9 rounded-lg bg-amber/10 text-amber shrink-0">

        <Icon
          size={15}
        />

      </span>


      <div>

        <p className="font-mono text-[11px] text-ink-1">

          {label}

        </p>


        <p className="font-mono text-[9px] text-ink-3 mt-0.5">

          {desc}

        </p>

      </div>

    </button>

  );
}


export default SettingsPage;