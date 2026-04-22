/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e6f6f0',
          100: '#ccece1',
          200: '#99d9c4',
          300: '#66c6a6',
          400: '#33b389',
          500: '#00aa6c', // TripAdvisor Green
          600: '#009961',
          700: '#008856',
          800: '#00774b',
          900: '#006641',
          950: '#00442b',
        },
        emerald: {
          DEFAULT: '#059669',
        },
      },
      boxShadow: {
        'ta': '0 4px 12px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1)',
        'ta-hover': '0 12px 24px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.1)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
