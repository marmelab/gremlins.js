const getDefaultConfig = (randomizer) => {
    const defaultWatchEvents = ['alert', 'confirm', 'prompt'];

    const defaultConfirmResponse = () => {
        return randomizer.bool();
    };

    const defaultPromptResponse = () => {
        return randomizer.sentence();
    };

    return {
        watchEvents: defaultWatchEvents,
        confirmResponse: defaultConfirmResponse,
        promptResponse: defaultPromptResponse,
    };
};

export default (userConfig) => ({ logger, randomizer, window }) => {
    const config = { ...getDefaultConfig(randomizer), ...userConfig };

    const alert = window.alert;
    const confirm = window.confirm;
    const prompt = window.prompt;

    const alertMogwai = () => {
        if (!logger) {
            return;
        }
        if (config.watchEvents.includes('alert')) {
            window.alert = (msg) => {
                logger.warn('mogwai ', 'alert ', msg, 'alert');
            };
        }
        if (config.watchEvents.includes('confirm')) {
            window.confirm = (msg) => {
                config.confirmResponse();
                logger.warn('mogwai ', 'alert ', msg, 'confirm');
            };
        }
        if (config.watchEvents.includes('prompt')) {
            window.prompt = (msg) => {
                config.promptResponse();
                logger.warn('mogwai ', 'alert ', msg, 'prompt');
            };
        }
    };

    alertMogwai.cleanUp = () => {
        window.alert = alert;
        window.confirm = confirm;
        window.prompt = prompt;
        return alertMogwai;
    };

    return alertMogwai;
};
