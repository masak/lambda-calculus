/* global describe, it */
import assert from "assert";
import { ast } from "../index";

describe("(alpha-)normalization in lambda calculus", () => {
    // We're interested in whether two lambda expressions can alpha-convert into
    // each other. We define alpha-normalization such that two alpha-normalized
    // expressions are equal if-and-only-if they can.

    // We use De Bruijn indices for bound variables, but give sequential names
    // to unbound variables.

    // Where ordinary De Bruijn notation uses bare lambdas and numbers, and end up
    // with something like (λ λ 1), we instead use dummy names and variables in
    // order to get parseable syntax, so we'd instead write (λL.λL.b1).

    it("numbers unbound variables sequentially", () => {
        assert.deepEqual(
            ast("x").normalize(),
            ast("u0")
        );

        assert.deepEqual(
            ast("x y z").normalize(),
            ast("u0 u1 u2")
        );

        assert.deepEqual(
            ast("x y z z y").normalize(),
            ast("u0 u1 u2 u2 u1")
        );

        assert.deepEqual(
            ast("(λx.y) (λx.z) (λx.y)").normalize(),
            ast("(λL.u0) (λL.u1) (λL.u0)")
        );
    });

    it("indicates bound variables by lambda depth", () => {
        assert.deepEqual(
            ast("λx.x").normalize(),
            ast("λL.b0")
        );

        assert.deepEqual(
            ast("λx.λy.x").normalize(),
            ast("λL.λL.b1")
        );

        assert.deepEqual(
            ast("λx.λy.x").normalize(),
            ast("λL.λL.b1")
        );

        assert.deepEqual(
            ast("λx.(x λx.(x λx.x))").normalize(),
            ast("λL.(b0 λL.(b0 λL.b0))")
        );
    });
});
