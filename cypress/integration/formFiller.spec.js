import Chance from 'chance';
import { createHorde, species, strategies } from '../../src/index';

const seed = 'formFiller';

describe('Form filler', () => {
    let horde;
    beforeEach(() => {
        return cy.visit('formFiller.html').then(() =>
            cy.window().then((pageWindow) => {
                horde = createHorde({
                    species: [species.formFiller()],
                    strategies: [strategies.bySpecies({ nb: 10 })],
                    window: pageWindow,
                    randomizer: new Chance(seed),
                });
            })
        );
    });
    it('should fill text input with seeded value', () => {
        return cy.wrap(horde.unleash()).then(() => {
            cy.get('input[type="text"]').should('have.value', '7uv');
        });
    });
    it('should fill number input with seeded value', () => {
        return cy.wrap(horde.unleash()).then(() => {
            cy.get('input[type="number"]').should('have.value', '693');
        });
    });
    it('should fill email input with seeded value', () => {
        return cy.wrap(horde.unleash()).then(() => {
            cy.get('input[type="email"]').should('have.value', 'ul@codipo.vn');
        });
    });
});
