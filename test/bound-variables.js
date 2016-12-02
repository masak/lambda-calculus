/* global describe, it */
import assert from "assert";
import { ast, isBound } from "../index";

describe("expressions with and without bound variables", () => {
    // For example, the lambda term representing the identity
    // λx.x has no free variables...
    it("has a bound variable if an abstraction captures it", () => {
        assert(isBound("x", ast("λx.x")));
    });

    // ...but the function λx.yx has a single free variable, y.
    it("has a non bound variable", () => {
        assert(isBound("x", ast("λx.yx")));
        assert(!isBound("y", ast("λx.yx")));
    });

    it("has a bound variable not at the top", () => {
        assert(isBound("y", ast("λx.λy.xy")));
    });
});
