var gremlins = gremlins || {};
gremlins.watcher = gremlins.watcher || {};

gremlins.watcher.alert = function() {

    var defaultWatchEvents = ['alert', 'confirm', 'pronmpt'];
    var defaultLogger = { log: function() {} };

    var config = {
        watchEvents: defaultWatchEvents,
        logger: defaultLogger
    };

    var alert   = window.alert;
    var confirm = window.confirm;
    var prompt  = window.prompt;

    function watch() {
        if (config.watchEvents.indexOf('alert') !== -1) {
            window.alert = function (msg) {
                config.logger.log('alert      watcher', msg, 'alert');
            };
        }
        if (config.watchEvents.indexOf('confirm') !== -1) {
            window.confirm = function (msg) {
                config.logger.log('alert      watcher', msg, 'confirm');
                // Random OK or cancel
                return Math.random() >= 0.5;
            };
        }
        if (config.watchEvents.indexOf('prompt') !== -1) {
            window.prompt = function (msg) {
                config.logger.log('alert         watcher', msg, 'prompt');
                // Return a random string
                return Math.random().toString(36).slice(2);
            };
        }
    }

    watch.cleanUp = function() {
        window.alert   = alert;
        window.confirm = confirm;
        window.prompt  = prompt;
        return watch;
    };

    watch.watchEvents = function(watchEvents) {
        if (!arguments.length) return config.watchEvents;
        config.watchEvents = watchEvents;
        return watch;
    };

    watch.logger = function(logger) {
        if (!arguments.length) return config.logger;
        config.logger = logger;
        return watch;
    };

    return watch;
};
