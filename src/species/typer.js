/**
 * The typer gremlin types keys on the keyboard
 *
 * Note that keyboard events must be localized somewhere on screen, so this
 * gremlins picks a random screen location first.
 *
 * By default, the typer gremlin activity is showed by a letter surrounded by
 * a red circle.
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

    return function() {

        var document = window.document,
            documentElement = document.documentElement,
            body = document.body;

        var defaultEventTypes = ['keypress', 'keyup', 'keydown'];

        var defaultShowAction = function (targetElement, x, y, key) {
            var typeSignal = document.createElement('div');
            typeSignal.style.border = "3px solid orange";
            typeSignal.style['border-radius'] = '50%';
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
        };

        /**
         * @mixin
         */
        var config = {
            eventTypes: defaultEventTypes,
            showAction: defaultShowAction,
            logger:     {},
            randomizer: new Chance()
        };

        /**
         * @mixes config
         */
        function typerGremlin() {
            var documentWidth = Math.max(body.scrollWidth, body.offsetWidth, documentElement.scrollWidth, documentElement.offsetWidth, documentElement.clientWidth),
                documentHeight = Math.max(body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight, documentElement.clientHeight),
                keyboardEvent = document.createEvent("KeyboardEvent"),
                initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent",
                key = config.randomizer.natural({ max: 360}),
                posX = config.randomizer.natural({ max: documentElement.clientWidth - 1 }),
                posY = config.randomizer.natural({ max: documentElement.clientHeight - 1 }),
                targetElement = document.elementFromPoint(posX, posY);

            keyboardEvent[initMethod](config.randomizer.pick(config.eventTypes), true, true, targetElement, false, false,  false,  false,  key, 0);

            targetElement.dispatchEvent(keyboardEvent);

            if (typeof config.showAction === 'function') {
                config.showAction(targetElement, posX, posY, key);
            }

            if (typeof config.logger.log == 'function') {
                config.logger.log('gremlin', 'typer       type', key, 'at', posX, posY);
            }
        }

        configurable(typerGremlin, config);

        return typerGremlin;
    };
});
