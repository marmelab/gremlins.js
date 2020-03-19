import Chance from 'chance';

import alert from './alert';

const mockChanceBool = jest.fn();
const mockChanceSentence = jest.fn();
jest.mock('chance', () => {
    return function() {
        return { bool: mockChanceBool, sentence: mockChanceSentence };
    };
});

describe('alert', () => {
    let consoleSpy;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    it('should call logger warn when window.alert is call', () => {
        const mogwais = alert()(console, new Chance());

        mogwais();
        window.alert('new alert');

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('mogwai ', 'alert ', 'new alert', 'alert');
    });

    it('should call logger warn when window.confirm is call', () => {
        const mogwais = alert()(console, new Chance());

        mogwais();
        window.confirm('new confirm');

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('mogwai ', 'alert ', 'new confirm', 'confirm');
    });

    it('should call logger warn when window.prompt is call', () => {
        const mogwais = alert()(console, new Chance());

        mogwais();
        window.prompt('new prompt');

        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('mogwai ', 'alert ', 'new prompt', 'prompt');
    });

    it('should call randomize bool when window.confirm is call', () => {
        const mogwais = alert()(console, new Chance());

        mogwais();
        window.confirm('new confirm');

        expect(mockChanceBool).toHaveBeenCalledTimes(1);
    });

    it('should call randomize sentence when window.prompt is call', () => {
        const mogwais = alert()(console, new Chance());

        mogwais();
        window.prompt('new prompt');

        expect(mockChanceSentence).toHaveBeenCalledTimes(1);
    });

    it('should cleanup the window prop when cleanUp function is call', () => {
        jest.spyOn(window, 'alert').mockImplementation();
        const mogwais = alert()(console, new Chance());

        mogwais();
        window.alert('new alert');

        expect(consoleSpy).toHaveBeenCalledTimes(1);

        mogwais.cleanUp();

        window.alert('new alert');
        expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it('should not override the window object when logger is not defined ', () => {
        const mogwais = alert()(null, new Chance());

        mogwais();
        window.alert('new alert');

        expect(mockChanceSentence).toHaveBeenCalledTimes(0);
    });
});
