/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          light: '#DCFCE7',
          hover: '#15803D'
        },
        background: '#F8FAFC',
        card: '#FFFFFF',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          light: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 30px rgba(0, 0, 0, 0.03)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
