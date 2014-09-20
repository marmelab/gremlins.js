/**
 * The ajax delayer gremlin adds a random delay to AJAX responses
 *
 * Even if called several times in a horde, this gremlin will only
 * override the XMLHttpRequest functions once. 
 *
 *   var ajaxDelayerGremlin = gremlins.species.ajaxDelayer();
 *   horde.gremlin(ajaxDelayerGremlin);
 *
 * The ajaxDelayer gremlin can be customized as follows:
 *
 *   ajaxDelayerGremlin.delayer(); // inject a delay generator, returning a delay in milliseconds
 *   ajaxDelayerGremlin.logger(loggerObject); // inject a logger
 *   ajaxDelayerGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.ajaxDelayer()
 *     .delayer(function () { return 500; }) // delay all AJAX calls by 500ms
 *   );
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');
    var RandomizerRequiredException = require('../exceptions/randomizerRequired');

    return function() {

        var XHR = window.XMLHttpRequest.prototype;

        var defaultDelayer = function () {
            return config.randomizer.natural({ max: 1000 });
        };

        /**
         * @mixin
         */
        var config = {
            delayer: defaultDelayer,
            logger: null,
            randomizer: null
        };

        var started = false;
        var oldSend = XHR.send;
        var oldOpen = XHR.open;

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

            XHR.send = function () {
                var xhrInstance = this;
                var sendArguments = arguments;
                var delay = config.delayer();
                window.setTimeout(function delayedSend() {
                    return oldSend.apply(xhrInstance, sendArguments);
                }, delay);
                if (config.logger && typeof config.logger.log === 'function') {
                    config.logger.log('gremlin', 'ajaxDelayer', 'delay', this.ajaxDelayer_url, 'response by', delay, 'ms');
                }
            };
            XHR.open = function (method, url) {
                this.ajaxDelayer_url = url;
                return oldOpen.apply(this, arguments);
            };
            started = true;
        };

        ajaxDelayerGremlin.cleanUp = function () {
            XHR.send = oldSend;
            XHR.open = oldOpen;
            started = false;
        };

        configurable(ajaxDelayerGremlin, config);

        return ajaxDelayerGremlin;
    };
});
