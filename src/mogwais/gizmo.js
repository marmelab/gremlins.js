const defaultConfig = { maxErrors: 10 };

export default (userConfig) => ({ logger, stop, window }) => {
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
                    logger.warn('mogwai ', 'gizmo     ', 'stopped test execution after ', config.maxErrors, 'errors');
                }, 4);
            }
        };

        realOnError = window.onerror;
        window.onerror = (...args) => {
            incrementNbErrors();
            return realOnError ? realOnError(...args) : false;
        };

        realLoggerError = console.error;
        console.error = (...args) => {
            incrementNbErrors();
            realLoggerError(...args);
        };
    };

    gizmoMogwai.cleanUp = () => {
        window.onerror = realOnError;
        console.error = realLoggerError.bind(console);
        return gizmoMogwai;
    };

    return gizmoMogwai;
};
