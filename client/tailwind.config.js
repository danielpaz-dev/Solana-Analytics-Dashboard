/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Unos tonos oscuros personalizados para un estilo cyberpunk/crypto profesional
        darkBg: '#0b0e11',
        darkCard: '#151a20',
        solanaGreen: '#14F195',
        solanaPurple: '#9945FF'
      }
    },
  },
  plugins: [],
}