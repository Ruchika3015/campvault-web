/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
        },
        metal: {
          0: 'var(--metal-0)',
          1: 'var(--metal-1)',
          2: 'var(--metal-2)',
          edge: 'var(--metal-edge)',
        },
        paper: {
          DEFAULT: 'var(--paper)',
          line: 'var(--paper-line)',
          ink: 'var(--paper-ink)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          soft: 'var(--amber-soft)',
          deep: 'var(--amber-deep)',
        },
        mint: {
          DEFAULT: 'var(--mint)',
          soft: 'var(--mint-soft)',
          deep: 'var(--mint-deep)',
        },
        coral: {
          DEFAULT: 'var(--coral)',
          soft: 'var(--coral-soft)',
        },
        ink: {
          0: 'var(--text-0)',
          1: 'var(--text-1)',
          2: 'var(--text-2)',
          3: 'var(--text-3)',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', 'Space Grotesk', 'sans-serif'],
        editorial: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 8px rgba(214,138,60,0.4), 0 0 16px rgba(214,138,60,0.15)',
        'glow-mint': '0 0 8px rgba(93,184,154,0.35), 0 0 16px rgba(93,184,154,0.12)',
        'glow-coral': '0 0 8px rgba(199,93,93,0.35), 0 0 16px rgba(199,93,93,0.12)',
      },
    },
  },
  plugins: [],
};
