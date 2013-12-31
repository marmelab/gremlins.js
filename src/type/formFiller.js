var gremlins = gremlins || {};
gremlins.type = gremlins.type || {};

gremlins.type.formFiller = function() {

    var document = window.document;

    var defaultMapElements = {
        'input[type="text"]': fillTextElement,
        'input[type="password"]': fillTextElement,
        'input[type="number"]': fillNumberElement,
        'select': fillSelect,
        'input[type="radio"]': fillRadio,
        'input[type="email"]': fillEmail
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

    var getRandomElementInArray = function(arr) {
        if (!arr || arr.length === 0) return null;

        return arr[Math.floor((Math.random() * arr.length))];
    };

    var config = {
        elementMapTypes: defaultMapElements,
        showAction: defaultShowAction,
        canFillElement: function() { return true; }
    };

    function gremlin(callback) {
        // Retrieve all selectors
        var elementTypes = [],
            matchFunction = getMatchFunctionName();

        for(var key in config.elementMapTypes) {
            if(config.elementMapTypes.hasOwnProperty(key)) {
                elementTypes.push(key);
            }
        }

        // Find a random element within all selectors
        var element = getRandomElementInArray(document.querySelectorAll(elementTypes.join(',')));

        if (!element || !config.canFillElement(element)) return;

        // Retrieve element type
        var elementType = null;
        for (var selector in config.elementMapTypes) {
            if(element[matchFunction](selector)) {
                elementType = selector;
                break;
            }
        }

        var character = config.elementMapTypes[elementType](element);

        if (typeof config.showAction == 'function') {
            config.showAction(element);
        }
        if (typeof callback == 'function') {
            callback(element, character);
        }
    }

    function fillTextElement(element) {
        var character = Math.random().toString(36).substring(5, 6);
        element.value += character;

        return character;
    }

    function fillNumberElement(element) {
        var number = Math.floor(Math.random() * 10);
        element.value += number;

        return number;
    }

    function fillSelect(element) {
        var options = element.querySelectorAll('option');
        var randomOption = getRandomElementInArray(options);

        for (var i = 0, c = options.length; i < c; i++) {
            var option = options[i];
            option.selected = option.value == randomOption.value;
        }

        return option.value;
    }

    function fillRadio(element) {
        element.checked = true;
    }

    function fillEmail(element) {
        var email = Math.random().toString(36).substring(5)+"@"+Math.random().toString(36).substring(5)+"."+Math.random().toString(36).substring(5, 8);
        element.value = email;

        return email;
    }

    function getMatchFunctionName() {
        var el = document.querySelector('body');
        return ( el.mozMatchesSelector || el.msMatchesSelector ||
            el.oMatchesSelector   || el.webkitMatchesSelector).name;
    }

    gremlin.elementMapTypes = function(elementMapTypes) {
        if (!arguments.length) return config.elementMapTypes;
        config.elementMapTypes = elementMapTypes;

        return gremlin;
    };

    gremlin.setElementMap = function(element, fct) {
        config.elementMapTypes[element] = fct;

        return gremlin;
    };

    gremlin.showAction = function(showAction) {
        if (!arguments.length) return config.showAction;
        config.showAction = showAction;

        return gremlin;
    };

    gremlin.canFillElement = function(canFillElement) {
        if (!arguments.length) return config.canFillElement;
        config.canClick = canFillElement;

        return gremlin;
    };

    return gremlin;
};
