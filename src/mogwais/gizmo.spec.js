import gizmo from './gizmo';

jest.useFakeTimers();

describe('gizmo', () => {
    let config;
    let stopMock;
    let consoleErrorSpy;
    let windowErrorSpy = jest.fn();

    beforeEach(() => {
        stopMock = jest.fn();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        window.onerror = windowErrorSpy;
        config = {
            logger: console,
            stop: stopMock,
            window,
        };
    });

    it('should call console.error with right args', () => {
        const mogwais = gizmo()(config);

        mogwais();

        console.error('first error');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('first error');
    });

    it('should call window.error with right args', () => {
        const mogwais = gizmo()(config);

        mogwais();

        window.onerror('first error', 'https://foo.bar', 10);

        expect(windowErrorSpy).toHaveBeenCalledTimes(1);
        expect(windowErrorSpy).toHaveBeenCalledWith('first error', 'https://foo.bar', 10);
    });

    it('should call stop when maxErrors is reached', () => {
        const mogwais = gizmo({ maxErrors: 2 })(config);

        mogwais();

        console.error('first error');
        console.error('second', 'error');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, 'first error');
        expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, 'second', 'error');

        expect(stopMock).toHaveBeenCalledTimes(1);

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 4);
    });
});
