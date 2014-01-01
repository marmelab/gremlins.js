/**
 * FPS watcher
 * 
 * Logs the number of frames per seconds (FPS) of the browser window.
 * The normal (and maximal) FPS rate is 60. It decreases when the browser is
 * busy refreshing the layout, or executing JavaScript.
 * This watcher logs with the error level once the FPS rate drops below 10.
 *
 * Usage:
 *   var watcher = gremlins.watcher.fps();
 *   horde.watch(watcher);
 *
 * Configuration:
 *   watcher.delay(500); // the interval for FPS measurements
 *   watcher.logger(customLoggerService);
 *   watcher.levelSelector(function(fps) { /../ }); log level selector according to fps
 */
define(function(require) {
    "use strict";
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

        var config = {
            delay: 500, // how often should the fps be measured
            logger: defaultLogger,
            levelSelector: defaultLevelSelector
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
                config.logger[level]('fps        watcher', fps);
            }
            window.requestAnimationFrame(init);
        }

        function watch() {
            enabled = true;
            window.requestAnimationFrame(loop);
        }

        watch.cleanUp = function() {
            enabled = false;
            return watch;
        };

        watch.delay = function(delay) {
            if (!arguments.length) return config.delay;
            config.delay = delay;
            return watch;
        };

        watch.logger = function(logger) {
            if (!arguments.length) return config.logger;
            config.logger = logger;
            return watch;
        };

        watch.levelSelector = function(levelSelector) {
            if (!arguments.length) return config.levelSelector;
            config.levelSelector = levelSelector;
            return watch;
        };

        return watch;
    };
});
