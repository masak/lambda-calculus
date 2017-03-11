/* global describe, it */
import assert from "assert";
import { isExpression } from "../index";

describe("a variable in lambda calculus", () => {
    it("can be a letter", () => {
        assert(isExpression("a"));
        assert(isExpression("m"));
    });

    it("can't be a digit", () => {
        assert(!isExpression("2"));
    });

    it("can't be an underscore", () => {
        assert(!isExpression("_"));
    });

    it("can be a word followed by digits", () => {
        assert(isExpression("agenda21"));
    });
});
