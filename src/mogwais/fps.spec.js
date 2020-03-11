import fps from './fps';

describe('fps', () => {
    let consoleWarnSpy;
    let time;

    beforeEach(() => {
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        time = 0;
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            time += 100;
            if (time < 1000) {
                return cb(time);
            }
        });
    });

    it('should log two times the fps mogwais', async () => {
        const mogwais = fps()(console);

        mogwais();
        mogwais.cleanUp();

        expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
        expect(consoleWarnSpy).toHaveBeenNthCalledWith(1, 'mogwai ', 'fps       ', 10);
        expect(consoleWarnSpy).toHaveBeenNthCalledWith(2, 'mogwai ', 'fps       ', 10);
    });
});
