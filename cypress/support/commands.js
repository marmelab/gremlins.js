// Overwrite cy.visit to visit local html files
Cypress.Commands.overwrite('visit', (visit, path, options = {}) => visit(`./cypress/pages/${path}`, options));
