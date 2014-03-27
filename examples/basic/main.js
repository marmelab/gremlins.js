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
        .before(function(done) {
            var horde = this;
            setTimeout(function(){
                horde.log('async');
                done();
            }, 500);
        })
        .before(function() {
            this.log('sync');
        })
        .gremlin(gremlins.species.formFiller())
        .gremlin(gremlins.species.clicker().clickTypes(['click']))
        .gremlin(gremlins.species.toucher())
        .gremlin(gremlins.species.scroller())
        .gremlin(function() {
            alert('here');
        })
        .after(function() {
            this.log('finished!');
        })
        .mogwai(gremlins.mogwais.alert())
        .mogwai(gremlins.mogwais.fps())
        .mogwai(gremlins.mogwais.gizmo().maxErrors(2))
        .unleash();
});
