var sources = ['./src/main.js'];

if (process.env.NODE_ENV !== 'production') { // for live reload
    sources.push('webpack-dev-server/client?http://localhost:8080');
}

module.exports = {
    entry: {
        gremlins: sources
    },
    output: {
        filename: "gremlins.min.js",
        publicPath: "http://localhost:8080/",
        libraryTarget: "umd"
    }
};
