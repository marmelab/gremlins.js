define(function(require) {
    "use strict";

    /**
     * @TODO test on safari and for the brave on IE
     */

    /**
     * Override property of an object totally
     *
     * To change behavior of native object it is needed to totally rewrite their property
     *
     * a property definition has the following :
     * {
     *      writable:     (default: false) Is the property editable (need to be false to use get and set) If its true and there is no setter, the variable is read only
     *      configurable: (default: false) Careful with this one it forbid the modification and the deletion of the property when false,
     *                    if set to false, the property will not be overridable anymore
     *      enumerable:  (default: false) Does the property appear during enumeration
     *      value:        (optional) the value of the property, cant be used with get and set,
     *      set:          (optional) function automatically called when changing the value, need writable to be false
     *      get:          (optional) function automatically called when retrieving the value, need writable to be false
     * }
     *
     * @param {Object} object - The Object for which to override some property
     * @param {String} name of the property to override
     * @param {Object} definition of the property to override, can be a value instead of an object
     */
    function overrideProperty(object, name, definition) {
        // allow to specify only the value directly
        if (typeof definition !== 'object') {
            definition = {value: definition};
        }

        // Will not allow to create unwritable|unconfigurable|unenumerable property unless told explicitly
        var defaultDefinition = {
            writable: true,
            configurable: true,
            enumerable: true,
            value: undefined,
            get: undefined,
            set: undefined
        };
        if (object.hasOwnProperty(name)) {
            defaultDefinition = Object.getOwnPropertyDescriptor(object, name);
            // Need to delete the property for chrome to be able to change them on native object.
            // Although the property is writable and configurable
            delete object[name];
        }

        // override only given value
        for (var setting in defaultDefinition) {
            // Firefox will throw an error if trying to set both value and accessor to undefined *sigh*
            if (definition.hasOwnProperty(setting) || defaultDefinition[setting] === undefined) {
                continue;
            }
            definition[setting] = defaultDefinition[setting];
        }
        // Firefox doesn't allow to change the property of native object directly (some have getter but no setter)
        // Thankfully they are still configurable
        Object.defineProperty(object, name, definition);
    }

    /**
     * Override listed properties of an object
     *
     * @param {Object} object - The Object for which to override some property
     * @param {Object} Object containing the properties to override and their new definition
     */
    function overrider(object, override) {
        for (var name in override) {
            if (!override.hasOwnProperty(name)) {
                continue;
            }
            overrideProperty(object, name, override[name]);
        }
    }

    return overrider;
});
