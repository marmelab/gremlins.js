import Chance from 'chance';

import configurable from '../utils/configurable';
import RandomizerRequiredException from '../exceptions/randomizerRequiredException';

/**
 * The clicker gremlin clicks anywhere on the visible area of the document
 *
 * The clicker gremlin triggers mouse events (click, dblclick, mousedown,
 * mouseup, mouseover, mouseover, mouseover, mousemove, and mouseout) on
 * random targets displayed on the viewport.
 *
 * By default, the clicker gremlin activity is showed by a red circle.
 *
 *   const clickerGremlin = gremlins.species.clicker();
 *   horde.gremlin(clickerGremlin);
 *
 * The clicker gremlin can be customized as follows:
 *
 *   clickerGremlin.clickTypes(['click', 'mouseover']); // the mouse event types to trigger
 *   clickerGremlin.positionSelector(function() { // find a random pair of coordinates to click });
 *   clickerGremlin.showAction(function(x, y) { // show the gremlin activity on screen });
 *   clickerGremlin.canClick(function(element) { return true }); // to limit where the gremlin can click
 *   clickerGremlin.maxNbTries(5); // How many times the gremlin must look for a clickable element before quitting
 *   clickerGremlin.logger(loggerObject); // inject a logger
 *   clickerGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.clicker()
 *     .clickTypes(['click'])
 *     .positionSelector(function() {
 *        // only click inside the foo element area
 *        const $el = $('#foo');
 *        const offset = $el.offset();
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

export default () => {
    const document = window.document;
    const body = document.body;

    const defaultClickTypes = [
        'click',
        'click',
        'click',
        'click',
        'click',
        'click',
        'dblclick',
        'dblclick',
        'mousedown',
        'mouseup',
        'mouseover',
        'mouseover',
        'mouseover',
        'mousemove',
        'mouseout',
    ];

    const defaultPositionSelector = () => {
        return [
            config.randomizer.natural({
                max: document.documentElement.clientWidth - 1,
            }),
            config.randomizer.natural({
                max: document.documentElement.clientHeight - 1,
            }),
        ];
    };

    const defaultShowAction = (x, y) => {
        const clickSignal = document.createElement('div');
        clickSignal.style.zIndex = 2000;
        clickSignal.style.border = '3px solid red';
        clickSignal.style['border-radius'] = '50%'; // Chrome
        clickSignal.style.borderRadius = '50%'; // Mozilla
        clickSignal.style.width = '40px';
        clickSignal.style.height = '40px';
        clickSignal.style['box-sizing'] = 'border-box';
        clickSignal.style.position = 'absolute';
        clickSignal.style.webkitTransition = 'opacity 1s ease-out';
        clickSignal.style.mozTransition = 'opacity 1s ease-out';
        clickSignal.style.transition = 'opacity 1s ease-out';
        clickSignal.style.left = x - 20 + 'px';
        clickSignal.style.top = y - 20 + 'px';
        const element = body.appendChild(clickSignal);
        setTimeout(() => {
            body.removeChild(element);
        }, 1000);
        setTimeout(() => {
            element.style.opacity = 0;
        }, 50);
    };

    const defaultCanClick = () => {
        return true;
    };

    const config = {
        clickTypes: defaultClickTypes,
        positionSelector: defaultPositionSelector,
        showAction: defaultShowAction,
        canClick: defaultCanClick,
        maxNbTries: 10,
        logger: null,
        randomizer: new Chance(),
    };

    const clickerGremlin = () => {
        if (!config.randomizer) {
            throw new RandomizerRequiredException(
                'This gremlin requires a randomizer to run. Please call randomizer(randomizerObject) before executing the gremlin.'
            );
        }

        let position;
        let posX;
        let posY;
        let targetElement;
        let nbTries = 0;

        do {
            position = config.positionSelector();
            posX = position[0];
            posY = position[1];
            targetElement = document.elementFromPoint(posX, posY);
            nbTries++;
            if (nbTries > config.maxNbTries) return;
        } while (!targetElement || !config.canClick(targetElement));

        const evt = document.createEvent('MouseEvents');
        const clickType = config.randomizer.pick(config.clickTypes);
        evt.initMouseEvent(
            clickType,
            true,
            true,
            window,
            0,
            0,
            0,
            posX,
            posY,
            false,
            false,
            false,
            false,
            0,
            null
        );
        targetElement.dispatchEvent(evt);

        if (typeof config.showAction === 'function') {
            config.showAction(posX, posY, clickType);
        }

        if (config.logger && typeof config.logger.log === 'function') {
            config.logger.log(
                'gremlin',
                'clicker   ',
                clickType,
                'at',
                posX,
                posY
            );
        }
    };

    configurable(clickerGremlin, config);

    return clickerGremlin;
};
