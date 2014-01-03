define(function(require) {
    "use strict";

    var executeInSeries = require('../utils/executeInSeries');

    return function() {

        var config = {
            delay: 10, // delay in milliseconds between each wave
            nb: 100    // number of waves to execute (can be overridden in params)
        };

        var timeouts = [];
        var doneCallback;

        // execute all Gremlins species ; repeat 10ms after for 100 times
        function allTogetherStrategy(gremlins, params, done) {
            var i = 0,
                nb = params && params.nb ? params.nb : config.nb,
                horde = this;
            doneCallback = done; // done can also be called by stop()

            function executeAllGremlins(callback) {
                executeInSeries(gremlins, [], horde, callback);
            }

            function executeNextWave() {
                i++;
                executeAllGremlins(function() {
                    if (i < nb) {
                        timeouts.push(setTimeout(executeNextWave, config.delay));
                    } else {
                        callDone();
                    }
                });
            }

            executeNextWave();
        }

        function callDone() {
            if (typeof doneCallback === 'function') {
                doneCallback();
            }
            doneCallback = null;
        }

        allTogetherStrategy.stop = function() {
            for (var i = 0, nb = timeouts.length ; i < nb ; i++) {
                clearTimeout(timeouts[i]);
            }
            timeouts = [];
            callDone();
        };

        allTogetherStrategy.delay = function(delay) {
            if (!arguments.length) return config.delay;
            config.delay = delay;
            return allTogetherStrategy;
        };

        allTogetherStrategy.nb = function(nb) {
            if (!arguments.length) return config.nb;
            config.nb = nb;
            return allTogetherStrategy;
        };

        return allTogetherStrategy;
    };
});
