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

function replace(match) {
    var url = "";

    if (httpPattern.test(match[0]) === false) {
        url += "http://";
    }
    url += match[0];

    return hyperlink(url, match[0]);
}

function hyperlink(url, match) {
    return '<a href="' + url + '" target="_blank">' + match + "</a>";
}

exports.pattern = urlPattern;
exports.replace = replace;
exports.hyperlink = hyperlink;