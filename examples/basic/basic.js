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
horde = horde.gremlin(gremlin.species.clicker().clickTypes(['click']));
horde = horde.after(function() {
    horde.log('finished!');
});
horde.unleash();
