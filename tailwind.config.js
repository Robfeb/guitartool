/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'studio-darker': 'var(--bg-page)',
        'studio-dark': 'var(--bg-panel)',
        'gray-800': 'var(--border-subtle)',
        'gray-700': 'var(--border-subtle)',
        'string': 'var(--string-color)',
        'white': 'var(--text-primary)',
        'fretboard': 'var(--fretboard-bg)',
        'fret': 'var(--fret-color)',
        'highlight': 'var(--bg-highlight)',
        'root': 'var(--bg-root)',
      }
    },
  },
  plugins: [],
}

