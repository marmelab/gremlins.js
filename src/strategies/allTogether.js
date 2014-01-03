define(function(require) {
    "use strict";
    return function() {

        var config = {
            delay: 10, // delay in milliseconds between each wave
            nb: 100    // number of waves to execute (can be overridden in params)
        };

        var timeouts = [];
        var doneCallback;

        // every 10ms, execute all Gremlins species ; repeat 100 times
        function allTogetherStrategy(gremlins, params, done) {
            var i = 0,
                j,
                count = gremlins.length,
                nb = params && params.nb ? params.nb : config.nb;
            doneCallback = done; // done can also be called by stop()
            while (i < nb) {
                for (j = 0; j < count; j++) {
                    (function(i, j) {
                        timeouts.push(setTimeout(function(){

                            gremlins[j].apply(this);

                            if (i == nb -1 && j == count - 1){
                                callDone();
                            }
                        }, i * config.delay));
                    })(i, j);
                }
                i++;
            }
        }

        allTogetherStrategy.stop = function() {
            for (var i = 0, nb = timeouts.length ; i < nb ; i++) {
                clearTimeout(timeouts[i]);
            }
            timeouts = [];
            callDone();
        };

        function callDone() {
            if (typeof doneCallback === 'function') {
                doneCallback();
            }
            doneCallback = null;
        }

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
