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

import executeInSeries from './utils/executeInSeries';

const species = [clicker(), formFiller(), toucher(), scroller(), typer()];

const mogwais = [fps(), alert(), gizmo()];

const strategies = [allTogether()];

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
    const mogwais = config.mogwais.map(mogwai => mogwai(logger, randomizer));
    const strategies = config.strategies.map(strat => strat(randomizer));

    const unleash = async () => {
        const beforeHorde = [...mogwais];
        const cleansUps = mogwais.map(mogwai => mogwai.cleanUp).filter(cleanUp => typeof cleanUp === 'function');

        await executeInSeries(beforeHorde, []);
        const unleashedStrategies = strategies.map(strat => strat(species));
        await Promise.all(unleashedStrategies);
        await executeInSeries(cleansUps, []);
    };

    const stop = () => config.strategies.forEach(strat => strat.stop());

    return {
        unleash,
        stop,
    };
};
