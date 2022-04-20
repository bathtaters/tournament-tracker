module.exports = {
  content: ['./src/**/*.js', './public/index.html'],
  theme: {
    extend: {
      zIndex: {

      },
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
    require('daisyui'),
  ],
  daisyui: {
    themes: ['corporate', 'business'],
    darkTheme: 'business',
  }
}
