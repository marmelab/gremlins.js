import gizmo from './gizmo';

jest.useFakeTimers();

describe('gizmo', () => {
    let consoleErrorSpy;
    let windowErrorSpy = jest.fn();

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        window.onerror = windowErrorSpy;
    });

    it('should call console.error with right args', () => {
        const mogwais = gizmo()(console);

        mogwais();

        console.error('first error');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('first error');
    });

    it('should call window.error with right args', () => {
        const mogwais = gizmo()(console);

        mogwais();

        window.onerror('first error', 'https://foo.bar', 10);

        expect(windowErrorSpy).toHaveBeenCalledTimes(1);
        expect(windowErrorSpy).toHaveBeenCalledWith('first error', 'https://foo.bar', 10);
    });

    it('should call stop when maxErrors is reached', () => {
        const stop = jest.fn();
        const mogwais = gizmo({ maxErrors: 2 })(console, null, stop);

        mogwais();

        console.error('first error');
        console.error('second', 'error');

        expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, 'first error');
        expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, 'second', 'error');

        expect(stop).toHaveBeenCalledTimes(1);

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 4);
    });
});
