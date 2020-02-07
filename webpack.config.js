const path = require('path');

const MODE = process.env.NODE_ENV || 'development';

module.exports = {
    entry: {
        index: './src/index.js',
    },
    mode: MODE,
    output: {
        filename: 'gremlins.min2.js',
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
