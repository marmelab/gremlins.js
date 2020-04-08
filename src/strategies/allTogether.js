import executeInSeries from '../utils/executeInSeries';
import wait from '../utils/wait';

export default (userConfig) => () => {
    const defaultConfig = {
        delay: 10, // delay in milliseconds between each wave
        nb: 100, // number of waves to execute (can be overridden in params)
    };

    const config = { ...defaultConfig, ...userConfig };

    let stopped = false;

    const allTogetherStrategy = async (gremlins) => {
        const { nb, delay } = config;

        for (let i = 0; i < nb; i++) {
            await wait(delay);
            if (stopped) {
                return Promise.resolve();
            }
            await executeInSeries(gremlins, []);
        }
        return Promise.resolve();
    };

    allTogetherStrategy.stop = () => {
        stopped = true;
    };

    return allTogetherStrategy;
};
