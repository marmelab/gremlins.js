/**
 * The alert mogwai answers calls to alert()
 *
 * The alert mogwai overrides window.alert, window.confirm, and window.prompt
 * to avoid stopping the stress test with blocking JavaScript calls. Instead
 * of displaying a dialog, these methods are simply replaced by a write in the
 * logger.
 *
 *   var alertMogwai = gremlins.mogwais.alert();
 *   horde.mogwai(alertMogwai);
 *
 * The alert mogwai can be customized as follows:
 *
 *   alertMogwai.watchEvents(['alert', 'confirm', 'prompt']); // select the events to catch
 *   alertMogwai.confirmResponse(function() { // what a call to confirm() should return });
 *   alertMogwai.promptResponse(function() { // what a call to prompt() should return });
 *   alertMogwai.logger(loggerObject); // inject a logger
 *   alertMogwai.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.mogwai(gremlins.mogwais.alert()
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
        function alertMogwai() {
            console.log('here');
            if (config.watchEvents.indexOf('alert') !== -1) {
                window.alert = function (msg) {
                    config.logger.warn('mogwai ', 'alert     ', msg, 'alert');
                };
            }
            if (config.watchEvents.indexOf('confirm') !== -1) {
                window.confirm = function (msg) {
                    config.confirmResponse();
                    config.logger.warn('mogwai ', 'alert     ', msg, 'confirm');
                };
            }
            if (config.watchEvents.indexOf('prompt') !== -1) {
                window.prompt = function (msg) {
                    config.promptResponse();
                    config.logger.warn('mogwai ', 'alert     ', msg, 'prompt');
                };
            }
        }

        alertMogwai.cleanUp = function() {
            window.alert   = alert;
            window.confirm = confirm;
            window.prompt  = prompt;
            return alertMogwai;
        };

        configurable(alertMogwai, config);

        return alertMogwai;
    };
});
