import Chance from 'chance';

import clicker from './species/clicker';
import toucher from './species/toucher';
import formFiller from './species/formFiller';
import scroller from './species/scroller';
import typer from './species/typer';

import alert from './mogwais/alert';
import fps from './mogwais/fps';
import gizmo from './mogwais/gizmo';

import distribution from './strategies/distribution';
import bySpecies from './strategies/bySpecies';
import allTogether from './strategies/allTogether';

import executeInSeries from './utils/executeInSeries';

const defaultConfig = {
    species: [clicker(), formFiller(), toucher(), scroller(), typer()],
    mogwais: [fps(), alert(), gizmo()],
    strategies: [distribution()],
    logger: console,
    randomizer: new Chance(),
    window: window,
};

export const createHorde = (userConfig) => {
    const config = { ...defaultConfig, ...userConfig };
    const { logger, randomizer, window } = config;

    const speciesConfig = {
        logger,
        randomizer,
        window,
    };
    const species = config.species.map((specie) => specie(speciesConfig));
    const strategies = config.strategies.map((strat) => strat(randomizer));
    const stop = () => strategies.forEach((strat) => strat.stop());
    const mogwaisConfig = {
        ...speciesConfig,
        stop,
    };
    const mogwais = config.mogwais.map((mogwai) => mogwai(mogwaisConfig));

    const unleash = async () => {
        const beforeHorde = [...mogwais];
        const cleansUps = mogwais.map((mogwai) => mogwai.cleanUp).filter((cleanUp) => typeof cleanUp === 'function');

        await executeInSeries(beforeHorde, []);
        const unleashedStrategies = strategies.map((strat) => strat(species));
        await Promise.all(unleashedStrategies);
        await executeInSeries(cleansUps, []);
    };

    return {
        unleash,
        stop,
    };
};

export const species = { clicker, toucher, formFiller, scroller, typer };
export const allSpecies = Object.values(species).map((specie) => specie());
export const mogwais = { alert, fps, gizmo };
export const allMogwais = Object.values(mogwais).map((mogwai) => mogwai());
export const strategies = { distribution, bySpecies, allTogether };
export { default as Chance } from 'chance';
