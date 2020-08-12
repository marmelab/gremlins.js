import Chance from 'chance';
import expect from 'expect';
import { createHorde, species, strategies, mogwais } from '../../../src/index';

const seed = 'fps';

describe('Mogwais: fps', () => {
    describe('animations', () => {
        let horde;
        const loggedFps = [];
        beforeEach(() => {
            const log = (level) => (type, info, value) => {
                if (!type.includes('mogwai') || !info.includes('fps')) {
                    return console[level](info, value);
                }
                loggedFps.push(value);
            };
            const logger = {
                log: log('log'),
                warn: log('warn'),
                error: log('error'),
            };

            return cy.visit('animations.html').then(() =>
                cy.window().then((pageWindow) => {
                    horde = createHorde({
                        species: [species.clicker()],
                        mogwais: [mogwais.fps()],
                        strategies: [strategies.bySpecies({ nb: 500, delay: 10 })],
                        window: pageWindow,
                        randomizer: new Chance(seed),
                        logger,
                    });
                })
            );
        });
        it('should fill text input with seeded value', () => {
            return cy.wrap(horde.unleash(), { timeout: 20000 }).then((stats) => {
                expect(stats).toHaveLength(1);
                console.log(loggedFps);
            });
        });
    });
});
