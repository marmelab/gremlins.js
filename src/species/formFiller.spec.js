import Chance from 'chance';

import formFiller from './formFiller';

jest.useFakeTimers();
jest.mock('chance', () => {
    return function() {
        const character = () => 1;
        const email = () => 'cofveve@cofveve.com';
        const pick = types => types[0]; // return click types
        return { character, email, pick };
    };
});

describe('formFiller', () => {
    let consoleSpy;
    let inputText;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        inputText = document.createElement('input');
        inputText.setAttribute('type', 'text');
        inputText.setAttribute('id', 'myid');
        document.body.appendChild(inputText);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should log the formFiller', () => {
        const species = formFiller({ log: true })(console, new Chance());

        species();

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('gremlin', 'formFiller', 'input', 1, 'in', inputText);
    });

    it("should fill element but don't show element", () => {
        const species = formFiller({ showAction: false })(console, new Chance());

        species();

        expect(document.getElementById('myid')).toBe(inputText);
        expect(inputText.value).toBe('1');
    });

    it("should try to fill twice on element but can't fill at the end", () => {
        const canFillElementSpy = jest.fn();
        const species = formFiller({ canFillElement: canFillElementSpy, maxNbTries: 2 })(console, new Chance());

        species();

        expect(canFillElementSpy).toHaveBeenCalledTimes(2);
        expect(inputText.value).toBe('');
    });

    it('should fill element and add new element', () => {
        const species = formFiller()(console, new Chance());

        species();

        expect(inputText.value).toBe('1');

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
    });
});
