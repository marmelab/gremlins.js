import formFiller from './formFiller';

jest.useFakeTimers();

describe('formFiller', () => {
    let consoleMock;
    let inputText;
    let chanceMock;
    let config;

    beforeEach(() => {
        consoleMock = { log: jest.fn() };
        chanceMock = {
            character: () => 1,
            email: () => 'cofveve@cofveve.com',
            pick: (types) => types[0], // return click types
        };

        inputText = document.createElement('input');
        inputText.setAttribute('type', 'text');
        inputText.setAttribute('id', 'myid');
        document.body.appendChild(inputText);
        config = {
            logger: consoleMock,
            randomizer: chanceMock,
            window,
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should log the formFiller', () => {
        const species = formFiller({ log: true })(config);

        species();

        expect(consoleMock.log).toHaveBeenCalledTimes(1);
        expect(consoleMock.log).toHaveBeenCalledWith('gremlin', 'formFiller', 'input', 1, 'in', inputText);
    });

    it("should fill element but don't show element", () => {
        const species = formFiller({ showAction: false })(config);

        species();

        expect(document.getElementById('myid')).toBe(inputText);
        expect(inputText.value).toBe('1');
    });

    it("should try to fill twice on element but can't fill at the end", () => {
        const canFillElementSpy = jest.fn();
        const species = formFiller({ canFillElement: canFillElementSpy, maxNbTries: 2 })(config);

        species();

        expect(canFillElementSpy).toHaveBeenCalledTimes(2);
        expect(inputText.value).toBe('');
    });

    it('should fill element and add new element', () => {
        const species = formFiller()(config);

        species();

        expect(inputText.value).toBe('1');

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
    });
});
