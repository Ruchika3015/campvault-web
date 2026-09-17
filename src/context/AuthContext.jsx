import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { setTokenFactory, api } from '@/services/api';


/* ================================================================
   DEMO USER
================================================================ */

const DEMO_USER = {
  id: 'demo-user',
  name: 'Demo Student',
  email: 'demo@campusvault.demo',
  role: 'student',
  college: 'Demo Campus Institute',
  department: 'CSE',
  year: '2nd Year',
  jugaadScore: 750,
  jugaadsCompleted: 5,
  rating: 4.5,
  avatar: 'DS',
};


/* ================================================================
   AUTH CONTEXT — shape preserved so all consumers are unchanged
================================================================ */

const AuthContext = createContext({
  user:            null,
  token:           null,
  isAuthenticated: false,
  isDemoMode:      false,
  loading:         true,
  profileComplete: false,
  appUser:         null, // MongoDB profile (superset of Clerk user data)

  login:     async () => {},  // kept for API surface compat (no-op — Clerk handles login)
  register:  async () => {},  // kept for API surface compat (no-op — Clerk handles signup)
  demoLogin: () => {},
  logout:    () => {},
});


/* ================================================================
   useAuth
================================================================ */

export function useAuth() {
  return useContext(AuthContext);
}


/* ================================================================
   AUTH PROVIDER
================================================================ */

