import typer from './typer';

jest.useFakeTimers();

describe('typer', () => {
    const dispatchEventSpy = jest.fn();
    const initMouseEventSpy = jest.fn();
    let console;
    let inputText;
    let chance;

    beforeEach(() => {
        console = { log: jest.fn() };
        chance = {
            natural: ({ min, max }) => (min ? 65 : max), // 65 = a
            pick: (types) => types[0],
        };

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
        jest.spyOn(document, 'createEvent').mockImplementation(() => ({ initMouseEvent: initMouseEventSpy }));
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should log the typer', () => {
        const species = typer({ log: true })(console, chance);

        species();

        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledWith('gremlin', 'typer type', 'A', 'at', 10, 10);
    });

    it("should type on element but don't show element", () => {
        const species = typer({ showAction: false })(console, chance);

        species();

        expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
        expect(dispatchEventSpy).toHaveBeenCalledWith({
            initMouseEvent: initMouseEventSpy,
            keyCode: 65,
            which: 65,
            keyCodeVal: 65,
        });
        expect(document.getElementsByTagName('div')).toHaveLength(0);
    });

    it('should type on myid element and add new element', () => {
        const species = typer()(console, chance);

        species();

        expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
        expect(dispatchEventSpy).toHaveBeenCalledWith({
            initMouseEvent: initMouseEventSpy,
            keyCode: 65,
            which: 65,
            keyCodeVal: 65,
        });

        expect(document.getElementsByTagName('div')).toHaveLength(1);

        expect(setTimeout).toHaveBeenCalledTimes(2);
        expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 1000);
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 50);
    });
});
