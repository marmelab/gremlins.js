const getDefaultConfig = (randomizer, window) => {
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
            randomizer.natural({
                max: documentWidth - documentElement.clientWidth,
            }),
            randomizer.natural({
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
        scrollSignal.style['pointer-events'] = 'none';

        const element = body.appendChild(scrollSignal);
        setTimeout(() => {
            body.removeChild(element);
        }, 1000);
        setTimeout(() => {
            element.style.opacity = 0;
        }, 50);
    };

    return {
        positionSelector: defaultPositionSelector,
        showAction: defaultShowAction,
        log: false,
    };
};

export default (userConfig) => ({ logger, randomizer, window }) => {
    const config = { ...getDefaultConfig(randomizer, window), ...userConfig };
    return () => {
        const position = config.positionSelector();
        const scrollX = position[0];
        const scrollY = position[1];

        window.scrollTo(scrollX, scrollY);

        if (typeof config.showAction === 'function') {
            config.showAction(scrollX, scrollY);
        }

        if (logger && config.log) {
            logger.log('gremlin', 'scroller  ', 'scroll to', scrollX, scrollY);
        }
    };
};
