import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import { api } from '@/services/api';


/* ================================================================
   DEMO USER
================================================================ */

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


/* ================================================================
   STORAGE KEYS
================================================================ */

const DEMO_TOKEN_KEY =
  'cj_demo_token';

const DEMO_USER_KEY =
  'cj_demo_user';

const REAL_TOKEN_KEY =
  'cj_token';


/* ================================================================
   AUTH CONTEXT
================================================================ */

const AuthContext =
  createContext({
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


/* ================================================================
   useAuth
================================================================ */

export function useAuth() {
  return useContext(
    AuthContext
  );
}


/* ================================================================
   AUTH PROVIDER
================================================================ */

export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    token,
    setToken,
  ] = useState(null);

  const [
    isDemoMode,
    setIsDemoMode,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);


  /* ==============================================================
     RESTORE SESSION
  ============================================================== */

  useEffect(() => {
    let mounted = true;

    const restoreSession =
      async () => {
        try {

          /*
           * ======================================================
           * 1. REAL LOGIN SESSION
           *
           * IMPORTANT:
           * Authentication is now stored in sessionStorage.
           *
           * This means:
           * - refresh keeps the session
           * - closing the tab removes the session
           * - opening a fresh tab requires login
           * ======================================================
           */

          const storedToken =
            sessionStorage.getItem(
              REAL_TOKEN_KEY
            );


          if (storedToken) {

            try {

              const profileResponse =
                await api.getProfile();

              if (!mounted) {
                return;
              }


              /*
               * Backend normally returns:
               *
               * {
               *   success: true,
               *   data: user
               * }
               */

              const currentUser =
                profileResponse?.data ||
                profileResponse?.user ||
                profileResponse;


              if (!currentUser) {
                throw new Error(
                  'User profile was not returned.'
                );
              }


              setToken(
                storedToken
              );

              setUser(
                currentUser
              );

              setIsDemoMode(
                false
              );

              setLoading(
                false
              );

              return;

            } catch (error) {

              /*
               * Stored token is invalid,
               * expired, or belongs to an
               * invalid session.
               */

              console.error(
                'Stored authentication session is invalid:',
                error
              );


              sessionStorage.removeItem(
                REAL_TOKEN_KEY
              );


              if (mounted) {

                setToken(null);

                setUser(null);

                setIsDemoMode(false);
              }
            }
          }


          /*
           * ======================================================
           * 2. DEMO SESSION
           * ======================================================
           */

          const demoToken =
            sessionStorage.getItem(
              DEMO_TOKEN_KEY
            );

          const demoUserString =
            sessionStorage.getItem(
              DEMO_USER_KEY
            );


          if (
            demoToken &&
            demoUserString
          ) {

            try {

              const demoUser =
                JSON.parse(
                  demoUserString
                );


              if (!mounted) {
                return;
              }


              setToken(
                demoToken
              );

              setUser(
                demoUser
              );

              setIsDemoMode(
                true
              );

              setLoading(
                false
              );

              return;

            } catch (error) {

              console.error(
                'Invalid demo session:',
                error
              );


              sessionStorage.removeItem(
                DEMO_TOKEN_KEY
              );

              sessionStorage.removeItem(
                DEMO_USER_KEY
              );
            }
          }


          /*
           * ======================================================
           * 3. NO SESSION
           * ======================================================
           */

          if (mounted) {

            setToken(null);

            setUser(null);

            setIsDemoMode(false);

            setLoading(false);
          }

        } catch (error) {

          console.error(
            'Failed to restore authentication session:',
            error
          );


          sessionStorage.removeItem(
            REAL_TOKEN_KEY
          );

          sessionStorage.removeItem(
            DEMO_TOKEN_KEY
          );

          sessionStorage.removeItem(
            DEMO_USER_KEY
          );


          if (mounted) {

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


  /* ==============================================================
     REAL LOGIN
  ============================================================== */

  const login =
    useCallback(
      async (
        email,
        password
      ) => {

        const data =
          await api.login({
            email,
            password,
          });


        const newToken =
          data?.token;

        const newUser =
          data?.user;


        /*
         * Validate token.
         */

        if (!newToken) {

          throw {
            status: 500,
            message:
              'Authentication failed. No token received.',
          };
        }


        /*
         * Validate user.
         */

        if (!newUser) {

          throw {
            status: 500,
            message:
              'Authentication failed. User information was not received.',
          };
        }


        /*
         * Remove demo session.
         */

        sessionStorage.removeItem(
          DEMO_TOKEN_KEY
        );

        sessionStorage.removeItem(
          DEMO_USER_KEY
        );


        /*
         * IMPORTANT:
         *
         * Store the real authentication
         * token in sessionStorage.
         */

        sessionStorage.setItem(
          REAL_TOKEN_KEY,
          newToken
        );


        /*
         * Update React state.
         */

        setToken(
          newToken
        );

        setUser(
          newUser
        );

        setIsDemoMode(
          false
        );


        return newUser;
      },
      []
    );


  /* ==============================================================
     REGISTER
  ============================================================== */

  const register =
    useCallback(
      async (
        payload
      ) => {

        const data =
          await api.register(
            payload
          );


        /*
         * Some backends automatically
         * log the user in after registration.
         */

        if (data?.token) {

          sessionStorage.removeItem(
            DEMO_TOKEN_KEY
          );

          sessionStorage.removeItem(
            DEMO_USER_KEY
          );


          sessionStorage.setItem(
            REAL_TOKEN_KEY,
            data.token
          );


          setToken(
            data.token
          );

          setUser(
            data.user ||
            data.data ||
            null
          );

          setIsDemoMode(
            false
          );
        }


        return data;
      },
      []
    );


  /* ==============================================================
     DEMO LOGIN
  ============================================================== */

  const demoLogin =
    useCallback(
      () => {

        /*
         * Remove real authentication.
         */

        sessionStorage.removeItem(
          REAL_TOKEN_KEY
        );


        /*
         * Create demo session.
         */

        const demoToken =
          `demo-session-${Date.now()}`;


        sessionStorage.setItem(
          DEMO_TOKEN_KEY,
          demoToken
        );


        sessionStorage.setItem(
          DEMO_USER_KEY,
          JSON.stringify(
            DEMO_USER
          )
        );


        /*
         * Update state.
         */

        setToken(
          demoToken
        );

        setUser(
          DEMO_USER
        );

        setIsDemoMode(
          true
        );
      },
      []
    );


  /* ==============================================================
     LOGOUT
  ============================================================== */

  const logout =
    useCallback(
      () => {

        /*
         * Remove real session.
         */

        sessionStorage.removeItem(
          REAL_TOKEN_KEY
        );


        /*
         * Remove demo session.
         */

        sessionStorage.removeItem(
          DEMO_TOKEN_KEY
        );

        sessionStorage.removeItem(
          DEMO_USER_KEY
        );


        /*
         * Clear React state.
         */

        setToken(
          null
        );

        setUser(
          null
        );

        setIsDemoMode(
          false
        );
      },
      []
    );


  /* ==============================================================
     CONTEXT VALUE
  ============================================================== */

  const value = {
    user,

    token,

    isAuthenticated:
      Boolean(token),

    isDemoMode,

    loading,

    login,

    register,

    demoLogin,

    logout,
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}