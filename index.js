const VARIABLE = /^[a-zA-Z][a-zA-Z0-9]*/;
const WHITESPACE_PREFIX = /^\s*/;

class Token {
    constructor(type, contents) {
        this.type = type;
        this.contents = contents;
    }
}

const tokenType = {
    LAMBDA: "LAMBDA",
    VARIABLE: "VARIABLE",
    DOT: "DOT",
    OPENING_PARENTHESIS: "OPENING_PARENTHESIS",
    CLOSING_PARENTHESIS: "CLOSING_PARENTHESIS",
    EOF: "EOF",
};

const tokenForCharacter = {
    "λ": "LAMBDA",
    ".": "DOT",
    "(": "OPENING_PARENTHESIS",
    ")": "CLOSING_PARENTHESIS",
};

class Lexer {
    constructor(sourceText) {
        this.sourceText = sourceText;
        this.position = 0;
    }

    nextToken() {
        let whitespace = this.sourceText.substring(this.position).match(WHITESPACE_PREFIX) || [""];
        this.position += whitespace[0].length;

        let c = this.sourceText.substring(this.position, this.position + 1);
        let variable;
        if (this.position >= this.sourceText.length) {
            return new Token(tokenType.EOF);
        } else if ((variable = this.sourceText.substring(this.position).match(VARIABLE)) !== null) {
            this.position += variable[0].length;
            return new Token(tokenType.VARIABLE, variable[0]);
        } else if (tokenForCharacter.hasOwnProperty(c)) {
            this.position += 1;
            return new Token(tokenForCharacter[c]);
        } else {
            throw new Error(`Unknown character at position ${this.position}: ${c}`);
        }
    }

    peekToken() {
        let oldPosition = this.position;
        let token = this.nextToken();
        this.position = oldPosition;
        return token;
    }
}

class Variable {
    constructor(name) {
        this.name = name;
    }

    binds(name) {
        return false;
    }
}

class Abstraction {
    constructor(parameter, expr) {
        this.parameter = parameter;
        this.expr = expr;
    }

    binds(name) {
        return name === this.parameter.name || this.expr.binds(name);
    }
}

class Application {
    constructor(operator, argument) {
        this.operator = operator;
        this.argument = argument;
    }

    binds(name) {
        return this.operator.binds(name) || this.argument.binds(name);
    }
}

class Parser {
    constructor(sourceText, lexer = new Lexer(sourceText)) {
        this.lexer = lexer;
    }

    nextToken() {
        return this.lexer.nextToken();
    }

    peekToken() {
        return this.lexer.peekToken();
    }

    ignoreToken() {
        this.nextToken();
    }

    position() {
        return this.lexer.position;
    }

    parseVariable() {
        return new Variable(this.nextToken().contents);
    }

    parseAbstraction() {
        // 'λ'
        this.ignoreToken();
        if (this.peekToken().type !== tokenType.VARIABLE) {
            throw new Error(`Expected parameter (variable) at position ${this.position()}, found ${this.peekToken()}`);
        }
        let parameter = this.parseVariable();
        let moreParameters = [];
        while (this.peekToken().type !== tokenType.DOT) {
            if (this.peekToken().type === tokenType.VARIABLE) {
                moreParameters.unshift(parameter);
                parameter = this.parseVariable();
            } else {
                throw new Error(`Expected dot at position ${this.position()}, found ${this.peekToken()}`);
            }
        }
        this.ignoreToken();
        let expr = this.parseExpression();

        return moreParameters.reduce(
            (ast, p) => new Abstraction(p, ast),
            new Abstraction(parameter, expr));
    }

    parseParenthesized() {
        // '('
        this.ignoreToken();
        let ast = this.parseExpression();
        if (this.peekToken().type !== tokenType.CLOSING_PARENTHESIS) {
            throw new Error(`Expected ')' at position ${this.position()}, found ${this.peekToken()}`);
        }
        this.ignoreToken();

        return ast;
    }

    parseTerm() {
        let peek = this.peekToken().type;
        let ast;
        if (peek === tokenType.VARIABLE) {
            ast = this.parseVariable();
        } else if (peek === tokenType.LAMBDA) {
            ast = this.parseAbstraction();
        } else if (peek === tokenType.OPENING_PARENTHESIS) {
            ast = this.parseParenthesized();
        } else if (peek === tokenType.DOT) {
            throw new Error(`Expected expression at position ${this.position()}, found ${peek}`);
        } else {
            return;
        }
        return ast;
    }

    parseExpression() {
        let peek = this.peekToken().type;
        if (peek === tokenType.EOF) {
            throw new Error(`Expected term at position ${this.position()}, found ${peek}`);
        } else if (peek === tokenType.CLOSING_PARENTHESIS) {
            throw new Error(`Expected term at position ${this.position()}, found ${peek}`);
        }
        let ast = this.parseTerm();
        let argument = this.parseTerm();
        while (argument) {
            ast = new Application(ast, argument);
            argument = this.parseTerm();
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
