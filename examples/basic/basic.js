import gremlins from '../../src';

const gremlin = gremlins();
let horde = gremlin.createHorde();
horde = gremlin.before(done => {
    const horde = gremlin;
    setTimeout(() => {
        horde.log('async');
        done();
    }, 500);
});
horde = horde.before(() => {
    horde.log('sync');
});
horde = horde.gremlin(gremlin.species.formFiller());
horde = horde.gremlin(gremlin.species.clicker().clickTypes(['click']));
horde = horde.gremlin(gremlin.species.toucher());
horde = horde.gremlin(gremlin.species.scroller());
horde = horde.gremlin(gremlin.species.typer());
// horde = horde.gremlin(() => {
//     alert('here');
// });
horde = horde.after(() => {
    horde.log('finished!');
});
horde = horde.mogwai(gremlin.mogwais.fps());
horde = horde.after(() => {
    horde.log('finished!');
});
horde.unleash();
