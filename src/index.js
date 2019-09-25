import Chance from 'chance';

import clicker from './species/clicker';
import toucher from './species/toucher';
import formFiller from './species/formFiller';
import scroller from './species/scroller';
import typer from './species/typer';

import alert from './mogwais/alert';
import fps from './mogwais/fps';
import gizmo from './mogwais/gizmo';

import allTogether from './strategies/allTogether';
import bySpecies from './strategies/bySpecies';
import distribution from './strategies/distribution';

import executeInSeries from './utils/executeInSeries';

// do not export anything else here to keep window.gremlins as a function
export default () => {
    const gremlins = {
        species: {
            clicker,
            toucher,
            formFiller,
            scroller,
            typer,
        },
        mogwais: {
            alert,
            fps,
            gizmo,
        },
        strategies: {
            allTogether,
            bySpecies,
            distribution,
        },
    };

    const initHorde = () => {
        gremlins._gremlins = [];
        gremlins._mogwais = [];
        gremlins._strategies = [];
        gremlins._beforeCallbacks = [];
        gremlins._afterCallbacks = [];
        gremlins._logger = console; // logs to console by default
        gremlins._randomizer = new Chance();
    };

    const inject = (services, objects) => {
        for (let i = 0, count = objects.length; i < count; i++) {
            for (let name in services) {
                if (
                    typeof objects[i][name] === 'function' &&
                    !objects[i][name]()
                ) {
                    objects[i][name](services[name]);
                }
            }
        }
    };

    /**
     * Add a gremlin to the horde.
     *
     * A gremlin is nothing more than a function. Gremlins mess up with the
     * application in order to test its robustness. Once unleashed, the horde
     * executes each gremlin function several times (see unleash()).
     *
     *   horde.gremlin(function() {
     *     // do nasty things to the application
     *   });
     *
     * The gremlins object contains a few gremlin species that you can add:
     *
     *   horde.gremlin(gremlins.species.clicker());
     *
     * A gremlin can be asynchronous if it takes an argument, which means that
     * the horde is paused until the argument is executed.
     *
     *   horde.gremlin(function(done) {
     *     // do nasty things to the application asynchronously
     *     done();
     *   });
     *
     * If the gremlin provides a logger() function, the horde logger object is
     * injected, to allow the gremlin to record activity.
     *
     *
     * If the gremlin provides a randomizer() function, the horde randomizer
     * object is injected, to allow the gremlin to generate random data in a
     * repeatable way.
     *
     * Here is a more sophisticated gremlin function example:
     *
     *   let logger;
     *   function arrayDestroyer() {
     *     Array.prototype.indexOf = function() { return 42; };
     *     if (logger && logger.log) {
     *       logger.log('All arrays are now equal');
     *     }
     *   });
     *   arrayDestroyer.logger = function(loggerObject) {
     *     logger = loggerObject;
     *   };
     *   horde.gremlin(arrayDestroyer);
     *
     * Gremlin functions are executed in the context of the horde, however it
     * is a good practice to avoid using "this" inside gremlin functions to
     * allow standalone gremlin execution, and to ease debugging.
     *
     *   horde.gremlin(function() {
     *     const oldIndexOf = Array.prototype.indexOf;
     *     Array.prototype.indexOf = function() { return 42; };
     *     // "this" is the horde
     *     this.after(function(){
     *       array.prototype.indexOf = oldIndexOf;
     *     });
     *   });
     *
     * If a horde is unleashed without manually adding at least a single
     * gremlin, all the default gremlin species are added (see allGremlins()).
     *
     * @param {Function} gremlin - A callback to be executed to mess up the app
     * @return {GremlinsHorde}
     */
    gremlins.gremlin = gremlin => {
        gremlins._gremlins.push(gremlin);
        return gremlins;
    };

    /**
     * Add all the registered gremlin species to the horde.
     *
     * The gremlin species are available in gremlins.species. You can add your
     * own easily:
     *
     *   gremlins.species.greenMutant = function(logger) { //... };
     *
     * @return {GremlinsHorde}
     */
    gremlins.allGremlins = () => {
        for (const gremlinName in gremlins.species) {
            gremlins.gremlin(gremlins.species[gremlinName]());
        }
        return gremlins;
    };

    /**
     * Add a mogwai to the horde.
     *
     * A mogwai is nothing more than a function. Mogwais monitor application
     * activity in order to detect when gremlins do damages. Contrary to
     * gremlins, mogwais should do no harm to the current application.
     *
     *   // this example mogwai monitors javascript alerts
     *   horde.mogwai(function() {
     *     const oldAlert = window.alert;
     *     window.alert = function(message) {
     *       // do stuff
     *       oldAlert(message);
     *     }
     *   });
     *
     * The gremlins object contains a few mogwai species than you can add:
     *
     *   horde.mogwai(gremlins.mogwais.alert());
     *
     * Mogwais are called once before the horde is unleashed. Just like a
     * before() callback, a mogwai can be synchronous or asynchronous.
     *
     * What distinguishes a mogwai function from a simple before() function
     * is that mogwai functions can provide a cleanUp() function to be called
     * once after the gremlins finished their job.
     *
     * When added, if the mogwai provides a logger() function, the horde
     * logger object is injected, to allow the mogwai to record activity.
     *
     * Here is a more sophisticated mogwai function example:
     *
     *   const oldAlert = window.alert;
     *   let logger;
     *   function alert() {
     *     window.alert = function(message) {
     *       oldAlert(message);
     *       if (logger && logger.log) {
     *         logger.log('alert', msg);
     *       }
     *     }
     *   });
     *   alert.cleanUp = function() {
     *     window.alert = oldAlert;
     *   };
     *   alert.logger = function(loggerObject) {
     *     logger = loggerObject;
     *   };
     *   horde.mogwai(alert);
     *
     * The cleanUp() and logger() support for mogwais allow to build
     * sophisticated monitoring features without using "this", and make
     * the mogwais portable and testable.
     *
     * If a horde is unleashed without manually adding at least a single
     * mogwai, all the default mogwai species are added (see allMogwais()).
     *
     * If you want to disable default mogwais, just add an empty function.
     *
     *   horde.mogwai(function() {});
     *
     * @param {Function} mogwai - A callback to be executed when the test starts
     * @return {GremlinsHorde}
     */
    gremlins.mogwai = mogwai => {
        gremlins._mogwais.push(mogwai);
        return gremlins;
    };

    /**
     * Add all the registered mogwai species to the horde.
     *
     * The mogwai species are available in gremlins.mogwais. You can add your
     * own easily:
     *
     *   gremlins.mogwais.gizmo = function() { //... };
     *
     * @return {GremlinsHorde}
     */
    gremlins.allMogwais = () => {
        for (const mogwaiName in gremlins.mogwais) {
            gremlins.mogwai(gremlins.mogwais[mogwaiName]());
        }
        return gremlins;
    };

    /**
     * Add an attack strategy to run gremlins.
     *
     * A strategy is an asynchronous function taking the following arguments:
     *  - gremlins: array of gremlin species added to the horde
     *  - params: the parameters passed as first argument of unleash()
     *  - done: a callback to execute once the strategy is finished
     *
     * A strategy function executes registered gremlins in a certain order,
     * a certain number of times.
     *
     *   horde.strategy(function allAtOnceStrategy(gremlins, params, done) {
     *     gremlins.forEach(function(gremlin) {
     *       gremlin.apply(horde);
     *     });
     *     done();
     *   });
     *
     * The gremlins object contains a few strategies than you can add:
     *
     *   horde.strategy(gremlins.strategies.bySpecies());
     *
     * You can add several strategies by calling strategy() more than once.
     * They will be executed in the order they were registered.
     *
     * If a horde is unleashed without manually adding at least a single
     * strategy, all the default strategy (allTogether) is used.
     *
     * @param {Function} strategy - A callback to be executed when the test starts
     * @return {GremlinsHorde}
     */
    gremlins.strategy = strategy => {
        gremlins._strategies.push(strategy);
        return gremlins;
    };

    /**
     * Add a callback to be executed before gremlins are unleashed.
     *
     * Use it to setup the page before the stress test (disable some features,
     * set default data, bootstrap the application, start a profiler).
     *
     *   horde.before(function() {
     *     console.profile('gremlins'); // start the Chrome profiler
     *   });
     *
     * If the callback takes no argument, it is executed synchronously.
     *
     *   horde.before(function() {
     *     // do things synchronously
     *   });
     *
     * If the callback takes an argument, it is executed asynchronously, which
     * means that the horde is paused until the argument is executed.
     *
     *   horde.before(function(done) {
     *     // do things asynchronously
     *     done();
     *   });
     *
     * before() callbacks are executed in the context of the horde.
     *
     *   horde.before(function() {
     *     // "this" is the horde
     *     this.log('Preparing the attack');
     *   });
     *
     * You can add several callbacks by calling before() more than once.
     * They will be executed in the order they were registered.
     *
     * @param {Function} beforeCallback - A callback to be executed before the stress test
     * @return {GremlinsHorde}
     */
    gremlins.before = beforeCallback => {
        gremlins._beforeCallbacks.push(beforeCallback);
        return gremlins;
    };

    /**
     * Add a callback to be executed after gremlins finished their job.
     *
     * Use it to collect insights of the gremlins activity, stop a profiler,
     * or re-enable features that were disabled for the test.
     *
     *   horde.after(function() {
     *     console.profileEnd(); // stop the Chrome profiler
     *   });
     *
     * If the callback takes no argument, it is executed synchronously.
     *
     *   horde.after(function() {
     *     // do things synchronously
     *   });
     *
     * If the callback takes an argument, it is executed asynchronously, which
     * means that the horde is paused until the argument is executed.
     *
     *   horde.after(function(done) {
     *     // do things asynchronously
     *     done();
     *   });
     *
     * after() callbacks are executed in the context of the horde.
     *
     *   horde.after(function() {
     *     // "this" is the horde
     *     this.log('Cleaning up the mess after the attack');
     *   });
     *
     * You can add several callbacks by calling after() more than once.
     * They will be executed in the order they were registered.
     *
     * @param {Function} afterCallback - A callback to be executed at the end of the stress test
     * @return {GremlinsHorde}
     */
    gremlins.after = afterCallback => {
        gremlins._afterCallbacks.push(afterCallback);
        return gremlins;
    };

    /**
     * Set the logger object to use for logging.
     *
     * When called with no parameter, return the current logger.
     *
     * The logger object must provide 4 functions: log, info, warn, and error.
     *
     *   const consoleLogger = {
     *       log:   console.log.bind(console),
     *       info:  console.info.bind(console),
     *       warn:  console.warn.bind(console),
     *       error: console.error.bind(console)
     *   };
     *   horde.logger(consoleLogger);
     *
     * The logger object is injected to mogwais, and to gremlins.
     *
     * By default, a horde uses the global console object as logger.
     *
     * @param {Object} [logger] - A logger object
     * @return {GremlinsHorde}
     */
    gremlins.logger = (logger = gremlins._logger) => {
        gremlins._logger = logger;
        return gremlins;
    };

    /**
     * Shortcut to the logger's log() method.
     *
     * Mostly useful for before() and after() callbacks. Only supports a
     * single argument.
     *
     * @param {String} msg The message to log
     */
    gremlins.log = msg => {
        gremlins._logger.log(msg);
    };

    /**
     * Set the randomizer object to use for generating random data.
     *
     * When called with no parameter, return the current randomizer.
     *
     * The randomizer object must be compatible with chance.js.
     *
     * The randomizer object is injected to mogwais, and to gremlins.
     *
     * By default, a horde uses a new Chance object as logger.
     *
     * @param {Object} [randomizer] - A randomizer object
     * @return {GremlinsHorde}
     */
    gremlins.randomizer = (randomizer = gremlins._randomizer) => {
        gremlins._randomizer = randomizer;
        return gremlins;
    };

    gremlins.seed = seed => {
        gremlins._randomizer = new Chance(seed);
        return gremlins;
    };

    /**
     * Start the stress test by executing gremlins according to the strategies
     *
     * Gremlins and mogwais do nothing until the horde is unleashed.
     * When unleashing, you can pass parameters to the strategies, such as the
     * number of gremlin waves in the default strategy.
     *
     *   horde.unleash({ nb: 50 }); // all gremlins will attack 50 times
     *
     * unleash() executes asynchronously, so you must use the second argument
     * if you need to execute code after the stress test.
     *
     *   horde.unleash({}, function() {
     *     console.log('Phew! Stress test is over.');
     *   });
     *
     * Alternately, you can use the after() method.
     *
     *   horde
     *     .after(function() {
     *       console.log('Phew! Stress test is over.');
     *     })
     *     .unleash();
     *
     * @param {Object} [params] - A list of parameters passed to each strategy.
     * @param {Function} [done] - A callback to be executed once the stress test is over
     */
    gremlins.unleash = (params, done) => {
        if (gremlins._gremlins.length === 0) {
            gremlins.allGremlins();
        }
        if (gremlins._mogwais.length === 0) {
            gremlins.allMogwais();
        }
        if (gremlins._strategies.length === 0) {
            gremlins.strategy(gremlins.strategies.distribution());
        }

        const gremlinsAndMogwais = [
            ...gremlins._gremlins,
            ...gremlins._mogwais,
        ];
        const allCallbacks = [
            ...gremlinsAndMogwais,
            ...gremlins._strategies,
            ...gremlins._beforeCallbacks,
            ...gremlins._afterCallbacks,
        ];
        inject(
            { logger: gremlins._logger, randomizer: gremlins._randomizer },
            allCallbacks
        );
        const beforeCallbacks = [
            ...gremlins._beforeCallbacks,
            ...gremlins._mogwais,
        ];
        const afterCallbacks = [
            ...gremlins._afterCallbacks,
            ...gremlinsAndMogwais
                .map(beast => beast.cleanUp)
                .filter(cleanUp => typeof cleanUp === 'function'),
        ];

        const horde = gremlins;

        executeInSeries(beforeCallbacks, [], horde, () => {
            executeInSeries(
                horde._strategies,
                [gremlinsAndMogwais, ...params],
                horde,
                () => {
                    executeInSeries(afterCallbacks, [], horde, () => {
                        if (typeof done === 'function') {
                            done();
                        }
                    });
                }
            );
        });
    };

    /**
     * Stop a running test
     *
     * Delegate the stop message to all registered strategies. Calling
     * this method before starting the test or after it is finished has
     * no effect.
     *
     * stop() will only work properly if strategies implement their own stop()
     * method.
     */
    gremlins.stop = () => {
        const strategies = gremlins._strategies;
        for (let i = 0, count = strategies.length; i < count; i++) {
            strategies[i].stop();
        }
        return gremlins;
    };

    /**
     * Get a new horde instance
     *
     * @return {gremlins}
     */
    gremlins.createHorde = () => {
        initHorde();
        return gremlins;
    };

    return gremlins;
};
