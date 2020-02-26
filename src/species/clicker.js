const getDefaultConfig = randomizer => {
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
            randomizer.natural({
                max: document.documentElement.clientWidth - 1,
            }),
            randomizer.natural({
                max: document.documentElement.clientHeight - 1,
            }),
        ];
    };

    const defaultShowAction = (x, y) => {
        const document = window.document;
        const body = document.body;
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
    return {
        clickTypes: defaultClickTypes,
        positionSelector: defaultPositionSelector,
        showAction: defaultShowAction,
        canClick: defaultCanClick,
        maxNbTries: 10,
    };
};

export default userConfig => (logger, randomizer) => {
    const config = {
        ...getDefaultConfig(randomizer),
        userConfig,
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
        } while (!targetElement || !config.canClick(targetElement));

        const evt = document.createEvent('MouseEvents');
        const clickType = randomizer.pick(config.clickTypes);
        evt.initMouseEvent(clickType, true, true, window, 0, 0, 0, posX, posY, false, false, false, false, 0, null);
        targetElement.dispatchEvent(evt);

        if (typeof config.showAction === 'function') {
            config.showAction(posX, posY, clickType);
        }

        if (logger && typeof logger.log === 'function') {
            logger.log('gremlin', 'clicker   ', clickType, 'at', posX, posY);
        }
    };
};
