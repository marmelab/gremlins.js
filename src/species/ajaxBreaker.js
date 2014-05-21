/**
 * The ajaxBreaker gremlin force fake response on ajax request
 *
 *   var ajaxBreaker = gremlins.species.ajaxBreaker();
 *   horde.gremlin(ajaxBreaker);
 *
 * The ajaxBreaker gremlin can be customized as follows:
 *
 *   ajaxBreaker.logger(loggerObject); // inject a logger
 *   ajaxBreaker.responseBreaker(brokenResponse, loggerObject) //inject a function that force the response for an ajax request
 *   ajaxBreaker.brokenResponse //inject a fake response objec to break every ajax request with it
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.ajaxBreaker());
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');
    var overrider = require('../utils/overrider');

    return function() {
        var OriginalXMLHttpRequest = window.XMLHttpRequest;
        var started = false;

        var defaultResponseBreaker = function (brokenResponse, logger) {
            var open = OriginalXMLHttpRequest.prototype.open;

            window.XMLHttpRequest.prototype.open = function (method, url) {
                var self = this;
                logger.log('forcing status to 404 on:', method, url);

                brokenResponse.send = function () {
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
                overrider(self, brokenResponse);

                return open.apply(self, arguments);
            }

            if (typeof jQuery !== 'undefined') {
                jQuery.ajaxSettings.xhr = new  window.XMLHttpRequest ();
            }
        };

        /**
         * @mixin
         */
        var config = {
            responseBreaker: defaultResponseBreaker,
            logger:           {},
            brokenResponse:  {
                // set the broken Ajax response details
                readyState: 4,
                status:     500,
                statusText: "Internal servor error"
            }
        };

        /**
         * @mixes config
         */
        var ajaxBreakerGremlin = function ajaxBreakerGremlin() {
            if (started) {
                return;
            }
            started = true;

            config.responseBreaker(config.brokenResponse, config.logger);
        };

        ajaxBreakerGremlin.cleanUp = function () {
            window.XMLHttpRequest = OriginalXMLHttpRequest;
            started = false;
        };

        configurable(ajaxBreakerGremlin, config);

        return ajaxBreakerGremlin;
    };
});
