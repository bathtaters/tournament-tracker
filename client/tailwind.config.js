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
      minHeight: {
        '32': '8rem',
      },
      minWidth: {
        '48': '14rem',
      },
      screens: { 'print': {'raw': 'print'}, },
      fontFamily: {
        sans: [ 'Roboto', 'sans-serif' ],
        serif: [ 'Garamond', 'serif' ],
        heading: [ 'Josefin Sans', 'sans-serif' ],
      },
      gridTemplateColumns: {
        'profile': 'max-content 1fr auto',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        corporate: {
          ...require("daisyui/src/colors/themes")["[data-theme=corporate]"],
          'neutral': '#D8D8D8',
          'neutral-focus': '#BBB',
          'neutral-content': '#444',
        },
      },
      {
        business: {
          ...require("daisyui/src/colors/themes")["[data-theme=business]"],
          'neutral': '#1A1A1A',
          'neutral-focus': 'black',
          'neutral-content': '#777',
        },
      },
    ],
    darkTheme: 'business',
  }
}
