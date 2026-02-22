import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm-neutral base palette
        paw: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f4dbb2',
          300: '#ecc07f',
          400: '#e2a04a',
          500: '#d9862a',  // primary amber
          600: '#c06b1e',
          700: '#9d531a',
          800: '#7e421a',
          900: '#673719',
        },
        // Sky-blue secondary
        sky: {
          paw: '#7dc4e4',
        },
        // Surface tokens
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          raised: 'hsl(var(--surface-raised))',
          overlay: 'hsl(var(--surface-overlay))',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'ring-fill': 'ring-fill 1s ease-out forwards',
        'hue-rotate': 'hue-rotate 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-gentle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.9' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'hue-rotate': {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, hsl(var(--bg-warm-from)), hsl(var(--bg-warm-to)))',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
