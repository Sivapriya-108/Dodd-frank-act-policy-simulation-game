// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8f3e8',
          100: '#f1e7d3',
          200: '#e4d3b3',
          300: '#d2bc94',
          400: '#b79b6a',
          500: '#8c6a4a',
          600: '#5b3a4c',
          700: '#7a583c',
          800: '#62462f',
          900: '#4b3524',
          950: '#372517',
        },
        zinc: {
          50: '#fbf6ee',
          100: '#f2e8d9',
          200: '#e6d6bc',
          300: '#d0b894',
          400: '#b7986f',
          500: '#9a7957',
          600: '#6d5348',
          700: '#6a4b34',
          800: '#563c2a',
          900: '#452f21',
          950: '#301f14',
        },
        blue: {
          50: '#fbf6ee',
          100: '#f2e8d9',
          200: '#e6d6bc',
          300: '#d0b894',
          400: '#b7986f',
          500: '#9a7957',
          600: '#7a583c',
          700: '#62462f',
          800: '#4b3524',
          900: '#372517',
          950: '#2b1c12',
        },
        purple: {
          50: '#f8f3e8',
          100: '#f1e7d3',
          200: '#e4d3b3',
          300: '#d2bc94',
          400: '#b79b6a',
          500: '#a07a58',
          600: '#8c6a4a',
          700: '#6d5348',
          800: '#563c2a',
          900: '#452f21',
          950: '#301f14',
        },
        government: {
          50: '#fff7e8',
          100: '#fce9c2',
          500: '#d6a94a',
          600: '#c89b3c',
          700: '#b8842f',
          800: '#946823',
          900: '#6f4f19',
        },
        bank: {
          50: '#fbf6ed',
          100: '#efe3cf',
          500: '#b79b6a',
          600: '#a07a58',
          700: '#8c6a4a',
          800: '#71553a',
          900: '#563f2a',
        },
        investor: {
          50: '#fff7e8',
          100: '#fce9c2',
          500: '#d6a94a',
          600: '#c89b3c',
          700: '#b8842f',
          800: '#946823',
          900: '#6f4f19',
        },
        citizen: {
          50: '#fbf6ed',
          100: '#efe3cf',
          500: '#b79b6a',
          600: '#a07a58',
          700: '#8c6a4a',
          800: '#71553a',
          900: '#563f2a',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['IBM Plex Serif', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
