import Chance from 'chance';

import configurable from '../utils/configurable';
import RandomizerRequiredException from '../exceptions/randomizerRequiredException';

/**
 * The toucher gremlin touches anywhere on the visible area of the document.
 *
 * The toucher gremlin triggers touch events (touchstart, touchmove, touchcancel
 * and touchend), by doing gestures on random targets displayed on the viewport.
 * Touch gestures can last several seconds, so this gremlin isn't instantaneous.
 *
 * By default, the touch gremlin activity is showed by a red disc.
 *
 *   const toucherGremlin = gremlins.species.toucher();
 *   horde.gremlin(toucherGremlin);
 *
 * The toucher gremlin can be customized as follows:
 *
 *   toucherGremlin.touchTypes(['tap', 'gesture']); // the mouse event types to trigger
 *   toucherGremlin.positionSelector(function() { // find a random pair of coordinates to touch });
 *   toucherGremlin.showAction(function(x, y) { // show the gremlin activity on screen });
 *   toucherGremlin.canTouch(function(element) { return true }); // to limit where the gremlin can touch
 *   toucherGremlin.maxNbTries(5); // How many times the gremlin must look for a touchable element before quitting
 *   toucherGremlin.logger(loggerObject); // inject a logger
 *   toucherGremlin.randomizer(randomizerObject); // inject a randomizer
 *
 * Example usage:
 *
 *   horde.gremlin(gremlins.species.toucher()
 *     .touchTypes(['gesture'])
 *     .positionSelector(function() {
 *        // only touch inside the foo element area
 *        const $el = $('#foo');
 *        const offset = $el.offset();
 *        return [
 *          parseInt(Math.random() * $el.outerWidth() + offset.left),
 *          parseInt(Math.random() * $el.outerHeight() + offset.top)
 *        ];
 *     })
 *     . showAction(function(x, y) {
 *       // do nothing (hide the gremlin action on screen)
 *     })
 *   );
 */
