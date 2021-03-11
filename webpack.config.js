module.exports = {
  entry: './src/index.js',
  target: 'webworker',
  module: {
    rules: [
      {
        test: /\.c?js$/, exclude: /node_modules/, loader: 'babel-loader'
      }
    ]
  }
}