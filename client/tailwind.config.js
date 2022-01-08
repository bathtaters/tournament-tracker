// const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      // colors: { green: colors.emerald, },
      screens: {
        'print': {'raw': 'print'},
      },
      fontFamily: {
        sans: [ 'Roboto', 'sans-serif' ],
        serif: [ 'Garamond', 'serif' ],
        heading: [ 'Josefin Sans', 'sans-serif' ],
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}
