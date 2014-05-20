define(function(require) {
    "use strict";

    /**
     * Execute a list of functions one after the other.
     *
     * Functions can be asynchronous or asynchronous, they will always be
     * executed in the order of the list.
     *
     * @param {Function[]} callbacks - The functions to execute
     * @param {Array} args - The arguments passed to each function
     * @param {Object|null} context - The object the functions must be bound to
     * @param {Function} done - The final callback to execute once all functions are executed
     */
    function executeInSeries(callbacks, args, context, done) {
        var nbArguments = args.length;
        callbacks = callbacks.slice(0); // clone the array to avoid modifying the original

        var iterator = function(callbacks, args) {
            if (!callbacks.length) {
                return typeof done === 'function' ? done() : true;
            }

            var callback = callbacks.shift();
            callback.apply(context, args);

            // Is the callback synchronous ?
            if (callback.length === nbArguments) {
                iterator(callbacks, args, done);
            }
        };

        args.push(function(){
            iterator(callbacks, args, done);
        });

        iterator(callbacks, args, done);
    }

    return executeInSeries;
});
