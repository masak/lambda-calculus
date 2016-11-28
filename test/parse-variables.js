'use strict';

describe('a variable in lambda calculus', function(){
    it("can be a letter", function (){
        expect(lambdaCalculus.isExpression('a')).toBe(true);
        expect(lambdaCalculus.isExpression('m')).toBe(true);
    });

    it("can't be a digit", function (){
        expect(lambdaCalculus.isExpression('2')).toBe(false);
    });

    it("can't be an underscore", function (){
        expect(lambdaCalculus.isExpression('_')).toBe(false);
    });
});
