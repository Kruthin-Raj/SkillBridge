/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // One accent per mode, so the toggle is obvious at a glance.
        freelance: '#0f766e',
        exchange: '#6d28d9',
      },
    },
  },
  plugins: [],
};
