import type { Config } from 'tailwindcss';

/**
 * "Warm Editorial Concierge" design system — light theme only.
 * Warm ivory canvas, deep-plum ink, dusty rose, soft gold (CTAs), sage (success).
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FBF7F4',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#3B2A30',
          soft: '#5E4D54',
          muted: '#7E6F75',
        },
        rose: {
          DEFAULT: '#C2848B',
          soft: '#E7D2D5',
          deep: '#A86A72',
        },
        gold: {
          DEFAULT: '#B68A3E',
          soft: '#E8D8B8',
          deep: '#9A7330',
        },
        sage: {
          DEFAULT: '#8FA68E',
          soft: '#DDE6DC',
          deep: '#6E8A6D',
        },
        line: '#EFE6E0',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(59,42,48,0.04), 0 4px 16px rgba(59,42,48,0.06)',
        card: '0 2px 6px rgba(59,42,48,0.05), 0 12px 32px rgba(59,42,48,0.07)',
        float: '0 8px 24px rgba(59,42,48,0.10), 0 24px 60px rgba(59,42,48,0.10)',
        focus: '0 0 0 3px rgba(194,132,139,0.35)',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
