var MonkeyTest = MonkeyTest || {};
MonkeyTest.crew = MonkeyTest.crew || {};

MonkeyTest.crew.ScrollMonkey = (function(window) {

    var document = window.document,
        documentElement = document.documentElement,
        body = document.body;

    var defaultShowAction = function(scrollX, scrollY) {
        var clickSignal = document.createElement('div');
        clickSignal.style.border = "3px solid red";
        clickSignal.style.width = (documentElement.clientWidth - 25) + "px";
        clickSignal.style.height = (documentElement.clientHeight - 25) + "px";
        clickSignal.style.position = "absolute";
        clickSignal.style.webkitTransition = 'opacity 1s ease-out';
        clickSignal.style.mozTransition = 'opacity 1s ease-out';
        clickSignal.style.transition = 'opacity 1s ease-out';
        clickSignal.style.left = (scrollX + 10) + 'px';
        clickSignal.style.top = (scrollY + 10) + 'px';
        var element = body.appendChild(clickSignal);
        setTimeout(function() {
            body.removeChild(element);
        }, 1000);
        setTimeout(function() {
            element.style.opacity = 0;
        }, 50);
    };

    var MonkeyConstructor = function(config) {
        config = config || {};
        config.showAction = config.showAction || defaultShowAction;

        var MonkeyRunner = function (callback) {
            var documentWidth = Math.max(body.scrollWidth, body.offsetWidth, documentElement.scrollWidth, documentElement.offsetWidth, documentElement.clientWidth),
                documentHeight = Math.max(body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight, documentElement.clientHeight),
                scrollX = Math.floor(Math.random() * (documentWidth  - documentElement.clientWidth )),
                scrollY = Math.floor(Math.random() * (documentHeight - documentElement.clientHeight));

            window.scrollTo(scrollX, scrollY);

            if (typeof config.showAction == 'function') {
                config.showAction(scrollX, scrollY);
            }
            if (typeof callback == 'function') {
                callback(scrollX, scrollY);
            }
        };

        return MonkeyRunner;
    };

    return MonkeyConstructor;

})(window);
