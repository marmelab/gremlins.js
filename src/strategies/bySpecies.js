import executeInSeries from '../utils/executeInSeries';
import wait from '../utils/wait';

export default (userConfig) => () => {
    const defaultConfig = {
        delay: 10, // delay in milliseconds between each wave
        nb: 100, // number of waves to execute (can be overridden in params)
    };

    const config = { ...defaultConfig, ...userConfig };

    let stopped = false;

    const bySpeciesStrategy = async (newGremlins) => {
        const { nb, delay } = config;

        const gremlins = [...newGremlins]; // clone the array to avoid modifying the original

        for (let gremlinIndex in gremlins) {
            const gremlin = gremlins[gremlinIndex];
            for (let i = 0; i < nb; i++) {
                await wait(delay);
                if (stopped) {
                    return Promise.resolve();
                }
                await executeInSeries([gremlin], []);
            }
        }
        return Promise.resolve();
    };

    bySpeciesStrategy.stop = () => {
        stopped = true;
    };

    return bySpeciesStrategy;
};
