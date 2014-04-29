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
    var Chance = require('../vendor/chance');

    return function() {
        var OriginalXMLHttpRequest = window.XMLHttpRequest;
        var started = false;

        var defaultDestroyRequest = function (logger) {

            var open = OriginalXMLHttpRequest.prototype.open;

            window.XMLHttpRequest.prototype.open = function (method, url) {
                var send = this.send;
                this.send = function () {
                    var rsc = this.onreadystatechange;
                    if (rsc) {
                        // "onreadystatechange" exists. Monkey-patch it
                        this.onreadystatechange = function(xmlHttpRequestProgressEvent) {
                            if (this.readyState == 4) {
                                // dirty and strange need to delete the property to change its value.
                                // Although the property is writable and configurable
                                logger.log('changing status from ', this.status, 'to 404 on:', method, url);
                                delete this.status;
                                this.status = 404;
                                delete this.statusText;
                                this.statusText = 'Not Found';
                                xmlHttpRequestProgressEvent.currentTarget = this;
                                xmlHttpRequestProgressEvent.target = this;
                            }

                            return rsc.apply(this, [xmlHttpRequestProgressEvent]);
                        };
                    }
                    return send.apply(this, arguments);
                }

                return open.apply(this, arguments);
            }
        };

        var randomizer = new Chance();

        /**
         * @mixin
         */
        var config = {
            destroyRequest:         defaultDestroyRequest,
            logger:           {}
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

            config.destroyRequest(config.logger);
        }

        ajaxDestroyerGremlin.stop = function () {
            window.XMLHttpRequest = OriginalXMLHttpRequest;
            started = false;
        };

        configurable(ajaxDestroyerGremlin, config);

        return ajaxDestroyerGremlin;
    };
});
