/**
 * The ajaxDelayer gremlin delay responses from ajax request
 *
 *   var ajaxDelayerGremlin = gremlins.species.ajaxDelayer();
 *   horde.gremlin(ajaxDelayerGremlin);
 *
 * The ajaxDelayer gremlin can be customized as follows:
 *
 *   clickerGremlin.logger(loggerObject); // inject a logger
 *   clickerGremlin.delayer(); // inject a delay generator that return a delay in milliseconds
 *   clickerGremlin.delayAdder() //inject a function to add delay on ajax request, by default delay the execution of the send method
 *   clickerGremlin.requestReporter() //inject a function to log on ajax request open By default log the method and url requested
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.ajaxDelayer());
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');

    return function() {
        var started = false;

        var oldSend = window.XMLHttpRequest.prototype.send;
        var oldOpen = window.XMLHttpRequest.prototype.open;

        var defaultDelayAdder = function (delayer, logger) {

            window.XMLHttpRequest.prototype.send = function () {
                var delay = delayer();
                if (typeof logger.log === 'function') {
                    logger.log('adding delay : ', delay);
                }

                setTimeout(oldSend.bind(this), delay);
            }
        };

        var defaultRequestReporter = function (logger) {
            window.XMLHttpRequest.prototype.open = function (method, url) {
                if (typeof logger.log === 'function') {
                    logger.log('delaying ', method, url);
                }

                return oldOpen.apply(this, arguments);
            }
        }

        var defaultDelayer = function () {
            return 1000;
        }

        /**
         * @mixin
         */
        var config = {
            delayer: defaultDelayer,
            delayAdder: defaultDelayAdder,
            requestReporter: defaultRequestReporter,
            logger: null,
        };

        /**
         * @mixes config
         */
        var ajaxDelayerGremlin = function ajaxDelayerGremlin() {
            if (started) {
                return;
            }
            started = true;

            config.requestReporter(config.logger);
            config.delayAdder(config.delayer, config.logger);
        }

        ajaxDelayerGremlin.cleanUp = function () {
            window.XMLHttpRequest.prototype.send = oldSend;
            window.XMLHttpRequest.prototype.open = oldOpen;
            started = false;
        };

        configurable(ajaxDelayerGremlin, config);

        return ajaxDelayerGremlin;
    };
});
