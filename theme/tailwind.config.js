/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './main/templates/**/*.html',
    './**/templates/**/*.html',  // For any other template directories
    './**/static/**/*.js'       // For JavaScript files in static directories
],
  theme: {
    extend: {
      colors: {
        tactical: {
          green: '#14ff6a',
          dark: '#0a0f0a',
          grid: 'rgba(20, 255, 106, 0.08)',
        },
      },
      fontFamily: {
        mono: ['Fira Code', 'monospace'],
      },
      backgroundImage: {
        'tactical-grid': "url('/static/img/grid.png')",
        'tactical-bg': "url('/static/img/tactical-bg.jpg')",
      },
    },
  },
  plugins: [],
};