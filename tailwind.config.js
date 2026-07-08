/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        berkeley: {
          red: '#D2322D',
          'red-dark': '#B02824',
          green: '#76A752',
          'green-dark': '#5E8A3E',
          'green-light': '#C5DEB4',
          yellow: '#FFF3B0',
          brick: '#7A9B6E',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        script: ['"Pacifico"', 'cursive'],
        heading: ['"Oswald"', 'sans-serif'],
        sans: ['"Barlow"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        gingham:
          'linear-gradient(45deg, #C5DEB4 25%, transparent 25%), linear-gradient(-45deg, #C5DEB4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #C5DEB4 75%), linear-gradient(-45deg, transparent 75%, #C5DEB4 75%)',
      },
      backgroundSize: {
        gingham: '24px 24px',
      },
      backgroundPosition: {
        gingham: '0 0, 0 12px, 12px -12px, -12px 0px',
      },
      boxShadow: {
        poster: '0 8px 32px rgba(0,0,0,0.25)',
        block: '0 4px 0 rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
