/**
 * The ajaxDelayer gremlin force error on ajax request
 *
 *   var ajaxDestroyerGremlin = gremlins.species.ajaxDelayer();
 *   horde.gremlin(ajaxDelayerGremlin);
 *
 * The ajaxDestroyerGremlin gremlin can be customized as follows:
 *
 *   ajaxDestroyerGremlin.logger(loggerObject); // inject a logger
 *   ajaxDestroyerGremlin.destroyRequest //inject a function change status of ajax request
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.ajaxDelayer());
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');
    var overrider = require('../utils/overrider');
    var Chance = require('../vendor/chance');

    return function() {
        var OriginalXMLHttpRequest = window.XMLHttpRequest;
        var started = false;

        var defaultDestroyRequest = function (override, logger) {
            var open = OriginalXMLHttpRequest.prototype.open;

            window.XMLHttpRequest.prototype.open = function (method, url) {
                overrider(this, override);
                logger.log('changing status from ', this.status, 'to 404 on:', method, url);

                return open.apply(this, arguments);
            }
        };

        var randomizer = new Chance();

        /**
         * @mixin
         */
        var config = {
            destroyRequest:  defaultDestroyRequest,
            logger:          {},
            requestOverride: {status: 404, statusText: "Not Found"}
        };

        /**
         * @mixes config
         */
        var ajaxDestroyerGremlin = function ajaxDestroyerGremlin() {
            if (started) {
                return;
            }
            started = true;
            if (typeof config.logger.log === 'function') {
                config.logger.log('start destroying');
            }

            config.destroyRequest(config.requestOverride, config.logger);
        }

        ajaxDestroyerGremlin.stop = function () {
            window.XMLHttpRequest = OriginalXMLHttpRequest;
            started = false;
        };

        configurable(ajaxDestroyerGremlin, config);

        return ajaxDestroyerGremlin;
    };
});
