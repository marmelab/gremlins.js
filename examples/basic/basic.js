import gremlins from '../../src';
import './basic.css';

const horde = gremlins().createHorde();

// Before Events
// => Gremlins.js manage Sync and Async Before events
horde.before(done => {
    setTimeout(() => {
        horde.log('Before Async');
        done();
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
horde.after(done => {
    setTimeout(() => {
        horde.log('Finish Async!');
        done();
    }, 500);
});
horde.after(() => horde.log('Finish Sync!'));

// Setup Mogwais
horde.mogwai(horde.mogwais.alert());
horde.mogwai(horde.mogwais.fps());
horde.mogwai(horde.mogwais.gizmo().maxErrors(2));

// Unleash the horde
horde.unleash({ nb: 50 });
