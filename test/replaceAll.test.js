"use strict";

var chai = require("chai"),
    sinon = require("sinon"),
    expect = chai.expect,
    replaceAll = require("../" + require("../package.json").main);

chai.Assertion.includeStack = true;
chai.use(require("sinon-chai"));

var aWithB = {
        pattern: /a/g,
        replace: "b"
    },
    bWithC = {
        pattern: /b/g,
        replace: "c"
    };

describe("replaceAll(str, modules)", function () {
    var modules = [aWithB],
        result;

    describe("if str is an empty string", function () {

        it("should just return str", function () {
            expect(replaceAll("", modules)).to.equal("");
        });

    });

    describe("if the whole string matches the pattern", function () {

        it("should work as expected", function () {
            expect(replaceAll("a", modules)).to.equal("b");
        });

    });

    describe("if there is a sequence of matches", function () {

        it("should work as expected", function () {
            expect(replaceAll("aaa", modules)).to.equal("bbb");
        });

    });

    describe("if there is a string between two matches", function () {

        it("should work as expected", function () {
            expect(replaceAll("a - a", modules)).to.equal("b - b");
        });

    });

    describe("if there is a string before the first match", function () {

        it("should work as expected", function () {
            expect(replaceAll("- a", modules)).to.equal("- b");
        });

    });

    describe("if there is a string after the last match", function () {

        it("should work as expected", function () {
            expect(replaceAll("a -", modules)).to.equal("b -");
        });

    });

    describe("if there is no match at all", function () {

        it("should not modify the str", function () {
            expect(replaceAll("---", modules)).to.equal("---");
        });

    });

    it("should apply all modules on the original string", function () {
        result = replaceAll(
            "a a b",
            [aWithB, bWithC]
        );
        // if bWithC would be applied on the result of aWithB
        // - like calling "a a b".replace("a", "b").replace("b", "c") -
        // the expected result would be "c c c"
        //
        // That's not what we want.
        expect(result).to.equal("b b c");
    });



});