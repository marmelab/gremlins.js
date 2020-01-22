import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import gremlins from '../../../src';

ReactDOM.render(<App />, document.getElementById('root'), () => {
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
    horde.mogwai(horde.mogwais.gizmo(horde).maxErrors(1));

    // Unleash the horde
    horde.unleash({ nb: 500, delay: 20 });
});

serviceWorker.unregister();
