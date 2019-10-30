import executeInSeries from '../utils/executeInSeries';
import configurable from '../utils/configurable';
import wait from '../utils/wait';

/**
 * Execute all Gremlins species at once ; repeat 10ms after for 100 times
 *
 *   const allTogetherStrategy = gremlins.strategies.allTogether();
 *   horde.strategy(allTogetherStrategy);
 *
 * The actual attack duration depends on the number of species in the horde.
 */
export default () => {
    const config = {
        delay: 10, // delay in milliseconds between each wave
        nb: 100, // number of waves to execute (can be overridden in params)
    };

    let stopped;

    const allTogetherStrategy = (gremlins, params) =>
        new Promise(resolve => {
            const nb = params && params.nb ? params.nb : config.nb;
            const delay = params && params.delay ? params.delay : config.delay;
            const horde = this;

            stopped = false;

            const promises = [...Array(nb)]
                .map(executeInSeries(gremlins, [], horde))
                .reduce((chainedPromises, promise) =>
                    chainedPromises.then(async () => {
                        if (stopped) {
                            return Promise.resolve();
                        }
                        await wait(delay);
                        return promise;
                    }, Promise.resolve())
                );
            promises.then(resolve);
        });

    allTogetherStrategy.stop = () => {
        stopped = true;
    };

    configurable(allTogetherStrategy, config);

    return allTogetherStrategy;
};
