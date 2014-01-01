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
            fps:        require('./mogwais/fps')
        }
    };

    var GremlinsHorde = function() {
        this._beforeCallbacks = [];
        this._afterCallbacks = [];
        this._gremlins = [];
        this._mogwais = [];
        this._unleashers = [];
        this.loggerObject = defaultLoggerObject;
    };

    var callCallbacks = function(callbacks, args, context, done) {
        var nbArguments = args.length;

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

    var defaultLoggerObject = {
        log:   console.log.bind(console),
        info:  console.info.bind(console),
        warn:  console.warn.bind(console),
        error: console.error.bind(console)
    };

    /**
     * Add a callback to be executed before gremlins are unleashed.
     *
     * Use it to setup the page before the stress test (disable some features, 
     * set default data, bootstrap your application).
     * 
     * If the callback takes no argument, it is executed synchronously.
     *
     *   horde.before(function() {
     *     // do things synchronously
     *   });
     *
     * If the callback takes an argument, it is executed asynchronously.
     *
     *   horde.before(function(done) {
     *     // do things synchronously
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
     */
    GremlinsHorde.prototype.before = function(beforeCallback) {
        this._beforeCallbacks.push(beforeCallback);
        return this;
    };

    /**
     * Add a callback to be executed after gremlins finished their job.
     *
     * Use it to collect insights of the gremlins activity, or re-enable
     * features that were disabled for the test).
     * 
     * If the callback takes no argument, it is executed synchronously.
     *
     *   horde.after(function() {
     *     // do things synchronously
     *   });
     *
     * If the callback takes an argument, it is executed asynchronously.
     *
     *   horde.after(function(done) {
     *     // do things synchronously
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
     */
    GremlinsHorde.prototype.after = function(afterCallback) {
        this._afterCallbacks.push(afterCallback);
        return this;
    };

    /**
     * Add a gremlin to the horde.
     *
     * A gremlin is nothing more than a function. Gremlins mess up with the
     * application in order to test its robustness. Once unleased, the horde
     * executes each gremlin function several times (see unleash()). A logger
     * function is passed as an argument by the unleasher.
     *
     *   horde.gremlin(function(logger) {
     *     // do nasty things to the application
     *     // ...
     *     logger('Bye-bye, Woof Woof');
     *   });
     * 
     * The gremlins object contains a few gremlin species than you can add:
     *
     *   horde.gremlin(gremlins.species.clicker());
     *
     * Gremlin functions are executed in the context of the horde, however it
     * is a good practice to avoid using "this" inside gremlin functions to
     * allow direct gremlin execution for easier debugging.
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
     */
    GremlinsHorde.prototype.gremlin = function(gremlin) {
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
     *   horde.mowai(gremlins.mogwais.alert());
     * 
     * Mogwais are called once before the horde is unleashed. Just like a
     * before() callback, a mogwai can be synchronous or asynchronous.
     *
     * What distinguishes a mogwai function from a simple before() function
     * is that mogwai functions can provide a cleanUp() function to be called
     * once after the gremlins finished their job.
     * 
     * When added, if the mogwai provides a logger() function, the horde
     * logger object is injected, to allow the watcher to record activity.
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
     *
     * The cleanUp() and logger() support for mogwais allow to build
     * sophisticated monitoring features without using "this", and make
     * the mogwais portable and testable.
     *
     * If a horde is unleashed without manually adding at least a single
     * mogwai, all the default mogwai species are added (see allMogwais()).
     */
    GremlinsHorde.prototype.mogwai = function(mogwai) {
        if (typeof mogwai.logger === "function") {
            mogwai.logger(this.loggerObject);
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
     */
    GremlinsHorde.prototype.allMogwais = function() {
        for (var mogwaiName in gremlins.mogwais) {
            this.mogwai(gremlins.mogwais[mogwaiName]());
        }
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
     * The logger object is injected to mogwais, and the logger log() function
     * is injected to gremlins.
     */
    GremlinsHorde.prototype.logger = function(loggerObject) {
        if (!arguments.length) return this.loggerObject;
        this.loggerObject = loggerObject;
        return this;
    };

    /**
     * Shortcut to the logger's log() method.
     *
     * Mostly usefult for before() and after() callbacks. Only supports a
     * single argument.
     */
    GremlinsHorde.prototype.log = function(msg) {
        this.loggerObject.log(msg);
    };

    GremlinsHorde.prototype.unleasher = function(unleasherCallback) {
        this._unleashers.push(unleasherCallback);
        return this;
    };

    // run each gremlin every 10 milliseconds for nb times
    GremlinsHorde.prototype.defaultUnleasher = function(nb, done) {
        var i = 0,
            j,
            horde = this,
            gremlins = horde._gremlins,
            count = gremlins.length;
        while (i < nb) {
            for (j = 0; j < count; j++) {
                (function(i, j) {
                    setTimeout(function(){

                        gremlins[j].apply(horde, [horde.loggerObject.log]);

                        if (i == nb -1 && j == count - 1){
                            done();
                        }
                    }, i * 10);
                })(i, j);
            }
            i++;
        }
    };

    GremlinsHorde.prototype.runUnleashers = function(nb, done) {
        if (this._unleashers.length === 0) {
            this.defaultUnleasher(nb, done);
        } else {
            callCallbacks(this._unleashers, [this._gremlins, nb], this, done);
        }
    };

    GremlinsHorde.prototype.unleash = function(nb, done) {
        nb = nb || 100;
        if (this._gremlins.length === 0) {
            this.allGremlins();
        }
        if (this._mogwais.length === 0) {
            this.allMogwais();
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
            horde.runUnleashers(nb, function() {
                callCallbacks(afterCallbacks, [], horde, function () {
                    if (typeof done === 'function') {
                        done();
                    }
                });
            });
        });
    };

    gremlins.createHorde = function() {
        return new GremlinsHorde();
    };

    return gremlins;

});
