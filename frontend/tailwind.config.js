/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0B0F19', // app background - near-black navy
          surface: '#131826', // card/panel surface
          raised: '#1B2333', // hover/raised surface
          border: '#262E42',
        },
        primary: {
          DEFAULT: '#6366F1', // indigo - primary actions, links
          hover: '#818CF8',
          muted: '#1E2150',
        },
        accent: {
          DEFAULT: '#34D399', // mint - scores, success, "live" signals
          hover: '#6EE7B7',
        },
        warn: '#FBBF24',
        danger: '#F87171',
        ink: {
          DEFAULT: '#E5E7EB', // primary text on dark surfaces
          muted: '#94A3B8',
          subtle: '#5B6478',
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
        glow: '0 0 0 1px rgba(99,102,241,0.35), 0 8px 24px -8px rgba(99,102,241,0.25)',
      },
    },
  },
  plugins: [],
};
