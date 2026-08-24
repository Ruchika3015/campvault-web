import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { api } from '@/services/api';

const DEMO_USER = {
  id: 'demo-user',
  name: 'Demo Student',
  email: 'demo@campusjugaad.demo',
  role: 'student',
  college: 'Demo Campus Institute',
  department: 'CSE',
  year: '2nd Year',
  jugaadScore: 750,
  jugaadsCompleted: 5,
  rating: 4.5,
  avatar: 'DS',
};

const DEMO_TOKEN_KEY = 'cj_demo_token';
const DEMO_USER_KEY = 'cj_demo_user';
const REAL_TOKEN_KEY = 'cj_token';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isDemoMode: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  demoLogin: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================================================================
  // RESTORE SESSION ON PAGE LOAD
  // ================================================================

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        // ------------------------------------------------------------
        // 1. Check REAL login session first
        // ------------------------------------------------------------

        const storedToken = localStorage.getItem(REAL_TOKEN_KEY);

        if (storedToken) {
          try {
            const profileResponse = await api.getProfile();

            if (!mounted) return;

            // Backend returns:
            // {
            //   success: true,
            //   data: user
            // }
            const currentUser =
              profileResponse?.data ||
              profileResponse?.user ||
              profileResponse;

            setToken(storedToken);
            setUser(currentUser);
            setIsDemoMode(false);
            setLoading(false);

            return;
          } catch (error) {
            // Token is invalid/expired.
            // Remove it and continue checking demo session.
            localStorage.removeItem(REAL_TOKEN_KEY);

            if (mounted) {
              setToken(null);
              setUser(null);
              setIsDemoMode(false);
            }
          }
        }

        // ------------------------------------------------------------
        // 2. Check DEMO session
        // ------------------------------------------------------------

        const demoToken = localStorage.getItem(DEMO_TOKEN_KEY);
        const demoUserString = localStorage.getItem(DEMO_USER_KEY);

        if (demoToken && demoUserString) {
          try {
            const demoUser = JSON.parse(demoUserString);

            if (!mounted) return;

            setToken(demoToken);
            setUser(demoUser);
            setIsDemoMode(true);
            setLoading(false);

            return;
          } catch {
            localStorage.removeItem(DEMO_TOKEN_KEY);
            localStorage.removeItem(DEMO_USER_KEY);
          }
        }

        // ------------------------------------------------------------
        // 3. No session
        // ------------------------------------------------------------

        if (mounted) {
          setToken(null);
          setUser(null);
          setIsDemoMode(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to restore authentication session:', error);

        if (mounted) {
          localStorage.removeItem(REAL_TOKEN_KEY);
          localStorage.removeItem(DEMO_TOKEN_KEY);
          localStorage.removeItem(DEMO_USER_KEY);

          setToken(null);
          setUser(null);
          setIsDemoMode(false);
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  // ================================================================
  // REAL LOGIN
  // ================================================================

  const login = useCallback(async (email, password) => {
    const data = await api.login({
      email,
      password,
    });

    const newToken = data?.token;
    const newUser = data?.user;

    if (!newToken) {
      throw {
        status: 500,
        message: 'Authentication failed. No token received.',
      };
    }

    if (!newUser) {
      throw {
        status: 500,
        message: 'Authentication failed. User information was not received.',
      };
    }

    // Remove demo session
    localStorage.removeItem(DEMO_TOKEN_KEY);
    localStorage.removeItem(DEMO_USER_KEY);

    // Save REAL session
    localStorage.setItem(REAL_TOKEN_KEY, newToken);

    // Update React state
    setToken(newToken);
    setUser(newUser);
    setIsDemoMode(false);

    return newUser;
  }, []);

  // ================================================================
  // REGISTER
  // ================================================================

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);

    // Some backends automatically log the user in after registration.
    // If a token is returned, establish the session.
    if (data?.token) {
      localStorage.removeItem(DEMO_TOKEN_KEY);
      localStorage.removeItem(DEMO_USER_KEY);

      localStorage.setItem(REAL_TOKEN_KEY, data.token);

      setToken(data.token);
      setUser(data.user || data.data || null);
      setIsDemoMode(false);
    }

    return data;
  }, []);

  // ================================================================
  // DEMO LOGIN
  // ================================================================

  const demoLogin = useCallback(() => {
    // Remove any real session before entering demo mode.
    localStorage.removeItem(REAL_TOKEN_KEY);

    const demoToken = `demo-session-${Date.now()}`;

    localStorage.setItem(DEMO_TOKEN_KEY, demoToken);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEMO_USER));

    setToken(demoToken);
    setUser(DEMO_USER);
    setIsDemoMode(true);
  }, []);

  // ================================================================
  // LOGOUT
  // ================================================================

  const logout = useCallback(() => {
    // Remove BOTH real and demo sessions.
    localStorage.removeItem(REAL_TOKEN_KEY);
    localStorage.removeItem(DEMO_TOKEN_KEY);
    localStorage.removeItem(DEMO_USER_KEY);

    // Clear React authentication state.
    setToken(null);
    setUser(null);
    setIsDemoMode(false);
  }, []);

  // ================================================================
  // CONTEXT VALUE
  // ================================================================

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isDemoMode,
    loading,
    login,
    register,
    demoLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}