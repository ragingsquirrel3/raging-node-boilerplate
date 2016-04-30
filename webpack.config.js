require('webpack');
const path = require('path');

module.exports = {
  entry: './src/entry.js',
  output: {
    path: path.resolve(__dirname, 'build/dev/assets/js/'),
    publicPath: '/assets/js/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader?presets[]=react,presets[]=es2015'],
      }
    ]
  }
};
