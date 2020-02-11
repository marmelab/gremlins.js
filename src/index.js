import Chance from 'chance';

import clicker from './species/clicker';
import toucher from './species/toucher';
import formFiller from './species/formFiller';
import scroller from './species/scroller';
import typer from './species/typer';

import alert from './mogwais/alert';
import fps from './mogwais/fps';
import gizmo from './mogwais/gizmo';

import allTogether from './strategies/allTogether';
import bySpecies from './strategies/bySpecies';
import distribution from './strategies/distribution';

import executeInSeries from './utils/executeInSeries';

export const species = {
    clicker,
    toucher,
    formFiller,
    scroller,
    typer,
};

export const mogwais = {
    alert,
    fps,
    gizmo,
};

export const strategies = {
    allTogether,
    bySpecies,
    distribution,
};

const defaultConfig = {
    gremlins: Object.values(species),
    mogwais: Object.values(mogwais),
    strategies: [strategies.bySpecies],
    logger: console,
    randomizer: new Chance(),
};

// do not export anything else here to keep window.gremlins as a function
export default userConfig => {
    const config = { ...defaultConfig, ...userConfig };

    const unleash = async params => {
        const gremlinsAndMogwais = [...config.gremlins, ...config.mogwais];
        const beforeHorde = [...config.mogwais];
        const afterHorde = gremlinsAndMogwais
            .map(beast => beast.cleanUp)
            .filter(cleanUp => typeof cleanUp === 'function');

        const horde = config.strategies.map(strat => strat.apply(null, [config.gremlins].concat(params)));

        await executeInSeries(beforeHorde, []);
        await Promise.all(horde);
        await executeInSeries(afterHorde, []);
    };

    const stop = () => config.strategies.forEach(strat => strat.stop());

    return {
        unleash,
        stop,
    };
};
