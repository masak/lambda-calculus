var IS_LETTER = /^[a-zA-Z]/;
var IS_WHITESPACE = /^\s/;

function Abstraction(parameter, expr) {
    this.parameter = parameter;
    this.expr = expr;
}

function Application(left, right) {
    this.left = left;
    this.right = right;
}

function Parser(sourceText) {
    this.sourceText = sourceText;
    this.position = 0;
}

Parser.prototype = {
    isAtVariable: function isAtVariable() {
        return IS_LETTER.test(this.sourceText.substring(this.position));
    },

    isAtCharacter(c) {
        return this.sourceText.substring(this.position, this.position + 1) === c;
    },

    isAtWhitespace() {
        return IS_WHITESPACE.test(this.sourceText.substring(this.position, this.position + 1));
    },

    skipWhitespace() {
        var L = this.sourceText.length;
        while (this.position < L && this.isAtWhitespace()) {
            this.position += 1;
        }
    },

    parseVariable: function parseVariable() {
        var variable = this.sourceText.substring(this.position, this.position + 1);
        // advance past the variable
        this.position += 1;

        return variable;
    },

    parseAbstraction: function parseAbstraction() {
        // advance past the 'λ'
        this.position += 1;
        if (!this.isAtVariable) {
            throw new Error("Expected parameter (variable) at position " + this.position);
        }
        var parameter = this.parseVariable();
        var moreParameters = [];
        while (!this.isAtCharacter(".")) {
            if (this.isAtVariable) {
                moreParameters.unshift(parameter);
                parameter = this.parseVariable();
            }
            else {
                throw new Error("Expected dot at position " + this.position);
            }
        }
        // advance past the '.'
        this.position += 1;
        var expr = this.parseExpression();

        var ast = new Abstraction(parameter, expr);
        moreParameters.forEach(function(p) {
            ast = new Abstraction(p, ast);
        });
        return ast;
    },

    parseParenthesized: function parseParenthesized() {
        // advance past the '('
        this.position += 1;
        var ast = this.parseExpression();
        if (!this.isAtCharacter(")")) {
            throw new Error("Expected ')' at position " + this.position);
        }
        // advance past the ')'
        this.position += 1;

        return ast;
    },

    parseExpression: function parseExpression() {
        var ast;
        function combine(oldAst, newAst) {
            if (typeof oldAst === "undefined") {
                return newAst;
            }

            return new Application(oldAst, newAst);
        }

        while (this.position < this.sourceText.length) {
            this.skipWhitespace();
            if (this.position >= this.sourceText.length) {
                break;
            }

            if (this.isAtVariable()) {
                ast = combine(ast, this.parseVariable());
            }
            else if (this.isAtCharacter("λ")) {
                ast = combine(ast, this.parseAbstraction());
            }
            else if (this.isAtCharacter("(")) {
                ast = combine(ast, this.parseParenthesized());
            }
            else if (this.isAtCharacter(")")) {
                break;
            }
            else {
                throw new Error("Expected expression at position " + this.position);
            }
        }

        return ast;
    },
};

var lambdaCalculus = {
    isExpression: function isExpression(text) {
        try {
            this.ast(text);
        }
        catch (e) {
            return false;
        }

        return true;
    },

    ast: function ast(text) {
        var parser = new Parser(text);
        var ast = parser.parseExpression();

        if (parser.position < text.length) {
            throw new Error("Expected <end-of-string> at position " + parser.position);
        }

        return ast;
    },
};
