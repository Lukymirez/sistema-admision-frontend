/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08060d',
          900: '#0f0a18',
          800: '#171022',
          700: '#241a33',
        },
        magenta: {
          600: '#742f6c',
          500: '#9d3f92',
          400: '#c084fc',
        },
        indigo: {
          600: '#4f46e5',
          500: '#6366f1',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #742f6c 0%, #4f46e5 100%)',
      },
    },
  },
  plugins: [],
}
