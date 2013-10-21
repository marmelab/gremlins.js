/*jslint browser: true*/
/*global jQuery*/

(function ($) {

    "use strict";

    var MonkeyTest = {
        config: {
            urlPattern: /.+/
        },
        furry: null,
        width: null,
        height: null,

        init: function () {
            this.width = $(window).width();
            this.height = $(window).height();

            this.furry = setInterval(this.clickEveryWhere.bind(this), 10);
        },

        /**
         * Click everywhere on the screen
         */
        clickEveryWhere: function () {
            var x = Math.floor(Math.random() * this.width),
                y = Math.floor(Math.random() * this.height),
                $targetElement = $(document.elementFromPoint(x, y));

            if (this.canClickOnElement($targetElement)) {
                $targetElement.click();
            }
        },

        /**
         * Check if the monkey can click on an element
         * @param element
         * @returns {boolean}
         */
        canClickOnElement: function ($element) {
            if ($element[0].tagName !== 'A') {
                return true;
            }

            return this.config.urlPattern.test($element.attr('href'));
        }
    };

    // Start the monkey
    $(window).on('load', MonkeyTest.init.bind(MonkeyTest));
}(jQuery));