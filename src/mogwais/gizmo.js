import configurable from '../utils/configurable';

/**
 * Gizmo is a special mogwai who can stop the gremlins when they go too far
 *
 * The gizmo mogwai monitors the JavaScript alerts and the calls to
 * console.alert(), and stops the stress test execution once the number of
 * errors pass a certain threshold (10 errors by default).
 *
 *   const gizmoMogwai = gremlins.mogwais.gizmo();
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
export default () => {
    /**
     * @mixin
     */
    const config = {
        maxErrors: 10,
        logger: console,
    };

    let realOnError;
    let realLoggerError;

    /**
     * @mixes config
     */
    const gizmoMogwai = () => {
        let nbErrors = 0;
        const horde = this; // this is exceptional - don't use 'this' for mogwais in general
        const incrementNbErrors = () => {
            nbErrors++;
            if (nbErrors === config.maxErrors) {
                horde.stop();
                if (!config.logger) return;
                window.setTimeout(() => {
                    // display the mogwai error after the caught error
                    config.logger.warn(
                        'mogwai ',
                        'gizmo     ',
                        'stopped test execution after ',
                        config.maxErrors,
                        'errors'
                    );
                }, 4);
            }
        };

        // general JavaScript errors
        realOnError = window.onerror;
        window.onerror = (message, url, linenumber) => {
            incrementNbErrors();
            return realOnError ? realOnError(message, url, linenumber) : false;
        };

        // console errors
        realLoggerError = console.error;
        console.error = () => {
            incrementNbErrors();
            realLoggerError.apply(console, arguments); // eslint-disable-line no-undef
        };
    };

    gizmoMogwai.cleanUp = () => {
        window.onerror = realOnError;
        console.error = realLoggerError.bind(console);
        return gizmoMogwai;
    };

    configurable(gizmoMogwai, config);

    return gizmoMogwai;
};
