"use strict";

var chai = require("chai"),
    sinon = require("sinon"),
    expect = chai.expect,
    replaceAll = require("../" + require("../package.json").main);

chai.Assertion.includeStack = true;
chai.use(require("sinon-chai"));

var ab = {
        pattern: /a/g,
        replace: "b"
    },
    bc = {
        pattern: /b/g,
        replace: "c"
    },
    everythingToWhitespace = {
        pattern: /./g,
        replace: function () { return " "; }
    };

describe("replaceAll", function () {

    describe(".module(name, object)", function () {

        it("should provide a function under the given module name", function () {
            replaceAll.module("newModule", {});

            expect(replaceAll.newModule).to.be.a("function");
        });

        it("should add a chainable module function", function () {
            var str;

            replaceAll.module("ab", ab);
            replaceAll.module("bc", bc);

            str = replaceAll.ab().bc("ab");
            expect(str).to.equal("bc");

            str = replaceAll.ab("ab");
            expect(str).to.equal("bb");
        });

    });

});

describe("replaceAll(str, modules)", function () {
    var result;

    it("should apply all modules on the original string", function () {
        result = replaceAll(
            "a a b",
            [ab, bc]
        );
        // if 'bc' would be applied on the result of 'ab'
        // - like calling "a a b".replace("a", "b").replace("b", "c") -
        // the expected result would be "c c c"
        //
        // That's not what we want.
        expect(result).to.equal("b b c");
    });

    it("should turn modules to an array if it is no array", function () {
        expect(replaceAll("a a b", ab)).to.equal("b b b");
    });

    it("should apply the latter module if both modules are trying to replace the same string", function () {
        expect(replaceAll("b", [everythingToWhitespace, bc])).to.equal("c");
    });

    describe("if str is an empty string", function () {

        it("should just return str", function () {
            expect(replaceAll("", [ab])).to.equal("");
        });

    });

    describe("if the whole string matches the pattern", function () {

        it("should work as expected", function () {
            expect(replaceAll("a", [ab])).to.equal("b");
        });

    });

    describe("if there is a sequence of matches", function () {

        it("should work as expected", function () {
            expect(replaceAll("aaa", [ab])).to.equal("bbb");
        });

    });

    describe("if there is a string between two matches", function () {

        it("should work as expected", function () {
            expect(replaceAll("a - a", [ab])).to.equal("b - b");
        });

    });

    describe("if there is a string before the first match", function () {

        it("should work as expected", function () {
            expect(replaceAll("- a", [ab])).to.equal("- b");
        });

    });

    describe("if there is a string after the last match", function () {

        it("should work as expected", function () {
            expect(replaceAll("a -", [ab])).to.equal("b -");
        });

    });

    describe("if there is no match at all", function () {

        it("should not modify the str", function () {
            expect(replaceAll("---", [ab])).to.equal("---");
        });

    });

    describe("when the module's replace-property is a function", function () {
        var spy;

        beforeEach(function () {
            spy = sinon.spy();
        });

        it("should pass every match one after another to the replace-function", function () {
            var matchABC =  /[abc]/g;

            replaceAll("abc", [{
                pattern: matchABC,
                replace: spy
            }]);

            expect(spy).to.have.been.calledThrice;

            // Calling matchABC.exec("abc") thrice will first return the match of "a", than of "b", than of "c"
            // that's how RegExp.prototype.exec() works
            // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
            expect(spy.firstCall.args).to.eql([matchABC.exec("abc")]);
            expect(spy.secondCall.args).to.eql([matchABC.exec("abc")]);
            expect(spy.thirdCall.args).to.eql([matchABC.exec("abc")]);
        });

        it("should use the function's return value as replacement", function () {
            expect(replaceAll("aaa", [everythingToWhitespace])).to.equal("   ");
        });

        it("should not be messed up by replacements with different lengths", function () {
            var one = [1, 11, 111, 1111],
                two = [2222, 222, 22, 2],
                i = 0,
                j = 0,
                result;

            result = replaceAll("a b a b a b a b", [
                {
                    pattern: /a/g,
                    replace: function () {
                        return one[i++];
                    }
                },
                {
                    pattern: /b/g,
                    replace: function () {
                        return two[j++];
                    }
                }
            ]);

            expect(result).to.equal("1 2222 11 222 111 22 1111 2");
        });

    });

});