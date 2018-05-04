/**
 * The targeted clicker gremlin either clicks randomly or clicks on interesting targets in the visible area of
 * the document
 *
 * The targeted clicker gremlin triggers mouse events (click, dblclick, mousedown,
 * mouseup, mouseover, mouseover, mouseover, mousemove, and mouseout) on 
 * interesting or random targets displayed on the viewport.
 *
 * By default, the targeted clicker gremlin activity is showed by a red circle.
 *
 *   var targetedClickerGremlin = gremlins.species.targetedClicker();
 *   horde.gremlin(targetedClickerGremlin);
 *
 * The targeted clicker gremlin can be customized as follows:
 *
 *   targetedClickerGremlin.percentRandom(0.5); // What percent of clicks are random vs. targeted
 *   targetedClickerGremlin.interestingElements(['button', 'input', 'a', 'img']); // the dom tag types the clicker gremlin finds interesting
 *   targetedClickerGremlin.clickTypes(['click', 'mouseover']); // the mouse event types to trigger
 *   targetedClickerGremlin.positionSelector(function() { // find a random pair of coordinates to click });
 *   targetedClickerGremlin.showAction(function(x, y) { // show the gremlin activity on screen });
 *   targetedClickerGremlin.canClick(function(element) { return true }); // to limit where the gremlin can click
 *   targetedClickerGremlin.maxNbTries(5); // How many times the gremlin must look for a clickable element before quitting
 *   targetedClickerGremlin.logger(loggerObject); // inject a logger
 *   targetedClickerGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.targetedClicker()
 *     .clickTypes(['click'])
 *     .positionSelector(function() {
 *        // only click inside the foo element area
 *        var $el = $('#foo');
 *        var offset = $el.offset();
 *        return [
 *          parseInt(Math.random() * $el.outerWidth() + offset.left),
 *          parseInt(Math.random() * $el.outerHeight() + offset.top)
 *        ];
 *     })
 *     .canClick(function(element) {
 *       // only click elements in bar
 *       return $(element).parents('#bar').length;
 *       // when canClick returns false, the gremlin will look for another
 *       // element to click on until maxNbTries is reached
 *     })
 *     . showAction(function(x, y) {
 *       // do nothing (hide the gremlin action on screen)
 *     })
 *   );
 */
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');
    var Chance = require('../vendor/chance');
    var RandomizerRequiredException = require('../exceptions/randomizerRequired');

    return function() {

        var document = window.document,
            body = document.body;

        var defaultClickTypes = ['click', 'click', 'click', 'click', 'click', 'click', 'dblclick', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseover', 'mouseover', 'mousemove', 'mouseout'];
        var defaultInterestingElements = ['button', 'input', 'a', 'img'];

        function defaultPositionSelector() {
            return [
                config.randomizer.natural({ max: document.documentElement.clientWidth - 1 }),
                config.randomizer.natural({ max: document.documentElement.clientHeight - 1 })
            ];
        }

        function defaultShowAction(x, y) {
            var clickSignal = document.createElement('div');
            clickSignal.style.zIndex = 2000;
            clickSignal.style.border = "3px solid red";
            clickSignal.style['border-radius'] = '50%'; // Chrome
            clickSignal.style.borderRadius = '50%';     // Mozilla
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
        }

        function defaultCanClick() {
            return true;
        }

        /**
         * @mixin
         */
        var config = {
            percentRandom:       50,
            interestingElements: defaultInterestingElements,
            clickTypes:          defaultClickTypes,
            positionSelector:    defaultPositionSelector,
            showAction:          defaultShowAction,
            canClick:            defaultCanClick,
            maxNbTries:          10,
            logger:              null,
            randomizer:          null
        };

        /**
         * @mixes config
         */
        function targetedClickerGremlin() {
            if (!config.randomizer) {
                throw new RandomizerRequiredException();
            }
            var position, posX, posY, target, targetElement, nbTries = 0;
            do {
                position = getPosition();
                posX = position[0];
                posY = position[1];
                target = position[2];
                if (target !== 'none') {
                  targetElement = document.elementFromPoint(posX, posY);
                }
                nbTries++;
                if (nbTries > config.maxNbTries) return false;
            } while (!targetElement || !config.canClick(targetElement));

            if (target === 'none') return false;

            var evt = document.createEvent("MouseEvents");
            var clickType = config.randomizer.pick(config.clickTypes);
            evt.initMouseEvent(clickType, true, true, window, 0, 0, 0, posX, posY, false, false, false, false, 0, null);
            targetElement.dispatchEvent(evt);

            if (typeof config.showAction === 'function') {
                config.showAction(posX, posY, clickType);
            }

            if (config.logger && typeof config.logger.log === 'function') {
                config.logger.log('gremlin', 'targetedClicker targeting', target, clickType, 'at', posX, posY);
            }
        }

        function getPosition() {
            if (config.percentRandom > 0 && config.randomizer.bool({ likelihood: config.percentRandom })) {
              var position = config.positionSelector();
              position[2] = 'random';
              return position;
            } else {
                var matchingNodes = document.querySelectorAll(config.interestingElements.join(', '));
                if (matchingNodes.length > 0) {
                  var selectedNode = config.randomizer.pick(matchingNodes);
                  var target = selectedNode.nodeName;
                  var bounds = selectedNode.getBoundingClientRect();
                  var xPos = config.randomizer.floating({ min: bounds.left, max: bounds.right });
                  var yPos = config.randomizer.floating({ min: bounds.top, max: bounds.bottom });
                  return [xPos, yPos, target];
                }
                return [0, 0, 'none'];
            }
        }

        configurable(targetedClickerGremlin, config);

        return targetedClickerGremlin;
    };
});
