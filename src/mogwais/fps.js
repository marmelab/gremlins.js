import configurable from '../utils/configurable';
import LoggerRequiredException from '../exceptions/loggerRequiredException';

/**
 * The fps mogwai logs the number of frames per seconds (FPS) of the browser
 *
 * The normal (and maximal) FPS rate is 60. It decreases when the browser is
 * busy refreshing the layout, or executing JavaScript.
 *
 * This mogwai logs with the error level once the FPS rate drops below 10.
 *
 *   const fpsMogwai = gremlins.mogwais.fps();
 *   horde.mogwai(fpsMogwai);
 *
 * The fps mogwai can be customized as follows:
 *
 *   fpsMogwai.delay(500); // the interval for FPS measurements
 *   fpsMogwai.levelSelector(function(fps) { // select logging level according to fps value });
 *   fpsMogwai.logger(loggerObject); // inject a logger
 *
 * Example usage:
 *
 *   horde.mogwai(gremlins.mogwais.fps()
 *     .delay(250)
 *     .levelSelector(function(fps) {
 *       if (fps < 5) return 'error';
 *       if (fps < 10) return 'warn';
 *       return 'log';
 *     })
 *   );
 */

const NEXT_FRAME_MS = 16;

export default () => {
    if (!window.requestAnimationFrame) {
        // shim layer with setTimeout fallback
        window.requestAnimationFrame =
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            (callback => {
                window.setTimeout(callback, 1000 / 60);
            });
    }

    const defaultLevelSelector = fps => {
        if (fps < 10) return 'error';
        if (fps < 20) return 'warn';
        return 'log';
    };

    const config = {
        delay: 500, // how often should the fps be measured
        levelSelector: defaultLevelSelector,
        logger: console,
    };

    let initialTime = -Infinity; // force initial measure
    let enabled;

    const loop = time => {
        if (time - initialTime > config.delay) {
            measureFPS(time);
            initialTime = time;
        }
        if (!enabled) return;
        window.requestAnimationFrame(loop);
    };

    const measureFPS = () => {
        let lastTime;
        const init = time => {
            lastTime = time;
            window.requestAnimationFrame(measure);
        };
        const measure = time => {
            const fps =
                time - lastTime < NEXT_FRAME_MS ? 60 : 1000 / (time - lastTime);
            const level = config.levelSelector(fps);
            config.logger[level]('mogwai ', 'fps       ', fps);
        };
        window.requestAnimationFrame(init);
    };

    const fpsMogwai = () => {
        if (!config.logger) {
            throw new LoggerRequiredException(
                'This mogwai requires a logger to run. Please call logger(loggerObject) before executing the mogwai'
            );
        }
        enabled = true;
        window.requestAnimationFrame(loop);
    };

    fpsMogwai.cleanUp = () => {
        enabled = false;
        return fpsMogwai;
    };

    configurable(fpsMogwai, config);

    return fpsMogwai;
};
