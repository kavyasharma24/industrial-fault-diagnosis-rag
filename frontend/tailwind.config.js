/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          sidebar: 'var(--color-sidebar)',
          surface: 'var(--color-surface)',
          teal: 'var(--color-teal)',
          'teal-hover': 'var(--color-teal-hover)',
          text: 'var(--color-text)',
          'text-muted': 'var(--color-text-muted)',
          border: 'var(--color-border)',
          'dusty-blue': 'var(--color-dusty-blue)',
          lavender: 'var(--color-lavender)',
          peach: 'var(--color-peach)',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
