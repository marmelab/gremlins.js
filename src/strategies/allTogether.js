import executeInSeries from '../utils/executeInSeries';
import configurable from '../utils/configurable';

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
    let doneCallback;

    /**
     * @mixes config
     */
    const allTogetherStrategy = (gremlins, params, done) => {
        const nb = params && params.nb ? params.nb : config.nb;
        const horde = this;

        stopped = false;
        doneCallback = done; // done can also be called by stop()

        const executeAllGremlins = callback => {
            executeInSeries(gremlins, [], horde, callback);
        };

        const executeNextWave = i => {
            if (stopped) return;
            if (i >= nb) return callDone();
            executeAllGremlins(() => {
                setTimeout(() => {
                    executeNextWave(++i);
                }, config.delay);
            });
        };

        executeNextWave(0);
    };

    const callDone = () => {
        if (typeof doneCallback === 'function') {
            doneCallback();
        }
        doneCallback = null;
    };

    allTogetherStrategy.stop = () => {
        stopped = true;
        setTimeout(callDone, 4);
    };

    configurable(allTogetherStrategy, config);

    return allTogetherStrategy;
};
