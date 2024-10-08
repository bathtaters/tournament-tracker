module.exports = {
  content: [
    './src/**/*.js',
    './public/index.html',
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
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
      keyframes: {
        pulse70: {
          '0%': { opacity: '0.6' },
          '50%': { opacity: '0.2' },
          '100%': { opacity: '0.6' },
        },
      },
      animation: {
        'pulse-pause': 'pulse70 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        corporate: {
          ...require("daisyui/src/theming/themes")["corporate"],
          'neutral': '#D8D8D8',
          'neutral-focus': '#BBB',
          'neutral-content': '#444',
        },
      },
      {
        business: {
          ...require("daisyui/src/theming/themes")["business"],
          'neutral': '#1A1A1A',
          'neutral-focus': 'black',
          'neutral-content': '#777',
        },
      },
    ],
    darkTheme: 'business',
  }
}
