"use strict";

var chai = require("chai"),
    expect = chai.expect,
    replace = require("../lib/replace.js"),
    hyperlinks = require("../plugins/hyperlinks.js");

chai.config.includeStack = true;
chai.use(require("sinon-chai"));

describe("(plugin) hyperlinks", function () {

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

    it("should not include punctuations (,.:;?!) at the end of an hyperlink", function () {
        expect(
            replace("test.example.com/test-path?query=param,", hyperlinks)
        ).to.equal(
            '<a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a>' +
            ','
        );
        expect(
            replace("test.example.com/test-path?query=param.", hyperlinks)
        ).to.equal(
            '<a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a>' +
            '.'
        );
        expect(
            replace("test.example.com/test-path?query=param:", hyperlinks)
        ).to.equal(
            '<a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a>' +
            ':'
        );
        expect(
            replace("test.example.com/test-path?query=param;", hyperlinks)
        ).to.equal(
            '<a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a>' +
            ';'
        );
        expect(
            replace("test.example.com/test-path?query=param?", hyperlinks)
        ).to.equal(
            '<a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a>' +
            '?'
        );
        expect(
            replace("test.example.com/test-path?query=param!", hyperlinks)
        ).to.equal(
            '<a href="http://test.example.com/test-path?query=param" target="_blank">test.example.com/test-path?query=param</a>' +
            '!'
        );
    });

    it("should recognize file endings", function () {
        expect(
            replace("Take this url for example: example.com/index.html, it should recognize .html", hyperlinks)
        ).to.equal(
            'Take this url for example: <a href="http://example.com/index.html" target="_blank">example.com/index.html</a>, it should recognize .html'
        );
        expect(
            replace("Or this: example.com/index.php?with&query, that's also tricky", hyperlinks)
        ).to.equal(
            'Or this: <a href="http://example.com/index.php?with&query" target="_blank">example.com/index.php?with&query</a>, that\'s also tricky'
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

    it("should also recognize unusual urls", function () {
        expect(
            replace("take ftps://user:password@this-particular.example.com/but-there-is?still&some&work#to-do, for example.", hyperlinks)
        ).to.equal(
            "take " +
            '<a href="ftps://user:password@this-particular.example.com/but-there-is?still&some&work#to-do" target="_blank">ftps://user:password@this-particular.example.com/but-there-is?still&some&work#to-do</a>' +
                ", for example."
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

    it("should not replace strings like '...[A-Za-z]+' as hyperlinks", function () {
        var stringToReplace = 'This is ...wouh not a link';
        expect(
            replace(stringToReplace, hyperlinks)
        ).to.equal(
            stringToReplace
        );
    });

});