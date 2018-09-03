import hammer from 'hammerjs';

import gremlins from '../../src';
import round from './round';

let lastEvent = {};

/**
 * Receive the element for the logger with some caching to speed things up
 */
const getLogElement = (function() {
    const cache = {};
    return (type, name) => {
        const key = `${type}${name}`;
        if (!cache[key]) {
            cache[key] = document.getElementById('log-' + type + '-' + name);
        }
        return cache[key];
    };
})();

/**
 * Highlight the triggered event and update the log values
 * @param event
 */
function displayHammerEvent(event) {
    if (!event.gesture) {
        return;
    }

    // store last event, that should might match the gremlin
    if (event.gesture.eventType == 'end') {
        lastEvent = event;
    }

    // highlight gesture
    const event_el = getLogElement('gesture', event.type);
    event_el.className = 'active';

    for (let i = 0, len = hammerProps.length; i < len; i++) {
        const prop = hammerProps[i];
        let value = event.gesture[prop];
        switch (prop) {
            case 'center':
                value = `${value.pageX}x${value.pageY}`;
                break;
            case 'gesture':
                value = event.type;
                break;
            case 'target':
                value = event.gesture.target.tagName;
                break;
            case 'touches':
                value = event.gesture.touches.length;
                break;
        }
        getLogElement('prop', prop).innerHTML = value;
    }
}

// Hammer props shown on the page
const hammerProps = [
    'gesture',
    'center',
    'deltaTime',
    'angle',
    'direction',
    'distance',
    'deltaX',
    'deltaY',
    'velocityX',
    'velocityY',
    'pointerType',
    'interimDirection',
    'interimAngle',
    'scale',
    'rotation',
    'touches',
    'target',
];

// Hammer events listened
const hammerEvents = [
    'touch',
    'release',
    'hold',
    'tap',
    'doubletap',
    'dragstart',
    'drag',
    'dragend',
    'dragleft',
    'dragright',
    'dragup',
    'dragdown',
    'swipe',
    'swipeleft',
    'swiperight',
    'swipeup',
    'swipedown',
    'transformstart',
    'transform',
    'transformend',
    'rotate',
    'pinch',
    'pinchin',
    'pinchout',
];

// Listen to all events and display them on the page
const hammerInst = hammer(document.body, { prevent_default: true });
hammerInst.on(hammerEvents.join(' '), displayHammerEvent);

// Display Gremlins logs
const logger = {
    log(_, species) {
        if (species.trim() !== 'toucher') {
            console.log(arguments);
            return;
        }
        const details = arguments[6];
        if (lastEvent && lastEvent.gesture) {
            const lastGesture = lastEvent.gesture;
            console.group();
            console.log(
                'deltax',
                round(lastGesture.deltaX),
                round(details.distanceX)
            );
            console.log(
                'deltay',
                round(lastGesture.deltaY),
                round(details.distanceY)
            );
            console.log(
                'scale',
                round(lastGesture.scale),
                round(details.scale)
            );
            console.log(
                'rotation',
                round(lastGesture.rotation),
                round(details.rotation)
            );
            console.log(lastGesture, details);
            console.groupEnd();
        }
    },
    info() {
        console.info(arguments);
    },
    warn() {
        console.warn(arguments);
    },
    error() {
        console.error(arguments);
    },
};

// Start Gremlins
gremlins()
    .createHorde()
    .gremlin(gremlins.species.toucher())
    .logger(logger)
    .mogwai(gremlins.mogwais.gizmo().maxErrors(2))
    .unleash();
