/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#16242e',
        blue: { DEFAULT: '#1f6fd4', deep: '#1559b0' },
        teal: '#2bb3a3',
        muted: { DEFAULT: '#8aa0ab', light: '#9fb2bc' },
        success: '#1aa06a',
        purple: '#6d52f5',
        amber: '#df9620',
      },
      fontFamily: {
        ui: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
