/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pothole': {
          'safe': '#3B82F6',      // Kék - 1-5 bejelentés
          'warning': '#FBBF24',   // Sárga - 6-10 bejelentés
          'danger': '#EF4444',    // Piros - 10+ bejelentés
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
