/* global describe, it */
import assert from "assert";
import { ast, isExpression } from "../index";

describe("an abstraction in lambda calculus", () => {
    // If x is a variable and M ∈ Λ, then (λx.M) ∈ Λ
    it("can be a simple abstraction", () => {
        assert(isExpression("(λx.x)"));
        assert(isExpression("λx.x"));
    });

    // The body of an abstraction extends as far right as possible: λx.M N means
    // λx.(M N) and not (λx.M) N
    it("extends as far right as possible", () => {
        assert.deepEqual(
            ast("λx.(λx.x) x"),
            ast("λx.((λx.x) x)")
        );
    });

    // A sequence of abstractions is contracted: λx.λy.λz.N is abbreviated as λxyz.N
    it("can be contracted by writing parameters one after another", () => {
        assert.deepEqual(
            ast("λx.λy.λz.z"),
            ast("λxyz.z")
        );
    });
});
