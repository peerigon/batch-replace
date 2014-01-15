"use strict";

/**
 * Matches actual urls and url-like patterns for instance:
 * - http://example.com
 * - example.com
 * - test.example.com
 * - test.example.com/test-path?query=param
 *
 * @type {RegExp}
 */
var urlPattern = /\S{2,256}\.[a-z]{2,3}(\/\S*)?/g;

var httpPattern = /^https?:\/\//i;

/**
 * Replaces all occurrences of url-like patterns with an hyperlink:
 *
 * "Check out example.com, bro"
 * becomes
 * "Check out <a href="http://example.com" target="_blank">http://example.com</a>, bro"
 *
 * @type {EnhanceModule}
 */
modules.url = new EnhanceModule(urlPattern, function generateHyperlink(match) {
    var url = "";

    if (httpPattern.test(match[0]) === false) {
        url += "http://";
    }
    url += match[0];

    return '<a href="' + url + '" target="_blank">' + match[0] + "</a>";
});