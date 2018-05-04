/**
 * The reloader gremlin reloads the browser window
 *
 *   var reloaderGremlin = gremlins.species.reloader();
 *   horde.gremlin(reloaderGremlin);
 *
 * The reloaderGremlin gremlin can be customized as follows:
 *
 *   typerGremlin.percentReload(1); // What percent of the time does this gremlin reload the page
 *   typerGremlin.logger(loggerObject); // inject a logger
 *   typerGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 *   TODO: Add a visual indication that the reloader gremin is reloading the page.
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');
    var Chance = require('../vendor/chance');
    var RandomizerRequiredException = require('../exceptions/randomizerRequired');

    return function() {

        var document = window.document;

        /**
         * @mixin
         */
        var config = {
            percentReload: 1,
            logger:     null,
            randomizer: null
        };

        /**
         * @mixes config
         */
        function reloaderGremlin() {
            if (!config.randomizer) {
                throw new RandomizerRequiredException();
            }

            if (config.randomizer.bool({ likelihood: config.percentReload })) {
                location.reload();
            }

            if (config.logger && typeof config.logger.log === 'function') {
                config.logger.log('gremlin', 'reloader');
            }
        }

        configurable(reloaderGremlin, config);

        return reloaderGremlin;
    };
});
