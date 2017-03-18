/* global describe, it */
import assert from "assert";
import { ast } from "../index";

describe("alpha-conversion", () => {
    // For example, alpha-conversion of λx.x might yield λy.y.
    it("replaces all variables bound by the abstraction", () => {
        assert.deepEqual(
            ast("λx.x").rename("x", "y"),
            ast("λy.y")
        );

        assert.deepEqual(
            ast("λx.x x").rename("x", "y"),
            ast("λy.y y")
        );
    });

    // First, when alpha-converting an abstraction, the only variable
    // occurrences that are renamed are those that are bound to the
    // same abstraction. For example, an alpha-conversion of λx.λx.x
    // could result in λy.λx.x, but it could not result in λy.λx.y.
    // The latter has a different meaning from the original.
    it("doesn't touch nested abstractions that re-bind", () => {
        assert.deepEqual(
            ast("λx.λx.x").rename("x", "y"),
            ast("λy.λx.x")
        );
    });

    // Second, alpha-conversion is not possible if it would result in
    // a variable getting captured by a different abstraction. For
    // example, if we replace x with y in λx.λy.x, we get λy.λy.y,
    // which is not at all the same.
    it("is not possible if a varible is getting captured in a nested abstraction", () => {
        assert(!ast("λx.λy.x").canRename("x", "y"));

        assert.throws(() => !ast("λx.λy.x").rename("x", "y"), /bound/);
    });
});
