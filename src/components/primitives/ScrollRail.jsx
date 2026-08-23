import { useScrollProgress } from '@/hooks/useEnvironment';

export function ScrollRail() {
  const progress = useScrollProgress();
  return (
    <div className="fixed top-0 left-0 z-50 h-1 w-full pointer-events-none" aria-hidden>
      <div
        className="h-full origin-left"
        style={{
          width: '100%',
          transform: `scaleX(${progress})`,
          background: 'linear-gradient(90deg, var(--amber), var(--mint))',
          boxShadow: '0 0 8px rgba(255,138,61,0.6)',
          transition: 'transform 0.1s linear',
        }}
      />
    </div>
  );
}
