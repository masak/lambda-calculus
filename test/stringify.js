/* global describe, it */
import assert from "assert";
import { ast } from "../index";

describe("stringification of a lambda calculus AST", () => {
    it("roundtrips -- produces the same as was put in (modulo parens & whitespace)", () => {
        assert.equal(ast("(λx.x) (λx.x) y").toString(), "(λx.x) (λx.x) y");
        assert.equal(ast("(λx.x)").toString(), "λx.x");
        assert.equal(ast("((λx.x))").toString(), "λx.x");
        assert.equal(ast(" λ   x . x  ").toString(), "λx.x");
    });
});
