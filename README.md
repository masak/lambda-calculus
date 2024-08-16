# The untyped lambda calculus

We're implementing the untyped lambda calculus, as described by Church, because we
want to gain a better understanding of its mechanisms.

(What does "untyped" mean here? It means that we deal with terms, expressions denoting values, but not
with types. The untyped lambda calculus is more powerful than the later typed
lambda calculus, but at the cost of some devastating inconsistencies, Gödel-style.)

We're also writing [a tutorial](https://github.com/masak/lambda-calculus/tree/master/tutorial)
of lambda calculus.

## Grammar

```
term ::= var | "λ" var "." term | term term
```

Furthermore,

* Any term can be surrounded by parentheses (`(` `)`) for disambiguation
* Applications associate to the left
* Abstraction bodies extend as far as possible to the right
* A single abstraction declaring several parameters (`λ x y z . term`) is syntactic sugar for a sequence of abstractions (`λx.λy.λz.term`)

## TODO

Here's the things we hope to implement:

* Syntax for lambda terms: variables, abstraction, application.
* Abbreviated syntax.
* Asking whether a variable is bound in a certain expression.
* Asking whether an expression is closed (contains no free variables).
* α-conversion: "hygienic" renaming of bound variables. ← *We're this far already*
* β-reduction: actually applying an appliction.
* η-reduction: converting `λx.f x` into `f`
* η-expansion: converting `f` into `λx.f x`
* Reduction strategies:
    * Applicative order
    * Normal order
    * Call by name
    * Call by value
    * Call by need
