/**
 * Gizmo is a special mogwai who can stop the gremlins when they go too far
 *
 * The gizmo mogwai monitors the JavaScript alerts and the calls to
 * console.alert(), and stops the stress test execution once the number of
 * errors pass a certain threshold (10 errors by default).
 *
 *   var gizmoMogwai = gremlins.mogwais.gizmo();
 *   horde.mogwai(gizmoMogwai);
 *
 * The gizmo mogwai can be customized as follows:
 *
 *   gizmoMogwai.maxErrors(10); // the number of errors after which the test stops
 *   gizmoMogwai.logger(loggerObject); // inject a logger
 *
 * Example usage:
 *
 *   horde.mogwai(gremlins.mogwais.gizmo()
 *     .maxErrors(5)
 *   );
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');

    return function() {

        /**
         * @mixin
         */
        var config = {
            maxErrors: 10,
            logger:    null
        };

        var realOnError, realLoggerError;

        /**
         * @mixes config
         */
        function gizmoMogwai() {
            var nbErrors = 0;
            var horde = this; // this is exceptional - don't use 'this' for mogwais in general
            function incrementNbErrors() {
                nbErrors++;
                if (nbErrors == config.maxErrors) {
                    horde.stop();
                    if (!config.logger) return;
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

            // console errors
            realLoggerError = console.error;
            console.error = function() {
                incrementNbErrors();
                realLoggerError.apply(console, arguments);
            };
        }

        gizmoMogwai.cleanUp = function() {
            window.onerror = realOnError;
            console.error = realLoggerError.bind(console);
            return gizmoMogwai;
        };

        configurable(gizmoMogwai, config);

        return gizmoMogwai;
    };
});
