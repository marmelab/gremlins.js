/**
 * The ajaxOverrider gremlin force error on ajax request
 *
 *   var ajaxOverrider = gremlins.species.ajaxOverrider();
 *   horde.gremlin(ajaxOverrider);
 *
 * The ajaxOverrider gremlin can be customized as follows:
 *
 *   ajaxOverrider.logger(loggerObject); // inject a logger
 *   ajaxOverrider.overrideResponse //inject a function change status of ajax request
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.ajaxDelayer());
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');
    var overrider = require('../utils/overrider');

    return function() {
        var OriginalXMLHttpRequest = window.XMLHttpRequest;
        var started = false;

        var defaultOverrideRequest = function (override, logger) {
            var open = OriginalXMLHttpRequest.prototype.open;

            window.XMLHttpRequest.prototype.open = function (method, url) {
                overrider(this, override);
                logger.log('changing status from ', this.status, 'to 404 on:', method, url);

                return open.apply(this, arguments);
            }
        };

        /**
         * @mixin
         */
        var config = {
            overrideResponse:  defaultOverrideRequest,
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

            config.overrideResponse(config.requestOverride, config.logger);
        };

        ajaxDestroyerGremlin.stop = function () {
            window.XMLHttpRequest = OriginalXMLHttpRequest;
            started = false;
        };

        configurable(ajaxDestroyerGremlin, config);

        return ajaxDestroyerGremlin;
    };
});
