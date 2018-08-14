const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    basic: ['./examples/basic/basic.css', './examples/basic/basic.js'],
  },
  mode: 'development',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'examples/basic/dist'),
    library: 'gremlins',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'examples/basic'),
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'examples/basic'),
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'examples/basic/index.html'),
    }),
  ],
};
