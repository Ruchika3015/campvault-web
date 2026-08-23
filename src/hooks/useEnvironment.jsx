import { createContext, useContext, useEffect, useRef, useState } from 'react';

const EnvironmentContext = createContext({
  scrollY: 0,
  reducedMotion: false,
});

export function useEnvironment() {
  return useContext(EnvironmentContext);
}

/**
 * Provides global environment state (scroll position, reduced-motion).
 * No mouse/pointer tracking — the scene stays stable when the cursor moves.
 */
export function EnvironmentProvider({ children }) {
  const [state, setState] = useState({
    scrollY: 0,
    reducedMotion: false,
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () =>
      setState((s) => ({ ...s, reducedMotion: mq.matches }));
    updateMotion();
    mq.addEventListener?.('change', updateMotion);

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setState((s) => ({ ...s, scrollY: window.scrollY }));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      mq.removeEventListener?.('change', updateMotion);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <EnvironmentContext.Provider value={state}>
      {children}
    </EnvironmentContext.Provider>
  );
}

/**
 * Returns true once an element scrolls into view (once by default).
 */
export function useInView(options = { threshold: 0.2 }, once = true) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      options,
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [once]);

  return { ref, inView };
}

/**
 * Scroll progress of the whole page, 0 → 1.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? window.scrollY / max : 0);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return progress;
}
