"use strict";

var patternReg = Object.create(replace),
    replacementReg = {};

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


/**
 * @type {Array}
 * @private
 */
var queue = [];

/**
 * Applies the given enhance modules on the text. An enhance module has a pattern and replaces all
 * occurrences of this pattern with another text. A typical use-case is for instance enhancing the text
 * with hyperlinks. Or replacing emoticons with images.
 *
 * @param {String|RegExp} str string or pattern
 * @param {Array<ReplacementModule>=} modules
 * @returns {String|patternReg}
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
 * Adds a new replacement module permanently to replace(). The module is than available under
 * replace[moduleName].
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
 * Starts the queue on the given string
 *
 * @param {String} str
 * @returns {String}
 */
replace["in"] = function (str) {
    return runQueue(str);
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
 * Adds the replace property to the last module in the internal queue
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

module.exports = replace;