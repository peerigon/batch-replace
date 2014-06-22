"use strict";

var chai = require("chai"),
    expect = chai.expect,
    replace = require("../lib/replace.js"),
    html = require("../plugins/html.js");

chai.config.includeStack = true;
chai.use(require("sinon-chai"));

describe("(plugin) html", function () {

    it("should replace & with &amp;", function () {
        expect(replace("&", html)).to.equal("&amp;");
    });

    it("should replace < with &lt;", function () {
        expect(replace("<", html)).to.equal("&lt;");
    });

    it("should replace > with &gt;", function () {
        expect(replace(">", html)).to.equal("&gt;");
    });

    it('should replace " with &quot;', function () {
        expect(replace('"', html)).to.equal("&quot;");
    });

    it("should replace ' with &#x27;", function () {
        expect(replace("'", html)).to.equal("&#x27;");
    });

    it("should replace all occurences", function () {
        expect(
            replace("This is a text containing & < > \" and also ', they should all be replaced", html)
        ).to.equal(
            "This is a text containing &amp; &lt; &gt; &quot; and also &#x27;, they should all be replaced"
        );
    });

    it("should be use-able as plugin", function () {
        expect(replace).to.not.have.property("html");
        replace.use(html);
        expect(replace.html).to.be.a("function");
    });

});