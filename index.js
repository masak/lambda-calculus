const IS_LETTER = /^[a-zA-Z]/;
const IS_WHITESPACE = /^\s/;

class Variable {
    constructor(name) {
        this.name = name;
    }
}

class Abstraction {
    constructor(parameter, expr) {
        this.parameter = parameter;
        this.expr = expr;
    }
}

class Application {
    constructor(operator, argument) {
        this.operator = operator;
        this.argument = argument;
    }
}

class Parser {
    constructor(sourceText) {
        this.sourceText = sourceText;
        this.position = 0;
    }

    isAtVariable() {
        return IS_LETTER.test(this.sourceText.substring(this.position));
    }

    isAtCharacter(c) {
        return this.sourceText.substring(this.position, this.position + 1) === c;
    }

    isAtWhitespace() {
        return IS_WHITESPACE.test(this.sourceText.substring(this.position, this.position + 1));
    }

    skipWhitespace() {
        let L = this.sourceText.length;
        while (this.position < L && this.isAtWhitespace()) {
            this.position += 1;
        }
    }

    parseVariable() {
        let name = this.sourceText.substring(this.position, this.position + 1);
        // advance one character
        this.position += 1;
        while (this.isAtVariable()) {
            name += this.sourceText.substring(this.position, this.position + 1);
            this.position += 1;
        }

        return new Variable(name);
    }

    parseAbstraction() {
        // advance past the 'λ'
        this.position += 1;
        if (!this.isAtVariable()) {
            throw new Error(`Expected parameter (variable) at position ${this.position}`);
        }
        let parameter = this.parseVariable();
        let moreParameters = [];
        this.skipWhitespace();
        while (!this.isAtCharacter(".")) {
            if (this.isAtVariable()) {
                moreParameters.unshift(parameter);
                parameter = this.parseVariable();
            } else {
                throw new Error(`Expected dot at position ${this.position}`);
            }
            this.skipWhitespace();
        }
        // advance past the '.'
        this.position += 1;
        let expr = this.parseExpression();

        let ast = new Abstraction(parameter, expr);
        moreParameters.forEach(p => {
            ast = new Abstraction(p, ast);
        });
        return ast;
    }

    parseParenthesized() {
        // advance past the '('
        this.position += 1;
        let ast = this.parseExpression();
        if (!this.isAtCharacter(")")) {
            throw new Error(`Expected ')' at position ${this.position}`);
        }
        // advance past the ')'
        this.position += 1;

        return ast;
    }

    parseExpression() {
        this.skipWhitespace();
        if (this.position >= this.sourceText.length) {
            throw new Error(`Expected term at position ${this.position}, found EOF`);
        }

        let ast;
        if (this.isAtVariable()) {
            ast = this.parseVariable();
        } else if (this.isAtCharacter("λ")) {
            ast = this.parseAbstraction();
        } else if (this.isAtCharacter("(")) {
            ast = this.parseParenthesized();
        } else if (this.isAtCharacter(")")) {
            throw new Error(`Expected term at position ${this.position}, found ")"`);
        } else {
            throw new Error(`Expected expression at position ${this.position}`);
        }

        while (this.position < this.sourceText.length) {
            this.skipWhitespace();
            if (this.position >= this.sourceText.length) {
                break;
            }

            if (this.isAtVariable()) {
                ast = new Application(ast, this.parseVariable());
            } else if (this.isAtCharacter("λ")) {
                ast = new Application(ast, this.parseAbstraction());
            } else if (this.isAtCharacter("(")) {
                ast = new Application(ast, this.parseParenthesized());
            } else if (this.isAtCharacter(")")) {
                break;
            } else {
                throw new Error(`Expected expression at position ${this.position}`);
            }
        }

        return ast;
    }
}

export function isExpression(text) {
    try {
        ast(text);
    } catch (e) {
        return false;
    }

    return true;
}

export function ast(text) {
    let parser = new Parser(text);
    let result = parser.parseExpression();

    if (parser.position < text.length) {
        throw new Error(`Expected <end-of-string> at position ${parser.position}`);
    }

    return result;
}

export function isBound(name, ast) {
    if (ast instanceof Abstraction) {
        return name === ast.parameter.name || isBound(name, ast.expr);
    } else if (ast instanceof Application) {
        return isBound(name, ast.operator) || isBound(name, ast.argument);
    }
    return false;
}
