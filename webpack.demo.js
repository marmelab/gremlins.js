const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        basic: [
            './examples/basic/basic.css',
            './examples/basic/basic.js',
            './src/index.js',
        ],
        touch: [
            './examples/touch/touch.css',
            './examples/touch/touch.js',
            './src/index.js',
        ],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                use: 'babel-loader',
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'examples/basic'),
                    path.resolve(__dirname, 'examples/touch'),
                ],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'examples/basic'),
                    path.resolve(__dirname, 'examples/touch'),
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Basic Gremlins Example',
            filename: 'index.html',
            template: path.join(__dirname, 'examples/basic/index.html'),
            chunks: ['basic'],
            inject: true,
        }),
        new HtmlWebpackPlugin({
            title: 'Touch Gremlins Example',
            filename: 'touch/index.html',
            template: path.join(__dirname, 'examples/touch/index.html'),
            chunks: ['touch'],
            inject: true,
        }),
    ],
};
