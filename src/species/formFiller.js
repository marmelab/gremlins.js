const getDefaultConfig = (randomizer, window) => {
    const document = window.document;

    /**
     * Hacky function to trigger react, angular & vue.js onChange on input
     */
    const triggerSimulatedOnChange = (element, newValue, prototype) => {
        const lastValue = element.value;
        element.value = newValue;

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
        nativeInputValueSetter.call(element, newValue);
        const event = new Event('input', { bubbles: true });

        // React 15
        event.simulated = true;
        // React >= 16
        let tracker = element._valueTracker;
        if (tracker) {
            tracker.setValue(lastValue);
        }
        element.dispatchEvent(event);
    };

    const fillTextElement = (element) => {
        const character = randomizer.character();
        const newValue = element.value + character;
        triggerSimulatedOnChange(element, newValue, window.HTMLInputElement.prototype);

        return character;
    };

    const fillTextAreaElement = (element) => {
        const character = randomizer.character();
        const newValue = element.value + character;
        triggerSimulatedOnChange(element, newValue, window.HTMLTextAreaElement.prototype);

        return character;
    };

    const fillNumberElement = (element) => {
        const number = randomizer.character({ pool: '0123456789' });
        const newValue = element.value + number;
        triggerSimulatedOnChange(element, newValue, window.HTMLInputElement.prototype);

        return number;
    };

    const fillSelect = (element) => {
        const options = element.querySelectorAll('option');
        if (options.length === 0) return;
        const randomOption = randomizer.pick(options);
        options.forEach((option) => {
            option.selected = option.value === randomOption.value;
        });

        return randomOption.value;
    };

    const fillRadio = (element) => {
        // using mouse events to trigger listeners
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        element.dispatchEvent(evt);

        return element.value;
    };

    const fillCheckbox = (element) => {
        // using mouse events to trigger listeners
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        element.dispatchEvent(evt);

        return element.value;
    };

    const fillEmail = (element) => {
        const email = randomizer.email();
        triggerSimulatedOnChange(element, email, window.HTMLInputElement.prototype);

        return email;
    };

    const defaultMapElements = {
        textarea: fillTextAreaElement,
        'input[type="text"]': fillTextElement,
        'input[type="password"]': fillTextElement,
        'input[type="number"]': fillNumberElement,
        select: fillSelect,
        'input[type="radio"]': fillRadio,
        'input[type="checkbox"]': fillCheckbox,
        'input[type="email"]': fillEmail,
        'input:not([type])': fillTextElement,
    };

    const defaultShowAction = (element) => {
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

    return {
        elementMapTypes: defaultMapElements,
        showAction: defaultShowAction,
        canFillElement: defaultCanFillElement,
        maxNbTries: 10,
        log: false,
    };
};

export default (userConfig) => ({ logger, randomizer, window }) => {
    const document = window.document;

    const config = { ...getDefaultConfig(randomizer, window), ...userConfig };

    return () => {
        // Retrieve all selectors
        const elementTypes = Object.keys(config.elementMapTypes);

        let element;
        let nbTries = 0;

        do {
            // Find a random element within all selectors
            const elements = document.querySelectorAll(elementTypes.join(','));
            if (elements.length === 0) return;
            element = randomizer.pick(elements);
            nbTries++;
            if (nbTries > config.maxNbTries) return;
        } while (!element || !config.canFillElement(element));

        // Retrieve element type
        const elementType = Object.keys(config.elementMapTypes).find((selector) => element.matches(selector));

        const value = config.elementMapTypes[elementType](element);

        if (typeof config.showAction === 'function') {
            config.showAction(element);
        }

        if (logger && config.log) {
            logger.log('gremlin', 'formFiller', 'input', value, 'in', element);
        }
    };
};
