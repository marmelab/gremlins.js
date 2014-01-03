/**
 * gremlins.js 0.1.0 Copyright (c) 2014, marmelab
 * Available via the MIT license.
 * see: http://github.com/marmelab/gremlins.js for details
 */
define(function(require) {
    "use strict";

    var gremlins = {
        species: {
            clicker:    require('./species/clicker'),
            formFiller: require('./species/formFiller'),
            scroller:   require('./species/scroller'),
            typer:      require('./species/typer')
        },
        mogwais: {
            alert:      require('./mogwais/alert'),
            fps:        require('./mogwais/fps'),
            gizmo:      require('./mogwais/gizmo')
        },
        strategies: {
            allTogether: require('./strategies/allTogether'),
            bySpecies:   require('./strategies/bySpecies')
        }
    };

    var GremlinsHorde = function() {
        this._gremlins = [];
        this._mogwais = [];
        this._strategies = [];
        this._beforeCallbacks = [];
        this._afterCallbacks = [];
        this._logger = console; // logs to console by default
    };

    /**
     * Add a gremlin to the horde.
     *
     * A gremlin is nothing more than a function. Gremlins mess up with the
     * application in order to test its robustness. Once unleased, the horde
     * executes each gremlin function several times (see unleash()).
     *
     *   horde.gremlin(function() {
     *     // do nasty things to the application
     *   });
     * 
     * The gremlins object contains a few gremlin species than you can add:
     *
     *   horde.gremlin(gremlins.species.clicker());
     *
     * When added, if the gremlin provides a logger() function, the horde
     * logger object is injected, to allow the gremlin to record activity.
     *
     * Here is a more sophisticated gremlin function example:
     *
     *   var logger;
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
     *     var oldIndexOf = Array.prototype.indexOf;
     *     Array.prototype.indexOf = function() { return 42; };
     *     // "this" is the horde
     *     this.after(function(){
     *       array.prototype.indexOf = oldIndexOf;
     *     });
     *   });
     *
     * Gremlin functions must be synchronous.
     *
     * If a horde is unleashed without manually adding at least a single
     * gremlin, all the default gremlin species are added (see allGremlins()).
     *
     * @param {Function} gremlin - A callback to be executed to mess up the app
     * @return {GremlinsHorde}
     */
    GremlinsHorde.prototype.gremlin = function(gremlin) {
        if (typeof gremlin.logger === "function") {
            gremlin.logger(this._logger);
        }
        this._gremlins.push(gremlin);
        return this;
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
    GremlinsHorde.prototype.allGremlins = function() {
        for (var gremlinName in gremlins.species) {
            this.gremlin(gremlins.species[gremlinName]());
        }
        return this;
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
     *     var oldAlert = window.alert;
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
     *   var oldAlert = window.alert;
     *   var logger;
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
    GremlinsHorde.prototype.mogwai = function(mogwai) {
        if (typeof mogwai.logger === "function") {
            mogwai.logger(this._logger);
        }
        this._mogwais.push(mogwai);
        return this;
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
    GremlinsHorde.prototype.allMogwais = function() {
        for (var mogwaiName in gremlins.mogwais) {
            this.mogwai(gremlins.mogwais[mogwaiName]());
        }
        return this;
    };

    /**
     * Add an attack strategy to run gremlins.
     *
     * A strategy is a simple function taking the following arguments:
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
    GremlinsHorde.prototype.strategy = function(strategy) {
        this._strategies.push(strategy);
        return this;
    };

    /**
     * Add a callback to be executed before gremlins are unleashed.
     *
     * Use it to setup the page before the stress test (disable some features, 
     * set default data, bootstrap your application, start a profiler).
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
    GremlinsHorde.prototype.before = function(beforeCallback) {
        this._beforeCallbacks.push(beforeCallback);
        return this;
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
    GremlinsHorde.prototype.after = function(afterCallback) {
        this._afterCallbacks.push(afterCallback);
        return this;
    };

    /**
     * Set the logger object to use for logging.
     *
     * When called with no parameter, return the current logger.
     * 
     * The logger object must provide 4 functions: log, info, warn, and error.
     * 
     *   var consoleLogger = {
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
    GremlinsHorde.prototype.logger = function(logger) {
        if (!arguments.length) return this._logger;
        this._logger = logger;
        return this;
    };

    /**
     * Shortcut to the logger's log() method.
     *
     * Mostly useful for before() and after() callbacks. Only supports a
     * single argument.
     *
     * @param {String} msg The message to log
     */
    GremlinsHorde.prototype.log = function(msg) {
        this._logger.log(msg);
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
    GremlinsHorde.prototype.unleash = function(params, done) {
        if (this._gremlins.length === 0) {
            this.allGremlins();
        }
        if (this._mogwais.length === 0) {
            this.allMogwais();
        }
        if (this._strategies.length === 0) {
            this.strategy(gremlins.strategies.allTogether());
        }
        var i;
        var horde = this;
        var beforeCallbacks = this._beforeCallbacks.concat(this._mogwais);
        var afterCallbacks  = this._afterCallbacks;
        for (var watcherName in this._mogwais) {
            if (typeof this._mogwais[watcherName].cleanUp == 'function')
            afterCallbacks.push(this._mogwais[watcherName].cleanUp);
        }

        callCallbacks(beforeCallbacks, [], horde, function() {
            callCallbacks(horde._strategies, [horde._gremlins, params], horde, function() {
                callCallbacks(afterCallbacks, [], horde, function () {
                    if (typeof done === 'function') {
                        done();
                    }
                });
            });
        });
    };

    var callCallbacks = function(callbacks, args, context, done) {
        var nbArguments = args.length;
        callbacks = callbacks.slice(0); // clone the array to avoid modifying the original

        var iterator = function(callbacks, args) {
            if (!callbacks.length) {
                return typeof done === 'function' ? done() : true;
            }

            var callback = callbacks.shift();
            callback.apply(context, args);

            // Is the callback synchronous ?
            if (callback.length === nbArguments) {
                iterator(callbacks, args, done);
            }
        };

        args.push(function(){
            iterator(callbacks, args, done);
        });

        iterator(callbacks, args, done);
    };

    /**
     * Get a new horde instance
     *
     * @return {GremlinsHorde}
     */
    gremlins.createHorde = function() {
        return new GremlinsHorde();
    };

    return gremlins;

});
