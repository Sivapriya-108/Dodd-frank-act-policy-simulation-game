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
          700: '#1f3f44',
          800: '#164e52',
          900: '#1a1a1a',
          950: '#121212',
        },
        zinc: {
          50: '#fbf6ee',
          100: '#f2e8d9',
          200: '#e6d6bc',
          300: '#d0b894',
          400: '#b7986f',
          500: '#9a7957',
          600: '#6d5348',
          700: '#4a2f3f',
          800: '#2a2a2a',
          900: '#1a1a1a',
          950: '#121212',
        },
        blue: {
          50: '#ecf7f7',
          100: '#d3eeee',
          200: '#aadadb',
          300: '#78bfc2',
          400: '#3ea5b5',
          500: '#1f6f78',
          600: '#164e52',
          700: '#0f3d3e',
          800: '#0c2f31',
          900: '#082325',
          950: '#051719',
        },
        purple: {
          50: '#f7eef3',
          100: '#eddde6',
          200: '#dbbdcd',
          300: '#c18fad',
          400: '#9b6688',
          500: '#7a4a67',
          600: '#5b3a4c',
          700: '#4a2f3f',
          800: '#3c2533',
          900: '#2f1d28',
          950: '#24141d',
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
          50: '#eaf6f7',
          100: '#cde7e9',
          500: '#1f6f78',
          600: '#164e52',
          700: '#0f3d3e',
          800: '#0d3334',
          900: '#0a2628',
        },
        investor: {
          50: '#f8f0f4',
          100: '#ecdce5',
          500: '#7a4a67',
          600: '#5b3a4c',
          700: '#4a2f3f',
          800: '#3d2734',
          900: '#2e1d27',
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
