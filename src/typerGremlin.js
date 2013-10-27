/*jslint browser: true*/

var Gremlins = Gremlins || {};
Gremlins.crew = Gremlins.crew || {};

Gremlins.crew.TyperGremlin = function() {
    "use strict";

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

    var getRandomElementInArray = function (arr) {
        if (arr.length === 0) {
            return null;
        }

        return arr[Math.floor((Math.random() * arr.length))];
    };

    var config = {
        eventTypes: defaultEventTypes,
        showAction: defaultShowAction
    };

    function gremlin(callback) {
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
        if (typeof callback === 'function') {
            callback(posX, posY, key);
        }
    }

    gremlin.eventTypes = function(eventTypes) {
        if (!arguments.length) return config.eventTypes;
        config.eventTypes = eventTypes;
        return gremlin;
    };

    gremlin.showAction = function(showAction) {
        if (!arguments.length) return config.showAction;
        config.showAction = showAction;
        return gremlin;
    };

    return gremlin;
};
