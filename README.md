# The untyped lambda calculus

We're implementing the untyped lambda calculus, as described by Church, because we
want to gain a better understanding of its mechanisms.

(What does "untyped" mean here? It means simply that we deal with terms but not
with types. The untyped lambda calculus is more powerful than the later typed
lambda calculus, but at the cost of some devastating inconsistencies, Gödel-style.)

We're also writing a tutorial of lambda calculus, which we're hoping to integrate
with this repository. So far the tutorial is located in
[this gist](https://gist.github.com/masak/8e082999e06bfb4d03b8d12899bbcde5), but
the plan is to move it into this repository's Github pages.

## TODO

Here's the things we hope to implement:

* Syntax for lambda terms: variables, abstraction, application.
* Abbreviated syntax.
* Asking whether a variable is bound in a certain expression.
* Asking whether an expression is closed (contains no free variables).
* α-conversion: "hygienic" renaming of bound variables. ← *We're this far already*
* β-reduction: actually applying an appliction.
* η-reduction: converting `λx.f x` into `f`
* η-abstraction: converting `f` into `λx.f x`
* Reduction strategies:
    * Applicative order
    * Normal order
    * Call by name
    * Call by value
    * Call by need
