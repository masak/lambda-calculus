## Lambda calculus

Lambda calculus makes an audacious claim: that every computation can be expressed in terms of *abstractions* and *applications*. We know these as functions and function calls most of the time.

It's perhaps easiest to feel how unlikely this claim is by considering how much lambda calculus does *not* offer. Here are a few examples of things not offered by lambda calculus:

* functions with several parameters
* booleans
* integers
* pairs and tuples
* recursion (since functions can't be named, a function can't just call itself by name)
* lists
* variable declarations
* loops

Instead, lambda calculus offers just its two building blocks to construct these things. On the face of it, this doesn't seem enough. The miracle of lambda calculus is that abstractions and applications are enough for these things.

(_See also_: the blog post [programming with nothing](https://tomstu.art/programming-with-nothing) by Tom Stuart, which also has a recorded [talk](https://www.youtube.com/watch?v=VUhlNx_-wYk). Surprisingly similar content.)

## Abstraction

An *abstraction* is a nameless function with exactly one parameter. Here's the simplest possible example, the identity function:

    λx.x

The syntax is a bit terse; in modern JavaScript this comes down to the same thing as an arrow function:

    (x) => x

Abstractions give lambda calculus the power to run code but *not right now*. They represent a delayed computation. As we will see, it's actually possible to store data this way, freezing it into the abstractions until it needs to be accessed. Abstractions correspond to *storing* data.

## Application

An *application* is a function call. It's written like this:

    f x

In JavaScript, this would translate to the same but with parentheses:

    f(x)

Applications are how you "unpack" abstractions, getting results back out of them. Let's do a concrete example, passing something into the identity function:

    (λx.x) y

The application "opens up" the abstraction; the `y` gets substituted in, and the result of the whole expression is just `y`. Applications correspond to *retrieving* data.

## We can do this!

Now let's define the whole world of programming in terms of abstractions and applications.

## Functions with more than one parameter

Just something that will come up all the time, so let's take care of it ASAP: lambda calculus only allows abstractions to take exactly one parameter. But if you had a five-parameter function, how would you render that in lambda calculus?

    (a, b, c, d, e) => { ... }

Easy: you just nest five abstractions, each one taking the next parameter:

    λa.λb.λc.λd.λe.<...>

Technically, of course, this isn't a function taking five parameters &mdash; it's five nested one-parameter functions. In JavaScript, you'd notice the difference:

    foo(x, y, z, v, w);    // calling a five-parameter function
    bar(x)(y)(z)(v)(w);    // calling five nested one-parameter functions

But lambda calculus simply doesn't have anything corresponding to the first approach with the commas, and so you're left with nesting your abstractions, and applying arguments one by one. The uncluttered calling syntax in lambda calclus really shines here:

    bar x y z v w          // calling five nested one-parameter functions, lambda style

(For those keeping score at home: yes, the invisible application juxtaposition operator in lambda calculus associates to the left. That's why parentheses are not necessary.)

The process of converting a many-parameter function to many nested functions is called *currying*, named after [Curry-the-logician](https://en.wikipedia.org/wiki/Haskell_Curry) (not [curry-the-Indian-nom](https://en.wikipedia.org/wiki/Curry)).

There's a lot of confusion about what counts as currying. More often than not, it's confused with [*partial application*](https://en.wikipedia.org/wiki/Partial_application), e.g. giving `bar` above fewer than five arguments:

    bar x y z               // aha, no v and w this time!

Instead of evaluating to a final result, partial application evaluates to one of the nested functions, which still expects the tail end of the argument list. As you can see, partial application is something that you can do with curried functions &mdash; but partial application is not currying. To repeat, but with JavaScript syntax:

    let f1 = (a, b) => a + b;        // original function
    f1(1, 2);                        // 3
    
    // ...currying gives us...
    
    let f2 = (a) => (b) => a + b;    // curried function
    f2(1)(2);                        // "full" application: 3
    f2(1);                           // partial application: a function that adds 1 to its argument

Even zero-parameter functions can be curried. If you ever need to emulate a zero-parameter function in lambda calculus, just give it a parameter that is never used:

    λdummy.<but then we never use dummy>

From now on, we'll be deliberately sloppy in our language and talk about a "five-parameter function" etc, when by necessity such a function has to be of the curried, nested variety.

## Booleans

This is going to be the hardest, because we still haven't shaken off our disbelief yet. How are we supposed to build our own booleans? Aren't they pretty fundamental? Lambda calculus cheekily claims that no, they're not fundamental enough to get special treatment. We're on our own.

    if (condition) {
        thenExpr;
    }
    else {
        elseExpr;
    }

Taking a ruthlessly practical stance, the value `true` is something that makes the above `if` statement evaluate to `thenExpr`, and `false` makes it evaluate to `elseExpr`.

If we were to start designing the `if` statement as a lambda expression, it would look something like this:

    λcondition.λthenExpr.λelseExpr.<???>

And we don't know what to put in the `<???>` spot yet, but it'll have to be something that chooses `thenExpr` or `elseExpr` appropriately based on `condition`.

Let's think about it from the point of view of `condition`. We know this to be a boolean, either `true` or `false`. We want the `true` value to choose `thenExpr`, and the `false` value to choose `elseExpr`. So how about this: we make a boolean a function that takes two arguments (`t` and `f`). One returns `t`, the other returns `f`. Like this:

    true := λt.λf.t
    false := λt.λf.f

In other words, these two functions are "choosers", which select one of their arguments and discards the other.

(The `:=` bit is metalinguistic syntax and not part of lambda calculus itself. Think of it as a mental macro/preprocessor capability. The names tell us human readers a lot more than the raw patterns of abstractions and applications.)

Now we can complete the thought by implementing the body of the `if` statement lambda expression:

    if := λcondition.λthenExpr.λelseExpr.condition thenExpr elseExpr

Now that `condition` is known to be a two-argument chooser, we just pass `thenExpr` and `elseExpr` to it, and let the boolean itself figure it out.

This is worth stopping and thinking about. Usually `if` statements in a language get all the magic decision-making mojo. But in lambda calculus, `if` just delegates to the incoming boolean condition, letting it handle things on its own.

If you look at the final implementation of the `if` statement, you can see that it actually does *nothing* on its own. It takes in three arguments and applies them to each other. Simplifying even further, repeated [η-reduction](https://en.wikipedia.org/wiki/Lambda_calculus#.CE.B7-conversion) shows that the implementation of the `if` statement is actually the identity function. This is perhaps easier to see if we rename the variables:

    if' := λt.λu.λv.t u v

So because the implementation of `if` is effectively this...

    if'' := λx.x

...you'd be better off just passing the `thenExpr` and `elseExpr` directly to the `condition` boolean itself. The `if` is redundant, because the booleans, coded as function like this, _are powerful enough on their own_. A kind of portable `if` statement. Therefore, we won't use `if` in our lambda expressions from now on.

Isn't lambda calculus cool? It presents boolean values as little agents that are able to jump in when necessary and make a choice between two options. People who are familiar with Smalltalk may recognize a very similar idea in Smalltalk's `Boolean` type, where `if` statements are simply written as an `ifTrue: ifFalse:` message to a boolean receiver:

    age < minAge
      ifTrue: [Transcript show: 'no kids in the disco, kid!']
      ifFalse: [Transcript show: 'welcome! enjoy the strobe lights and the unbearably loud bass']

It also &mdash; refreshingly &mdash; downplays what booleans actually are. After all the cultural and semantic baggage has been peeled off, `true` simply translates to "the former one" and `false` to "the latter one". That's all.

## Operations on booleans

Let's define lambda expressions corresponding to `and`, `or`, and `not` while we're at it. This is quite straightforward now that we know that our booleans are actually two-argument choosers, and can be used to make boolean decisions.

This works for `and` and `or`:

    and := λp.λq.p q false         // if p then q else false
    or := λp.λq.p true q           // if p then true else q
    or' := λp.p true               // can simplify thanks to η-reduction

(But frankly these are so simple and so like `if` statements that half of the time we end up inlining their definition instead of relying on `and` and `or`.)

And here's a simple implementation of `not`:

    not := λp.p false true         // "what is p if true and false change places?"

Before we're done, we're going to need `xor`, too. Since the semantics of `xor` is "one or the other but not both", we can define it using the above three operators:

    xor' := λp.λq.or (and p (not q)) (and (not p) q)

But the straightforward way of using already-defined operators fails to consider the true power of the booleans themselves. Here's a much nicer version of `xor` that uses booleans directly:

    xor := λp.λq.p (not q) q

## Integers

*God made the integers; all else is the work of man.* &mdash; Leopold Kronecker

It's not computing if we can't deal with numbers. So let's start with the natural numbers (including zero). Our trick with the booleans is pretty far-reaching, but we've heard rumors that there's an infinite amount of natural numbers, and so representing them may be a taller order.

If booleans were conjugate with `if` statements, then natural numbers are conjugate with counting. There are two basic operations in counting: starting from zero, and increasing by one (that is, going from a number to its *successor*).

    0 := λs.λz.z
    1 := λs.λz.s z
    2 := λs.λz.s (s z)
    3 := λs.λz.s (s (s z))
    4 := λs.λz.s (s (s (s z)))
    // and so on -- you see the pattern

Let's look at the above and state some things clearly:

* Natural numbers are represented as two-argument functions.
* Just like booleans are designed to carry `t` and `f` around as parameters, these numbers come equipped with `s` and `z`, some particular version of successor function and zero. With booleans, this allowed us to inject any kind of `thenExpr` or `elseExpr` that we wanted. With numbers, it allows us to *count in many different ways*. (The hipster programming community of today refers to this technique as "dependency-injecting" the zero and the successor function. Dependencies are for objects what parameters are for functions.)
* Quite fittingly, the natural number N is represented as starting from the zero state and going to the successor N times. When we strip away all the unnecessary cultural baggage (like decimal representation, names for numbers, written symbols), this is what counting fundamentally *does* for us. (Have you ever seen those clicky things the crew uses in airplanes, when they walk down the aisle and click the thing once per passenger? The click represents applying the successor function, and there must also be a reset button somewhere on the device. There's a decimal-number readout, too &mdash; just like we could write a lambda-number-to-decimal formatter.)
* If you're wondering why we do first `s` and then `z` in the parameter list, remark that our definition of `0` conveniently coincides with our definition of `false` (up to α-renaming). You may or may not like that reason, but there it is.
* We can't get rid of the parentheses this time. The right-associativity of application is perfect when we're dealing with partial application, but here &mdash; when we're doing repeated iteration of a function &mdash; we need to go against the grain and parenthesize a lot. With the syntactic choices the lambda syntax has made, this is what happens when one makes a lot of function calls.

Also note how we skillfully skirted the whole infinity debacle &mdash; you just add more `s` applications, and you get higher numbers as needed. If you feel comfortable with induction, this should feel like reassurance enough.

*Les entiers naifs ne remplissent pas ℕ. (The naïve integers don't fill up ℕ.)* &mdash; Georges Reeb, and I have no idea exactly what he means, but I'm *fascinated*

## Operations on integers

The successor trick is quite neat, but things don't get seriously pretty until we start defining operations on the integers. Here's a simple one for starters: comparing a number to zero. This will do:

    isZero := λn.n (λx.false) true

What this function is doing is counting along this sequence:

    true, false, false, false, false, false...

Before tackling addition, let's implement adding 1 to a number. This is the successor function that we mentioned above, but now defined from the outside of a number:

    succ := λn.λs.λz.s (n s z)

The body of the function simply says "apply the successor function `s` to `n`". It's tempting to think of it as taking three parameters, but more helpful to think of it as taking only one (`n`) and returning something number-shaped (a two-argument function). A blessing and a curse it is that lambda calculus does not make this kind of thing more explicit. (A curse because it's a little hard to read. A blessing because we can start to exploit partial application to our advantage very soon.)

On to addition. We can think of addition of two numbers *m + n* as "first count *m* steps (then don't reset to zero), then count *n* steps". That's exactly what the lambda calculus definition comes down to:

    plus := λm.λn.λs.λz.m s (n s z)

But here is the first time we benefit from always passing in our custom successor and zero. We can just say, "taking *m* as our zero, do *n* successor steps":

    plus' := λm.λn.λs.λz.m succ n s z
    plus'' := λm.λn.m succ n           // η-reduced

This is the key inspiration that we've needed: in order to make our arithmetical operations flow more easily, we use the fact that we can *invent new types of counting* as we please. Addition is just ordinary counting, but with zero displaced to a different starting point.

Similarly, multiplication is just a kind of counting to *m* where the "successor function" consists of taking *n*-sized steps.

    times := λm.λn.m (plus n) 0

For those of you who believe that multiplication is a kind of repeated addition ([\*cough\*](http://www.maa.org/external_archive/devlin/devlin_06_08.html)), this definition ought to make a whole lot of sense.

Onwards. We can of course use the very same trick with exponentiation, too. It's just a kind of counting to *m* where the "zero" is 1 and the "successor function" consists of multiplying by *n*.

    exp := λm.λn.m (times n) 1

But there's a much simpler way to define exponentiation:

    exp' := λm.λn.n m

That's right: applying *n* to *m* is the same as raising *m* to the *n*th power! Mind. Blown.

I'll prefix the explanation by saying I dearly wish I could explain this better. Through a series of clever partial applications making a complete mockery of the concept of arity, the counting in this case ends up taking the normal successor `s` as its zero, and then each step of the successor function ends up "boosting" the current successor to take steps that are *m* times as large. Conceptually, we are counting along this infinite sequence:

    1, m, m*m, m*m*m, m*m*m*m ...

And since we take *n* steps along it, we end up with the exponent we want.

(There's more. Both [set theory](https://en.wikipedia.org/wiki/Exponentiation#Over_sets) and [category theory](https://ncatlab.org/nlab/show/exponential+object) seem to say that exponentiation corresponds to function application. I don't claim to deeply grok why this is so, but I find it beautiful and fascinating nevertheless.)

(_Update_: [here on StackOverflow](https://stackoverflow.com/questions/47563925/church-naturals-exponentiation-function-and-type-checking) is a decent derivation of `exp` from first principles. The impact of this derivation isn't as earth-shattering as I had hoped, even though I found myself nodding at each individual step. The philosophical question remains, it seems: _why is exponentiation of Church numerals so simple?_ Why is it simpler than multiplication, which is simpler than addition? Isn't that just the weirdest?)

We'd like to do subtraction, division, and the modulo operation too. But we're missing some prerequisite tools to do that, so we're going to take a couple of small detours first.

## Pairs and tuples

A *pair* is something that satisfies these two equalities (here written as JavaScript):

    (new Pair(x, y)).fst === x
    (new Pair(x, y)).snd === y

That is, a pair is constructed by passing it two arguments (`x` and `y` in our case), and those arguments are saved in the pair for later extraction with the two getters `fst` and `snd`. From this, we can come up with a satisfactory lambda calculus implementation:

    pair := λx.λy.λf.f x y
    fst := λp.p (λx.λy.x)
    snd := λp.p (λx.λy.y)

It may look like `pair` needs three parameters with that extra `f`, but it's much more sensible to think of `pair` as taking an `x` and a `y` as parameters, and returning the abstraction `λf.f x y` (with `x` and `y` appropriately bound). This abstraction *is* the pair, in a very real sense. That also makes it much easier to read the definitions of `fst` and `snd`: the pair `p` that they operate on is something that sits around waiting for its two-parameter callback `f`.

The parenthetical expression above &mdash; "with `x` and `y` appropriately bound" &mdash; is the whole secret behind how pairs can "store" information for later. Or more generally, how lambda abstractions can hold data and store it like in data structures. If you've ever seen someone get an enamoured look in their eyes as they wax poetic about *closures*, this right here is it. The binding that happens in `pair` is quite literally what weaves together the data structure. (And here *I* go, waxing poetic. Figures.)

The same technique that we used above can also be generalized to any n-tuple. You might want to take a moment to think about how to do this. It even works (in a trivial way) for 0-tuples.

Oh, and with tuples we essentially *do* gain the power to pass several arguments to a function without having to curry the function. But in lambda calculus, this feels like going against the grain. There is little reason to pack arguments into tuples only to unpack them on the receiving side.

Being able to build pairs and tuples opens up a few new doors for us.

* For example, we could now simulate all integers by combining a sign bit with a natural number, or (more commonly) by expressing the difference `m - n` between two natural numbers as the pair `(m, n)`. One would need to consider many of these pairs equivalent, since for example `(3, 0)` and `(5, 2)` (and many others) would then refer to the *same* integer 3.
* Similarly, we could represent rational numbers `p / q` as the pair `(p, q)` of integers.
* We could even do IEEE 754 floating-point numbers by representing them as the tuple `(s, e, f)` where `s` is a sign bit (boolean) and `e` and `f` are tuples of bits representing the exponent and fraction.

The main idea is that there are a lot of values out there which are composed of smaller values. Tuples allow us to model them.

## The zen of not replying

We're almost done, but here's why we needed to detour in the first place: subtraction is super-easy to define if we happen to have a *predecessor function*:

    minus := λm.λn.n pred m     // `pred` not defined yet, hold on

(Observe the similarity to `plus`.)

But... what immediate trouble do we run into when we try to define a `pred` function? Right, that 0 doesn't really have a predecessor! Or, stated differently, 0 is the (unique) natural number that isn't a successor of something.

Numerous explanations of Church encoding and lambda calculus (including Wikipedia) decide to define `pred 0` as `0` itself. This is... unfortunate, since it's, uh, wrong. 0 is not its own predecessor. The only reason authors do it that way is that they don't see a better alternative.

(If at this point you're jumping up and down on your chair saying to the screen "You fools! Can't you see that it's -1?", let me give you a paper star for being technically correct, but in the wrong domain. Excepting the negative-numbers-through-pairs trick above, we're still squarely in the domain of natural numbers. Can't play negative-numbered tunes on this [peano](https://en.wikipedia.org/wiki/Peano_axioms).)

Since 0 doesn't have a predecessor, the best answer to `pred 0` is to give no answer back at all! Philosophically, this is us saying "calculate the predecessor of 0" and the program rolling its eyes and saying "uhhhh... I'll go get you a square circle... but this might *take a while*", and then it embarks forever on The Fruitless Quest For The Predecessor Of Zero.

Lambda calculus can do this. A moment's thought reveals that we already *knew* lambda calculus can do this, at least if we accept the premise that it's as powerful as all other computing. We just cause an infinite loop somehow. D'oh!

Here's the canonical way to cause an infinite loop in lambda calculus:

    omega := λx.x x
    diverge := omega omega

The term `omega` is something that can "duplicate" an `x` into `x`-applied-to-`x`. Therefore, if you apply `omega` to `omega`, it will evaluate to the same as you just put in: `omega omega`. This is the first time we've seen the evaluation not progress and eventually converge to something without any more applications to untangle. Instead, it *diverges* and never comes back with an answer. Sometimes frustrating, but just what we need in this case.

Now we can define `pred`:

    pred := λn.fst (n (λp.pair (snd p) (succ (snd p))) (pair diverge 0))

The above is the longest we've seen so far. Here, let me rewrite it as JavaScript:

    function pred(n) {
        let p = new Pair(diverge, 0);
        for (let i = 0; i < n; i++) {
            p = new Pair(p.snd, p.snd + 1);
        }
        return p.fst;
    }

This function ends up iterating along the infinite sequence

    (diverge, 0), (0, 1), (1, 2), (2, 3), (3, 4)...

Note that the `fst` element of the pair is always one smaller than the second. We iterate n times to the pair we want, and then we take the `fst`, and get `n - 1`. Unless we iterated 0 times; then we get a well-deserved diverging program.

I should probably mention something here about evaluation strategies. If we're evaluating in applicative order, then `diverge` is going to be evaluated "too eagerly", and `pred` will always diverge. We need to either run on a less strict evaluation strategy (such as normal order), or we need to cocoon the elements in the pair in 0-argument functions so that we retain the control over when to unpack them. Since such protective measures are straightforward but tedious, we're just going to assume normal-order evaluation from now on. If that feels like too high a price to pay in your implementation, feel free to adapt the expressions by appropriately shielding `diverge` terms.

Ok, that concludes our definition of subtraction.

## The Y of unbounded recursion

In the myth about Prometheus, who stole fire from the gods and gave it to humanity, I always like to imagine how the first time with fire was horrible for the humans. They must have inadvertently burned down forests, villages, themselves and each other. Fire seemed uncontrollable and extremely dangerous &mdash; more like a curse than a technology.

And then, gradually, fire was harnessed. Today we have combustion engines, cigarette lighters, furnaces, and blowtorches &mdash; all of which isolate and channel fire to make it useful and safe.

This happens all the time in the history of computer science. Think of how computed `goto`s were refined into structured programming with conditionals and loops, for example. Or how `null` pointers have by now been completely eliminated and replaced with the much safer `Maybe`/`Option` types. (\*snort\*)

In our case, `diverge` is the dangerous uncontrollable fire. It makes our lambda machine shudder and hum uselessly forever without producing anything, and we need to pull the plug and reset it back to factory settings. But there is something useful that could be harnessed out of it: unbounded recursion.

Think back to our numerals. Each one applies `s` a finite number of times. Each of them one more time than the last.

    0 := λs.λz.z
    1 := λs.λz.s z
    2 := λs.λz.s (s z)
    3 := λs.λz.s (s (s z))
    4 := λs.λz.s (s (s (s z)))
    // and so on

Even though there is no such number, we can think of the "limit" of the above sequence as a lambda expression with an infinite number of applications:

    λs.λz.s (s (s ... (s (s z)))...)    // Church aleph-null!

There's nothing much that permits or forbids such an infinitely deep chain of applications. It's not very practically useful, at least not if we think of each application as taking nonzero effort to carry out. (If you're on a computing platform where applications are instantaneous, then... will you sell it to me for money?) We're still in uncontrollable-and-extremely-dangerous territory here. But one thing to like about the expression is that it keeps applying `s` long after all the normal numbers have stopped doing so. That would be terribly useful if we could only harness it, control it.

So let's do that. Here's the dangerous `diverge` expression again, the one that never stops:

    (λx.x x) (λx.x x)

We will harness it by wrapping it in an abstraction, whose parameter `f` we then apply along each step:

    Y := λf.(λx.f (x x)) (λx.f (x x))

The key difference now is that `f` gets to come in at every iteration and *decide* whether to keep recursing or not.

By strong tradition, the above term is referred to as "the Y combinator". For our purposes, a combinator is simply a function that takes in one function and spits out another. The Y combinator happens to take functions that aren't properly recursive and spit out functions that are.

Here's an example, the factorial function:

    function factorial(n) {
        return n === 0
            ? 1
            : n * factorial(n - 1);
    }

Translated directly into lambda terms, this becomes:

    factorial' := λn.(isZero n) 1 (times n (factorial' (pred n)))    // won't work, sorry

But the problem is that the recursive call isn't expressible directly in lambda calculus. (Recall that the `:=` syntax is not part of lambda calculus itself. There's no `factorial'` name to expand into the function body until we've finished defining it. Or we could try and end up with a problematic infinite lambda expression.)

This difficulty is exactly what the Y combinator solves. Since we're not allowed to mention `factorial` inside its own definition, we just assume that a function `recurse` will be dependency-injected to the function:

    factorialStep := λrecurse.λn.(isZero n) 1 (times n (recurse (pred n)))    // note no self-reference now

And then we just define the real factorial function by applying the Y combinator to the above function:

    factorial := Y factorialStep

Think of `factorialStep` as a piece of string, where the two ends `factorialStep` and `recurse` are still not joined together. The `Y` combinator takes that piece of string and joins the ends together, melding them into the same thing so that `recurse` actually comes to mean `factorialStep`. Voilà, harnessed infinite looping!

It's worth stopping for a moment and consider the achievement. Lambda calculus insists on not having names for functions. If you have named functions, then calling `foo()` inside of `foo` itself is an obvious way to do recursion. But the Y combinator manages to cause recursion to happen without named functions, by *just shuffling terms around*. It's just abstractions and applications. That's pretty incredible.

For our own convenience, from now on we will assume that whenever a name occurs in the body of its own definition, behind the scenes it is going to be given an extra `recurse` parameter as above and passed to the Y combinator before being fed to the lambda calculus machine.

## Factorial, a variant

The recursive definition of the factorial function is cute, and an illustrative example of recursion &mdash; but do we really need unbounded recursion in this case?

No, we do not. The recursion is necessary when we count downwards and don't know how far it is to the ground. But we can also count upwards to *n* with a finite loop:

    function factIterative(n) {
        let result = 1;
        for (let i = 1; i <= n; i++) {
            result *= i;
        }
        return result;
    }

Nothing wrong with this code as JavaScript, but for our lambda sensibilities it has a bit too much state manipulation and variable reassignment. Machines with moving parts are so 19th century. Luckily, there's a way to rewrite the function:

    function factIterative(n) {
        let p = new Pair(1, 1);
        for (let i = 1; i <= n; i++) {
            p = new Pair(p.fst * p.snd, p.snd + 1);
        }
        return p.fst;
    }

Why is this an improvement? Because the above can be phrased as a sequence that we can iterate along with a natural number. (You may recognize this as the same sequence-of-pairs technique as used in `pred` but with a different sequence this time.)

    (1, 1), (1, 2), (2, 3), (6, 4), (24, 5), (120, 6)...

Translating the JavaScript to a lambda expression gives us:

    factIterative := λn.fst (n (λp.pair (times (fst p) (snd p)) (succ (snd p))) (pair 1 1))

It's nice and self-contained, and arguably the sequence-of-pairs trick is a smaller cannon to haul out than recursion and the Y combinator.

In fact, instead of completely re-implementing the sequence-of-pairs pattern from scratch each time, let's put it in a convenience function:

    sequence := λfstSucc.λfstZero.λsndZero.λn.fst (n (λp.pair (fstSucc (fst p) (snd p)) (succ (snd p))) (pair fstZero sndZero))

Now `pred` and `factIterative` can be written much more succinctly:

    pred' := sequence (λfst.λsnd.snd) diverge 0
    factIterative' := sequence times 1 1

*Now* we're talking! We know we've successfully abstracted away the mechanics of the pattern, because we no longer have to say `pair` at all when we use `sequence`.

## Comparing numbers

For comparing any number to any number, we can combine `isZero`, `pred` and recursion to get the following:

    function leq(m, n) {    // is m less than or equal to n?
        if (m === 0) {
            return true;
        }
        else if (n === 0) {
            return false;
        }
        else {
            return leq(m - 1, n - 1);
        }
    }

Translating that to lambda calculus gives this:

    leq := λm.λn.(isZero m) true ((isZero n) false (leq (pred m) (pred n)))

In fact, it's rather amazing how close a translation that is to the JavaScript.

Note particularly how, thanks to being guarded by comparisons of both `m` and `n` to 0, we will never accidentally compute `pred 0`.

Now that we have `leq`, we can define the other five ways to compare numbers:

    eq := λm.λn.and (leq m n) (leq n m)
    ne := λm.λn.not (eq m n)
    geq := λm.λn.leq n m
    lt := λm.λn.and (leq m n) (ne m n)
    gt := λm.λn.lt n m

But we could also think slightly out of the box, and imagine a three-valued comparison enum:

    less := λl.λs.λm.l
    same := λl.λs.λm.s
    more := λl.λs.λm.m

And with just a teeny bit more work, `leq` can be written to return one of those enum values:

    function compare(m, n) {
        if (m === 0 && n === 0) {
            return same;
        }
        else if (m === 0) {
            return less;
        }
        else if (n === 0) {
            return more;
        }
        else {
            return compare(m - 1, n - 1);
        }
    }

Translating this to a lambda expression gives:

    compare := λm.λn.(isZero m) ((isZero n) same less) ((isZero n) more (compare (pred m) (pred n)))

Which is slightly longer, but the big payoff is that all the boolean comparison functions now come out quite symmetric:

    leq' := λm.λn.(compare m n) true true false
    eq' := λm.λn.(compare m n) false true false
    ne' := λm.λn.(compare m n) true false true
    geq' := λm.λn.(compare m n) false true true
    lt' := λm.λn.(compare m n) true false false
    gt' := λm.λn.(compare m n) false false true

The enum is nice to have sometimes, especially when we *do* want to do three different things for the cases less/same/more. In that case, we can think of our decision logic as switching over those three cases:

    switch (compare(m, n)) {
        case less: ...; break;
        case same: ...; break;
        case more: ...; break;
    }

Analogously with `if` statements, `compare` will happilty fill the role of such a switch statements when we need it.

## Division and modulo

In all of the following, we're going to be a bit lenient with dividing by 0. It's fairly straightforward to make division and modulo `diverge` when the denominator is 0, and that's probably how we want to implement it. But for exposition of the algorithms it's easier to ignore that case.

Here's the semantics we would like to get out of natural number division:

    function div(m, n) {
        return n <= m
            ? 1 + div(m - n, n)
            : 0;
    }

In other words, "keep subtracting n until we have nothing left; the result is how many times we subtracted". Should feel familiar. Notice that dividing by 0 will naturally diverge since the subtraction doesn't actually remove anything.

A straight rendering into lambda calculus might look like this:

    div' := λm.λn.(leq n m) (succ (div (minus m n) n)) 0

There's also a way to avoid the unbounded recursion even here. It hinges on two ideas:

* We're looking for a number not bigger than the numerator *m* (so we can use *m* to iterate)
* We want the highest number *q* such that *n* times *q* does not exceed *m*:

We can implement that idea as follows:

    function divIterative(m, n) {
        let p = new Pair(0, 1);
        for (let i = 0; i < m; i++) {
            p = new Pair(p.snd * n > m ? p.fst : p.snd, p.snd + 1);
        }
        return p.fst;
    }

The resulting sequence will have pairs where the first element chases the second until it gets "stuck" on the right *q*, and retains it until we stop iterating. Here's an example with 10 / 2:

    (0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (5, 7), (5, 8), (5, 9), (5, 10)

Here's how we write it using `sequence`:

    divIterative := λm.λn.sequence (λfst.λsnd.(lt (times snd n) m) fst snd) 0 1 m

Defining modulo is easy once we have division, since modulo is the remainder after the division is done:

    modulo' := λm.λn.minus m (times m (div m n))

But we could also define it on its own terms. "Counting in a special way" works here, too:

    function modulo(m, n) {
        let result = 0;
        for (let i = 0; i < m; i++) {
            result = result + 1 === n
                ? 0
                : result + 1;
        }
        return result;
    }

And as a lambda expression:

    modulo := λm.λn.m (λr.(eq (succ r) n) 0 (succ r)) 0

Having defined addition, subtraction, multiplication, division, modulo, equality, and comparison, we're now satisfied with our range of operations on natural numbers.

## Taking stock: products and sums

Here's one thing I wish they had told me during my CS education: we can algebraically create bigger types from smaller types, and there are two main ways to glue the building blocks together.

The first way is **products**. Products involve combination. You put N things in, and you get a combined N-way type that you can treat as an individual thing. Two-way products are "this *and* that"; a Pair.

The second way is **sums**. Sums involve choice; you put *one* of N things in, and whoever wants to transform the resulting combined type doesn't get to know which of the things it is, so they have to be ready to handle any one of them. Two-way sums are "this *or* that"; sometimes called the Either type.

Here, let's make a table of what we have so far:

<table>
<tr><th>Type</th><th>How we represent it in lambda calculus</th><th>Algebraic type formula</th></tr>
<tr><td>Pair</td><td>A function of two arguments <code>x</code>, <code>y</code> returning a function of <code>f</code> that applies <code>f</code> to <code>x</code> and <code>y</code></td><td>Pair a<sub>1</sub> a<sub>2</sub> = a<sub>1</sub> ⨯ a<sub>2</sub></td></tr>
<tr><td>Tuple</td><td>A function of N arguments returning a function of <code>f</code> that applies <code>f</code> to those N arguments</td><td>Tuple a<sub>1</sub> ... a<sub>N</sub> = a<sub>1</sub> ⨯ ... ⨯ a<sub>N</sub></td></tr>
<tr><td>Bool</td><td>A function of two arguments <code>t</code>, <code>f</code> returning one of those</td><td>Bool = 1 + 1</td></tr>
<tr><td>Order</td><td>A function of three arguments <code>l</code>, <code>s</code>, <code>m</code> returning one of those</td><td>Order = 1 + 1 + 1</td></tr>
<tr><td>Natural number</td><td>A function of two arguments <code>s</code>, <code>z</code> returning <code>s</code> applied N times to <code>z</code></td><td>Nat = Nat + 1</td></tr>
</table>

The rightmost column is the new information, and the most important part of the table.

We haven't talked explicitly about the types before. We're still in *untyped* lambda calculus, so types don't really show up in our lambda expressions. We mentally make the distinction in our heads, though; `false` and `0` are α-equivalent, but we still think of them as two distinct values, because one is of type Bool and the other is of type Nat. Someone could run `not 0`, and the result would be equal to `true`, but we don't think of it as making sense because we think of `not` as acting on Bools.

The indexed lower-case letters "a" in the rightmost column are *type parameters*. So "Pair a<sub>1</sub> a<sub>2</sub>" means "a Pair of some given types which we call 'a<sub>1</sub>' and 'a<sub>2</sub>'". In an actual situation it might be a "Pair Int Bool" or a "Pair Order Nat", or any other choice of types for "a<sub>1</sub>" and "a<sub>2</sub>". Pair is called a *generic* type because it has type parameters. On the other hand, the Bool and Nat types aren't generic.

One thing the table is telling us is that pairs and tuples are product types, nothing else. And that Bool, Order and Nat are sum types.

The appearance of "1" in a type context might be surprising. It kind of means "a featureless value". The "1 + 1" in the definition of `Bool` corresponds to a choice between `true` and `false`, two completely data-less values that we only use to distinguish from one another. Similarly with the three choices in Order. The 1s are not important; the choice between them is. (Sometimes "1 + 1" is also written "1 | 1" to highlight the `or`-like choice.)

The 1 can also be written as `()`, the Tuple type of 0 elements, sometimes called Unit or Top. That syntax offers a different view to why the type represents a data-less atom. These two views are related; the empty tuple is a product of an empty list of types, and 1 in algebra is the product of an empty list of factors.

(The curious reader might wonder if, since there is a product type of no factors, there is also a sum type of no terms. Yes, there is! This is the type that represents a choice between no options &mdash; it's sometimes said that this type is not *inhabited*; the collection of values the type takes on is empty. This type is usually written as Bottom, or ⊥, the latter also being the logic symbol for a contradition.)

Let's return now to Nat, because something unusual is going on there. It's the only type so far that refers to itself on the right-hand side of its own definition. Is that allowed? What does it mean?

Answering that directly, Nat is defined as "Nat + 1" because a natural number is either the successor function *applied to a natural number*, or zero. That is, the successor function requires a natural number as an argument, as data. Each natural number except zero contains a natural number (its predecessor) as data.

Types that refer to themselves like this are called "recursive types" or sometimes "inductive types". When in the next section we talk about lists, we'll see a type that's both recursive (defined using itself) and generic (taking type parameters).

We can also think of it as a "type equation" that we can expand by replacing the "Nat" on the right-hand side with the definition of "Nat" itself. If we repeat that process, and if we're comfortable with transfinite arguments, we can think of the eventual result as being

> Nat = 1 + 1 + 1 + 1 + ...

And somehow that's a very appropriate view of the natural number, isn't it? It's a sum type of a countable infinity of data-less atoms.

*Roses are seven,<br>
violets are twelve,<br>
my love is isomorphic to a subset of itself*<br>
&nbsp;&nbsp;&nbsp;&nbsp;&mdash; [masak](https://irclog.perlgeek.de/perl6/2016-09-19#i_13237377)

You may also think back to the argument about recursion and the Y combinator, and wonder about similarities between those and the situation with self-referent Nat. They are connected; we don't need to use a Y combinator in the type realm (because we allow types to occur in their own definition), but the Nat type was the first type that we needed the Y combinator for, because it's a recursive type.

That's enough about the table. Let's summarize what we know so far about building sum types and product types in lambda calclus. We'll use the name **constructor** for the function that creates a new value, and **projections** for the getter-like functions that ask for parts of a value.

* If your type is a **product type** then its constructor should take one parameter for each of the *N* elements in the product, and return a function of one parameter `f` that applies them all. It also has *N* different projections that work by passing in different `f` functions.
    * Think back to the example with the `pair` constructor: `λx.λy.λf.f x y`. That's *N = 2* parameters, and then `f x y` applies them both to `f`.
* If your type is a **sum type** then it should have *N* different constructors, each one taking *N* arguments and returning a particular one of them. If a term in the sum type is another type, the corresponding argument should be a 1-ary function. If a term is a product type of *M* things, the corresponding argument should be an *M*-ary function.
    * In the case of Bool, there are two 0-ary constructors `true` and `false`.
    * In the case of Nat, the two constructors are `succ` (1-ary) and `zero` (0-ary).
* Simplification Ⅰ: anything that's a 0-tuple doesn't have to be written as an identity `λx.y` that you then pass some useless term z to. In that case, we can simplify the two thing to just `y`, and nothing needs to be applied on the outside.
* Simplification Ⅱ: for recursive types like Nat we don't have to put a layer of lambdas at every recursive step, since each time it's the same parameters that come in. (`s` and `z` in the case of Nat.)

Every type that we've built so far is actually some case or other of the above rules. What's more, now that we have a *recipe* of sorts, we can use that to more or less mechanically build ourselves a List type!

## Lists

According to the notation in the previous section, here's a possible definition of the List type:

    List a = a ⨯ List a + 1

That is, a List is either an element ("the head") and a List ("the tail"), or it's the empty List ("nil").

XXX definition

XXX isNil, cons, head, tail

XXX map, filter, reduce
