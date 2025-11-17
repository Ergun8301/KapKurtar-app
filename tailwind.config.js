/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'kapkurtar': {
          'green': '#00A690',
          'green-light': '#70c8ad',
          'yellow': '#e2fd66',
          'gray': '#5c6a75',
        },
        // Legacy colors for backward compatibility
        'tilkapp-green': '#00A690',
        'tilkapp-beige': '#F7F2E7',
        'tilkapp-orange': '#F75C00',
      }
    },
  },
  plugins: [],
};