/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tilkapp-blue': '#256874',
        'tilkapp-beige': '#f3eace',
        'tilkapp-orange': '#f75c00',
        'tilkapp-black': '#000000',
        'tilkapp-white': '#ffffff',
      }
    },
  },
  plugins: [],
};