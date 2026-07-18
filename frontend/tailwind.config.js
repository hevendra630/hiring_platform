/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: 'hsl(var(--bg-base) / <alpha-value>)',
          surface: 'hsl(var(--bg-surface) / <alpha-value>)',
          raised: 'hsl(var(--bg-raised) / <alpha-value>)',
          border: 'hsl(var(--border) / <alpha-value>)',
          background: 'hsl(var(--bg-base) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          hover: 'hsl(var(--primary-hover) / <alpha-value>)',
          muted: 'hsl(var(--border) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          hover: 'hsl(var(--accent-hover) / <alpha-value>)',
        },
        warn: 'hsl(var(--warn) / <alpha-value>)',
        danger: 'hsl(var(--danger) / <alpha-value>)',
        success: 'hsl(var(--success) / <alpha-value>)',
        ink: {
          DEFAULT: 'hsl(var(--text-ink) / <alpha-value>)',
          muted: 'hsl(var(--text-muted) / <alpha-value>)',
          subtle: 'hsl(var(--text-subtle) / <alpha-value>)',
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
