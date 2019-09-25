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
export default (callbacks, args, context, done) => {
    const nbArguments = args.length;
    const cbs = [...callbacks]; // clone the array to avoid modifying the original

    const iterator = (callbacks, args) => {
        if (!callbacks.length) {
            return typeof done === 'function' ? done() : true;
        }

        const callback = callbacks.shift();
        callback.apply(context, args);

        // Is the callback synchronous?
        if (callback.length === nbArguments) {
            iterator(callbacks, args);
        } else {
            done();
        }
    };

    const newArgs = [...args, () => iterator(cbs, args)];
    iterator(cbs, newArgs);
};
