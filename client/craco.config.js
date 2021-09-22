module.exports = {
    style: {
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
    eslint: {
      configure: {
        "plugins": ["react-pug"],
        "extends": [
          "react-app", 
          "plugin:react-pug/all"
        ]
      },
    },
    babel: {
      plugins: [
        "transform-react-pug",
        "transform-react-jsx"
      ],
    },
}