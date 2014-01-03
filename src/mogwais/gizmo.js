define(function(require) {
    "use strict";
    return function() {

        var defaultLogger = { warn: function() {} };

        var config = {
            maxErrors: 10,
            logger:    defaultLogger
        };

        var oldOnError;

        function gizmoMogwai() {
            var nbErrors = 0;
            var horde = this; // this is exceptional - don't use 'this' for mogwais in general
            oldOnError = window.onerror;
            window.onerror = function(message, url, linenumber) {
                nbErrors++;
                if (nbErrors == config.maxErrors) {
                    var strategies = horde._strategies;
                    for (var i = 0, count = strategies.length; i < count; i++) {
                        strategies[i].stop();
                    }
                    window.setTimeout(function() {
                        // display the mogwai error after the caught error
                        config.logger.warn('mogwai ', 'gizmo     ', 'stopped test execution after ', config.maxErrors, 'errors');
                    }, 4);
                }
                return oldOnError ? oldOnError(message, url, linenumber) : false;
            };

        }

        gizmoMogwai.cleanUp = function() {
            window.onerror = oldOnError;
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
