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
                var self = this;
                logger.log('forcing status to 404 on:', method, url);

                override.send = function () {
                    // trigger only when send is called since it is generally not defined before
                    if (this.onreadystatechange) {
                        this.onreadystatechange();
                    }
                    if (this.status != 200 && this.onerror) {
                        this.error();
                    }
                    if (this.status == 200 && this.onload) {
                        this.onload();
                    }

                    return this;
                };
                overrider(self, override);

                return open.apply(self, arguments);
            }


            if (jQuery) {
                jQuery.ajaxSettings.xhr = new  window.XMLHttpRequest ();
            }
        };

        /**
         * @mixin
         */
        var config = {
            overrideResponse: defaultOverrideRequest,
            logger:           {},
            requestOverride:  {
                // set the request has having returned
                readyState: 4,
                status:     404,
                statusText: "Not Found"
            }
        };

        /**
         * @mixes config
         */
        var ajaxOverriderGremlin = function ajaxOverriderGremlin() {
            if (started) {
                return;
            }
            started = true;
            if (typeof config.logger.log === 'function') {
                config.logger.log('start destroying');
            }

            config.overrideResponse(config.requestOverride, config.logger);
        };

        ajaxOverriderGremlin.stop = function () {
            window.XMLHttpRequest = OriginalXMLHttpRequest;
            started = false;
        };

        configurable(ajaxOverriderGremlin, config);

        return ajaxOverriderGremlin;
    };
});
