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
    var defaultRunner = function(monkeys, nb) {
        var i = 0,
            j,
            count = monkeys.length;
        while (i < nb) {
            for (j = 0; j < count; j++) {
                setTimeout(monkeys[j], i * 10);
            }
            i++;
        }
    };

    MonkeyTestSuite.prototype.logger = function(loggerCallback) {
        this._loggers.push(loggerCallback);
        return this;
    };

    MonkeyTestSuite.prototype.run = function(nb) {
        var i;

        for (i = 0; i < this._beforeCallbacks.length; i++) {
            this._beforeCallbacks[i]();
        }

        if (this._runners.length === 0) {
            defaultRunner(this._monkeys, nb);
        } else {
            for (i = 0; i < this._runners.length; i++) {
                this._runners[i](this._monkeys, nb);
            }
        }

        for (i = 0; i < this._afterCallbacks.length; i++) {
            this._afterCallbacks[i]();
        }
    };

    MonkeyTest.createSuite = function() {
        return new MonkeyTestSuite();
    };

    return MonkeyTest;
})();
