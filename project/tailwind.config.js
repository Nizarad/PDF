/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)',
        card: '0 1px 3px rgba(15,23,42,0.05), 0 10px 30px -12px rgba(15,23,42,0.12)',
        lift: '0 20px 50px -20px rgba(15,23,42,0.25)',
      },
    },
  },
  plugins: [],
};
