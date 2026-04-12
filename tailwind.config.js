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
          50: '#fff8e8',
          100: '#fbeecb',
          200: '#f6dea0',
          300: '#eecf6d',
          400: '#e6c15c',
          500: '#f4a127',
          600: '#e5771e',
          700: '#9f5d2a',
          800: '#5a3d2b',
          900: '#3f2a1f',
          950: '#2a1c15',
        },
        zinc: {
          50: '#fef9ef',
          100: '#f5ead7',
          200: '#ead2ab',
          300: '#d7b77c',
          400: '#bf9454',
          500: '#8f6a42',
          600: '#724f33',
          700: '#5a3d2b',
          800: '#4a3325',
          900: '#38271d',
          950: '#271b14',
        },
        blue: {
          50: '#f2f5e6',
          100: '#e4ebcc',
          200: '#cad79a',
          300: '#adbf66',
          400: '#8fa448',
          500: '#758c32',
          600: '#66792d',
          700: '#566627',
          800: '#465321',
          900: '#36401a',
          950: '#252b12',
        },
        purple: {
          50: '#fdf6e7',
          100: '#f8e9c8',
          200: '#f1d696',
          300: '#eab964',
          400: '#e6c15c',
          500: '#f4a127',
          600: '#e5771e',
          700: '#a65c26',
          800: '#7a4627',
          900: '#5a3d2b',
          950: '#3d291d',
        },
        government: {
          50: '#fff8e8',
          100: '#fbeecb',
          500: '#e6c15c',
          600: '#f4a127',
          700: '#e5771e',
          800: '#9f5d2a',
          900: '#5a3d2b',
        },
        bank: {
          50: '#f2f5e6',
          100: '#e4ebcc',
          500: '#758c32',
          600: '#66792d',
          700: '#566627',
          800: '#465321',
          900: '#36401a',
        },
        investor: {
          50: '#fdf6e7',
          100: '#f8e9c8',
          500: '#f4a127',
          600: '#e5771e',
          700: '#a65c26',
          800: '#7a4627',
          900: '#5a3d2b',
        },
        citizen: {
          50: '#fef9ef',
          100: '#f5ead7',
          500: '#e6c15c',
          600: '#bf9454',
          700: '#8f6a42',
          800: '#724f33',
          900: '#5a3d2b',
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
