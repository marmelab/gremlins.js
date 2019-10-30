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
export default (callables, args, context) =>
    new Promise(async (resolve, reject) => {
        try {
            callables.forEach(cb => cb.apply(context, args));
        } catch (error) {
            return reject(error);
        }
        return resolve();
    });
