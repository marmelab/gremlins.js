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

    var requestEl = document.getElementById('request');

    setInterval(function() {
        requestEl.innerHTML = '<p>requesting /</p>';
        var req = new XMLHttpRequest();
        //0 or 1
        var rand = Math.round(Math.random());
        if (rand) {
            req.open('GET', '/', true);
        } else {
            req.open('GET', '/404', true);
        }
        var start = (new Date()).getTime();
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                var end = (new Date()).getTime();
                if(req.status == 200) {
                    requestEl.innerHTML = '<p>request succeeded</p>';
                } else {
                    requestEl.innerHTML = '<p>Error encountered while loading the page.</p>';
                }
                requestEl.innerHTML += '<p>Took '+(end - start)+' milliseconds</p>';
            }
        };
        req.send(null);
    }, 1500);

    var ajaxDelayer = gremlins.species.ajaxDelayer().logger(console);

    gremlins.createHorde()
        .gremlin(ajaxDelayer())
        .mogwai(null)
        .unleash();

});
