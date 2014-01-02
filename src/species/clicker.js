define(function(require) {
    "use strict";
    return function() {

        var document = window.document,
            body = document.body;

        var defaultClickTypes = ['click', 'click', 'click', 'click', 'click', 'click', 'mousedown', 'mouseup', 'mouseover', 'mouseover', 'mouseover', 'mousemove', 'mouseout'];

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
            clickSignal.style.left = x + 'px';
            clickSignal.style.top = y + 'px';
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
            clickTypes: defaultClickTypes,
            showAction: defaultShowAction,
            canClick:   defaultCanClick,
            logger:     {}
        };

        var getRandomElementInArray = function(arr) {
            if (arr.length === 0) return null;

            return arr[Math.floor((Math.random() * arr.length))];
        };

        function clickerGremlin() {
            var posX, posY, targetElement;
            do {
                posX = Math.floor(Math.random() * document.documentElement.clientWidth);
                posY = Math.floor(Math.random() * document.documentElement.clientHeight);
                targetElement = document.elementFromPoint(posX, posY);
            } while (!config.canClick(targetElement));

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

        clickerGremlin.clickTypes = function(clickTypes) {
            if (!arguments.length) return config.clickTypes;
            config.clickTypes = clickTypes;
            return clickerGremlin;
        };

        clickerGremlin.showAction = function(showAction) {
            if (!arguments.length) return config.showAction;
            config.showAction = showAction;
            return clickerGremlin;
        };

        clickerGremlin.canClick = function(canClick) {
            if (!arguments.length) return config.canClick;
            config.canClick = canClick;
            return clickerGremlin;
        };

        clickerGremlin.logger = function(logger) {
            if (!arguments.length) return config.logger;
            config.logger = logger;
            return clickerGremlin;
        };

        return clickerGremlin;
    };
});
