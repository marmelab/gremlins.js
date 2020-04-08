import executeInSeries from '../utils/executeInSeries';
import wait from '../utils/wait';

export default (userConfig) => (randomizer) => {
    const defaultConfig = {
        distribution: [], // percentage of each gremlin species ; the sum of all values should equal to 1
        delay: 10,
        nb: 1000,
    };

    const config = { ...defaultConfig, ...userConfig };

    let stopped = false;

    const distributionStrategy = async (newGremlins) => {
        const { nb, delay } = config;

        const gremlins = [...newGremlins]; // clone the array to avoid modifying the original
        const distribution = config.distribution.length === 0 ? getUniformDistribution(gremlins) : config.distribution;

        if (nb === 0) return Promise.resolve();

        for (let i = 0; i < nb; i++) {
            const gremlin = pickGremlin(gremlins, distribution);
            await wait(delay);
            if (stopped) {
                return Promise.resolve();
            }
            await executeInSeries([gremlin], []);
        }
        return Promise.resolve();
    };

    const getUniformDistribution = (newGremlins) => {
        const len = newGremlins.length;
        if (len === 0) return [];
        const distribution = [];
        const value = 1 / len;
        for (let i = 0; i < len; i++) {
            distribution.push(value);
        }
        return distribution;
    };

    const pickGremlin = (newGremlins, distribution) => {
        let chance = 0;
        const random = randomizer.floating({ min: 0, max: 1 });
        for (let i = 0, count = newGremlins.length; i < count; i++) {
            chance += distribution[i];
            if (random <= chance) return newGremlins[i];
        }
        // no gremlin - probably error in the distribution
        return () => {};
    };

    distributionStrategy.stop = () => {
        stopped = true;
    };

    return distributionStrategy;
};
