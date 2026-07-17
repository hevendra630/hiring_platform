/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: 'rgb(var(--bg-base) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          raised: 'rgb(var(--bg-raised) / <alpha-value>)',
          border: 'rgb(var(--border) / <alpha-value>)',
          background: 'rgb(var(--bg-base) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover) / <alpha-value>)',
          muted: 'rgb(var(--border) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--text-ink) / <alpha-value>)',
          hover: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        warn: 'rgb(var(--text-ink) / <alpha-value>)',
        danger: 'rgb(var(--text-ink) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--text-ink) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
          subtle: 'rgb(var(--border) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
      },
      boxShadow: {
        glow: 'none',
        neon: 'none',
        card: '0 4px 6px -1px rgb(var(--text-ink) / 0.1), 0 2px 4px -2px rgb(var(--text-ink) / 0.1)',
        input: 'none',
      },
    },
  },
  plugins: [],
};
