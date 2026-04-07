/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './pages/**/*.html',
    './services/**/*.html',
    './js/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'fi-black': '#0a0a0a',
        'fi-dark': '#111111',
        'fi-gray': '#1a1a1a',
        'fi-accent': '#f97316',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