export default () => {
    const document = window.document;
    const body = document.body;

    const defaultTouchTypes = [
        'tap',
        'tap',
        'tap',
        'doubletap',
        'gesture',
        'gesture',
        'gesture',
        'multitouch',
        'multitouch',
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

    const defaultShowAction = touches => {
        const fragment = document.createDocumentFragment();
        touches.forEach(touch => {
            const touchSignal = document.createElement('div');
            touchSignal.style.zIndex = 2000;
            touchSignal.style.background = 'red';
            touchSignal.style['border-radius'] = '50%'; // Chrome
            touchSignal.style.borderRadius = '50%'; // Mozilla
            touchSignal.style.width = '20px';
            touchSignal.style.height = '20px';
            touchSignal.style.position = 'absolute';
            touchSignal.style.webkitTransition = 'opacity .5s ease-out';
            touchSignal.style.mozTransition = 'opacity .5s ease-out';
            touchSignal.style.transition = 'opacity .5s ease-out';
            touchSignal.style.left = touch.x - 10 + 'px';
            touchSignal.style.top = touch.y - 10 + 'px';

            const element = fragment.appendChild(touchSignal);
            setTimeout(() => {
                body.removeChild(element);
            }, 500);
            setTimeout(() => {
                element.style.opacity = 0;
            }, 50);
        });
        document.body.appendChild(fragment);
    };

    const defaultCanTouch = () => {
        return true;
    };

    /**
     * @mixin
     */
    const config = {
        touchTypes: defaultTouchTypes,
        positionSelector: defaultPositionSelector,
        showAction: defaultShowAction,
        canTouch: defaultCanTouch,
        maxNbTries: 10,
        logger: null,
        randomizer: new Chance(),
        maxTouches: 2,
    };

    /**
     * generate a list of x/y around the center
     * @param center
     * @param points
     * @param [radius=100]
     * @param [rotation=0]
     */
    const getTouches = (center, points, radius, degrees) => {
        const cx = center[0];
        const cy = center[1];
        const touches = [];

        // just one touch, at the center
        if (points === 1) {
            return [{ x: cx, y: cy }];
        }

        radius = radius || 100;
        degrees = degrees !== null ? (degrees * Math.PI) / 180 : 0;
        const slice = (2 * Math.PI) / points;

        for (let i = 0; i < points; i++) {
            let angle = slice * i + degrees;
            touches.push({
                x: cx + radius * Math.cos(angle),
                y: cy + radius * Math.sin(angle),
            });
        }
        return touches;
    };

    /**
     * trigger a touchevent
     * @param touches
     * @param element
     * @param type
     */
    const triggerTouch = (touches, element, type) => {
        const touchlist = [];
        const event = document.createEvent('Event');

        event.initEvent('touch' + type, true, true);

        touchlist.identifiedTouch = touchlist.item = index => {
            return this[index] || {};
        };

        touches.forEach((touch, i) => {
            const x = Math.round(touch.x);
            const y = Math.round(touch.y);
            touchlist.push({
                pageX: x,
                pageY: y,
                clientX: x,
                clientY: y,
                screenX: x,
                screenY: y,
                target: element,
                identifier: i,
            });
        });

        event.touches = type == 'end' ? [] : touchlist;
        event.targetTouches = type == 'end' ? [] : touchlist;
        event.changedTouches = touchlist;

        element.dispatchEvent(event);
        config.showAction(touches);
    };

    /**
     * trigger a gesture
     * @param element
     * @param startPos
     * @param startTouches
     * @param gesture
     * @param done
     */
    const triggerGesture = (element, startPos, startTouches, gesture, done) => {
        const interval = 10;
        const loops = Math.ceil(gesture.duration / interval);
        let loop = 1;

        const gestureLoop = () => {
            // calculate the radius
            let radius = gesture.radius;
            if (gesture.scale !== 1) {
                radius =
                    gesture.radius -
                    gesture.radius * (1 - gesture.scale) * ((1 / loops) * loop);
            }

            // calculate new position/rotation
            const posX = startPos[0] + (gesture.distanceX / loops) * loop;
            const posY = startPos[1] + (gesture.distanceY / loops) * loop;
            const rotation =
                typeof gesture.rotation == 'number'
                    ? (gesture.rotation / loops) * loop
                    : null;
            const touches = getTouches(
                [posX, posY],
                startTouches.length,
                radius,
                rotation
            );
            const isFirst = loop == 1;
            const isLast = loop == loops;

            if (isFirst) {
                triggerTouch(touches, element, 'start');
            } else if (isLast) {
                triggerTouch(touches, element, 'end');
                return done(touches);
            } else {
                triggerTouch(touches, element, 'move');
            }

            setTimeout(gestureLoop, interval);
            loop++;
        };
        gestureLoop();
    };

    const touchTypes = {
        // tap, like a click event, only 1 touch
        // could also be a slow tap, that could turn out to be a hold
        tap(position, element, done) {
            const touches = getTouches(position, 1);
            const gesture = {
                duration: config.randomizer.integer({ min: 20, max: 700 }),
            };

            triggerTouch(touches, element, 'start');

            setTimeout(() => {
                triggerTouch(touches, element, 'end');
                done(touches, gesture);
            }, gesture.duration);
        },

        // doubletap, like a dblclick event, only 1 touch
        // could also be a slow doubletap, that could turn out to be a hold
        doubletap(position, element, done) {
            touchTypes.tap(position, element, () => {
                setTimeout(() => {
                    touchTypes.tap(position, element, done);
                }, 30);
            });
        },

        // single touch gesture, could be a drag and swipe, with 1 points
        gesture(position, element, done) {
            const gesture = {
                distanceX: config.randomizer.integer({ min: -100, max: 200 }),
                distanceY: config.randomizer.integer({ min: -100, max: 200 }),
                duration: config.randomizer.integer({ min: 20, max: 500 }),
            };
            const touches = getTouches(position, 1, gesture.radius);

            triggerGesture(element, position, touches, gesture, touches => {
                done(touches, gesture);
            });
        },

        // multitouch gesture, could be a drag, swipe, pinch and rotate, with 2 or more points
        multitouch(position, element, done) {
            const points = config.randomizer.integer({
                min: 2,
                max: config.maxTouches,
            });
            const gesture = {
                scale: config.randomizer.floating({ min: 0, max: 2 }),
                rotation: config.randomizer.natural({ min: 0, max: 100 }),
                radius: config.randomizer.integer({ min: 50, max: 200 }),
                distanceX: config.randomizer.integer({ min: -20, max: 20 }),
                distanceY: config.randomizer.integer({ min: -20, max: 20 }),
                duration: config.randomizer.integer({ min: 100, max: 1500 }),
            };
            const touches = getTouches(position, points, gesture.radius);

            triggerGesture(element, position, touches, gesture, touches => {
                done(touches, gesture);
            });
        },
    };

    /**
     * @mixes config
     */
    const toucherGremlin = (done = () => {}) => {
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
        } while (!targetElement || !config.canTouch(targetElement));

        const touchType = config.randomizer.pick(config.touchTypes);
        const logGremlin = (touches, details) => {
            if (typeof config.showAction == 'function') {
                config.showAction(touches);
            }
            if (config.logger && typeof config.logger.log == 'function') {
                config.logger.log(
                    'gremlin',
                    'toucher   ',
                    touchType,
                    'at',
                    posX,
                    posY,
                    details
                );
            }
        };
        touchTypes[touchType](position, targetElement, logGremlin, done);
    };

    configurable(toucherGremlin, config);

    return toucherGremlin;
};
