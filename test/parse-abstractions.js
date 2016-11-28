'use strict';

function deeplyEqual(o1, o2) {
    return JSON.stringify(o1) === JSON.stringify(o2);
}

describe("an abstraction in lambda calculus", function() {
    // If x is a variable and M ∈ Λ, then (λx.M) ∈ Λ
    it("can be a simple abstraction", function () {
        expect(lambdaCalculus.isExpression("(λx.x)")).toBe(true);
        expect(lambdaCalculus.isExpression("λx.x")).toBe(true);
    });

    // The body of an abstraction extends as far right as possible: λx.M N means
    // λx.(M N) and not (λx.M) N
    it("extends as far right as possible", function() {
        expect(deeplyEqual(
            lambdaCalculus.ast("λx.(λx.x) x"),
            lambdaCalculus.ast("λx.((λx.x) x)")
        )).toBe(true);
    });

    // A sequence of abstractions is contracted: λx.λy.λz.N is abbreviated as λxyz.N
    it("can be contracted by writing parameters one after another", function() {
        expect(deeplyEqual(
            lambdaCalculus.ast("λx.λy.λz.z"),
            lambdaCalculus.ast("λxyz.z")
        )).toBe(true);
    });
});
