/**
 * The ajaxDelayer gremlin delay result from ajax request
 *
 *   var ajaxDelayerGremlin = gremlins.species.ajaxDelayer();
 *   horde.gremlin(ajaxDelayerGremlin);
 *
 * The ajaxDelayer gremlin can be customized as follows:
 *
 *   clickerGremlin.logger(loggerObject); // inject a logger
 *   clickerGremlin.delay(randomizerObject || value); // inject a random delay generator or a fix value
 *   clickerGremlin.addDelay //inject a function to add delay on ajax request, by default it slow down the onreadyStateChange event
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

        var defaultAddDelay = function (delay, logger) {

            var open = OriginalXMLHttpRequest.prototype.open;

            window.XMLHttpRequest.prototype.open = function (method, url) {
                var send = this.send;
                this.send = function () {
                    var rsc = this.onreadystatechange;
                    if (rsc) {
                        // "onreadystatechange" exists. Monkey-patch it
                        this.onreadystatechange = function() {
                            var self = this;
                            if (self.readyState == 4) {
                                var d = delay();
                                if (typeof config.logger.log === 'function') {
                                    logger.log('added delay : ', d, ' for ', method, url);
                                }

                                return setTimeout(function () {
                                    rsc.apply(self, arguments)
                                }, d);
                            }
                            return rsc.apply(this, arguments);
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
            addDelay:         defaultAddDelay,
            delay:            randomizer.natural.bind(randomizer),
            maxDelay:         1000,
            logger:           {}
        };

        /**
         * @mixes config
         */
        var ajaxDelayerGremlin = function ajaxDelayerGremlin() {
            if (started) {
                return;
            }
            started = true;
            if (typeof config.logger.log === 'function') {
                config.logger.log('start delaying');
            }
            var delay;

            if (typeof config.delay == 'function') {
                delay = function () {
                    return config.delay({ max: config.maxDelay});
                }
            } else {
                delay = function () {
                    return config.delay;
                }
            }

            config.addDelay(delay, config.logger);
        }

        ajaxDelayerGremlin.stop = function () {
            window.XMLHttpRequest = OriginalXMLHttpRequest;
            started = false;
        };

        configurable(ajaxDelayerGremlin, config);

        return ajaxDelayerGremlin;
    };
});
