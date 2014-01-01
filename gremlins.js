(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node.js
        module.exports = factory();
    } else {
         // Browser globals (root is window)
        root.gremlins = factory();
    }
}(this, function() {
    

/**
 * almond 0.2.6 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../build/almond.js", function(){});

define('type/clicker',['require'],function(require) {
    
    return function() {

        var document = window.document,
            body = document.body;

        var defaultClickTypes = ['click', 'click', 'click', 'click', 'click', 'click', 'mousedown', 'mouseup', 'mouseover', 'mouseover', 'mouseover', 'mousemove', 'mouseout'];

        var defaultShowAction = function(x, y) {
            var clickSignal = document.createElement('div');
            clickSignal.style.border = "3px solid red";
            clickSignal.style['border-radius'] = '50%';
            clickSignal.style.width = "40px";
            clickSignal.style.height = "40px";
            clickSignal.style['box-sizing'] = 'border-box';
            clickSignal.style.position = "absolute";
            clickSignal.style.webkitTransition = 'opacity 1s ease-out';
            clickSignal.style.mozTransition = 'opacity 1s ease-out';
            clickSignal.style.transition = 'opacity 1s ease-out';
            clickSignal.style.left = x + 'px';
            clickSignal.style.top = y + 'px';
            var element = body.appendChild(clickSignal);
            setTimeout(function() {
                body.removeChild(element);
            }, 1000);
            setTimeout(function() {
                element.style.opacity = 0;
            }, 50);
        };

        var getRandomElementInArray = function(arr) {
            if (arr.length === 0) return null;

            return arr[Math.floor((Math.random() * arr.length))];
        };

        var config = {
            clickTypes: defaultClickTypes,
            showAction: defaultShowAction,
            canClick: function() { return true; }
        };

        function gremlin(callback) {
            var posX, posY, targetElement;
            do {
                posX = Math.floor(Math.random() * document.documentElement.clientWidth);
                posY = Math.floor(Math.random() * document.documentElement.clientHeight);
                targetElement = document.elementFromPoint(posX, posY);
            } while (!config.canClick(targetElement));

            var evt = document.createEvent("MouseEvents");
            var clickType = getRandomElementInArray(config.clickTypes);
            evt.initMouseEvent(clickType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            targetElement.dispatchEvent(evt);

            if (typeof config.showAction == 'function') {
                config.showAction(posX, posY, clickType);
            }
            if (typeof callback == 'function') {
                callback('clicker    gremlin', clickType, 'at', posX, posY);
            }
        }

        gremlin.clickTypes = function(clickTypes) {
            if (!arguments.length) return config.clickTypes;
            config.clickTypes = clickTypes;
            return gremlin;
        };

        gremlin.showAction = function(showAction) {
            if (!arguments.length) return config.showAction;
            config.showAction = showAction;
            return gremlin;
        };

        gremlin.canClick = function(canClick) {
            if (!arguments.length) return config.canClick;
            config.canClick = canClick;
            return gremlin;
        };

        return gremlin;
    };
});

define('type/formFiller',['require'],function(require) {
    
    return function() {

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

            var element;

            do {
                // Find a random element within all selectors
                element = getRandomElementInArray(document.querySelectorAll(elementTypes.join(',')));
            } while (!element || !config.canFillElement(element));

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
                callback('formFiller gremlin', 'input', character, 'in', element);
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
});

define('type/scroller',['require'],function(require) {
    
    return function() {

        var document = window.document,
            documentElement = document.documentElement,
            body = document.body;

        var defaultShowAction = function(scrollX, scrollY) {
            var clickSignal = document.createElement('div');
            clickSignal.style.border = "3px solid red";
            clickSignal.style.width = (documentElement.clientWidth - 25) + "px";
            clickSignal.style.height = (documentElement.clientHeight - 25) + "px";
            clickSignal.style.position = "absolute";
            clickSignal.style.webkitTransition = 'opacity 1s ease-out';
            clickSignal.style.mozTransition = 'opacity 1s ease-out';
            clickSignal.style.transition = 'opacity 1s ease-out';
            clickSignal.style.left = (scrollX + 10) + 'px';
            clickSignal.style.top = (scrollY + 10) + 'px';
            var element = body.appendChild(clickSignal);
            setTimeout(function() {
                body.removeChild(element);
            }, 1000);
            setTimeout(function() {
                element.style.opacity = 0;
            }, 50);
        };

        var config = {
            showAction: defaultShowAction
        };

        function gremlin(callback) {
            var documentWidth = Math.max(body.scrollWidth, body.offsetWidth, documentElement.scrollWidth, documentElement.offsetWidth, documentElement.clientWidth),
                documentHeight = Math.max(body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight, documentElement.clientHeight),
                scrollX = Math.floor(Math.random() * (documentWidth  - documentElement.clientWidth )),
                scrollY = Math.floor(Math.random() * (documentHeight - documentElement.clientHeight));

            window.scrollTo(scrollX, scrollY);

            if (typeof config.showAction == 'function') {
                config.showAction(scrollX, scrollY);
            }
            if (typeof callback == 'function') {
                callback('scroller   gremlin', 'scroll to', scrollX, scrollY);
            }
        }

        gremlin.showAction = function(showAction) {
            if (!arguments.length) return config.showAction;
            config.showAction = showAction;
            return gremlin;
        };

        return gremlin;
    };
});

define('type/typer',['require'],function(require) {
    
    return function() {

        var document = window.document,
            documentElement = document.documentElement,
            body = document.body;

        var defaultEventTypes = ['keypress', 'keyup', 'keydown'];

        var defaultShowAction = function (targetElement, x, y, key) {
            var typeSignal = document.createElement('div');
            typeSignal.style.border = "3px solid orange";
            typeSignal.style['border-radius'] = '50%';
            typeSignal.style.width = "40px";
            typeSignal.style.height = "40px";
            typeSignal.style['box-sizing'] = 'border-box';
            typeSignal.style.position = "absolute";
            typeSignal.style.webkitTransition = 'opacity 1s ease-out';
            typeSignal.style.mozTransition = 'opacity 1s ease-out';
            typeSignal.style.transition = 'opacity 1s ease-out';
            typeSignal.style.left = x + 'px';
            typeSignal.style.top = y + 'px';
            typeSignal.style.textAlign = 'center';
            typeSignal.style.paddingTop = '7px';
            typeSignal.innerHTML = String.fromCharCode(key);

            var element = body.appendChild(typeSignal);
            setTimeout(function () {
                body.removeChild(element);
            }, 1000);
            setTimeout(function () {
                element.style.opacity = 0;
            }, 50);
        };

        var getRandomElementInArray = function (arr) {
            if (arr.length === 0) {
                return null;
            }

            return arr[Math.floor((Math.random() * arr.length))];
        };

        var config = {
            eventTypes: defaultEventTypes,
            showAction: defaultShowAction
        };

        function gremlin(callback) {
            var documentWidth = Math.max(body.scrollWidth, body.offsetWidth, documentElement.scrollWidth, documentElement.offsetWidth, documentElement.clientWidth),
                documentHeight = Math.max(body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight, documentElement.clientHeight),
                keyboardEvent = document.createEvent("KeyboardEvent"),
                initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent",
                key = Math.floor(Math.random() * 360),
                posX = Math.floor(Math.random() * documentElement.clientWidth),
                posY = Math.floor(Math.random() * documentElement.clientHeight),
                targetElement = document.elementFromPoint(posX, posY);

            keyboardEvent[initMethod](getRandomElementInArray(config.eventTypes), true, true, targetElement, false, false,  false,  false,  key, 0);

            targetElement.dispatchEvent(keyboardEvent);

            if (typeof config.showAction === 'function') {
                config.showAction(targetElement, posX, posY, key);
            }
            if (typeof callback === 'function') {
                callback('typer      gremlin type', key, 'at', posX, posY);
            }
        }

        gremlin.eventTypes = function(eventTypes) {
            if (!arguments.length) return config.eventTypes;
            config.eventTypes = eventTypes;
            return gremlin;
        };

        gremlin.showAction = function(showAction) {
            if (!arguments.length) return config.showAction;
            config.showAction = showAction;
            return gremlin;
        };

        return gremlin;
    };
});

define('watcher/alert',['require'],function(require) {
    
    return function() {

        var defaultWatchEvents = ['alert', 'confirm', 'pronmpt'];
        var defaultLogger = { log: function() {} };

        var config = {
            watchEvents: defaultWatchEvents,
            logger: defaultLogger
        };

        var alert   = window.alert;
        var confirm = window.confirm;
        var prompt  = window.prompt;

        function watch() {
            if (config.watchEvents.indexOf('alert') !== -1) {
                window.alert = function (msg) {
                    config.logger.log('alert      watcher', msg, 'alert');
                };
            }
            if (config.watchEvents.indexOf('confirm') !== -1) {
                window.confirm = function (msg) {
                    config.logger.log('alert      watcher', msg, 'confirm');
                    // Random OK or cancel
                    return Math.random() >= 0.5;
                };
            }
            if (config.watchEvents.indexOf('prompt') !== -1) {
                window.prompt = function (msg) {
                    config.logger.log('alert         watcher', msg, 'prompt');
                    // Return a random string
                    return Math.random().toString(36).slice(2);
                };
            }
        }

        watch.cleanUp = function() {
            window.alert   = alert;
            window.confirm = confirm;
            window.prompt  = prompt;
            return watch;
        };

        watch.watchEvents = function(watchEvents) {
            if (!arguments.length) return config.watchEvents;
            config.watchEvents = watchEvents;
            return watch;
        };

        watch.logger = function(logger) {
            if (!arguments.length) return config.logger;
            config.logger = logger;
            return watch;
        };

        return watch;
    };
});

/**
 * FPS watcher
 * 
 * Logs the number of frames per seconds (FPS) of the browser window.
 * The normal (and maximal) FPS rate is 60. It decreases when the browser is
 * busy refreshing the layout, or executing JavaScript.
 * This watcher logs with the error level once the FPS rate drops below 10.
 *
 * Usage:
 *   var watcher = gremlins.watcher.fps();
 *   horde.watch(watcher);
 *
 * Configuration:
 *   watcher.delay(500); // the interval for FPS measurements
 *   watcher.logger(customLoggerService);
 *   watcher.levelSelector(function(fps) { /../ }); log level selector according to fps
 */
define('watcher/fps',['require'],function(require) {
    
    return function() {

        var defaultLogger = {
            log: function() {},
            warn: function() {},
            error: function() {}
        };

        var defaultLevelSelector = function(fps) {
            if (fps < 10) return 'error';
            if (fps < 20) return 'warn';
            return 'log';
        };

        var config = {
            delay: 500, // how often should the fps be measured
            logger: defaultLogger,
            levelSelector: defaultLevelSelector
        };

        var initialTime = -Infinity; // force initial measure
        var enabled;

        function loop(time) {
            if ((time - initialTime) > config.delay) {
                measureFPS(time);
                initialTime = time;
            }
            if (!enabled) return;
            window.requestAnimationFrame(loop);
        }

        function measureFPS() {
            var lastTime;
            function init(time) {
                lastTime = time;
                 window.requestAnimationFrame(measure);
            }
            function measure(time) {
                var fps = (time - lastTime < 16) ? 60 : 1000/(time - lastTime);
                var level = config.levelSelector(fps);
                config.logger[level]('fps        watcher', fps);
            }
            window.requestAnimationFrame(init);
        }

        function watch() {
            enabled = true;
            window.requestAnimationFrame(loop);
        }

        watch.cleanUp = function() {
            enabled = false;
            return watch;
        };

        watch.delay = function(delay) {
            if (!arguments.length) return config.delay;
            config.delay = delay;
            return watch;
        };

        watch.logger = function(logger) {
            if (!arguments.length) return config.logger;
            config.logger = logger;
            return watch;
        };

        watch.levelSelector = function(levelSelector) {
            if (!arguments.length) return config.levelSelector;
            config.levelSelector = levelSelector;
            return watch;
        };

        return watch;
    };
});

define('main',['require','./type/clicker','./type/formFiller','./type/scroller','./type/typer','./watcher/alert','./watcher/fps'],function(require) {
    

    var gremlins = {
        type: {
            clicker:    require('./type/clicker'),
            formFiller: require('./type/formFiller'),
            scroller:   require('./type/scroller'),
            typer:      require('./type/typer')
        },
        watcher: {
            alert:      require('./watcher/alert'),
            fps:        require('./watcher/fps')
        }
    };

    var GremlinsHorde = function() {
        this._beforeCallbacks = [];
        this._afterCallbacks = [];
        this._gremlins = [];
        this._watchers = [];
        this._unleashers = [];
        this.loggerService = defaultLoggerService;
    };

    var callCallbacks = function(callbacks, args, context, done) {
        var nbArguments = args.length;

        var iterator = function(callbacks, args) {
            if (!callbacks.length) {
                return typeof done === 'function' ? done() : true;
            }

            var callback = callbacks.shift();
            callback.apply(context, args);

            // Is the callback synchronous ?
            if (callback.length === nbArguments) {
                iterator(callbacks, args, done);
            }
        };

        args.push(function(){
            iterator(callbacks, args, done);
        });

        iterator(callbacks, args, done);
    };

    var defaultLoggerService = {
        log:   console.log.bind(console),
        info:  console.info.bind(console),
        warn:  console.warn.bind(console),
        error: console.error.bind(console)
    };

    GremlinsHorde.prototype.before = function(beforeCallback) {
        this._beforeCallbacks.push(beforeCallback);
        return this;
    };

    GremlinsHorde.prototype.after = function(afterCallback) {
        this._afterCallbacks.push(afterCallback);
        return this;
    };

    GremlinsHorde.prototype.breed = function(gremlin) {
        this._gremlins.push(gremlin);
        return this;
    };

    GremlinsHorde.prototype.breedAll = function() {
        for (var gremlinName in gremlins.type) {
            this.breed(gremlins.type[gremlinName]());
        }
        return this;
    };

    GremlinsHorde.prototype.watch = function(watcher) {
        watcher.logger(this.loggerService);
        this._watchers.push(watcher);
        return this;
    };

    GremlinsHorde.prototype.watchAll = function() {
        for (var watcherName in gremlins.watcher) {
            this.watch(gremlins.watcher[watcherName]());
        }
        return this;
    };

    GremlinsHorde.prototype.logger = function(logger) {
        if (!arguments.length) return this.loggerService;
        this.loggerService = logger;
        return this;
    };

    GremlinsHorde.prototype.log = function(msg) {
        this.loggerService.log(msg);
    };

    GremlinsHorde.prototype.unleasher = function(unleasherCallback) {
        this._unleashers.push(unleasherCallback);
        return this;
    };

    // run each gremlin every 10 milliseconds for nb times
    GremlinsHorde.prototype.defaultUnleasher = function(nb, done) {
        var i = 0,
            j,
            horde = this,
            gremlins = horde._gremlins,
            count = gremlins.length;
        while (i < nb) {
            for (j = 0; j < count; j++) {
                (function(i, j) {
                    setTimeout(function(){

                        gremlins[j].apply(horde, [horde.loggerService.log]);

                        if (i == nb -1 && j == count - 1){
                            done();
                        }
                    }, i * 10);
                })(i, j);
            }
            i++;
        }
    };

    GremlinsHorde.prototype.runUnleashers = function(nb, done) {
        if (this._unleashers.length === 0) {
            this.defaultUnleasher(nb, done);
        } else {
            callCallbacks(this._unleashers, [this._gremlins, nb], this, done);
        }
    };

    GremlinsHorde.prototype.unleash = function(nb, done) {
        var i;
        var horde = this;
        var beforeCallbacks = this._beforeCallbacks.concat(this._watchers);
        var afterCallbacks  = this._afterCallbacks;
        for (var watcherName in this._watchers) {
            if (typeof this._watchers[watcherName].cleanUp == 'function')
            afterCallbacks.push(this._watchers[watcherName].cleanUp);
        }

        callCallbacks(beforeCallbacks, [], horde, function() {
            horde.runUnleashers(nb, function() {
                callCallbacks(afterCallbacks, [], horde, function () {
                    if (typeof done === 'function') {
                        done();
                    }
                });
            });
        });
    };

    gremlins.createHorde = function() {
        return new GremlinsHorde();
    };

    return gremlins;

});

require(["main"]);
    return require('main');
}));
