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

function escapeHTMLPlugin(replace) {
    replace.module("escapeHTML", escapeHTMLPlugin);
}

escapeHTMLPlugin.pattern = /[&<>"']/g;

escapeHTMLPlugin.replace = function (match) {
    return entityMap[match];
};

module.exports = escapeHTMLPlugin;