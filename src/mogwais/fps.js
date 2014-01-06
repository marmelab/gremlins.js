/**
 * The fps mogwai logs the number of frames per seconds (FPS) of the browser
 * 
 * The normal (and maximal) FPS rate is 60. It decreases when the browser is
 * busy refreshing the layout, or executing JavaScript.
 *
 * This mogwai logs with the error level once the FPS rate drops below 10.
 *
 *   var fpsMogwai = gremlins.mogwais.fps();
 *   horde.mogwai(fpsMogwai);
 *
 * The fps mogwai can be customized as follows:
 *
 *   fpsMogwai.delay(500); // the interval for FPS measurements
 *   fpsMogwai.levelSelector(function(fps) { // select logging level according to fps value });
 *   fpsMogwai.logger(loggerObject); // inject a logger
 *
 * Example usage:
 *
 *   horde.mogwai(gremlins.mogwais.fps()
 *     .delay(250)
 *     .levelSelector(function(fps) {
 *       if (fps < 5) return 'error';
 *       if (fps < 10) return 'warn';
 *       return 'log';
 *     })
 *   );
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');

    return function() {

        var defaultLogger = {
            log: function() {},
            warn: function() {},
            error: function() {}
        };

        var defaultLevelSelector = function(fps) {
            if (fps < 10) return 'error';
            if (fps < 20) return 'warn';
            return 'log';
        };

        /**
         * @mixin
         */
        var config = {
            delay: 500, // how often should the fps be measured
            levelSelector: defaultLevelSelector,
            logger: defaultLogger
        };

        var initialTime = -Infinity; // force initial measure
        var enabled;

        function loop(time) {
            if ((time - initialTime) > config.delay) {
                measureFPS(time);
                initialTime = time;
            }
            if (!enabled) return;
            window.requestAnimationFrame(loop);
        }

        function measureFPS() {
            var lastTime;
            function init(time) {
                lastTime = time;
                window.requestAnimationFrame(measure);
            }
            function measure(time) {
                var fps = (time - lastTime < 16) ? 60 : 1000/(time - lastTime);
                var level = config.levelSelector(fps);
                config.logger[level]('mogwai ', 'fps       ', fps);
            }
            window.requestAnimationFrame(init);
        }

        /**
         * @mixes config
         */
        function fpsMogwai() {
            enabled = true;
            window.requestAnimationFrame(loop);
        }

        fpsMogwai.cleanUp = function() {
            enabled = false;
            return fpsMogwai;
        };

        configurable(fpsMogwai, config);

        return fpsMogwai;
    };
});
