/* global describe, it */

var assert = require("assert");
var lambdaCalculus = require("../index");

describe("an application in lambda calculus", function() {
    // If M, N ∈ Λ, then (M N) ∈ Λ
    it("can be a simple application", function () {
        assert(lambdaCalculus.isExpression("((λx.x) y)"));
        assert(lambdaCalculus.isExpression("(λx.x) y"));
    });

    it("can be spaced unconventionally", function() {
        assert(lambdaCalculus.isExpression("(λx.x)  y"));
        assert(lambdaCalculus.isExpression("(λx.x)y"));
        assert(lambdaCalculus.isExpression("(λx.x)\ny"));
    });

    // Applications are assumed to be left associative: M N P may be written instead
    // of ((M N) P)
    it("can chain and the chain associates to the left", function() {
        assert(lambdaCalculus.isExpression("(λx.x) (λx.x) y"));
        assert.deepEqual(
            lambdaCalculus.ast("(λx.x) (λy.y) z"),
            lambdaCalculus.ast("((λx.x) (λy.y)) z")
        );
    });
});
