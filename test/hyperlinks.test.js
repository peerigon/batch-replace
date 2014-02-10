"use strict";

var chai = require("chai"),
    sinon = require("sinon"),
    expect = chai.expect,
    replaceAll = require("../" + require("../package.json").main),
    hyperlinks = require("../modules/hyperlinks.js");

chai.Assertion.includeStack = true;
chai.use(require("sinon-chai"));

describe("hyperlinks", function () {

    it("should replace actual urls with hyperlinks", function () {
        expect(
            replaceAll("A link to http://example.com, that is all", hyperlinks)
        ).to.equal(
            'A link to <a href="http://example.com" target="_blank">http://example.com</a>, that is all'
        );
    });

    it("should replace domain-like patterns with hyperlinks", function () {
        expect(
            replaceAll("A link to example.de, that is all", hyperlinks)
        ).to.equal(
            'A link to <a href="http://example.de" target="_blank">example.de</a>, that is all'
        );
    });

    it("should replace subdomain-like patterns with hyperlinks", function () {
        expect(
            replaceAll("A link to test.example.com, that is all", hyperlinks)
        ).to.equal(
            'A link to <a href="http://test.example.com" target="_blank">test.example.com</a>, that is all'
        );
    });

    it("should replace url-like patterns with hyperlinks", function () {
        // notice the problem with punctuations
        // there is no better way to distinct between urls and punctuation
        expect(
            replaceAll("A link to test.example.com/test-path?query=param , that is all", hyperlinks)
        ).to.equal(
            'A link to <a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a> , that is all'
        );
    });

    it("should replace multiple patterns with hyperlinks", function () {
        expect(
            replaceAll("example.de some text between example.com/test-path?query=param text at the end", hyperlinks)
        ).to.equal(
            '<a href="http://example.de" target="_blank">example.de</a> ' +
                'some text between <a href="http://example.com/test-path?query=param" target="_blank">example.com/test-path?query=param</a> text at the end'
        );
    });

    it("should provide the possibilty to override the hyperlink generator", function () {
        var hyperlink = hyperlinks.hyperlink;

        hyperlinks.hyperlink = function (url, match) {
            expect(url).to.equal("http://example.com");
            expect(match).to.equal("example.com");

            return "it works";
        };
        expect(replaceAll("example.com", hyperlinks)).to.equal("it works");

        // restore original hyperlink generator
        hyperlinks.hyperlink = hyperlink;
    });

});