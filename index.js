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
        this.peekedToken = this._nextToken();
    }

    nextToken() {
        let token = this.peekedToken;
        this.peekedToken = this._nextToken();
        return token;
    }

    _nextToken() {
        let whitespace = this.sourceText.substring(this.position).match(WHITESPACE_PREFIX) || [""];
        this.position += whitespace[0].length;

        let c = this.sourceText.substring(this.position, this.position + 1);
        let variable = this.sourceText.substring(this.position).match(VARIABLE);
        if (this.position >= this.sourceText.length) {
            return new Token(tokenType.EOF);
        } else if (variable !== null) {
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
        return this.peekedToken;
    }
}

class Expression {
    toInnerString() {
        return this.toString();
    }

    isEquivalentTo(ast) {
        return this.normalize().toString() === ast.normalize().toString();
    }
}

class Variable extends Expression {
    constructor(name) {
        super();
        this.name = name;
    }

    binds(name) {
        return false;
    }

    toString() {
        return this.name;
    }

    normalize(depth = 0, unboundSeen = {}, boundDepths = []) {
        let boundDepth = boundDepths.lastIndexOf(this.name);
        let name = boundDepth !== -1
            ? `b${depth - boundDepth - 1}`
            : unboundSeen.hasOwnProperty(this.name)
                ? unboundSeen[this.name]
                : unboundSeen[this.name] = `u${Object.keys(unboundSeen).length}`;
        return new Variable(name);
    }

    _rename(oldName, newName) {
        return this.rename(oldName, newName);
    }

    rename(oldName, newName) {
        return new Variable(newName);
    }

    canRename(oldName, newName) {
        return true;
    }

    isClosed(boundDepths = []) {
        return boundDepths.includes(this.name);
    }
}

class Abstraction extends Expression {
    constructor(parameter, expr) {
        super();
        this.parameter = parameter;
        this.expr = expr;
    }

    binds(name) {
        return name === this.parameter.name || this.expr.binds(name);
    }

    toString() {
        return `λ${this.parameter}.${this.expr}`;
    }

    toInnerString() {
        return `(${this.toString()})`;
    }

    normalize(depth = 0, unboundSeen = {}, boundDepths = []) {
        return new Abstraction(
            new Variable("L"),
            this.expr.normalize(depth + 1, unboundSeen, [...boundDepths, this.parameter.name]),
        );
    }

    _rename(oldName, newName) {
        return this.parameter.name === oldName
            ? this
            : new Abstraction(this.parameter._rename(oldName, newName), this.expr._rename(oldName, newName));
    }

    rename(oldName, newName) {
        if (this.binds(newName)) {
            throw new Error(`Cannot rename -- variable ${newName} is bound in expression`);
        }
        return new Abstraction(this.parameter._rename(oldName, newName), this.expr._rename(oldName, newName));
    }

    canRename(oldName, newName) {
        return !this.binds(newName);
    }

    isClosed(boundDepths = []) {
        return this.expr.isClosed([...boundDepths, this.parameter.name]);
    }
}

class Application extends Expression {
    constructor(operator, operand) {
        super();
        this.operator = operator;
        this.operand = operand;
    }

    binds(name) {
        return this.operator.binds(name) || this.operand.binds(name);
    }

    toString() {
        return this.operand instanceof Application
            ? `${this.operator.toInnerString()} (${this.operand.toInnerString()})`
            : `${this.operator.toInnerString()} ${this.operand.toInnerString()}`;
    }

    normalize(depth = 0, unboundSeen = {}, boundDepths = []) {
        return new Application(
            this.operator.normalize(depth, unboundSeen, boundDepths),
            this.operand.normalize(depth, unboundSeen, boundDepths),
        );
    }

    _rename(oldName, newName) {
        return new Application(this.operator.rename(oldName, newName), this.operand.rename(oldName, newName));
    }

    rename(oldName, newName) {
        if (this.binds(newName)) {
            throw new Error(`Cannot rename -- variable ${newName} is bound in expression`);
        }
        return this._rename(oldName, newName);
    }

    canRename(oldName, newName) {
        return !this.binds(newName);
    }

    isClosed(boundDepths = []) {
        return this.operator.isClosed(boundDepths) &&
            this.operand.isClosed(boundDepths);
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
        let operand = this.parseTerm();
        while (operand) {
            ast = new Application(ast, operand);
            operand = this.parseTerm();
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
