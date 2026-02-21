/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        green: {
          primary: '#22c55e',
          hover: '#16a34a',
          light: '#86efac',
          bg: '#f0fdf4',
          'bg-dark': '#0a2e14',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
