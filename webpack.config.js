module.exports = {
  entry: './src/entry.js',
  output: {
    path: __dirname,
    filename: 'build/dev/js/bundle.js'
  },
  loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel', // 'babel-loader' is also a legal name to reference
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
};
