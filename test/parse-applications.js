/* global describe, it */
import assert from "assert";
import lambdaCalculus from "../index";

describe("an application in lambda calculus", () => {
    // If M, N ∈ Λ, then (M N) ∈ Λ
    it("can be a simple application", () => {
        assert(lambdaCalculus.isExpression("((λx.x) y)"));
        assert(lambdaCalculus.isExpression("(λx.x) y"));
    });

    it("can be spaced unconventionally", () => {
        assert(lambdaCalculus.isExpression("(λx.x)  y"));
        assert(lambdaCalculus.isExpression("(λx.x)y"));
        assert(lambdaCalculus.isExpression("(λx.x)\ny"));
    });

    // Applications are assumed to be left associative: M N P may be written instead
    // of ((M N) P)
    it("can chain and the chain associates to the left", () => {
        assert(lambdaCalculus.isExpression("(λx.x) (λx.x) y"));
        assert.deepEqual(
            lambdaCalculus.ast("(λx.x) (λy.y) z"),
            lambdaCalculus.ast("((λx.x) (λy.y)) z")
        );
    });
});
