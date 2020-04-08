import distribution from './distribution';

describe('distribution', () => {
    beforeEach(() => {});

    it('should contains stop function', async () => {
        const strategies = distribution({ nb: 2 })();
        expect(typeof strategies.stop === 'function').toBe(true);
    });
});
