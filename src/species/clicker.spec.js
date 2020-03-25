import Chance from 'chance';

import clicker from './clicker';

jest.useFakeTimers();
jest.mock('chance', () => {
    return function() {
        const natural = ({ max }) => max;
        const pick = types => types[0]; // return click types
        return { natural, pick };
    };
});

describe('clicker', () => {
    const dispatchEventSpy = jest.fn();
    const initMouseEventSpy = jest.fn();
    let consoleSpy;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        document.body.innerHTML = '<div id="myid">my div</div>';

        // can't be delete in afterEach...
        if (document.elementFromPoint === undefined) {
            Object.defineProperty(document, 'elementFromPoint', {
                get: () => () => ({
                    ...document.getElementById('myid'),
                    dispatchEvent: dispatchEventSpy,
                }),
            });
        }

        Object.defineProperty(document.documentElement, 'clientWidth', {
            value: 11,
        });
        Object.defineProperty(document.documentElement, 'clientHeight', {
            value: 11,
        });
        jest.spyOn(document, 'createEvent').mockImplementation(() => ({ initMouseEvent: initMouseEventSpy }));
    });

    it('should log the cliker', () => {
        const species = clicker({ log: true })(console, new Chance());

        species();

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('gremlin', 'clicker   ', 'click', 'at', 10, 10);
    });

    it("should click on element but don't show element", () => {
        const species = clicker({ showAction: false })(console, new Chance());

        species();

        expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
        expect(document.getElementsByTagName('div')).toHaveLength(1);
    });

    it("should try to click twice on element but can't click at the end", () => {
        const canClickSpy = jest.fn();
        const species = clicker({ canClick: canClickSpy, maxNbTries: 2 })(console, new Chance());

        species();

        expect(canClickSpy).toHaveBeenCalledTimes(2);
        expect(dispatchEventSpy).toHaveBeenCalledTimes(0);
    });

    it('should click on myid element and add new element', () => {
        const species = clicker()(console, new Chance());

        species();

        // Click on myid element
        expect(initMouseEventSpy).toHaveBeenCalledWith(
            'click',
            true,
            true,
            window,
            0,
            0,
            0,
            10,
            10,
            false,
            false,
            false,
            false,
            0,
            null
        );
        expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

        // Add div element
        expect(document.getElementsByTagName('div')).toHaveLength(2);

        expect(setTimeout).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 1000);
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 50);
    });
});
