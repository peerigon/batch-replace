"use strict";

var chai = require("chai"),
    sinon = require("sinon"),
    expect = chai.expect,
    replace = require("../lib/replace.js");

chai.config.includeStack = true;
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

describe("replace", function () {

    describe(".module(name, object)", function () {

        it("should provide a function under the given module name", function () {
            replace.module("newModule", {});

            expect(replace.newModule).to.be.a("function");
        });

        it("should add a chainable module function", function () {
            var str;

            replace.module("ab", ab);
            replace.module("bc", bc);

            str = replace.ab().bc()["in"]("ab");
            expect(str).to.equal("bc");

            str = replace.ab()["in"]("ab");
            expect(str).to.equal("bb");
        });

    });

    describe(".queue()", function () {

        it("should return a function", function () {
            expect(replace.queue()).to.be.a("function");
        });

        it("should return the current queue as standalone function", function () {
            var queue = replace(/a/g)["with"]("b")
                .and(/b/g)["with"]("c")
                .queue();

            // Override the current queue to test if the returned queue is standalone
            replace(/a/g)["with"]("A").and(/b/g)["with"]("B");

            expect(queue("ababab")).to.equal("bcbcbc");
        });

    });

});

describe("replace(pattern)", function () {

    it("should provide a nice chainable api for replace operations", function () {
        var str = replace(/a/g).with("b")
            .and(/b/g).with(function () { return "c"; })
            .in("ab");

        expect(str).to.equal("bc");

        str = replace(/./g).with(" ")
            .and(/a/g).with("b")
            .in("ab");

        expect(str).to.equal("b ");
    });

});

describe("replace(str, modules)", function () {
    var result;

    it("should apply all modules on the original string", function () {
        result = replace(
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
        expect(replace("a a b", ab)).to.equal("b b b");
    });

    it("should throw an error if the requested module is not an object", function () {
        expect(function () {
            replace("", [null]);
        }).to.throw("Unknown module 'null'");
    });

    describe("if str is an empty string", function () {

        it("should just return str", function () {
            expect(replace("", [ab])).to.equal("");
        });

    });

    describe("if the whole string matches the pattern", function () {

        it("should work as expected", function () {
            expect(replace("a", [ab])).to.equal("b");
        });

    });

    describe("if there is a sequence of matches", function () {

        it("should work as expected", function () {
            expect(replace("aaa", [ab])).to.equal("bbb");
        });

    });

    describe("if there is a string between two matches", function () {

        it("should work as expected", function () {
            expect(replace("a - a", [ab])).to.equal("b - b");
        });

    });

    describe("if there is a string before the first match", function () {

        it("should work as expected", function () {
            expect(replace("- a", [ab])).to.equal("- b");
        });

    });

    describe("if there is a string after the last match", function () {

        it("should work as expected", function () {
            expect(replace("a -", [ab])).to.equal("b -");
        });

    });

    describe("if there is no match at all", function () {

        it("should not modify the str", function () {
            expect(replace("---", [ab])).to.equal("---");
        });

    });

    describe("when multiple replacements match parts of the same string", function () {

        it("should apply the latter module if both modules are trying to replace the exact same string", function () {
            expect(replace("b", [everythingToWhitespace, bc])).to.equal("c");
        });

        it("should apply the first module which matches", function () {
            expect(
                replace("abc", [
                    {
                        pattern: /abc/g,
                        replace: "ABC"
                    },
                    {
                        pattern: /abc/g,
                        replace: "Alphabet"
                    },
                    {
                        pattern: /b/g,
                        replace: "B"
                    },
                    {
                        pattern: /c/g,
                        replace: "C"
                    }
                ])
            ).to.equal("Alphabet");
        });

    });

    describe("when the module's replace-property is a function", function () {
        var spy;

        beforeEach(function () {
            spy = sinon.spy();
        });

        it("should pass every match one after another to the replace-function", function () {
            var matchABC =  /[abc]/g;

            replace("abc", [{
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
            expect(replace("aaa", [everythingToWhitespace])).to.equal("   ");
        });

        it("should not be messed up by replacements with different lengths", function () {
            var one = [1, 11, 111, 1111],
                two = [2222, 222, 22, 2],
                i = 0,
                j = 0,
                result;

            result = replace("a b a b a b a b", [
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

    describe("when a pattern is not global", function () {

        it("should only replace the first occurrence", function () {
            expect(replace("aaa", {
                pattern: /a/,
                replace: "b"
            })).to.equal("baa");
        });

    });

});