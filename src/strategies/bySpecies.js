define(function(require) {
    "use strict";
    return function() {

        var config = {
            delay: 10, // delay in milliseconds between each attack
            nb: 100    // number of attacks to execute (can be overridden in params)
        };

        var timeouts = [];
        var finalDone;

        // for each species, execute the gremlin 100 times, separated by a 10ms delay
        function bySpeciesStrategy(gremlins, params, done) {
            var i, j,
                count = gremlins.length,
                nb = params && params.nb ? params.nb : config.nb;
            finalDone = done;
            for (j = 0; j < count; j++) {
                i = 0;
                while (i < nb) {
                    (function(i, j) {
                        timeouts.push(setTimeout(function(){

                            gremlins[j].apply(this);

                            if (i == nb -1 && j == count - 1) {
                                done();
                            }
                        }, j * nb * config.delay + i * config.delay));
                    })(i, j);
                    i++;
                }
            }
        }

        bySpeciesStrategy.stop = function() {
            for (var i = 0, nb = timeouts.length ; i < nb ; i++) {
                clearTimeout(timeouts[i]);
            }
            timeouts = [];
            finalDone();
        };

        bySpeciesStrategy.delay = function(delay) {
            if (!arguments.length) return config.delay;
            config.delay = delay;
            return bySpeciesStrategy;
        };

        bySpeciesStrategy.nb = function(nb) {
            if (!arguments.length) return config.nb;
            config.nb = nb;
            return bySpeciesStrategy;
        };

        return bySpeciesStrategy;
    };
});
