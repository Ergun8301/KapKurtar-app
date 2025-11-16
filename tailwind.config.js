/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tilkapp-green': '#00A690',
        'tilkapp-beige': '#F7F2E7',
        'tilkapp-orange': '#F75C00',
        'kapkurtar-verdigris': '#00A690',
        'kapkurtar-teal': '#00615F',
        'kapkurtar-orange': '#F75C00',
        'kapkurtar-cream': '#F7F2E7',
      }
    },
  },
  plugins: [],
};