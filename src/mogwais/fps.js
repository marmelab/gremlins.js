const NEXT_FRAME_MS = 16;

const getDefaultConfig = () => {
    const defaultLevelSelector = (fps) => {
        if (fps < 10) return 'error';
        if (fps < 20) return 'warn';
        return 'log';
    };
    return {
        delay: 500, // how often should the fps be measured
        levelSelector: defaultLevelSelector,
    };
};

export default (userConfig) => ({ logger, window }) => {
    const config = { ...getDefaultConfig(), ...userConfig };

    let initialTime = -Infinity; // force initial measure
    let enabled;
    const fpsRecords = [];

    const loop = (time) => {
        if (time - initialTime > config.delay) {
            measureFPS(time);
            initialTime = time;
        }
        if (!enabled) return;
        window.requestAnimationFrame(loop);
    };

    const measureFPS = () => {
        let lastTime;
        const init = (time) => {
            lastTime = time;
            window.requestAnimationFrame(measure);
        };
        const measure = (time) => {
            const fps = time - lastTime < NEXT_FRAME_MS ? 60 : 1000 / (time - lastTime);
            const level = config.levelSelector(fps);
            if (logger) {
                logger[level]('mogwai ', 'fps       ', fps);
            }
            fpsRecords.push(fps);
        };
        window.requestAnimationFrame(init);
    };

    const fpsMogwai = () => {
        enabled = true;
        window.requestAnimationFrame(loop);
    };

    fpsMogwai.cleanUp = () => {
        enabled = false;
        return fpsMogwai;
    };

    fpsMogwai.stats = () => {
        if (!fpsRecords.length) {
            return {};
        }
        return {
            max: Math.max(...fpsRecords),
            min: Math.min(...fpsRecords),
            avg: fpsRecords.reduce((total, fps) => total + fps, 0) / fpsRecords.length,
        };
    };

    return fpsMogwai;
};
