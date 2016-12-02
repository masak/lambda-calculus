/* global describe, it */
import assert from "assert";
import { ast, isExpression } from "../index";

describe("an application in lambda calculus", () => {
    // If M, N ∈ Λ, then (M N) ∈ Λ
    it("can be a simple application", () => {
        assert(isExpression("((λx.x) y)"));
        assert(isExpression("(λx.x) y"));
    });

    it("can be spaced unconventionally", () => {
        assert(isExpression("(λx.x)  y"));
        assert(isExpression("(λx.x)y"));
        assert(isExpression("(λx.x)\ny"));
    });

    // Applications are assumed to be left associative: M N P may be written instead
    // of ((M N) P)
    it("can chain and the chain associates to the left", () => {
        assert(isExpression("(λx.x) (λx.x) y"));
        assert.deepEqual(
            ast("(λx.x) (λy.y) z"),
            ast("((λx.x) (λy.y)) z")
        );
    });
});
