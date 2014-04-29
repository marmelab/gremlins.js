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


    setInterval(function() {
        var req = new XMLHttpRequest();
        req.open('GET', '/error', true);
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if(req.status == 200)
                    console.log('bingo');
                else
                    console.log("Erreur pendant le chargement de la page.\n");
            }
        };
        req.send(null);
    }, 1000);

    var ajaxDelayer = gremlins.species.ajaxDelayer().logger(console);


    setTimeout(function () {
        ajaxDelayer.stop();
    }, 10000);

    gremlins.createHorde()
        .gremlin(ajaxDelayer())
        .unleash();

});
