define(function(require) {
    "use strict";
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

        var config = {
            eventTypes: defaultEventTypes,
            showAction: defaultShowAction,
            logger:     {}
        };

        var getRandomElementInArray = function (arr) {
            if (arr.length === 0) {
                return null;
            }

            return arr[Math.floor((Math.random() * arr.length))];
        };

        function typerGremlin() {
            var documentWidth = Math.max(body.scrollWidth, body.offsetWidth, documentElement.scrollWidth, documentElement.offsetWidth, documentElement.clientWidth),
                documentHeight = Math.max(body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight, documentElement.clientHeight),
                keyboardEvent = document.createEvent("KeyboardEvent"),
                initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent",
                key = Math.floor(Math.random() * 360),
                posX = Math.floor(Math.random() * documentElement.clientWidth),
                posY = Math.floor(Math.random() * documentElement.clientHeight),
                targetElement = document.elementFromPoint(posX, posY);

            keyboardEvent[initMethod](getRandomElementInArray(config.eventTypes), true, true, targetElement, false, false,  false,  false,  key, 0);

            targetElement.dispatchEvent(keyboardEvent);

            if (typeof config.showAction === 'function') {
                config.showAction(targetElement, posX, posY, key);
            }

            if (typeof config.logger.log == 'function') {
                config.logger.log('gremlin', 'typer       type', key, 'at', posX, posY);
            }
        }

        typerGremlin.eventTypes = function(eventTypes) {
            if (!arguments.length) return config.eventTypes;
            config.eventTypes = eventTypes;
            return typerGremlin;
        };

        typerGremlin.showAction = function(showAction) {
            if (!arguments.length) return config.showAction;
            config.showAction = showAction;
            return typerGremlin;
        };

        typerGremlin.logger = function(logger) {
            if (!arguments.length) return config.logger;
            config.logger = logger;
            return typerGremlin;
        };

        return typerGremlin;
    };
});
