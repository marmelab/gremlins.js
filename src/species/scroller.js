import Chance from 'chance';

import configurable from '../utils/configurable';
import RandomizerRequiredException from '../exceptions/randomizerRequiredException';

/**
 * The scroller gremlin scrolls the viewport to reveal another part of the document
 *
 *   const scrollerGremlin = gremlins.species.scroller();
 *   horde.gremlin(scrollerGremlin);
 *
 * The scrollerGremlin gremlin can be customized as follows:
 *
 *   scrollerGremlin.positionSelector(function() { // return a random position to scroll to });
 *   scrollerGremlin.showAction(function(element) { // show the gremlin activity on screen });
 *   scrollerGremlin.logger(loggerObject); // inject a logger
 *   scrollerGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.scroller()
 *     .positionSelector(function() {
 *       // only click in the app
 *       const $list = $('#todoapp');
 *       const offset = $list.offset();
 *       return [
 *         parseInt(Math.random() * $list.outerWidth() + offset.left),
 *         parseInt(Math.random() * ($list.outerHeight() + $('#info').outerHeight()) + offset.top)
 *       ];
 *     })
 *   )
 */
export default () => {
    const document = window.document;
    const documentElement = document.documentElement;
    const body = document.body;

    const defaultPositionSelector = () => {
        const documentWidth = Math.max(
            body.scrollWidth,
            body.offsetWidth,
            documentElement.scrollWidth,
            documentElement.offsetWidth,
            documentElement.clientWidth
        );
        const documentHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            documentElement.scrollHeight,
            documentElement.offsetHeight,
            documentElement.clientHeight
        );

        return [
            config.randomizer.natural({
                max: documentWidth - documentElement.clientWidth,
            }),
            config.randomizer.natural({
                max: documentHeight - documentElement.clientHeight,
            }),
        ];
    };

    const defaultShowAction = (scrollX, scrollY) => {
        const scrollSignal = document.createElement('div');
        scrollSignal.style.zIndex = 2000;
        scrollSignal.style.border = '3px solid red';
        scrollSignal.style.width = documentElement.clientWidth - 25 + 'px';
        scrollSignal.style.height = documentElement.clientHeight - 25 + 'px';
        scrollSignal.style.position = 'absolute';
        scrollSignal.style.webkitTransition = 'opacity 1s ease-out';
        scrollSignal.style.mozTransition = 'opacity 1s ease-out';
        scrollSignal.style.transition = 'opacity 1s ease-out';
        scrollSignal.style.left = scrollX + 10 + 'px';
        scrollSignal.style.top = scrollY + 10 + 'px';
        const element = body.appendChild(scrollSignal);
        setTimeout(() => {
            body.removeChild(element);
        }, 1000);
        setTimeout(() => {
            element.style.opacity = 0;
        }, 50);
    };

    const config = {
        positionSelector: defaultPositionSelector,
        showAction: defaultShowAction,
        logger: null,
        randomizer: new Chance(),
    };

    /**
     * @mixes config
     */
    const scrollerGremlin = () => {
        if (!config.randomizer) {
            throw new RandomizerRequiredException();
        }

        const position = config.positionSelector();
        const scrollX = position[0];
        const scrollY = position[1];

        window.scrollTo(scrollX, scrollY);

        if (typeof config.showAction === 'function') {
            config.showAction(scrollX, scrollY);
        }

        if (config.logger && typeof config.logger.log === 'function') {
            config.logger.log(
                'gremlin',
                'scroller  ',
                'scroll to',
                scrollX,
                scrollY
            );
        }
    };

    configurable(scrollerGremlin, config);

    return scrollerGremlin;
};
