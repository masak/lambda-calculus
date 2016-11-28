/* global describe, it */

var assert = require("assert");
var lambdaCalculus = require("../index");

describe("a variable in lambda calculus", function() {
    it("can be a letter", function () {
        assert(lambdaCalculus.isExpression("a"));
        assert(lambdaCalculus.isExpression("m"));
    });

    it("can't be a digit", function () {
        assert(!lambdaCalculus.isExpression("2"));
    });

    it("can't be an underscore", function () {
        assert(!lambdaCalculus.isExpression("_"));
    });
});
