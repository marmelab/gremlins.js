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

const species = [scroller()];

const mogwais = [fps()];

const strategies = [bySpecies()];

const defaultConfig = {
    species,
    mogwais,
    strategies,
    logger: console,
    randomizer: new Chance(),
};

// do not export anything else here to keep window.gremlins as a function
export default userConfig => {
    const config = { ...defaultConfig, ...userConfig };
    const { logger, randomizer } = config;
    const species = config.species.map(specie => specie(logger, randomizer));
    const mogwais = config.mogwais.map(mogwai => mogwai(logger));
    const strategies = config.strategies.map(strat => strat(species));

    const unleash = async () => {
        const gremlinsAndMogwais = [...species, ...mogwais];
        const beforeHorde = [...mogwais];
        // const afterHorde = gremlinsAndMogwais
        //     .map(beast => beast.cleanUp)
        //     .filter(cleanUp => typeof cleanUp === 'function');

        // const horde = config.strategies.map(strat => strat.apply(null, [species].concat(params)));
        await executeInSeries(beforeHorde, []);
        await Promise.all(strategies);
        // await executeInSeries(afterHorde, []);
    };

    const stop = () => config.strategies.forEach(strat => strat.stop());

    return {
        unleash,
        stop,
    };
};
