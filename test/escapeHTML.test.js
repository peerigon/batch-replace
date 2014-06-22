"use strict";

var chai = require("chai"),
    expect = chai.expect,
    replace = require("../lib/replace.js"),
    escapeHTML = require("../plugins/escapeHTML.js");

chai.config.includeStack = true;
chai.use(require("sinon-chai"));

describe("escapeHTML", function () {

    it("should replace & with &amp;", function () {
        expect(replace("&", escapeHTML)).to.equal("&amp;");
    });

    it("should replace < with &lt;", function () {
        expect(replace("<", escapeHTML)).to.equal("&lt;");
    });

    it("should replace > with &gt;", function () {
        expect(replace(">", escapeHTML)).to.equal("&gt;");
    });

    it('should replace " with &quot;', function () {
        expect(replace('"', escapeHTML)).to.equal("&quot;");
    });

    it("should replace ' with &#x27;", function () {
        expect(replace("'", escapeHTML)).to.equal("&#x27;");
    });

    it("should replace all occurences", function () {
        expect(
            replace("This is a text containing & < > \" and also ', they should all be replaced", escapeHTML)
        ).to.equal(
            "This is a text containing &amp; &lt; &gt; &quot; and also &#x27;, they should all be replaced"
        );
    });

    it("should be use-able as plugin", function () {
        expect(replace).to.not.have.property("escapeHTML");
        replace.use(escapeHTML);
        expect(replace.escapeHTML).to.be.a("function");
    });

});