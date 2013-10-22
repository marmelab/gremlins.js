var ScrollMonkey = (function() {

    var Monkey = function(config) {
        config = config || {};
        this.config = {};
        this.config.showAction = config.showAction || showAction;
    };

    Monkey.prototype.run = function () {
        var documentWidth = Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth),
            documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight, document.documentElement.clientHeight),
            scrollX = Math.floor(Math.random() * (documentWidth - document.documentElement.clientWidth)),
            scrollY = Math.floor(Math.random() * documentHeight - document.documentElement.clientHeight);

        if (typeof this.config.showAction == 'function') {
            showAction(scrollX, scrollY);
        }

        window.scrollTo(scrollX, scrollY);
    };

    var showAction = function(scrollX, scrollY) {
        var clickSignal = document.createElement('div');
        clickSignal.style.border = "3px solid red";
        clickSignal.style.width = (document.documentElement.clientWidth - 20) + "px";
        clickSignal.style.height = (document.documentElement.clientHeight - 20) + "px";
        clickSignal.style.position = "absolute";
        clickSignal.style.webkitTransition = 'opacity 1s ease-out';
        clickSignal.style.mozTransition = 'opacity 1s ease-out';
        clickSignal.style.transition = 'opacity 1s ease-out';
        clickSignal.style.left = (scrollX + 10) + 'px';
        clickSignal.style.top = (scrollY + 10) + 'px';
        var element = document.body.appendChild(clickSignal);
        setTimeout(function() {
            document.body.removeChild(element);
        }, 1000);
        setTimeout(function() {
            element.style.opacity = 0;
        }, 50);
    };

    return Monkey;
})();
