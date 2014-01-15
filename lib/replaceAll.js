"use strict";

/**
 * A Replacement is an object containing information which substring should be replaced by what and where
 *
 * @typedef
 * @type {object}
 * @property {number} position
 * @property {string} original
 * @property {string} replacement
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

var modules = {};

/**
 * Applies the given enhance modules on the text. An enhance module has a pattern and replaces all
 * occurrences of this pattern with another text. A typical use-case is for instance enhancing the text
 * with hyperlinks. Or replacing emoticons with images.
 *
 * @param {String} str
 * @param {Array<String|ReplacementModule>} modules
 * @returns {String}
 */
function replaceAll(str, modules) {
    var replacements;

    replacements = runModules(str, modules);

    return applyReplacements(str, replacements);
}
replaceAll.modules = modules;
replaceAll.use = use;

/**
 * This is an example implementation of the use()-interface. It calls the given plugin with the current
 * context as first argument and the given config as second. Additionally it remembers what plugins have been
 * applied and thus won't apply the same plugin twice.
 *
 * @param {Function} plugin
 * @param {Object=} config
 * @returns {Object} this
 */
function use(plugin, config) { /*jshint validthis: true */

    if (use.plugins.indexOf(plugin) === -1) {
        plugin(this, config);
        use.plugins.push(plugin);
    }

    return this;
}
use.plugins = [];

/**
 * Runs the given modules on the text and returns the insertions in a two-dimensional array:
 *
 * [
 *     [<insertions of url module>],
 *     [<insertions of emoticon module>]
 * ]
 *
 * @private
 * @param {String} str
 * @param {Array<String|ReplacementModule>} modules
 * @returns {Array<Array>}
 */
function runModules(str, modules) {
    var replacements = [],
        moduleName,
        module,
        i;

    if (Array.isArray(modules) === false) {
        modules = [modules];
    }

    for (i = 0; i < modules.length; i++) {
        moduleName = modules[i];
        if (typeof moduleName === "string") {
            module = modules[moduleName];
        } else {
            module = moduleName;
        }
        if (!module) {
            throw new Error("Unknown module '" + moduleName + "'");
        }

        runModule(module, str, replacements);
    }

    return replacements;
}

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
    }
}

/**
 * Applies all insertions on the given text.
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

module.exports = replaceAll;