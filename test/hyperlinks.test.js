"use strict";

var chai = require("chai"),
    expect = chai.expect,
    replace = require("../" + require("../package.json").main),
    hyperlinks = require("../plugins/hyperlinks.js");

chai.Assertion.includeStack = true;
chai.use(require("sinon-chai"));

describe("hyperlinks", function () {

    it("should replace actual urls with hyperlinks", function () {
        expect(
            replace("A link to http://example.com, that is all", hyperlinks)
        ).to.equal(
            'A link to <a href="http://example.com" target="_blank">http://example.com</a>, that is all'
        );
    });

    it("should replace domain-like patterns with hyperlinks", function () {
        expect(
            replace("A link to example.de, that is all", hyperlinks)
        ).to.equal(
            'A link to <a href="http://example.de" target="_blank">example.de</a>, that is all'
        );
    });

    it("should replace subdomain-like patterns with hyperlinks", function () {
        expect(
            replace("A link to test.example.com, that is all", hyperlinks)
        ).to.equal(
            'A link to <a href="http://test.example.com" target="_blank">test.example.com</a>, that is all'
        );
    });

    it("should replace url-like patterns with hyperlinks", function () {
        expect(
            replace("A link to test.example.com/test-path?query=param, that is all", hyperlinks)
        ).to.equal(
            'A link to <a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a>, that is all'
        );
    });

    it("should not include punctuations (,.:) at the end of an hyperlink", function () {
        expect(
            replace("test.example.com/test-path?query=param,", hyperlinks)
        ).to.equal(
            '<a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a>,'
        );
        expect(
            replace("test.example.com/test-path?query=param.", hyperlinks)
        ).to.equal(
            '<a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a>.'
        );
        expect(
            replace("test.example.com/test-path?query=param:", hyperlinks)
        ).to.equal(
            '<a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a>:'
        );
    });

    it("should replace multiple patterns with hyperlinks", function () {
        expect(
            replace("example.de some text between example.com/test-path?query=param text at the end", hyperlinks)
        ).to.equal(
            '<a href="http://example.de" target="_blank">example.de</a> ' +
                'some text between <a href="http://example.com/test-path?query=param" target="_blank">example.com/test-path?query=param</a> text at the end'
        );
    });

    it("should provide the possibility to override the hyperlink generator", function () {
        var hyperlink = hyperlinks.hyperlink;

        hyperlinks.hyperlink = function (url, match) {
            expect(url).to.equal("http://example.com");
            expect(match).to.equal("example.com");

            return "it works";
        };
        expect(replace("example.com", hyperlinks)).to.equal("it works");

        // restore original hyperlink generator
        hyperlinks.hyperlink = hyperlink;
    });

    it("should be use-able as plugin", function () {
        expect(replace).to.not.have.property("hyperlinks");
        replace.use(hyperlinks);
        expect(replace.hyperlinks).to.be.a("function");
    });

});