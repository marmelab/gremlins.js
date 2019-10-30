import gremlins from '../../src';

const horde = gremlins().createHorde();

// Before Events
// => Gremlins.js manage Sync and Async Before events
horde.before(() => {
    setTimeout(() => {
        horde.log('Before Async');
    }, 500);
});
horde.before(() => {
    horde.log('Before Sync');
});

// Setup Gremlins
horde.gremlin(horde.species.formFiller());
horde.gremlin(horde.species.clicker());
horde.gremlin(horde.species.toucher());
horde.gremlin(horde.species.scroller());

// After Events
// => Gremlins.js manage Sync and Async After events
horde.after(() => {
    setTimeout(() => {
        horde.log('Finish Async!');
    }, 500);
});
horde.after(() => horde.log('Finish Sync!'));

// Setup Mogwais
horde.mogwai(horde.mogwais.alert());
horde.mogwai(horde.mogwais.fps());
horde.mogwai(horde.mogwais.gizmo().maxErrors(2));

// Unleash the horde
horde.unleash({ nb: 200, delay: 10 });
