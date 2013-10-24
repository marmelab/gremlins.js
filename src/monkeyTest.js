var MonkeyTest = (function() {

    var MonkeyTest = {
        crew: {}
    };

    var MonkeyTestSuite = function() {
        this._beforeCallbacks = [];
        this._afterCallbacks = [];
        this._monkeys = [];
        this._runners = [];
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

    MonkeyTestSuite.prototype.before = function(beforeCallback) {
        this._beforeCallbacks.push(beforeCallback);
        return this;
    };

    MonkeyTestSuite.prototype.after = function(afterCallback) {
        this._afterCallbacks.push(afterCallback);
        return this;
    };

    MonkeyTestSuite.prototype.monkey = function(monkeyCallback) {
        this._monkeys.push(monkeyCallback);
        return this;
    };

    MonkeyTestSuite.prototype.allMonkeys = function() {
        for (var monkeyName in MonkeyTest.crew) {
            this.monkey(MonkeyTest.crew[monkeyName]());
        }
        return this;
    };

    MonkeyTestSuite.prototype.runner = function(runnerCallback) {
        this._runners.push(runnerCallback);
        return this;
    };

    // run each monkey every 10 milliseconds for nb times
    var defaultRunner = function(monkeys, nb, done) {
        var i = 0,
            j,
            count = monkeys.length;
        while (i < nb) {
            for (j = 0; j < count; j++) {
                (function(i, j) {
                    setTimeout(function(){
                        monkeys[j]();

                        if (i == nb -1 && j == count - 1){
                            done();
                        }
                    }, i * 10);
                })(i, j);
            }
            i++;
        }
    };

    var runRunners = function(runners, monkeys, nb, done) {
        if (runners.length === 0) {
            defaultRunner(monkeys, nb, done);
        } else {
            callCallbacks(runners, [monkeys, nb], done);
        }
    };

    MonkeyTestSuite.prototype.logger = function(loggerCallback) {
        this._loggers.push(loggerCallback);
        return this;
    };

    MonkeyTestSuite.prototype.run = function(nb, done) {
        var i;
        var self = this;

        callCallbacks(this._beforeCallbacks, [], function () {
            runRunners(self._runners, self._monkeys, nb, function() {
                callCallbacks(self._afterCallbacks, [], function () {
                    if (typeof done === 'function') {
                        done();
                    }
                });
            });
        });
    };

    MonkeyTest.createSuite = function() {
        return new MonkeyTestSuite();
    };

    return MonkeyTest;
})();
