define(function(require) {
    "use strict";
    return function() {

        var defaultWatchEvents = ['alert', 'confirm', 'prompt'];

        var defaultConfirmResponse = function() {
            // Random OK or cancel
            return Math.random() >= 0.5;
        };

        var defaultPromptResponse = function() {
            // Return a random string
            return Math.random().toString(36).slice(2);
        };

        var defaultLogger = { warn: function() {} };

        var config = {
            watchEvents:     defaultWatchEvents,
            confirmResponse: defaultConfirmResponse,
            promptResponse:  defaultPromptResponse,
            logger:          defaultLogger
        };

        var alert   = window.alert;
        var confirm = window.confirm;
        var prompt  = window.prompt;

        function alertMogwai() {
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

        alertMogwai.watchEvents = function(watchEvents) {
            if (!arguments.length) return config.watchEvents;
            config.watchEvents = watchEvents;
            return alertMogwai;
        };

        alertMogwai.confirmResponse = function(confirmResponse) {
            if (!arguments.length) return config.confirmResponse;
            config.confirmResponse = confirmResponse;
            return alertMogwai;
        };

        alertMogwai.promptResponse = function(promptResponse) {
            if (!arguments.length) return config.promptResponse;
            config.promptResponse = promptResponse;
            return alertMogwai;
        };

        alertMogwai.logger = function(logger) {
            if (!arguments.length) return config.logger;
            config.logger = logger;
            return alertMogwai;
        };

        return alertMogwai;
    };
});
