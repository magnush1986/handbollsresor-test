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
          DEFAULT: '#148424',
          dark: '#0f6319',
          light: '#6ecf7d',
        }
      }
    },
  },
  plugins: [],
}
