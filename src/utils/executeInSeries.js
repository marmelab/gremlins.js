/**
 * Execute a list of functions one after the other.
 *
 * Functions can be asynchronous or asynchronous, they will always be
 * executed in the order of the list.
 *
 * @param {Function[]} callbacks - The functions to execute
 * @param {Array} args - The arguments passed to each function
 */
export default (callables, args) =>
    new Promise((resolve, reject) => {
        try {
            callables.forEach(async cb => await cb.apply(null, args));
        } catch (error) {
            return reject(error);
        }
        return resolve();
    });
