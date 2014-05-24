/**
 * DOM position selector helper for clicker gremlin.
 *
 * It gets a list of DOM nodes, chooses one of them
 * and returns coordinates of it's center.
 *
 * The reason behind it is to get the gremlins horde
 * to generate more clicks that actually affect real
 * UI elements instead of getting random clicks.
 */
define(function(require) {
    "use strict";

    var document = window.document,
        body = document.body,
        elements = body.getElementsByTagName('*'),
        pickDomElement,
        getElementPosition,
        domPositionSelector;

    pickDomElement = function(elementsList){
        var elem = elementsList[Math.floor(Math.random() * elementsList.length-1)] || pickDomElement(elementsList);

        return elem;
    };

    getElementPosition = function(element){
        return element.getBoundingClientRect();
    };

    return function() {
        domPositionSelector = function(){
            var elementPosition = getElementPosition(pickDomElement(elements));

            return [
                elementPosition.left + (elementPosition.right-elementPosition.left)/2,
                elementPosition.top + (elementPosition.bottom-elementPosition.top)/2
            ];
        };

        return domPositionSelector;
    };
});
