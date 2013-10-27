var gremlins = (function() {

    var gremlins = {
        crew: {}
    };

    var GremlinsHorde = function() {
        this._beforeCallbacks = [];
        this._afterCallbacks = [];
        this._gremlins = [];
        this._unleashers = [];
        this._loggers = [];
    };

    var callCallbacks = function (callbacks, args, done) {
        var nbArguments = args.length;

        args.push(function(){
            iterator(callbacks, args, done)
        });

        (iterator = function(callbacks, args) {
            if (!callbacks.length) {
                return typeof done === 'function' ? done() : true;
            }

            var callback = callbacks.shift();
            callback.apply(callback, args);

            // Is the callback synchronous ?
            if (callback.length === nbArguments) {
                iterator(callbacks, args, done)
            }
        })(callbacks, args, done);
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
        for (var gremlinName in Gremlins.crew) {
            this.breed(Gremlins.crew[gremlinName]());
        }
        return this;
    };

    GremlinsHorde.prototype.unleasher = function(unleasherCallback) {
        this._unleashers.push(unleasherCallback);
        return this;
    };

    // run each gremlin every 10 milliseconds for nb times
    var defaultUnleasher = function(gremlins, nb, done) {
        var i = 0,
            j,
            count = gremlins.length;
        while (i < nb) {
            for (j = 0; j < count; j++) {
                (function(i, j) {
                    setTimeout(function(){
                        gremlins[j]();

                        if (i == nb -1 && j == count - 1){
                            done();
                        }
                    }, i * 10);
                })(i, j);
            }
            i++;
        }
    };

    var runUnleashers = function(unleashers, gremlins, nb, done) {
        if (unleashers.length === 0) {
            defaultUnleasher(gremlins, nb, done);
        } else {
            callCallbacks(unleashers, [gremlins, nb], done);
        }
    };

    GremlinsHorde.prototype.logger = function(loggerCallback) {
        this._loggers.push(loggerCallback);
        return this;
    };

    GremlinsHorde.prototype.unleash = function(nb, done) {
        var i;
        var self = this;

        callCallbacks(this._beforeCallbacks, [], function () {
            runUnleashers(self._unleashers, self._gremlins, nb, function() {
                callCallbacks(self._afterCallbacks, [], function () {
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
})();
