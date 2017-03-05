/* global describe, it */
import assert from "assert";
import { ast } from "../index";

describe("an empty string in lambda calculus", () => {
    it("is illegal", () => {
        assert.throws(() => ast(""), /Expected term/);
    });

    it("is illegal even if enclosed by parentheses", () => {
        assert.throws(() => ast("()"), /Expected term/);
    });
});
