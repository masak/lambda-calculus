/* global describe, it */
import assert from "assert";
import lambdaCalculus from "../index";

describe("a variable in lambda calculus", () => {
    it("can be a letter", () => {
        assert(lambdaCalculus.isExpression("a"));
        assert(lambdaCalculus.isExpression("m"));
    });

    it("can't be a digit", () => {
        assert(!lambdaCalculus.isExpression("2"));
    });

    it("can't be an underscore", () => {
        assert(!lambdaCalculus.isExpression("_"));
    });
});
