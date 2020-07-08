const getDefaultConfig = (randomizer, window) => {
    const document = window.document;
    const body = document.body;

    const defaultEventTypes = ['keypress', 'keyup', 'keydown'];

    const defaultKeyGenerator = () => {
        return randomizer.natural({ min: 3, max: 254 });
    };

    const defaultTargetElement = (x, y) => {
        return document.elementFromPoint(x, y);
    };

    const defaultShowAction = (targetElement, x, y, key) => {
        const typeSignal = document.createElement('div');
        typeSignal.style.zIndex = 2000;
        typeSignal.style.border = '3px solid orange';
        typeSignal.style['border-radius'] = '50%'; // Chrome
        typeSignal.style.borderRadius = '50%'; // Mozilla
        typeSignal.style.width = '40px';
        typeSignal.style.height = '40px';
        typeSignal.style['box-sizing'] = 'border-box';
        typeSignal.style.position = 'absolute';
        typeSignal.style.webkitTransition = 'opacity 1s ease-out';
        typeSignal.style.mozTransition = 'opacity 1s ease-out';
        typeSignal.style.transition = 'opacity 1s ease-out';
        typeSignal.style.left = x + 'px';
        typeSignal.style.top = y + 'px';
        typeSignal.style.textAlign = 'center';
        typeSignal.style.paddingTop = '7px';
        typeSignal.innerHTML = String.fromCharCode(key);

        const element = body.appendChild(typeSignal);
        setTimeout(() => {
            body.removeChild(element);
        }, 1000);
        setTimeout(() => {
            element.style.opacity = 0;
        }, 50);
    };

    return {
        eventTypes: defaultEventTypes,
        showAction: defaultShowAction,
        keyGenerator: defaultKeyGenerator,
        targetElement: defaultTargetElement,
        log: false,
    };
};

export default (userConfig) => ({ logger, randomizer, window }) => {
    const document = window.document;
    const documentElement = document.documentElement;
    const config = { ...getDefaultConfig(randomizer, window), ...userConfig };

    return () => {
        const keyboardEvent = document.createEventObject
            ? document.createEventObject()
            : document.createEvent('Events');
        const eventType = randomizer.pick(config.eventTypes);
        const key = config.keyGenerator();
        const posX = randomizer.natural({
            max: Math.max(0, documentElement.clientWidth - 1),
        });
        const posY = randomizer.natural({
            max: Math.max(0, documentElement.clientHeight - 1),
        });
        const targetElement = config.targetElement(posX, posY);

        if (keyboardEvent.initEvent) {
            keyboardEvent.initEvent(eventType, true, true);
        }

        keyboardEvent.keyCode = key;
        keyboardEvent.which = key;
        keyboardEvent.keyCodeVal = key;

        if (targetElement.dispatchEvent) {
            targetElement.dispatchEvent(keyboardEvent);
        } else {
            targetElement.fireEvent('on' + eventType, keyboardEvent);
        }

        if (typeof config.showAction === 'function') {
            config.showAction(targetElement, posX, posY, key);
        }

        if (config.log && logger) {
            logger.log('gremlin', 'typer type', String.fromCharCode(key), 'at', posX, posY);
        }
    };
};
