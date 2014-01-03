define(function(require) {
    "use strict";

    var executeInSeries = require('../utils/executeInSeries');

    return function() {

        var config = {
            delay: 10, // delay in milliseconds between each wave
            nb: 100    // number of waves to execute (can be overridden in params)
        };

        var stopped;
        var doneCallback;

        // execute all Gremlins species ; repeat 10ms after for 100 times
        function allTogetherStrategy(gremlins, params, done) {
            var nb = params && params.nb ? params.nb : config.nb,
                horde = this;

            stopped = false;
            doneCallback = done; // done can also be called by stop()

            function executeAllGremlins(callback) {
                executeInSeries(gremlins, [], horde, callback);
            }

            function executeNextWave(i) {
                if (stopped) return;
                if (i >= nb) return callDone();
                executeAllGremlins(function() {
                    setTimeout(function() {
                        executeNextWave(++i);
                    }, config.delay);
                });
            }

            executeNextWave(0);
        }

        function callDone() {
            if (typeof doneCallback === 'function') {
                doneCallback();
            }
            doneCallback = null;
        }

        allTogetherStrategy.stop = function() {
            stopped = true;
            setTimeout(callDone, 4);
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
