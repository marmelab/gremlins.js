/**
 * The formFiller gremlin fills forms by entering data, selecting options, clicking checkboxes, etc
 *
 * As much as possible, the form filling is done using mouse and keyboard
 * events, to trigger any listener bound to it.
 *
 * By default, the formFiller gremlin activity is showed by changing the 
 * element border to solid red.
 *
 *   var formFillerGremlin = gremlins.species.formFiller();
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
define(function(require) {
    "use strict";

    var configurable = require('../utils/configurable');
    var Chance = require('../vendor/chance');

    return function() {

        var document = window.document;

        var defaultMapElements = {
            'input[type="text"]': fillTextElement,
            'input[type="password"]': fillTextElement,
            'input[type="number"]': fillNumberElement,
            'select': fillSelect,
            'input[type="radio"]': fillRadio,
            'input[type="checkbox"]': fillCheckbox,
            'input[type="email"]': fillEmail,
            'input:not([type])': fillTextElement
        };

        var defaultShowAction = function(element) {
            if(typeof element.attributes['data-old-border'] === 'undefined') {
                element.attributes['data-old-border'] = element.style.border;
            }

            var oldBorder = element.attributes['data-old-border'];
            element.style.border = "1px solid red";

            setTimeout(function() {
                element.style.border = oldBorder;
            }, 500);
        };

        var defaultCanFillElemment = function() { return true; };

        /**
         * @mixin
         */
        var config = {
            elementMapTypes: defaultMapElements,
            showAction:      defaultShowAction,
            canFillElement:  defaultCanFillElemment,
            maxNbTries:      10,
            logger:          {},
            randomizer:      new Chance()
        };

        /**
         * @mixes config
         */
        function formFillerGremlin() {
            // Retrieve all selectors
            var elementTypes = [],
                matchFunction = getMatchFunctionName();

            for(var key in config.elementMapTypes) {
                if(config.elementMapTypes.hasOwnProperty(key)) {
                    elementTypes.push(key);
                }
            }

            var element, nbTries = 0;

            do {
                // Find a random element within all selectors
                element = config.randomizer.pick(document.querySelectorAll(elementTypes.join(',')));
                nbTries++;
                if (nbTries > config.maxNbTries) return false;
            } while (!element || !config.canFillElement(element));

            // Retrieve element type
            var elementType = null;
            for (var selector in config.elementMapTypes) {
                if (element[matchFunction](selector)) {
                    elementType = selector;
                    break;
                }
            }

            var character = config.elementMapTypes[elementType](element);

            if (typeof config.showAction == 'function') {
                config.showAction(element);
            }

            if (typeof config.logger.log == 'function') {
                config.logger.log('gremlin', 'formFiller', 'input', character, 'in', element);
            }
        }

        function fillTextElement(element) {
            var character = config.randomizer.character();
            element.value += character;

            return character;
        }

        function fillNumberElement(element) {
            var number = config.randomizer.character({pool: '0123456789'});
            element.value += number;

            return number;
        }

        function fillSelect(element) {
            var options = element.querySelectorAll('option');
            var randomOption = config.randomizer.pick(options);

            for (var i = 0, c = options.length; i < c; i++) {
                var option = options[i];
                option.selected = option.value == randomOption.value;
            }

            return randomOption.value;
        }

        function fillRadio(element) {
            // using mouse events to trigger listeners
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            element.dispatchEvent(evt);

            return element.value;
        }

        function fillCheckbox(element) {
            // using mouse events to trigger listeners
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            element.dispatchEvent(evt);

            return element.value;
        }

        function fillEmail(element) {
            var email = config.randomizer.email();
            element.value = email;

            return email;
        }

        function getMatchFunctionName() {
            var el = document.querySelector('body');
            return ( el.mozMatchesSelector || el.msMatchesSelector ||
                el.oMatchesSelector   || el.webkitMatchesSelector).name;
        }

        configurable(formFillerGremlin, config);

        return formFillerGremlin;
    };
});
