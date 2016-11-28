var IS_LETTER = /^[a-zA-Z]/;
var IS_WHITESPACE = /^\s/;

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
        // advance past the variable
        this.position += 1;
    },

    parseAbstraction: function parseAbstraction() {
        // advance past the 'λ'
        this.position += 1;
        if (!this.isAtVariable) {
            throw new Error("Expected parameter (variable) at position " + this.position);
        }
        this.parseVariable();
        if (!this.isAtCharacter(".")) {
            throw new Error("Expected dot at position " + this.position);
        }
        // advance past the '.'
        this.position += 1;
        this.parseExpression();
    },

    parseParenthesized: function parseParenthesized() {
        // advance past the '('
        this.position += 1;
        this.parseExpression();
        if (!this.isAtCharacter(")")) {
            throw new Error("Expected ')' at position " + this.position);
        }
        // advance past the ')'
        this.position += 1;
    },

    parseExpression: function parseExpression() {
        while (this.position < this.sourceText.length) {
            this.skipWhitespace();
            if (this.position >= this.sourceText.length) {
                break;
            }

            if (this.isAtVariable()) {
                this.parseVariable();
            }
            else if (this.isAtCharacter("λ")) {
                this.parseAbstraction();
            }
            else if (this.isAtCharacter("(")) {
                this.parseParenthesized();
            }
            else if (this.isAtCharacter(")")) {
                break;
            }
            else {
                throw new Error("Expected lambda expression at position " + this.position);
            }
        }
    },
};

var lambdaCalculus = {
    isExpression: function(text) {
        var parser = new Parser(text);

        try {
            parser.parseExpression();
        }
        catch (e) {
            return false;
        }


        if (parser.position < text.length) {
            return false;
        }

        return true;
    },
};
