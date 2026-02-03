/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'bounce-soft': 'bounce-soft 0.6s ease-in-out',
        'pokeball-shake': 'pokeball-shake 0.5s ease-in-out',
        'capture': 'capture 0.8s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pokeball-shake': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-20deg)' },
          '75%': { transform: 'rotate(20deg)' },
        },
        capture: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.5)', opacity: '0.5' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #ff0000, 0 0 10px #ff0000' },
          '50%': { boxShadow: '0 0 20px #ff0000, 0 0 30px #ff0000' },
        },
      },
    },
  },
  plugins: [],
}
