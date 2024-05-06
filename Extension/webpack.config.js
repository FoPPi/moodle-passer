const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const browserDir = path.resolve(__dirname, 'dist', process.env.BROWSER);

const patterns = [
  {
    from: process.env.BROWSER === 'chrome' ? 'src/manifest.json' : 'src/manifest.firefox.json',
    to: path.resolve(browserDir, 'manifest.json')
  },
]

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    background: './src/scripts/background.js',
    popup: './src/scripts/popup.js',
    main: './src/scripts/modules/main.js'
  },
  output: {
    path: path.resolve(browserDir, 'scripts'), 
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        ...patterns,
        { from: 'src/icons', to: path.resolve(browserDir, 'icons') },
        { from: 'src/pages', to: path.resolve(browserDir, 'pages') }, 
        { from: 'src/styles', to: path.resolve(browserDir, 'styles') } 
      ]
    })
  ]
};
