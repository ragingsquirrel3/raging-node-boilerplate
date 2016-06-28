require('webpack');
const path = require('path');

module.exports = {
  entry: './src/dev_entry.js',
  output: {
    path: path.resolve(__dirname, 'build/prod/assets'),
    publicPath: '/assets/',
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
