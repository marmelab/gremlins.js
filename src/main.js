/**
 * gremlins.js 0.1.0 Copyright (c) 2014, marmelab
 * Available via the MIT license.
 * see: http://github.com/marmelab/gremlins.js for details
 */
define(function(require) {
    "use strict";

    var gremlins = {
        type: {
            clicker:    require('./type/clicker'),
            formFiller: require('./type/formFiller'),
            scroller:   require('./type/scroller'),
            typer:      require('./type/typer')
        },
        watcher: {
            alert:      require('./watcher/alert'),
            fps:        require('./watcher/fps')
        }
    };

    var GremlinsHorde = function() {
        this._beforeCallbacks = [];
        this._afterCallbacks = [];
        this._gremlins = [];
        this._watchers = [];
        this._unleashers = [];
        this.loggerService = defaultLoggerService;
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

    var defaultLoggerService = {
        log:   console.log.bind(console),
        info:  console.info.bind(console),
        warn:  console.warn.bind(console),
        error: console.error.bind(console)
    };

    GremlinsHorde.prototype.before = function(beforeCallback) {
        this._beforeCallbacks.push(beforeCallback);
        return this;
    };

    GremlinsHorde.prototype.after = function(afterCallback) {
        this._afterCallbacks.push(afterCallback);
        return this;
    };

    GremlinsHorde.prototype.breed = function(gremlin) {
        this._gremlins.push(gremlin);
        return this;
    };

    GremlinsHorde.prototype.breedAll = function() {
        for (var gremlinName in gremlins.type) {
            this.breed(gremlins.type[gremlinName]());
        }
        return this;
    };

    GremlinsHorde.prototype.watch = function(watcher) {
        watcher.logger(this.loggerService);
        this._watchers.push(watcher);
        return this;
    };

    GremlinsHorde.prototype.watchAll = function() {
        for (var watcherName in gremlins.watcher) {
            this.watch(gremlins.watcher[watcherName]());
        }
        return this;
    };

    GremlinsHorde.prototype.logger = function(logger) {
        if (!arguments.length) return this.loggerService;
        this.loggerService = logger;
        return this;
    };

    GremlinsHorde.prototype.log = function(msg) {
        this.loggerService.log(msg);
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

                        gremlins[j].apply(horde, [horde.loggerService.log]);

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
        var i;
        var horde = this;
        var beforeCallbacks = this._beforeCallbacks.concat(this._watchers);
        var afterCallbacks  = this._afterCallbacks;
        for (var watcherName in this._watchers) {
            if (typeof this._watchers[watcherName].cleanUp == 'function')
            afterCallbacks.push(this._watchers[watcherName].cleanUp);
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
