import Chance from 'chance';

import configurable from '../utils/configurable';
import RandomizerRequiredException from '../exceptions/randomizerRequiredException';

/**
 * The formFiller gremlin fills forms by entering data, selecting options, clicking checkboxes, etc
 *
 * As much as possible, the form filling is done using mouse and keyboard
 * events, to trigger any listener bound to it.
 *
 * By default, the formFiller gremlin activity is showed by changing the
 * element border to solid red.
 *
 *   const formFillerGremlin = gremlins.species.formFiller();
 *   horde.gremlin(formFillerGremlin);
 *
 * The formFiller gremlin can be customized as follows:
 *
 *   formFillerGremlin.elementMapTypes({'select': function selectFiller(element) {} }); // form element filler functions
 *   formFillerGremlin.showAction(function(element) { // show the gremlin activity on screen });
 *   formFillerGremlin.canFillElement(function(element) { return true }); // to limit where the gremlin can fill
 *   formFillerGremlin.maxNbTries(5); // How many times the gremlin must look for a fillable element before quitting
 *   formFillerGremlin.logger(loggerObject); // inject a logger
 *   formFillerGremlin.randomizer(randomizerObject); // inject a randomizer
 */
export default () => {
    const document = window.document;

    const fillTextElement = element => {
        const character = config.randomizer.character();
        const newValue = element.value + character;

        var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
        ).set;
        nativeInputValueSetter.call(element, newValue);
        var ev2 = new Event('input', { bubbles: true });
        element.dispatchEvent(ev2);

        return character;
    };

    const fillNumberElement = element => {
        const number = config.randomizer.character({ pool: '0123456789' });
        element.value += number;

        return number;
    };

    const fillSelect = element => {
        const options = element.querySelectorAll('option');
        if (options.length === 0) return;
        const randomOption = config.randomizer.pick(options);
        options.forEach(option => {
            option.selected = option.value === randomOption.value;
        });

        return randomOption.value;
    };

    const fillRadio = element => {
        // using mouse events to trigger listeners
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent(
            'click',
            true,
            true,
            window,
            0,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
        );
        element.dispatchEvent(evt);

        return element.value;
    };

    const fillCheckbox = element => {
        // using mouse events to trigger listeners
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent(
            'click',
            true,
            true,
            window,
            0,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
        );
        element.dispatchEvent(evt);

        return element.value;
    };

    const fillEmail = element => {
        const email = config.randomizer.email();
        element.value = email;

        return email;
    };

    const clickSubmit = element => element.click();

    const defaultMapElements = {
        textarea: fillTextElement,
        'input[type="text"]': fillTextElement,
        'input[type="password"]': fillTextElement,
        'input[type="number"]': fillNumberElement,
        select: fillSelect,
        'input[type="radio"]': fillRadio,
        'input[type="checkbox"]': fillCheckbox,
        'input[type="email"]': fillEmail,
        'input:not([type])': fillTextElement,
        'input[type="submit"]': clickSubmit,
    };

    const defaultShowAction = element => {
        if (typeof element.attributes['data-old-border'] === 'undefined') {
            element.attributes['data-old-border'] = element.style.border;
        }

        const oldBorder = element.attributes['data-old-border'];
        element.style.border = '1px solid red';

        setTimeout(() => {
            element.style.border = oldBorder;
        }, 500);
    };

    const defaultCanFillElement = () => {
        return true;
    };

    const config = {
        elementMapTypes: defaultMapElements,
        showAction: defaultShowAction,
        canFillElement: defaultCanFillElement,
        maxNbTries: 10,
        logger: null,
        randomizer: new Chance(),
    };

    const formFillerGremlin = () => {
        if (!config.randomizer) {
            throw new RandomizerRequiredException();
        }

        // Retrieve all selectors
        const elementTypes = Object.keys(config.elementMapTypes);

        let element;
        let nbTries = 0;

        do {
            // Find a random element within all selectors
            const elements = document.querySelectorAll(elementTypes.join(','));
            if (elements.length === 0) return;
            element = config.randomizer.pick(elements);
            nbTries++;
            if (nbTries > config.maxNbTries) return;
        } while (!element || !config.canFillElement(element));

        // Retrieve element type
        const elementType = Object.keys(config.elementMapTypes).find(selector =>
            matchesSelector(element, selector)
        );

        const value = config.elementMapTypes[elementType](element);

        if (typeof config.showAction === 'function') {
            config.showAction(element);
        }

        if (config.logger && typeof config.logger.log === 'function') {
            config.logger.log(
                'gremlin',
                'formFiller',
                'input',
                value,
                'in',
                element
            );
        }
    };

    let matchesSelector = (el, selector) => {
        if (el.webkitMatchesSelector) {
            matchesSelector = (el, selector) => {
                return el.webkitMatchesSelector(selector);
            };
        } else if (el.mozMatchesSelector) {
            matchesSelector = (el, selector) => {
                return el.mozMatchesSelector(selector);
            };
        } else if (el.msMatchesSelector) {
            matchesSelector = (el, selector) => {
                return el.msMatchesSelector(selector);
            };
        } else if (el.oMatchesSelector) {
            matchesSelector = (el, selector) => {
                return el.oMatchesSelector(selector);
            };
        } else {
            throw new Error('Unsupported browser');
        }
        return matchesSelector(el, selector);
    };

    configurable(formFillerGremlin, config);

    return formFillerGremlin;
};
