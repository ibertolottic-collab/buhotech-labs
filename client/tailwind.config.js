/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7', // Primary Brand Color
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          500: '#f43f5e', // Hearts / Errors
          600: '#e11d48',
        },
        success: {
          500: '#22c55e', // Correct answers
          600: '#16a34a',
        }
      },
      animation: {
        'bounce-short': 'bounce 0.5s ease-in-out 2',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
