define(function(require) {
    "use strict";
    return function() {

        var defaultLogger = { warn: function() {} };

        var config = {
            maxErrors: 10,
            logger:    defaultLogger
        };

        var realOnError, realLoggerError;

        /**
         * Gizmo is a special mogwai who can stop the gremlins when they go too far
         */
        function gizmoMogwai() {
            var nbErrors = 0;
            var horde = this; // this is exceptional - don't use 'this' for mogwais in general
            function incrementNbErrors(){
                nbErrors++;
                if (nbErrors == config.maxErrors) {
                    horde.stop();
                    window.setTimeout(function() {
                        // display the mogwai error after the caught error
                        config.logger.warn('mogwai ', 'gizmo     ', 'stopped test execution after ', config.maxErrors, 'errors');
                    }, 4);
                }
            }

            // general JavaScript errors
            realOnError = window.onerror;
            window.onerror = function(message, url, linenumber) {
                incrementNbErrors();
                return realOnError ? realOnError(message, url, linenumber) : false;
            };

            // console (or logger) errors
            realLoggerError = config.logger.error;
            config.logger.error = function() {
                incrementNbErrors();
                realLoggerError.apply(config.logger, arguments);
            };
        }

        gizmoMogwai.cleanUp = function() {
            window.onerror = realOnError;
            config.logger.error = realLoggerError.bind(config.logger);
            return gizmoMogwai;
        };

        gizmoMogwai.maxErrors = function(maxErrors) {
            if (!arguments.length) return config.maxErrors;
            config.maxErrors = maxErrors;
            return gizmoMogwai;
        };

        gizmoMogwai.logger = function(logger) {
            if (!arguments.length) return config.logger;
            config.logger = logger;
            return gizmoMogwai;
        };

        return gizmoMogwai;
    };
});
