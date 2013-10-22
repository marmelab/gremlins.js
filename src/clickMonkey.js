var ClickMonkey = (function() {

    var Monkey = function(config) {
        config = config || {};
        this.config = {};
        this.config.isElementClickable = config.isElementClickable;
        this.config.clickTypes = config.clickTypes || clickTypes;
        this.config.showAction = config.showAction || showAction;
    };

    Monkey.prototype.run = function () {
        var posX = Math.floor(Math.random() * document.documentElement.clientWidth),
            posY = Math.floor(Math.random() * document.documentElement.clientHeight),
            targetElement = document.elementFromPoint(posX, posY);

        if (typeof this.config.isElementClickable == 'function' && !this.config.isElementClickable(targetElement)) return;

        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(getRandomElementInArray(this.config.clickTypes), true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        targetElement.dispatchEvent(evt);

        if (typeof this.config.showAction == 'function') {
            showAction(posX, posY);
        }
    };

    var clickTypes = ['click', 'click', 'click', 'click', 'click', 'click', 'mousedown', 'mouseup', 'mouseover', 'mouseover', 'mouseover', 'mousemove', 'mouseout'];

    var showAction = function(x, y) {
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
        var element = document.body.appendChild(clickSignal);
        setTimeout(function() {
            document.body.removeChild(element);
        }, 1000);
        setTimeout(function() {
            element.style.opacity = 0;
        }, 50);
    };

    var getRandomElementInArray = function(arr) {
        if (arr.length === 0) return null;

        return arr[Math.floor((Math.random() * arr.length))];
    };

    return Monkey;
})();
