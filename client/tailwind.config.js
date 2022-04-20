module.exports = {
  content: ['./src/**/*.js', './public/index.html'],
  theme: {
    extend: {
      zIndex: {
        '60':  '60',
        '70':  '70',
        '80':  '80',
        '90':  '90',
        '100': '100',
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
