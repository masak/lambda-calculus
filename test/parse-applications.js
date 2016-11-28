/* global describe, expect, it, lambdaCalculus */
"use strict";

function deeplyEqual(o1, o2) {
    return JSON.stringify(o1) === JSON.stringify(o2);
}

describe("an application in lambda calculus", function() {
    // If M, N ∈ Λ, then (M N) ∈ Λ
    it("can be a simple application", function () {
        expect(lambdaCalculus.isExpression("((λx.x) y)")).toBe(true);
        expect(lambdaCalculus.isExpression("(λx.x) y")).toBe(true);
    });

    it("can be spaced unconventionally", function() {
        expect(lambdaCalculus.isExpression("(λx.x)  y")).toBe(true);
        expect(lambdaCalculus.isExpression("(λx.x)y")).toBe(true);
        expect(lambdaCalculus.isExpression("(λx.x)\ny")).toBe(true);
    });

    // Applications are assumed to be left associative: M N P may be written instead
    // of ((M N) P)
    it("can chain and the chain associates to the left", function() {
        expect(lambdaCalculus.isExpression("(λx.x) (λx.x) y")).toBe(true);
        expect(deeplyEqual(
            lambdaCalculus.ast("(λx.x) (λy.y) z"),
            lambdaCalculus.ast("((λx.x) (λy.y)) z")
        )).toBe(true);
    });
});
