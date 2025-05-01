/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          900: '#1a365d',
          800: '#2a4365',
          700: '#2c5282',
          100: '#ebf8ff',
        },
        gray: {
          950: '#0a0a0a',
          900: '#1a1a1a',
          800: '#2d2d2d',
          700: '#424242',
          600: '#525252',
          500: '#737373',
          400: '#9e9e9e',
          300: '#c8c8c8',
          200: '#e0e0e0',
          100: '#f5f5f5',
          50: '#fafafa',
        },
        green: {
          500: '#48bb78',
        },
        red: {
          500: '#f56565',
        },
      },
    },
  },
  plugins: [],
} 