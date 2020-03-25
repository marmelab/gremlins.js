import Chance from 'chance';

import toucher from './toucher';

jest.useFakeTimers();
jest.mock('chance', () => {
    return function() {
        const natural = ({ max }) => max;
        const floating = ({ max }) => max;
        const integer = ({ max }) => max;
        const pick = types => types[0]; // return click types
        return { natural, floating, integer, pick };
    };
});

describe('toucher', () => {
    const dispatchEventSpy = jest.fn();
    const initEventSpy = jest.fn();
    let inputText;

    beforeEach(() => {
        // todo unskip test
        // consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        inputText = document.createElement('input');
        inputText.setAttribute('type', 'text');
        inputText.setAttribute('id', 'myid');
        document.body.appendChild(inputText);

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
        jest.spyOn(document, 'createEvent').mockImplementation(() => ({ initEvent: initEventSpy }));
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it.skip('should log the toucher', () => {
        // const species = toucher({ log: true })(console, new Chance());
        // species();
        // expect(consoleSpy).toHaveBeenCalledTimes(1);
        // expect(consoleSpy).toHaveBeenCalledWith('gremlin', 'toucher type', 'A', 'at', 10, 10);
    });

    it("should touch the element but don't show element", () => {
        const species = toucher({ showAction: false })(console, new Chance());

        species();

        expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
        expect(document.getElementsByTagName('div')).toHaveLength(0);
    });

    it('should touch on myid element and add new element', () => {
        const species = toucher()(console, new Chance());

        species();

        expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

        expect(document.getElementsByTagName('div')).toHaveLength(1);

        expect(setTimeout).toHaveBeenCalledTimes(3);
        expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 500);
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 50);
        expect(setTimeout).toHaveBeenNthCalledWith(3, expect.any(Function), 700);
    });
});
