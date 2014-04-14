define(function(require) {
    "use strict";

    function LoggerRequiredException() {
        this.message = 'This mogwai requires a logger to run. Please call logger(loggerObject) before executing the mogwai';
        this.toString = function() {
            return this.message;
        };
    }

    return LoggerRequiredException;
});
