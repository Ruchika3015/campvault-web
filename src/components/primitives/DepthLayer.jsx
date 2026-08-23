/**
 * A layer placed at a fixed visual depth via translateZ.
 * It does NOT react to the mouse — the scene stays stable on cursor movement.
 * Depth is purely for visual layering (foreground / midground / background).
 */
export function DepthLayer({
  children,
  depth = 0,
  className = '',
  rotate = 0,
  blur = 0,
  style,
  interactive = false,
}) {
  return (
    <div
      className={`will-change-transform ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{
        transform: `translateZ(${depth}px) rotate(${rotate}deg)`,
        transformStyle: 'preserve-3d',
        filter: blur ? `blur(${blur}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * A foreground layer — sits closer to the viewer. No mouse reactivity.
 */
export function ForegroundLayer({ children, depth = 80, className = '', style }) {
  return (
    <div
      className={`will-change-transform ${className}`}
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
