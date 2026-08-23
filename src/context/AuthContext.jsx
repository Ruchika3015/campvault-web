import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  useEffect(() => {
    // Check for real token first
    const stored = localStorage.getItem('cj_token');
    if (stored) {
      setToken(stored);
      api
        .getProfile()
        .then((data) => {
          setUser(data.user || data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('cj_token');
          setToken(null);
          setUser(null);
          setLoading(false);
        });
      return;
    }

    // Check for demo session
    const demoToken = localStorage.getItem(DEMO_TOKEN_KEY);
    const demoUserStr = localStorage.getItem(DEMO_USER_KEY);
    if (demoToken && demoUserStr) {
      try {
        const demoUser = JSON.parse(demoUserStr);
        setToken(demoToken);
        setUser(demoUser);
        setIsDemoMode(true);
      } catch {
        localStorage.removeItem(DEMO_TOKEN_KEY);
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    const newToken = data.token;
    const newUser = data.user;
    if (!newToken) throw { status: 500, message: 'Authentication failed. No token received.' };
    localStorage.setItem('cj_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setIsDemoMode(false);
    return newUser;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    if (data.token) {
      localStorage.setItem('cj_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsDemoMode(false);
    }
    return data;
  }, []);

  const demoLogin = useCallback(() => {
    const demoToken = 'demo-session-' + Date.now();
    localStorage.setItem(DEMO_TOKEN_KEY, demoToken);
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEMO_USER));
    setToken(demoToken);
    setUser(DEMO_USER);
    setIsDemoMode(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cj_token');
    localStorage.removeItem(DEMO_TOKEN_KEY);
    localStorage.removeItem(DEMO_USER_KEY);
    setToken(null);
    setUser(null);
    setIsDemoMode(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isDemoMode,
        loading,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
