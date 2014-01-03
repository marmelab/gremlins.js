define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');

    return function() {

        var document = window.document,
            body = document.body;

        var defaultClickTypes = ['click', 'click', 'click', 'click', 'click', 'click', 'dblclick', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseover', 'mouseover', 'mousemove', 'mouseout'];

        var defaultPositionSelector = function() {
            return [
                Math.floor(Math.random() * document.documentElement.clientWidth),
                Math.floor(Math.random() * document.documentElement.clientHeight)
            ];
        };

        var defaultShowAction = function(x, y) {
            var clickSignal = document.createElement('div');
            clickSignal.style.border = "3px solid red";
            clickSignal.style['border-radius'] = '50%';
            clickSignal.style.width = "40px";
            clickSignal.style.height = "40px";
            clickSignal.style['box-sizing'] = 'border-box';
            clickSignal.style.position = "absolute";
            clickSignal.style.webkitTransition = 'opacity 1s ease-out';
            clickSignal.style.mozTransition = 'opacity 1s ease-out';
            clickSignal.style.transition = 'opacity 1s ease-out';
            clickSignal.style.left = (x - 20 ) + 'px';
            clickSignal.style.top = (y - 20 )+ 'px';
            var element = body.appendChild(clickSignal);
            setTimeout(function() {
                body.removeChild(element);
            }, 1000);
            setTimeout(function() {
                element.style.opacity = 0;
            }, 50);
        };

        var defaultCanClick = function() { return true; };

        var config = {
            clickTypes:       defaultClickTypes,
            positionSelector: defaultPositionSelector,
            showAction:       defaultShowAction,
            canClick:         defaultCanClick,
            maxNbTries:       10,
            logger:           {}
        };

        var getRandomElementInArray = function(arr) {
            if (arr.length === 0) return null;

            return arr[Math.floor((Math.random() * arr.length))];
        };

        function clickerGremlin() {
            var position, posX, posY, targetElement, nbTries = 0;
            do {
                position = config.positionSelector();
                posX = position[0];
                posY = position[1];
                targetElement = document.elementFromPoint(posX, posY);
                nbTries++;
                if (nbTries > config.maxNbTries) return false;
            } while (!targetElement || !config.canClick(targetElement));

            var evt = document.createEvent("MouseEvents");
            var clickType = getRandomElementInArray(config.clickTypes);
            evt.initMouseEvent(clickType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            targetElement.dispatchEvent(evt);

            if (typeof config.showAction == 'function') {
                config.showAction(posX, posY, clickType);
            }

            if (typeof config.logger.log == 'function') {
                config.logger.log('gremlin', 'clicker   ', clickType, 'at', posX, posY);
            }
        }

        configurable(clickerGremlin, config);

        return clickerGremlin;
    };
});
