import bySpecies from './bySpecies';

import * as executeInSeries from '../utils/executeInSeries';
import * as wait from '../utils/wait';

jest.useFakeTimers();

describe('bySpecies', () => {
    beforeEach(() => {});

    it('should contains stop function', async () => {
        const strategies = bySpecies({ nb: 2 })();
        expect(typeof strategies.stop === 'function').toBe(true);
    });

    it('should call executeInSeries by species', async () => {
        const executeInSeriesSpy = jest.spyOn(executeInSeries, 'default').mockImplementation();
        const waitSpy = jest.spyOn(wait, 'default').mockImplementation();

        const gremlins = [{ name: 'firstGremlins' }, { name: 'secondGremlins' }];
        const strategies = bySpecies({ nb: 2 })();

        await expect(strategies(gremlins)).resolves.toBe();

        expect(waitSpy).toHaveBeenCalledTimes(4);
        expect(executeInSeriesSpy).toHaveBeenCalledTimes(4);
        expect(executeInSeriesSpy).toHaveBeenNthCalledWith(1, [{ name: 'firstGremlins' }], []);
        expect(executeInSeriesSpy).toHaveBeenNthCalledWith(2, [{ name: 'firstGremlins' }], []);
        expect(executeInSeriesSpy).toHaveBeenNthCalledWith(3, [{ name: 'secondGremlins' }], []);
        expect(executeInSeriesSpy).toHaveBeenNthCalledWith(4, [{ name: 'secondGremlins' }], []);
    });
});
