require.config({
    packages: [{ name: 'gremlins', location: '../../src' }]
    /*
    // alternative: use the packaged version
    paths: {
        gremlins:  '../../gremlins.min'
    }
    */
});

require(['gremlins'], function(gremlins) {
    gremlins.createHorde()
        .gremlin(gremlins.species.toucher())
        .after(function() {
            this.log('finished!');
        })
        .mogwai(gremlins.mogwais.gizmo().maxErrors(2))
        .unleash(5);
});
