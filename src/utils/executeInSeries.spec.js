import executeInSeries from './executeInSeries';

describe('executeInSeries', () => {
    it('should call all callables with correct arguments', async () => {
        const promise = jest.fn(() => new Promise((resolve) => resolve()));
        const callable = jest.fn(() => {});
        const callables = [promise, callable];
        const args = [1, 2];

        await executeInSeries(callables, args);

        expect(promise).toHaveBeenCalledTimes(1);
        expect(promise).toHaveBeenLastCalledWith(...args);

        expect(callable).toHaveBeenCalledTimes(1);
        expect(callable).toHaveBeenLastCalledWith(...args);
    });

    it('should throw an error and stop executing if an error occur', async () => {
        const promise = jest.fn(() => new Promise((resolve) => resolve()));
        const rejectPromise = jest.fn(() => new Promise((_, reject) => reject('test reject')));
        const callables = [promise, rejectPromise, promise];
        const args = [1, 2];

        await expect(executeInSeries(callables, args)).rejects.toEqual('test reject');

        expect(promise).toHaveBeenCalledTimes(1);
        expect(promise).toHaveBeenLastCalledWith(...args);

        expect(rejectPromise).toHaveBeenCalledTimes(1);
        expect(rejectPromise).toHaveBeenLastCalledWith(...args);
    });
});
