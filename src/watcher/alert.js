var gremlins = gremlins || {};
gremlins.watcher = gremlins.watcher || {};

gremlins.watcher.alert = function() {

    var defaultWatchEvents = ['alert', 'confirm', 'pronmpt'];

    var config = {
        watchEvents: defaultWatchEvents
    };

    var alert   = window.alert;
    var confirm = window.confirm;
    var prompt  = window.prompt;

    function watch() {
        var logger = (typeof this.logger === 'function') ? this.logger : function() {};
        if (config.watchEvents.indexOf('alert') !== -1) {
            window.alert = function (msg) {
                logger('alert: ' + msg, 'info');
            };
        }
        if (config.watchEvents.indexOf('confirm') !== -1) {
            window.confirm = function (msg) {
                logger('confirm: ' + msg, 'info');
                // Random OK or cancel
                return Math.random() >= 0.5;
            };
        }
        if (config.watchEvents.indexOf('prompt') !== -1) {
            window.prompt = function (msg) {
                logger('prompt: ' + msg, 'info');
                // Return a random string
                return Math.random().toString(36).slice(2);
            };
        }
    }

    watch.cleanUp = function(logger) {
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

    return watch;
};
