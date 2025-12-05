/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css}"
  ],
  theme: {
    extend: {
      colors: {
        blackish: "#111111",
        softblack: "#1a1a1a",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        smoothBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      },
      animation: {
        smoothBounce: 'smoothBounce 2s infinite',
      }
    },
  },
};
