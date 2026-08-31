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
   STORAGE KEYS
================================================================ */

const DEMO_TOKEN_KEY =
  'cj_demo_token';

const DEMO_USER_KEY =
  'cj_demo_user';

const REAL_TOKEN_KEY =
  'cj_token';

const REAL_USER_KEY =
  'cj_user';


/* ================================================================
   AUTH CONTEXT
================================================================ */

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
     RESTORE SESSION ON PAGE LOAD
  ============================================================== */

  useEffect(() => {
    let mounted = true;


    const restoreSession =
      async () => {
        try {

          /* ========================================================
             REAL SESSION
          ======================================================== */

          const storedToken =
            sessionStorage.getItem(
              REAL_TOKEN_KEY
            );

          const storedUserString =
            sessionStorage.getItem(
              REAL_USER_KEY
            );


          if (storedToken) {

            /*
             * Restore cached user first.
             */

            let cachedUser = null;


            if (storedUserString) {

              try {
                cachedUser =
                  JSON.parse(
                    storedUserString
                  );
              } catch (error) {

                console.error(
                  'Invalid cached user:',
                  error
                );

                sessionStorage.removeItem(
                  REAL_USER_KEY
                );
              }
            }


            if (!mounted) {
              return;
            }


            /*
             * Restore authentication immediately.
             */

            setToken(
              storedToken
            );

            setIsDemoMode(
              false
            );


            if (cachedUser) {
              setUser(
                cachedUser
              );
            }


            /*
             * Ask backend for the latest
             * profile information.
             */

            try {

              const profileResponse =
                await api.getProfile();


              if (!mounted) {
                return;
              }


              const profileUser =
                profileResponse?.data ||
                profileResponse?.user ||
                null;


              /*
               * IMPORTANT:
               *
               * DO NOT replace the cached
               * full user with a partial
               * profile response.
               *
               * Merge them instead.
               */

              if (profileUser) {

                const mergedUser = {
                  ...(cachedUser || {}),
                  ...profileUser,
                };


                setUser(
                  mergedUser
                );


                /*
                 * Save the merged user so
                 * refresh works again.
                 */

                sessionStorage.setItem(
                  REAL_USER_KEY,
                  JSON.stringify(
                    mergedUser
                  )
                );
              }

            } catch (error) {

              console.error(
                'Failed to refresh user profile:',
                error
              );


              /*
               * IMPORTANT:
               *
               * If we already have a cached
               * valid-looking user, keep the
               * session instead of turning
               * the user into Guest.
               */

              if (!cachedUser) {

                sessionStorage.removeItem(
                  REAL_TOKEN_KEY
                );

                sessionStorage.removeItem(
                  REAL_USER_KEY
                );


                setToken(null);

                setUser(null);

                setIsDemoMode(false);
              }
            }


            if (mounted) {
              setLoading(false);
            }


            return;
          }


          /* ========================================================
             DEMO SESSION
          ======================================================== */

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


          /* ========================================================
             NO SESSION
          ======================================================== */

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
            REAL_USER_KEY
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
          data?.user ||
          data?.data;


        if (!newToken) {

          throw {
            status: 500,
            message:
              'Authentication failed. No token received.',
          };
        }


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
         * Save real token.
         */

        sessionStorage.setItem(
          REAL_TOKEN_KEY,
          newToken
        );


        /*
         * Save complete user.
         */

        sessionStorage.setItem(
          REAL_USER_KEY,
          JSON.stringify(
            newUser
          )
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


        if (data?.token) {

          const registeredUser =
            data?.user ||
            data?.data ||
            null;


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
           * Save token.
           */

          sessionStorage.setItem(
            REAL_TOKEN_KEY,
            data.token
          );


          /*
           * Save user.
           */

          if (registeredUser) {

            sessionStorage.setItem(
              REAL_USER_KEY,
              JSON.stringify(
                registeredUser
              )
            );
          }


          setToken(
            data.token
          );

          setUser(
            registeredUser
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
         * Clear real session.
         */

        sessionStorage.removeItem(
          REAL_TOKEN_KEY
        );

        sessionStorage.removeItem(
          REAL_USER_KEY
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
         * Clear real session.
         */

        sessionStorage.removeItem(
          REAL_TOKEN_KEY
        );

        sessionStorage.removeItem(
          REAL_USER_KEY
        );


        /*
         * Clear demo session.
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

        setToken(null);

        setUser(null);

        setIsDemoMode(false);
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


export default AuthContext;