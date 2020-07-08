import toucher from './toucher';

describe('toucher', () => {
    const dispatchEventSpy = jest.fn();
    const initEventSpy = jest.fn();
    let config;
    let inputText;
    let chanceMock;
    let consoleMock;

    beforeEach(() => {
        chanceMock = {
            natural: ({ max }) => max,
            floating: ({ max }) => max,
            integer: ({ max }) => max,
            pick: (types) => types[0],
        };
        consoleMock = { log: jest.fn() };

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

        jest.useFakeTimers();

        config = {
            logger: consoleMock,
            randomizer: chanceMock,
            window,
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should log the toucher', () => {
        const species = toucher({ log: true })(config);

        species();
        jest.runAllTimers();
        expect(consoleMock.log).toHaveBeenCalledTimes(1);
        expect(consoleMock.log).toHaveBeenCalledWith('gremlin', 'toucher', 'tap', 'at', 10, 10, { duration: 700 });
    });

    it("should touch the element but don't show element", () => {
        const species = toucher({ showAction: false })(config);

        species();

        expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
        expect(document.getElementsByTagName('div')).toHaveLength(0);
    });

    it('should touch on myid element and add new element', () => {
        const species = toucher()(config);

        species();

        expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

        expect(document.getElementsByTagName('div')).toHaveLength(1);

        expect(setTimeout).toHaveBeenCalledTimes(3);
        expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 500);
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 50);
        expect(setTimeout).toHaveBeenNthCalledWith(3, expect.any(Function), 700);
    });
});
