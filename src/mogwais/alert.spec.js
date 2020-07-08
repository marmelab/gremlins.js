import alert from './alert';

describe('alert', () => {
    const chanceBoolMock = jest.fn();
    const chanceSentenceMock = jest.fn();
    let config;
    let consoleMock;
    let chanceMock;

    beforeEach(() => {
        consoleMock = { warn: jest.fn() };
        chanceMock = {
            bool: chanceBoolMock,
            sentence: chanceSentenceMock,
        };
        config = {
            logger: consoleMock,
            randomizer: chanceMock,
            window,
        };
    });

    it('should call logger warn when window.alert is call', () => {
        const mogwais = alert()(config);

        mogwais();
        window.alert('new alert');

        expect(consoleMock.warn).toHaveBeenCalledTimes(1);
        expect(consoleMock.warn).toHaveBeenCalledWith('mogwai ', 'alert ', 'new alert', 'alert');
    });

    it('should call logger warn when window.confirm is call', () => {
        const mogwais = alert()(config);

        mogwais();
        window.confirm('new confirm');

        expect(consoleMock.warn).toHaveBeenCalledTimes(1);
        expect(consoleMock.warn).toHaveBeenCalledWith('mogwai ', 'alert ', 'new confirm', 'confirm');
    });

    it('should call logger warn when window.prompt is call', () => {
        const mogwais = alert()(config);

        mogwais();
        window.prompt('new prompt');

        expect(consoleMock.warn).toHaveBeenCalledTimes(1);
        expect(consoleMock.warn).toHaveBeenCalledWith('mogwai ', 'alert ', 'new prompt', 'prompt');
    });

    it('should call randomize bool when window.confirm is call', () => {
        const mogwais = alert()(config);

        mogwais();
        window.confirm('new confirm');

        expect(chanceBoolMock).toHaveBeenCalledTimes(1);
    });

    it('should call randomize sentence when window.prompt is call', () => {
        const mogwais = alert()(config);

        mogwais();
        window.prompt('new prompt');

        expect(chanceSentenceMock).toHaveBeenCalledTimes(1);
    });

    it('should cleanup the window prop when cleanUp function is call', () => {
        jest.spyOn(window, 'alert').mockImplementation();
        const mogwais = alert()(config);

        mogwais();
        window.alert('new alert');

        expect(consoleMock.warn).toHaveBeenCalledTimes(1);

        mogwais.cleanUp();

        window.alert('new alert');
        expect(consoleMock.warn).toHaveBeenCalledTimes(1);
    });

    it('should not override the window object when logger is not defined ', () => {
        const mogwais = alert()(config);

        mogwais();
        window.alert('new alert');

        expect(chanceSentenceMock).toHaveBeenCalledTimes(0);
    });
});
