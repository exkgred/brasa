/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        soot: {
          950: '#140c08',
          900: '#1c120c',
          800: '#2a1b12',
          700: '#3d2618',
          500: '#a88972',
          300: '#f0d7c3',
        },
        ember: {
          DEFAULT: '#f97316',
          hover: '#ea580c',
          dim: '#c2410c',
        },
        slag: {
          DEFAULT: '#65a30d',
        },
        steel: {
          DEFAULT: '#94a3b8',
        },
        copper: {
          DEFAULT: '#d97706',
        },
      },
      boxShadow: {
        ember: '0 20px 60px rgba(249, 115, 22, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
