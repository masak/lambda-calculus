/* global describe, it */
import assert from "assert";
import { ast } from "../index";

describe("lambda expressions", () => {
    // An expression is closed if and only if it does not contain any free variables
    it("are closed if they don't have any free variables", () => {
        assert(ast("λx.x").isClosed());
        assert(ast("λx.λy.x").isClosed());
        assert(ast("λx.λy.y").isClosed());
    });

    it("are not closed if they have free variables", () => {
        assert(!ast("x").isClosed());
        assert(!ast("x y").isClosed());
        assert(!ast("(λx.x) y").isClosed());
        assert(!ast("λx.λy.z").isClosed());
    });
});
