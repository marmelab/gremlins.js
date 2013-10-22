var ClickMonkey = (function() {

    var Monkey = function(config) {
        this.config = {};
        this.config.isElementClickable = config.isElementClickable;
        this.config.clickTypes = config.clickTypes || ['click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout'];
        this.config.showClick = config.showClick;
    };

    Monkey.prototype.run = function () {
        var windowSize = getWindowSize(),
            posX = Math.floor(Math.random() * windowSize.x),
            posY = Math.floor(Math.random() * windowSize.y),
            targetElement = document.elementFromPoint(posX, posY);

        if (typeof this.config.isElementClickable == 'function' && !this.config.isElementClickable(targetElement)) return;

        if (this.config.showClick) {
            visualizeEvent(posX, posY);
        }

        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(getRandomElementInArray(this.config.clickTypes), true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        targetElement.dispatchEvent(evt);
    };

    var visualizeEvent = function(x, y) {
        var clickSignal = document.createElement('div');
        clickSignal.style.border = "3px solid red";
        clickSignal.style['border-radius'] = '50%';
        clickSignal.style.width = "40px";
        clickSignal.style.height = "40px";
        clickSignal.style['box-sizing'] = 'border-box';
        clickSignal.style.position = "absolute";
        clickSignal.style.left = x + 'px';
        clickSignal.style.top = y + 'px';
        var element = document.body.appendChild(clickSignal);
        setTimeout(function() {
            document.body.removeChild(element);
        }, 1000);
    };

    var getRandomElementInArray = function(arr) {
        if (arr.length === 0) return null;

        return arr[Math.floor((Math.random() * arr.length))];
    };

    var getWindowSize = function() {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight|| e.clientHeight|| g.clientHeight;
        return { x: x, y: y };
    };

    return Monkey;
})();
