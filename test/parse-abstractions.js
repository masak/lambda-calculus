'use strict';

describe("an abstraction in lambda calculus", function() {
    // If x is a variable and M ∈ Λ, then (λx.M) ∈ Λ
    it("can be a simple abstraction", function () {
        expect(lambdaCalculus.isExpression('(λx.x)')).toBe(true);
        expect(lambdaCalculus.isExpression('λx.x')).toBe(true);
    });
});
