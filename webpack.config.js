const path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
  },
  mode: 'production',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: 'gremlins',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src')],
      },
    ],
  },
};
