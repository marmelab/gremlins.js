import scroller from './scroller';

jest.useFakeTimers();

describe('scroller', () => {
    let consoleMock;
    let chanceMock;
    let config;

    const scrollToSpy = jest.fn();

    beforeEach(() => {
        consoleMock = { log: jest.fn() };
        chanceMock = {
            natural: ({ max }) => max,
        };

        Object.defineProperty(window, 'scrollTo', { value: scrollToSpy, writable: true });

        const documentElementProps = {
            clientWidth: 10,
            clientHeight: 10,
            scrollWidth: 15,
            scrollHeight: 15,
        };
        Object.keys(documentElementProps).forEach((key) => {
            Object.defineProperty(document.documentElement, key, {
                value: documentElementProps[key],
            });
        });
        config = {
            logger: consoleMock,
            randomizer: chanceMock,
            window,
        };
    });

    it('should log the scroller', () => {
        const species = scroller({ log: true })(config);

        species();

        expect(consoleMock.log).toHaveBeenCalledTimes(1);
        expect(consoleMock.log).toHaveBeenCalledWith('gremlin', 'scroller  ', 'scroll to', 5, 5);
    });

    it("should scroll but don't show element", () => {
        const species = scroller({ showAction: false })(config);

        species();

        expect(scrollToSpy).toHaveBeenCalledTimes(1);
        expect(scrollToSpy).toHaveBeenCalledWith(5, 5);
        expect(document.getElementsByTagName('div')).toHaveLength(1);
    });

    it('should scroll and add new element', () => {
        const species = scroller()(config);

        species();

        expect(scrollToSpy).toHaveBeenCalledTimes(1);
        expect(scrollToSpy).toHaveBeenCalledWith(5, 5);
        expect(document.getElementsByTagName('div')).toHaveLength(2);

        expect(setTimeout).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 1000);
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 50);
    });
});
