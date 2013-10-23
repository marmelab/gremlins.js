var MonkeyTest = MonkeyTest || {};
MonkeyTest.crew = MonkeyTest.crew || {};

MonkeyTest.crew.ClickMonkey = function() {

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

    var getRandomElementInArray = function(arr) {
        if (arr.length === 0) return null;

        return arr[Math.floor((Math.random() * arr.length))];
    };

    var config = {
        clickTypes: defaultClickTypes,
        showAction: defaultShowAction,
        canClick: function() { return true; }
    };

    function monkey(callback) {
        var posX = Math.floor(Math.random() * document.documentElement.clientWidth),
            posY = Math.floor(Math.random() * document.documentElement.clientHeight),
            targetElement = document.elementFromPoint(posX, posY);

        if (!config.canClick(targetElement)) return;

        var evt = document.createEvent("MouseEvents");
        var clickType = getRandomElementInArray(config.clickTypes);
        evt.initMouseEvent(clickType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        targetElement.dispatchEvent(evt);

        if (typeof config.showAction == 'function') {
            config.showAction(posX, posY, clickType);
        }
        if (typeof callback == 'function') {
            callback(posX, posY, clickType);
        }
    }

    monkey.clickTypes = function(clickTypes) {
        if (!arguments.length) return config.clickTypes;
        config.clickTypes = clickTypes;
        return monkey;
    };

    monkey.showAction = function(showAction) {
        if (!arguments.length) return config.showAction;
        config.showAction = showAction;
        return monkey;
    };

    monkey.canClick = function(canClick) {
        if (!arguments.length) return config.canClick;
        config.canClick = canClick;
        return monkey;
    };

    return monkey;
};
