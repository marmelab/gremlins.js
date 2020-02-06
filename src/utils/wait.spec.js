import wait from './wait';

jest.useFakeTimers();

describe('wait', () => {
    it('should call setTimeout and wait x ms', () => {
        wait(1000);

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    });
});
