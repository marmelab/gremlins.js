import allTogether from './allTogether';

import * as executeInSeries from '../utils/executeInSeries';
import * as wait from '../utils/wait';

jest.useFakeTimers();

describe('allTogether', () => {
    it('should contains stop function', async () => {
        const strategies = allTogether({ nb: 2 })();
        expect(typeof strategies.stop === 'function').toBe(true);
    });

    it('should call executeInSeries with all gremlins', async () => {
        const executeInSeriesSpy = jest.spyOn(executeInSeries, 'default').mockImplementation();
        const waitSpy = jest.spyOn(wait, 'default').mockImplementation();

        const gremlins = [{ name: 'firstGremlins' }, { name: 'secondGremlins' }];
        const strategies = allTogether({ nb: 2 })();

        await expect(strategies(gremlins)).resolves.toBe();

        expect(waitSpy).toHaveBeenCalledTimes(2);
        expect(executeInSeriesSpy).toHaveBeenCalledTimes(2);
        expect(executeInSeriesSpy).toHaveBeenNthCalledWith(1, gremlins, []);
        expect(executeInSeriesSpy).toHaveBeenNthCalledWith(2, gremlins, []);
    });

    it("should don't call executeInSeries twice when strategies is stop", async () => {
        const executeInSeriesSpy = jest.spyOn(executeInSeries, 'default').mockImplementation();
        const waitSpy = jest.spyOn(wait, 'default').mockImplementation();

        const gremlins = [{ name: 'firstGremlins' }];
        const strategies = allTogether({ nb: 2 })();

        strategies.stop();
        await expect(strategies(gremlins)).resolves.toBe();

        expect(waitSpy).toHaveBeenCalledTimes(1);
        expect(executeInSeriesSpy).toHaveBeenCalledTimes(0);
    });
});
