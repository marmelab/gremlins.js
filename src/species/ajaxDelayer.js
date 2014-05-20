/**
 * The ajaxDelayer gremlin delay result from ajax request
 *
 *   var ajaxDelayerGremlin = gremlins.species.ajaxDelayer();
 *   horde.gremlin(ajaxDelayerGremlin);
 *
 * The ajaxDelayer gremlin can be customized as follows:
 *
 *   clickerGremlin.logger(loggerObject); // inject a logger
 *   clickerGremlin.delay(randomizerObject || value); // inject a random delay generator
 *   clickerGremlin.delayAdder() //inject a function to add delay on ajax request, by default it slow down the onreadyStateChange event
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.ajaxDelayer());
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');

    return function() {
        var OriginalXMLHttpRequest = window.XMLHttpRequest;
        var started = false;

        var defaultDelayAdder = function (delay, logger) {

            var open = OriginalXMLHttpRequest.prototype.open;

            window.XMLHttpRequest.prototype.open = function (method, url) {
                var send = this.send;
                this.send = function () {
                    var d = delay();
                    var rsc = this.onreadystatechange;
                    if (rsc) {
                        // "onreadystatechange" exists -> the request is asynchronous. Monkey-patch it
                        this.onreadystatechange = function() {
                            var self = this;
                            if (self.readyState == 4) {
                                if (typeof config.logger.log === 'function') {
                                    logger.log('added delay : ', d, ' for ', method, url);
                                }

                                return setTimeout(function () {
                                    rsc.apply(self, arguments)
                                }, d);
                            }
                            return rsc.apply(this, arguments);
                        };
                    } else {
                        if (typeof config.logger.log === 'function') {
                            logger.log('added delay : ', d, ' for ', method, url);
                        }
                        // the request is synchronous delay the sending
                        var start = Date.now();
                        for (;;) {
                            var end = Date.now();
                            if (end - start > d) {
                                break;
                            }
                        }
                    }
                    return send.apply(this, arguments);
                }

                return open.apply(this, arguments);
            }
        };

        var defaultDelayer = function (randomizer) {
            return randomizer.natural({max : 1000});
        }

        /**
         * @mixin
         */
        var config = {
            delayer:    defaultDelayer,
            delayAdder: defaultDelayAdder,
            logger:     {},
            randomizer: new Chance()
        };

        /**
         * @mixes config
         */
        var ajaxDelayerGremlin = function ajaxDelayerGremlin() {
            if (started) {
                return;
            }
            started = true;
            var delayer = function () {
                return config.delayer(config.randomizer);
            }

            config.delayAdder(delayer, config.logger);
        }

        ajaxDelayerGremlin.cleanUp = function () {
            window.XMLHttpRequest = OriginalXMLHttpRequest;
            started = false;
        };

        configurable(ajaxDelayerGremlin, config);

        return ajaxDelayerGremlin;
    };
});
