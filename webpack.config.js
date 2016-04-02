module.exports = {
  entry: './src/entry.js',
  output: {
    path: __dirname,
    filename: 'build/dev/js/bundle.js'
  },
  loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader?presets[]=react,presets[]=es2015'],
      }
    ]
};
