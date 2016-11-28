'use strict';

describe("an application in lambda calculus", function() {
    // If M, N ∈ Λ, then (M N) ∈ Λ
    it("can be a simple application", function () {
        expect(lambdaCalculus.isExpression('((λx.x) y)')).toBe(true);
        expect(lambdaCalculus.isExpression('(λx.x) y')).toBe(true);
    });

    it("can be spaced unconventionally", function () {
        expect(lambdaCalculus.isExpression('(λx.x)  y')).toBe(true);
        expect(lambdaCalculus.isExpression('(λx.x)y')).toBe(true);
        expect(lambdaCalculus.isExpression('(λx.x)\ny')).toBe(true);
    });
});
