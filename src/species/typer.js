/**
 * The typer gremlin types keys on the keyboard
 *
 * Note that keyboard events must be localized somewhere on screen, so this
 * gremlins picks a random screen location first.
 *
 * By default, the typer gremlin activity is showed by a letter surrounded by
 * a orange circle with a keyname on it.
 *
 *   var typerGremlin = gremlins.species.typer();
 *   horde.gremlin(typerGremlin);
 *
 * The typerGremlin gremlin can be customized as follows:
 *
 *   typerGremlin.eventTypes(['keypress', 'keyup', 'keydown']); // types of events to trigger
 *   typerGremlin.showAction(function(element) { // show the gremlin activity on screen });
 *   typerGremlin.logger(loggerObject); // inject a logger
 *   typerGremlin.randomizer(randomizerObject); // inject a randomizer
 *
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

        var defaultEventTypes = ['keypress', 'keyup', 'keydown'];

        function defaultKeyGenerator() {
            return config.randomizer.natural({ min: 3, max: 254});
        }

        function defaultTargetElement(x, y) {
            return document.elementFromPoint(x, y);
        }

        function defaultShowAction(targetElement, x, y, key) {
            var typeSignal = document.createElement('div');
            typeSignal.style.zIndex = 2000;
            typeSignal.style.border = "3px solid orange";
            typeSignal.style['border-radius'] = '50%'; // Chrome
            typeSignal.style.borderRadius = '50%';     // Mozilla
            typeSignal.style.width = "40px";
            typeSignal.style.height = "40px";
            typeSignal.style['box-sizing'] = 'border-box';
            typeSignal.style.position = "absolute";
            typeSignal.style.webkitTransition = 'opacity 1s ease-out';
            typeSignal.style.mozTransition = 'opacity 1s ease-out';
            typeSignal.style.transition = 'opacity 1s ease-out';
            typeSignal.style.left = x + 'px';
            typeSignal.style.top = y + 'px';
            typeSignal.style.textAlign = 'center';
            typeSignal.style.paddingTop = '7px';
            typeSignal.innerHTML = String.fromCharCode(key);

            var element = body.appendChild(typeSignal);
            setTimeout(function () {
                body.removeChild(element);
            }, 1000);
            setTimeout(function () {
                element.style.opacity = 0;
            }, 50);
        }

        /**
         * @mixin
         */
        var config = {
            eventTypes: defaultEventTypes,
            showAction: defaultShowAction,
            keyGenerator: defaultKeyGenerator,
            targetElement: defaultTargetElement,
            logger:     null,
            randomizer: null
        };

        /**
         * @mixes config
         */
        function typerGremlin() {
            if (!config.randomizer) {
                throw new RandomizerRequiredException();
            }

            var keyboardEvent = document.createEventObject ? document.createEventObject() : document.createEvent("Events"),
                eventType = config.randomizer.pick(config.eventTypes),
                key = config.keyGenerator(),
                posX = config.randomizer.natural({ max: documentElement.clientWidth - 1 }),
                posY = config.randomizer.natural({ max: documentElement.clientHeight - 1 }),
                targetElement = config.targetElement(posX, posY);

            if(keyboardEvent.initEvent){
                keyboardEvent.initEvent(eventType, true, true);
            }

            keyboardEvent.keyCode = key;
            keyboardEvent.which = key;
            keyboardEvent.keyCodeVal = key;

            targetElement.dispatchEvent ? targetElement.dispatchEvent(keyboardEvent) : targetElement.fireEvent("on" + eventType, keyboardEvent);

            if (typeof config.showAction === 'function') {
                config.showAction(targetElement, posX, posY, key);
            }

            if (config.logger && typeof config.logger.log == 'function') {
                config.logger.log('gremlin', 'typer       type', String.fromCharCode(key), 'at', posX, posY);
            }
        }

        configurable(typerGremlin, config);

        return typerGremlin;
    };
});
