/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f5',
          100: '#fbe8eb',
          200: '#f7d5da',
          300: '#f0b4bd',
          400: '#e58595',
          500: '#d75a71',
          600: '#c23c57',
          700: '#a32b43',
          800: '#87273b',
          900: '#722436',
          950: '#3f0f1b',
        },
        royal: {
          50: '#f4f6fc',
          100: '#e9edfa',
          200: '#d4def6',
          300: '#b1c3ef',
          400: '#87a0e5',
          500: '#647fd9',
          600: '#4b61cb',
          700: '#3c4cb3',
          800: '#344092',
          900: '#2f3875',
          950: '#1b2045',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}

