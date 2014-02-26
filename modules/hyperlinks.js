"use strict";

/**
 * Replaces all occurrences of url-like patterns with an hyperlink:
 *
 * "Check out example.com, bro"
 * becomes
 * "Check out <a href="http://example.com" target="_blank">http://example.com</a>, bro".
 *
 * The hyperlink()-method is called with the url and the actual match and returns an html string.
 * Override this method if you need to customize the returned <a>-tag.
 */

var httpPattern = /^https?:\/\//i;

/**
 * Matches actual urls and url-like patterns for instance:
 * - http://example.com
 * - example.com
 * - test.example.com
 * - test.example.com/test-path?query=param
 *
 * @type {RegExp}
 */
exports.pattern = /\S{2,256}\.[a-z]{2,3}(\/[^\s,.:]*)?/g;

exports.replace = function (match) {
    var url = "";

    if (httpPattern.test(match[0]) === false) {
        url += "http://";
    }
    url += match[0];

    return exports.hyperlink(url, match[0]);
};

exports.hyperlink = function (url, match) {
    return '<a href="' + url + '" target="_blank">' + match + "</a>";
};