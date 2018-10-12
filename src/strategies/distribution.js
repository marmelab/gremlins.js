import Chance from 'chance';

import executeInSeries from '../utils/executeInSeries';
import configurable from '../utils/configurable';

/**
 * Execute all Gremlins randomly following a distribution, separated by a 10ms
 * delay, for 100 times
 *
 * This is the default attack strategy, so selecting no strategy is equivalent to
 *
 *   const distributionStrategy = gremlins.strategies.distribution();
 *   horde.strategy(distributionStrategy);
 *
 * The attack duration is roughly equivalent to delay * nb, although setTimeout
 * may make it longer when delay is small.
 *
 * By default, this strategy uses a uniform distribution, i.e. all gremlins
 * have an equal chance to be selected for the next action.
 *
 * The distribution strategy can be customized as follows:
 *
 *   distributionStrategy.distribution([0.25, 0.25, 0.25, 0.25]); // chances for each gremlin to be selected ; total must equal 1
 *   distributionStrategy.delay(10); // delay in milliseconds between each wave
 *   distributionStrategy.nb(100); // number of waves to execute (can be overridden in params)
 *   distributionStrategy.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.strategy(gremlins.strategies.distribution()
 *     .delay(50)
 *     .distribution([
 *       0.3, // first gremlin
 *       0.3, // second gremlin
 *       0.3, // third gremlin
 *       0.1, // fourth gremlin
 *     ])
 *   )
 */
export default () => {
    const config = {
        distribution: [], // percentage of each gremlin species ; the sum of all values should equal to 1
        delay: 10, // delay in milliseconds between each wave
        nb: 1000, // number of waves to execute (can be overridden in params)
        randomizer: new Chance(),
    };

    let stopped;
    let doneCallback;

    const distributionStrategy = (newGremlins, params, done) => {
        const nb = params && params.nb ? params.nb : config.nb;
        const gremlins = newGremlins.slice(0); // clone the array to avoid modifying the original
        const distribution =
            config.distribution.length === 0
                ? getUniformDistribution(gremlins)
                : config.distribution;
        const horde = this;

        if (nb === 0) return done();

        stopped = false;
        doneCallback = done; // done can also be called by stop()

        const executeNext = (gremlin, i, callback) => {
            if (stopped) return;
            if (i >= nb) return callDone();
            executeInSeries([gremlin], [], horde, () => {
                setTimeout(() => {
                    executeNext(
                        pickGremlin(newGremlins, distribution),
                        ++i,
                        callback
                    );
                }, config.delay);
            });
        };

        executeNext(pickGremlin(gremlins, distribution), 0, executeNext);
    };

    const getUniformDistribution = newGremlins => {
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
        const random = config.randomizer.floating({ min: 0, max: 1 });
        for (let i = 0, count = newGremlins.length; i < count; i++) {
            chance += distribution[i];
            if (random <= chance) return newGremlins[i];
        }
        // no gremlin - probably error in the distribution
        return () => {};
    };

    distributionStrategy.stop = () => {
        stopped = true;
        setTimeout(callDone, 4);
    };

    const callDone = () => {
        if (typeof doneCallback === 'function') {
            doneCallback();
        }
        doneCallback = null;
    };

    configurable(distributionStrategy, config);

    return distributionStrategy;
};
