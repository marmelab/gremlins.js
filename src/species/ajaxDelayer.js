/**
 * The ajaxDelayer gremlin delay result from ajax request
 *
 *   var ajaxDelayerGremlin = gremlins.species.ajaxDelayer();
 *   horde.gremlin(ajaxDelayerGremlin);
 *
 * The ajaxDelayer gremlin can be customized as follows:
 *
 *   clickerGremlin.logger(loggerObject); // inject a logger
 *   clickerGremlin.delay(randomizerObject); // inject a random delay generator
 *   clickerGremlin.delayAdder() //inject a function to add delay on ajax request, by default it slow down the onreadyStateChange event
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.ajaxDelayer());
 */
define(function(require) {
    "use strict";

    var RandomizerRequiredException = require('../exceptions/randomizerRequired');
    var configurable = require('../utils/configurable');

    return function() {
        var started = false;

        var oldSend = window.XMLHttpRequest.prototype.send;
        var oldOpen = window.XMLHttpRequest.prototype.open;

        var defaultDelayAdder = function (delay, logger) {

            window.XMLHttpRequest.prototype.send = function () {
                var d = delay();
                if (typeof config.logger.log === 'function') {
                    logger.log('adding delay : ', d);
                }

                setTimeout(oldSend.bind(this), d);
            }
        };

        var defaultRequestReporter = function (logger) {
            window.XMLHttpRequest.prototype.open = function (method, url) {
                if (typeof config.logger.log === 'function') {
                    logger.log('delaying ', method, url);
                }

                return oldOpen.apply(this, arguments);
            }
        }

        var defaultDelayer = function (randomizer) {
            return randomizer.natural({max : 1000});
        }

        /**
         * @mixin
         */
        var config = {
            delayer: defaultDelayer,
            delayAdder: defaultDelayAdder,
            requestReporter: defaultRequestReporter,
            logger: null,
            randomizer: null
        };

        /**
         * @mixes config
         */
        var ajaxDelayerGremlin = function ajaxDelayerGremlin() {
            if (started) {
                return;
            }
            if (!config.randomizer) {
                throw new RandomizerRequiredException();
            }
            started = true;
            var delayer = function () {
                return config.delayer(config.randomizer);
            }

            config.requestReporter(config.logger);
            config.delayAdder(delayer, config.logger);
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
