/**
 * The alert gremlin answers calls to alert()
 *
 * The alert gremlin overrides window.alert, window.confirm, and window.prompt
 * to avoid stopping the stress test with blocking JavaScript calls. Instead
 * of displaying a dialog, these methods are simply replaced by a write in the
 * logger.
 *
 *   var alertGremlin = gremlins.species.alert();
 *   horde.gremlin(alertGremlin);
 *
 * The alert mogwai can be customized as follows:
 *
 *   alertGremlin.watchEvents(['alert', 'confirm', 'prompt']); // select the events to catch
 *   alertGremlin.confirmResponse(function() { // what a call to confirm() should return });
 *   alertGremlin.promptResponse(function() { // what a call to prompt() should return });
 *   alertGremlin.logger(loggerObject); // inject a logger
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.alert()
 *     .watchEvents(['prompt'])
 *     .promptResponse(function() { return 'I typed garbage'; })
 *   );
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');
    var Chance = require('../vendor/chance');

    return function() {

        var defaultWatchEvents = ['alert', 'confirm', 'prompt'];

        var defaultConfirmResponse = function() {
            // Random OK or cancel
            return config.randomizer.bool();
        };

        var defaultPromptResponse = function() {
            // Return a random string
            return config.randomizer.sentence();
        };

        var defaultLogger = { warn: function() {} };

        /**
         * @mixin
         */
        var config = {
            watchEvents:     defaultWatchEvents,
            confirmResponse: defaultConfirmResponse,
            promptResponse:  defaultPromptResponse,
            logger:          defaultLogger,
            randomizer:      new Chance()
        };

        var alert   = window.alert;
        var confirm = window.confirm;
        var prompt  = window.prompt;

        /**
         * @mixes config
         */
        function alertGremlin() {
            if (config.watchEvents.indexOf('alert') !== -1) {
                window.alert = function (msg) {
                    config.logger.warn('gremlin', 'alert     ', msg, 'alert');
                };
            }
            if (config.watchEvents.indexOf('confirm') !== -1) {
                window.confirm = function (msg) {
                    config.confirmResponse();
                    config.logger.warn('gremlin', 'alert     ', msg, 'confirm');
                };
            }
            if (config.watchEvents.indexOf('prompt') !== -1) {
                window.prompt = function (msg) {
                    config.promptResponse();
                    config.logger.warn('gremlin', 'alert     ', msg, 'prompt');
                };
            }
        }

        alertGremlin.cleanUp = function() {
            window.alert   = alert;
            window.confirm = confirm;
            window.prompt  = prompt;
            return alertGremlin;
        };

        configurable(alertGremlin, config);

        return alertGremlin;
    };
});