export function AuthProvider({ children }) {

  /* ── Clerk state ────────────────────────────────────────────────────────── */
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();

  /* ── App-level state ────────────────────────────────────────────────────── */
  const [appUser,          setAppUser]          = useState(null);  // MongoDB profile
  const [profileComplete,  setProfileComplete]  = useState(false);
  const [isDemoMode,       setIsDemoMode]       = useState(false);
  const [demoUser,         setDemoUser]         = useState(null);
  const [demoToken,        setDemoToken]        = useState(null);

  // Whether we have finished the sync call (not just whether Clerk loaded)
  const [syncDone,   setSyncDone]   = useState(false);
  const syncInFlight = useRef(false);


  /* ── Provide the Clerk token factory to api.js ──────────────────────────── */
  // api.js is a plain module — it can't call hooks. We give it a callback here
  // so apiRequest() can get a fresh Clerk session token for every request.
  useEffect(() => {
    if (isDemoMode) {
      // In demo mode provide a fake token factory
      setTokenFactory(() => Promise.resolve(`demo-session-${Date.now()}`));
    } else if (isSignedIn) {
      setTokenFactory(() => getToken());
    } else {
      setTokenFactory(() => Promise.resolve(null));
    }
  }, [isSignedIn, isDemoMode, getToken]);
  /* ── Restore demo session on page load ─────────────────────────────────── */
  useEffect(() => {
    const storedDemo  = sessionStorage.getItem('cj_demo_token');
    const storedUser  = sessionStorage.getItem('cj_demo_user');
    if (storedDemo && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setDemoToken(storedDemo);
        setDemoUser(parsed);
        setIsDemoMode(true);
        setSyncDone(true);
        setTokenFactory(() => Promise.resolve(storedDemo));
      } catch {
        sessionStorage.removeItem('cj_demo_token');
        sessionStorage.removeItem('cj_demo_user');
        setTokenFactory(() => Promise.resolve(null));
      }
    } else {
      setTokenFactory(() => Promise.resolve(null));
    }
  }, []);


  /* ── Sync MongoDB profile after Clerk signs in ──────────────────────────── */
  useEffect(() => {
    if (!isLoaded)            return; // Wait for Clerk to initialise
    if (isDemoMode)           return; // Demo mode — nothing to sync
    if (!isSignedIn) {
      // User signed out — clear local state
      setAppUser(null);
      setProfileComplete(false);
      setSyncDone(true);
      setTokenFactory(() => Promise.resolve(null));
      return;
    }
    if (syncInFlight.current) return; // Already syncing

    syncInFlight.current = true;

    const doSync = async () => {
      try {
        // ── Step 1: Set token factory BEFORE any API call ──────────────────
        // This guarantees the Authorization header is present even if the
        // separate setTokenFactory effect hasn't run yet (React effect order
        // is not guaranteed between two independent useEffect calls).
        setTokenFactory(() => getToken());

        // ── Step 2: Verify Clerk actually has a token ───────────────────────
        const token = await getToken();
        if (!token) {
          // Clerk says isSignedIn=true but has no token yet — edge case on
          // first load. Let syncDone fire so we don't hang, and the next
          // navigation will re-trigger this effect.
          setSyncDone(true);
          syncInFlight.current = false;
          return;
        }

        // ── Step 3: Sync MongoDB profile ───────────────────────────────────
        const data = await api.syncProfile();

        const profile = data?.data || data;
        setProfileComplete(Boolean(profile?.profileComplete));
        setAppUser(profile || null);
      } catch (err) {
        // If sync fails (e.g. network error), still mark done so the UI doesn't hang.
        // The protect middleware will enforce the profile state on the next API call.
        console.error('[AuthContext] Profile sync failed:', err);
        setProfileComplete(false);
        setAppUser(null);
      } finally {
        setSyncDone(true);
        syncInFlight.current = false;
      }
    };

    doSync();
  }, [isLoaded, isSignedIn, isDemoMode, getToken]); // re-run whenever sign-in state changes


  /* ── Refresh app user after profile completion ──────────────────────────── */
  const refreshAppUser = useCallback(async () => {
    try {
      const data = await api.syncProfile();
      const profile = data?.data || data;
      setProfileComplete(Boolean(profile?.profileComplete));
      setAppUser(profile || null);
    } catch (err) {
      console.error('[AuthContext] refreshAppUser failed:', err);
    }
  }, []);


  /* ── Loading state ──────────────────────────────────────────────────────── */
  // Show loading until:
  //   1. Clerk has finished loading, AND
  //   2. We have finished the /api/auth/sync call (or detected no session)
  const loading = !isLoaded || (!syncDone && !isDemoMode);


  /* ── Derived values ─────────────────────────────────────────────────────── */
  // The "user" exposed to consumers combines Clerk identity + MongoDB profile.
  // We prefer the MongoDB profile when available (it has app-specific fields).
  const effectiveUser = isDemoMode
    ? demoUser
    : (appUser || (clerkUser ? {
        id:    clerkUser.id,
        name:  clerkUser.fullName || clerkUser.firstName || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
      } : null));

  const isAuthenticated = isDemoMode ? true : Boolean(isSignedIn && syncDone);

  // Expose a token-like value for any legacy code that reads context.token
  // (in Clerk, the token is obtained async; this is a best-effort sync snapshot)
  const [tokenSnapshot, setTokenSnapshot] = useState(null);
  useEffect(() => {
    if (!isSignedIn || isDemoMode) { setTokenSnapshot(isDemoMode ? demoToken : null); return; }
    getToken().then(setTokenSnapshot).catch(() => setTokenSnapshot(null));
  }, [isSignedIn, isDemoMode, demoToken, getToken]);


  /* ── Demo login ─────────────────────────────────────────────────────────── */
  const demoLogin = useCallback(() => {
    const token = `demo-session-${Date.now()}`;
    sessionStorage.setItem('cj_demo_token', token);
    sessionStorage.setItem('cj_demo_user', JSON.stringify(DEMO_USER));
    setDemoToken(token);
    setDemoUser(DEMO_USER);
    setIsDemoMode(true);
    setSyncDone(true);
  }, []);


  /* ── Logout ─────────────────────────────────────────────────────────────── */
  const logout = useCallback(async () => {
    // Clear demo session
    sessionStorage.removeItem('cj_demo_token');
    sessionStorage.removeItem('cj_demo_user');
    localStorage.removeItem('cj_demo_token');
    localStorage.removeItem('cj_demo_user');

    setDemoToken(null);
    setDemoUser(null);
    setIsDemoMode(false);
    setAppUser(null);
    setProfileComplete(false);
    setSyncDone(false);
    syncInFlight.current = false;

    if (isSignedIn) {
      await signOut();
    }
  }, [isSignedIn, signOut]);


  /* ── no-op stubs for legacy consumers (Clerk handles actual login/register) */
  const login    = useCallback(async () => {}, []);
  const register = useCallback(async () => {}, []);


  /* ── Context value ──────────────────────────────────────────────────────── */
  const value = {
    // Core auth
    user:            effectiveUser,
    token:           tokenSnapshot,
    isAuthenticated,
    isDemoMode,
    loading,

    // Profile state
    profileComplete,
    appUser,

    // Actions
    login,
    register,
    demoLogin,
    logout,
    refreshAppUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}