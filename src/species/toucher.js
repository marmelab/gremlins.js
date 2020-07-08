const getDefaultConfig = (randomizer, window) => {
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
            randomizer.natural({
                max: Math.max(0, document.documentElement.clientWidth - 1),
            }),
            randomizer.natural({
                max: Math.max(0, document.documentElement.clientHeight - 1),
            }),
        ];
    };

    const defaultShowAction = (touches) => {
        const fragment = document.createDocumentFragment();
        touches.forEach((touch) => {
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

    return {
        touchTypes: defaultTouchTypes,
        positionSelector: defaultPositionSelector,
        showAction: defaultShowAction,
        canTouch: defaultCanTouch,
        maxNbTries: 10,
        maxTouches: 2,
        log: false,
    };
};

export default (userConfig) => ({ logger, randomizer, window }) => {
    const document = window.document;
    const config = { ...getDefaultConfig(randomizer, window), ...userConfig };

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

    const triggerTouch = (touches, element, type) => {
        const touchlist = [];
        const event = document.createEvent('Event');

        event.initEvent('touch' + type, true, true);

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

        event.touches = type === 'end' ? [] : touchlist;
        event.targetTouches = type === 'end' ? [] : touchlist;
        event.changedTouches = touchlist;

        element.dispatchEvent(event);
        if (typeof config.showAction === 'function') {
            config.showAction(touches);
        }
    };

    const triggerGesture = (element, startPos, startTouches, gesture, done) => {
        const interval = 10;
        const loops = Math.ceil(gesture.duration / interval);
        let loop = 1;

        const gestureLoop = () => {
            // calculate the radius
            let radius = gesture.radius;
            if (gesture.scale !== 1) {
                radius = gesture.radius - gesture.radius * (1 - gesture.scale) * ((1 / loops) * loop);
            }

            // calculate new position/rotation
            const posX = startPos[0] + (gesture.distanceX / loops) * loop;
            const posY = startPos[1] + (gesture.distanceY / loops) * loop;
            const rotation = typeof gesture.rotation === 'number' ? (gesture.rotation / loops) * loop : null;
            const touches = getTouches([posX, posY], startTouches.length, radius, rotation);
            const isFirst = loop === 1;
            const isLast = loop === loops;

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
        tap(position, element, log) {
            const touches = getTouches(position, 1);
            const gesture = {
                duration: randomizer.integer({ min: 20, max: 700 }),
            };

            triggerTouch(touches, element, 'start');

            setTimeout(() => {
                triggerTouch(touches, element, 'end');

                log(touches, gesture);
            }, gesture.duration);
        },

        // doubletap, like a dblclick event, only 1 touch
        // could also be a slow doubletap, that could turn out to be a hold
        doubletap(position, element, log) {
            touchTypes.tap(position, element, () => {
                setTimeout(() => {
                    touchTypes.tap(position, element, log);
                }, 30);
            });
        },

        // single touch gesture, could be a drag and swipe, with 1 points
        gesture(position, element, log) {
            const gesture = {
                distanceX: randomizer.integer({ min: -100, max: 200 }),
                distanceY: randomizer.integer({ min: -100, max: 200 }),
                duration: randomizer.integer({ min: 20, max: 500 }),
            };
            const touches = getTouches(position, 1, gesture.radius);

            triggerGesture(element, position, touches, gesture, (touches) => {
                log(touches, gesture);
            });
        },

        // multitouch gesture, could be a drag, swipe, pinch and rotate, with 2 or more points
        multitouch(position, element, log) {
            const points = randomizer.integer({
                min: 2,
                max: config.maxTouches,
            });
            const gesture = {
                scale: randomizer.floating({ min: 0, max: 2 }),
                rotation: randomizer.natural({ min: 0, max: 100 }),
                radius: randomizer.integer({ min: 50, max: 200 }),
                distanceX: randomizer.integer({ min: -20, max: 20 }),
                distanceY: randomizer.integer({ min: -20, max: 20 }),
                duration: randomizer.integer({ min: 100, max: 1500 }),
            };
            const touches = getTouches(position, points, gesture.radius);

            triggerGesture(element, position, touches, gesture, (touches) => {
                log(touches, gesture);
            });
        },
    };

    return () => {
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

        const touchType = randomizer.pick(config.touchTypes);
        const log = (touches, details) => {
            if (typeof config.showAction === 'function') {
                config.showAction(touches);
            }
            if (logger && config.log) {
                logger.log('gremlin', 'toucher', touchType, 'at', posX, posY, details);
            }
        };
        touchTypes[touchType](position, targetElement, log);
    };
};
