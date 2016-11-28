/* global describe, it */
import assert from "assert";
import lambdaCalculus from "../index";

describe("an abstraction in lambda calculus", () => {
    // If x is a variable and M ∈ Λ, then (λx.M) ∈ Λ
    it("can be a simple abstraction", () => {
        assert(lambdaCalculus.isExpression("(λx.x)"));
        assert(lambdaCalculus.isExpression("λx.x"));
    });

    // The body of an abstraction extends as far right as possible: λx.M N means
    // λx.(M N) and not (λx.M) N
    it("extends as far right as possible", () => {
        assert.deepEqual(
            lambdaCalculus.ast("λx.(λx.x) x"),
            lambdaCalculus.ast("λx.((λx.x) x)")
        );
    });

    // A sequence of abstractions is contracted: λx.λy.λz.N is abbreviated as λxyz.N
    it("can be contracted by writing parameters one after another", () => {
        assert.deepEqual(
            lambdaCalculus.ast("λx.λy.λz.z"),
            lambdaCalculus.ast("λxyz.z")
        );
    });
});
