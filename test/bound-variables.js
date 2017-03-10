/* global describe, it */
import assert from "assert";
import { ast } from "../index";

describe("expressions with and without bound variables", () => {
    // For example, the lambda term representing the identity
    // λx.x has no free variables...
    it("has a bound variable if an abstraction captures it", () => {
        assert(ast("λx.x").binds("x"));
    });

    // ...but the function λx.yx has a single free variable, y.
    it("has a non bound variable", () => {
        assert(ast("λx.yx").binds("x"));
        assert(!ast("λx.yx").binds("y"));
    });

    it("has a bound variable in a nested abstraction", () => {
        assert(ast("λx.λy.xy").binds("y"));
    });

    it("has a bound variable in an application", () => {
        assert(ast("(λx.x) y").binds("x"));
        assert(!ast("(λx.x) y").binds("y"));
    });
});
