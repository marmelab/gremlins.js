/**
 * The scroller gremlin scrolls the viewport to reveal another part of the document
 *
 *   var scrollerGremlin = gremlins.species.scroller();
 *   horde.gremlin(scrollerGremlin);
 *
 * The scrollerGremlin gremlin can be customized as follows:
 *
 *   scrollerGremlin.positionSelector(function() { // return a random position to scroll to });
 *   scrollerGremlin.showAction(function(element) { // show the gremlin activity on screen });
 *   scrollerGremlin.logger(loggerObject); // inject a logger
 *   scrollerGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.scroller()
 *     .positionSelector(function() {
 *       // only click in the app
 *       var $list = $('#todoapp');
 *       var offset = $list.offset();
 *       return [
 *         parseInt(Math.random() * $list.outerWidth() + offset.left),
 *         parseInt(Math.random() * ($list.outerHeight() + $('#info').outerHeight()) + offset.top)
 *       ];
 *     })
 *   )
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');
    var Chance = require('../vendor/chance');
    var RandomizerRequiredException = require('../exceptions/randomizerRequired');

    return function() {

        var document = window.document,
            documentElement = document.documentElement,
            body = document.body;

        function defaultPositionSelector() {
            var documentWidth = Math.max(body.scrollWidth, body.offsetWidth, documentElement.scrollWidth, documentElement.offsetWidth, documentElement.clientWidth),
                documentHeight = Math.max(body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight, documentElement.clientHeight);

            return [
                config.randomizer.natural({ max: documentWidth  - documentElement.clientWidth }),
                config.randomizer.natural({ max: documentHeight  - documentElement.clientHeight })
            ];
        }

        function defaultShowAction(scrollX, scrollY) {
            var scrollSignal = document.createElement('div');
            scrollSignal.style.zIndex = 2000;
            scrollSignal.style.border = "3px solid red";
            scrollSignal.style.width = (documentElement.clientWidth - 25) + "px";
            scrollSignal.style.height = (documentElement.clientHeight - 25) + "px";
            scrollSignal.style.position = "absolute";
            scrollSignal.style.webkitTransition = 'opacity 1s ease-out';
            scrollSignal.style.mozTransition = 'opacity 1s ease-out';
            scrollSignal.style.transition = 'opacity 1s ease-out';
            scrollSignal.style.left = (scrollX + 10) + 'px';
            scrollSignal.style.top = (scrollY + 10) + 'px';
            var element = body.appendChild(scrollSignal);
            setTimeout(function() {
                body.removeChild(element);
            }, 1000);
            setTimeout(function() {
                element.style.opacity = 0;
            }, 50);
        }

        /**
         * @mixin
         */
        var config = {
            positionSelector: defaultPositionSelector,
            showAction:       defaultShowAction,
            logger:           null,
            randomizer:       null
        };

        /**
         * @mixes config
         */
        function scrollerGremlin() {
            if (!config.randomizer) {
                throw new RandomizerRequiredException();
            }

            var position = config.positionSelector(),
                scrollX = position[0],
                scrollY = position[1];

            window.scrollTo(scrollX, scrollY);

            if (typeof config.showAction == 'function') {
                config.showAction(scrollX, scrollY);
            }

            if (typeof config.logger.log == 'function') {
                config.logger.log('gremlin', 'scroller  ', 'scroll to', scrollX, scrollY);
            }
        }

        configurable(scrollerGremlin, config);

        return scrollerGremlin;
    };
});
