/**
 * Execute all Gremlins species at once ; repeat 10ms after for 100 times
 *
 *   var allTogetherStrategy = gremlins.strategies.allTogether();
 *   horde.strategy(allTogetherStrategy);
 *
 * The actual attack duration depends on the number of species in the horde.
 */
define(function(require) {
    "use strict";

    var executeInSeries = require('../utils/executeInSeries');
    var configurable = require('../utils/configurable');

    return function() {

        /**
         * @mixin
         */
        var config = {
            delay: 10, // delay in milliseconds between each wave
            nb: 100    // number of waves to execute (can be overridden in params)
        };

        var stopped;
        var doneCallback;

        /**
         * @mixes config
         */
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

        configurable(allTogetherStrategy, config);

        return allTogetherStrategy;
    };
});
