export default userConfig => (logger, _ignore, stop) => {
    const defaultConfig = { maxErrors: 10 };
    const config = { ...defaultConfig, ...userConfig };

    let realOnError;
    let realLoggerError;

    const gizmoMogwai = () => {
        let nbErrors = 0;
        const incrementNbErrors = () => {
            nbErrors++;
            if (nbErrors === config.maxErrors) {
                stop();
                if (!logger) return;
                window.setTimeout(() => {
                    // display the mogwai error after the caught error
                    logger.warn('mogwai ', 'gizmo     ', 'stopped test execution after ', config.maxErrors, 'errors');
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

    return gizmoMogwai;
};
