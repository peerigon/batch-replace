"use strict";

var patternReg = Object.create(replace),
    replacementReg = {};

/**
 * A Replacement is an object containing information which substring should be replaced by what and where
 *
 * @typedef
 * @type {object}
 * @property {string} oldStr
 * @property {string} newStr
 */
var Replacement;

/**
 * A ReplacementModule provides a pattern to match against and a function or string to retrieve
 * the replacement (similar to String.prototype.replace)
 *
 * @typedef
 * @type {object}
 * @property {RegExp} pattern
 * @property {function|string} replace
 */
var ReplacementModule;

/**
 * @type {Array}
 * @private
 */
var queue = [];

/**
 * This function can be used in two ways:
 *
 * - To create a new queue with replacement modules. Just pass a single pattern.
 * - To applies all given replacement modules on the target string.
 *
 * @param {string|RegExp} str string or pattern
 * @param {Array<ReplacementModule>=} modules
 * @returns {string|patternReg}
 */
function replace(str, modules) {
    var replacements;

    if (arguments.length === 1) {
        return patternReg.and(str);
    }

    replacements = runModules(str, modules);

    return applyReplacements(str, replacements);
}

/**
 * Adds a new replacement module permanently to replace(). The module is then available under replace[moduleName].
 *
 * @param {String} name
 * @param {ReplacementModule} module
 * @returns {replace}
 */
replace.module = function (name, module) {
    replace[name] = function () {
        queue.push(module);
        return patternReg;
    };

    return this;
};

/**
 * Calls the given function with the replace function as first argument and the given config (optionally). Plugins can be used
 * to hook into methods by overriding them.
 *
 * It is safe to call this function multiple times with the same plugin, the plugin will only be applied once.
 *
 * @param {function} plugin
 * @param {object=} config
 * @returns {function}
 */
replace.use = function (plugin, config) {
    this._plugins = this._plugins || [];

    if (this._plugins.indexOf(plugin) === -1) {
        plugin(this, config);
        this._plugins.push(plugin);
    }

    return this;
};

/**
 * Starts the queue on the given string
 *
 * @param {String} str
 * @returns {String}
 */
replace["in"] = function (str) {
    return runQueue(str);
};

/**
 * Returns the current queue as standalone function.
 *
 * @returns {Function}
 */
replace.queue = function () {
    var currentQueue = queue;

    queue = [];

    /**
     * @param {String} str
     */
    return function (str) {
        return replace(str, currentQueue);
    };
};

/**
 * Adds a new module to the internal queue
 *
 * @param {RegExp} pattern
 * @returns {Object}
 */
patternReg.and = function (pattern) {
    queue.push({
        pattern: pattern
    });

    return replacementReg;
};

/**
 * Adds the replace property to the last module in the internal queue.
 *
 * @param {String|Function} replace
 * @returns {Object}
 */
replacementReg["with"] = function (replace) {
    queue[queue.length - 1].replace = replace;

    return patternReg;
};

/**
 * @private
 * @param {String} str
 * @returns {String}
 */
function runQueue(str) {
    var currentQueue = queue;

    queue = [];

    return replace(str, currentQueue);
}

/**
 * Runs the given modules on the text and returns the insertions.
 *
 * @private
 * @param {String} str
 * @param {Array<String|ReplacementModule>} modules
 * @returns {Array<Array>}
 */
function runModules(str, modules) {
    var replacements = [],
        module;

    if (Array.isArray(modules) === false) {
        modules = [modules];
    }

    modules.forEach(function forEachModule(module) {
        if (!module) {
            throw new Error("Unknown module '" + module + "'");
        }

        runModule(module, str, replacements);
    });

    return replacements;
}

/**
 * Matches the module's pattern against the string and stores the scheduled replacement
 * under the corresponding array index.
 *
 * @private
 * @param {ReplacementModule} module
 * @param {String} str
 * @param {Array<Replacement>} replacements
 */
function runModule(module, str, replacements) {
    var pattern = module.pattern,
        replace = module.replace,
        match;

    // Reset the pattern so we can re-use it
    pattern.lastIndex = 0;

    while ((match = pattern.exec(str)) !== null) {
        replacements[match.index] = {
            oldStr: match[0],
            newStr: typeof replace === "function"? replace(match) : replace
        };
        if (pattern.global === false) {
            // if the search isn't global we need to break manually
            // because pattern.exec() will always return something
            break;
        }
    }
}

/**
 * Applies all replacements on the given string.
 *
 * @private
 * @param {String} str
 * @param {Array<Replacement>} replacements
 * @returns {string}
 */
function applyReplacements(str, replacements) {
    var result = "",
        replacement,
        i;

    for (i = 0; i < replacements.length; i++) {
        replacement = replacements[i];
        if (replacement) {
            result += replacement.newStr;
            i += replacement.oldStr.length - 1;
        } else {
            result += str.charAt(i);
        }
    }

    result += str.substr(i, str.length);

    return result;
}

module.exports = replace;