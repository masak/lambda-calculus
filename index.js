const IS_LETTER = /^[a-zA-Z]/;
const IS_WHITESPACE = /^\s/;

class Token {
    constructor(type, contents) {
        this.type = type;
        this.contents = contents;
    }
}

const TokenType = {
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

    isAtWhitespace() {
        return IS_WHITESPACE.test(this.sourceText.substring(this.position, this.position + 1));
    }

    nextToken() {
        let sourceLength = this.sourceText.length;
        while (this.position < sourceLength && this.isAtWhitespace()) {
            this.position += 1;
        }

        let c = this.sourceText.substring(this.position, this.position + 1);
        if (this.position >= sourceLength) {
            return new Token(TokenType.EOF);
        } else if (IS_LETTER.test(c)) {
            let newPosition = this.position + 1;
            while (IS_LETTER.test(this.sourceText.substring(newPosition))) {
                newPosition += 1;
            }
            let name = this.sourceText.substring(this.position, newPosition);
            this.position = newPosition;
            return new Token(TokenType.VARIABLE, name);
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
        if (this.peekToken().type !== TokenType.VARIABLE) {
            throw new Error(`Expected parameter (variable) at position ${this.position()}, found ${this.peekToken()}`);
        }
        let parameter = this.parseVariable();
        let moreParameters = [];
        while (this.peekToken().type !== TokenType.DOT) {
            if (this.peekToken().type === TokenType.VARIABLE) {
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
        if (this.peekToken().type !== TokenType.CLOSING_PARENTHESIS) {
            throw new Error(`Expected ')' at position ${this.position()}, found ${this.peekToken()}`);
        }
        this.ignoreToken();

        return ast;
    }

    parseTerm() {
        let peek = this.peekToken().type;
        let ast;
        if (peek === TokenType.VARIABLE) {
            ast = this.parseVariable();
        } else if (peek === TokenType.LAMBDA) {
            ast = this.parseAbstraction();
        } else if (peek === TokenType.OPENING_PARENTHESIS) {
            ast = this.parseParenthesized();
        } else if (peek === TokenType.DOT) {
            throw new Error(`Expected expression at position ${this.position()}, found ${peek}`);
        } else {
            return;
        }
        return ast;
    }

    parseExpression() {
        let peek = this.peekToken().type;
        if (peek === TokenType.EOF) {
            throw new Error(`Expected term at position ${this.position()}, found ${peek}`);
        } else if (peek === TokenType.CLOSING_PARENTHESIS) {
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

export function isBound(name, ast) {
    if (ast instanceof Abstraction) {
        return name === ast.parameter.name || isBound(name, ast.expr);
    } else if (ast instanceof Application) {
        return isBound(name, ast.operator) || isBound(name, ast.argument);
    }
    return false;
}
