import Chance from 'chance';

import scroller from './scroller';

jest.useFakeTimers();
jest.mock('chance', () => {
    return function() {
        const natural = ({ max }) => max;
        return { natural };
    };
});

describe('scroller', () => {
    let consoleSpy;
    const scrollToSpy = jest.fn();

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        Object.defineProperty(window, 'scrollTo', { value: scrollToSpy, writable: true });

        const documentElementProps = {
            clientWidth: 10,
            clientHeight: 10,
            scrollWidth: 15,
            scrollHeight: 15,
        };
        Object.keys(documentElementProps).forEach(key => {
            Object.defineProperty(document.documentElement, key, {
                value: documentElementProps[key],
            });
        });
    });

    it('should log the scroller', () => {
        const species = scroller({ log: true })(console, new Chance());

        species();

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('gremlin', 'scroller  ', 'scroll to', 5, 5);
    });

    it("should scroll but don't show element", () => {
        const species = scroller({ showAction: false })(console, new Chance());

        species();

        expect(scrollToSpy).toHaveBeenCalledTimes(1);
        expect(scrollToSpy).toHaveBeenCalledWith(5, 5);
        expect(document.getElementsByTagName('div')).toHaveLength(1);
    });

    it('should scroll and add new element', () => {
        const species = scroller()(console, new Chance());

        species();

        expect(scrollToSpy).toHaveBeenCalledTimes(1);
        expect(scrollToSpy).toHaveBeenCalledWith(5, 5);
        expect(document.getElementsByTagName('div')).toHaveLength(2);

        expect(setTimeout).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 1000);
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 50);
    });
});
