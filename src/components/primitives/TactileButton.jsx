import { useState } from 'react';

const variantClass = {
  amber: 'machine-control--primary',
  mint: 'machine-control--secondary',
  ghost: 'machine-control--ghost',
};

/**
 * A tactile machine-style control — dark metal surface, subtle border,
 * small indicator LED, mechanical press. No gradient/glow buttons.
 */
export function TactileButton({
  children,
  variant = 'amber',
  onClick,
  className = '',
  type = 'button',
  ariaLabel,
  id,
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      type={type}
      id={id}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className={`machine-control ${variantClass[variant]} ${className}`}
      style={pressed ? { transform: 'translateY(1px)' } : undefined}
    >
      <span className="ctrl-led" />
      <span className="flex items-center gap-2">{children}</span>
    </button>
  );
}
