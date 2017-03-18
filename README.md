# The untyped lambda calculus

I'm implementing the untyped lambda calculus, as described by Church, because I
want to gain a better understanding of its mechanisms.

## TODO

Here's the things I hope to implement:

* Syntax for lambda terms: variables, abstraction, application.
* Abbreviated syntax.
* Asking whether a variable is bound in a certain expression.
* α-conversion: "hygienic" renaming of bound variables. ← *We're this far already*
* Asking whether an expression is closed (contains no free variables).
* β-reduction: actually applying an appliction.
* η-reduction: converting `λx.f x` into `f`
* η-abstraction: converting `f` into `λx.f x`
* Reduction strategies:
    * Applicative order
    * Normal order
    * Call by name
    * Call by value
    * Call by need
