/* global describe, it */
import assert from "assert";
import { ast } from "../index";

describe("alpha-equivalence", () => {
    // Terms that differ only by alpha-conversion are called α-equivalent.
    it("shows things as equivalent which can be mutually alpha-converted", () => {
        assert(ast("λx.x").isEquivalentTo(ast("λy.y")));
    });

    it("does not shows things as equivalent which can not be alpha-converted", () => {
        assert(!ast("λx.x").isEquivalentTo(ast("λx.y")));
    });
});
