import fps from './fps';

describe('fps', () => {
    let consoleMock;
    let time;

    beforeEach(() => {
        consoleMock = { warn: jest.fn() };

        time = 0;
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            time += 100;
            if (time < 1000) {
                return cb(time);
            }
        });
    });

    it('should log two times the fps mogwais', async () => {
        const mogwais = fps()(consoleMock);

        mogwais();
        mogwais.cleanUp();

        expect(consoleMock.warn).toHaveBeenCalledTimes(2);
        expect(consoleMock.warn).toHaveBeenNthCalledWith(1, 'mogwai ', 'fps       ', 10);
        expect(consoleMock.warn).toHaveBeenNthCalledWith(2, 'mogwai ', 'fps       ', 10);
    });
});
