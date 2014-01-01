({
    baseUrl: "../src",
    name: "../build/almond.js",
    include: ['main'],
    insertRequire: ['main'],
    wrap: {
        startFile: '../build/start.frag',
        endFile: '../build/end.frag'
    },
    out: '../gremlins.js',
    optimize: 'none'
})
