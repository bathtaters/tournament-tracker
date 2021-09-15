module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'media',
  theme: {
    extend: {
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
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundOpacity: ['hover', 'focus', 'active', 'disabled'],
      backgroundColor: ['active'],
      textColor: ['active'],
      translate: ['active'],
    },
  },
  plugins: [],
}
