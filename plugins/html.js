"use strict";

// Inspired from underscore
// @see https://github.com/jashkenas/underscore/blob/ac647aff2c2acdbb715a4611caa3c557f6160f00/underscore.js#L1189
var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#x27;"
    };

/**
 * Replaces all special html characters with save html entities. This function
 * can be used if you want to escape user data to prevent XSS attacks.
 *
 * @param {Function} replace
 */
function htmlPlugin(replace) {
    replace.module("html", htmlPlugin);
}

htmlPlugin.pattern = /[&<>"']/g;

htmlPlugin.replace = function (match) {
    return entityMap[match[0]];
};

module.exports = htmlPlugin;