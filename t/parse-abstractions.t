use v6;
use Test;

use Language::Lambda::Calculus;

my $lc = Language::Lambda::Calculus.new();

ok $lc.is_expression('(λx.x)'),
    'If x is a variable and M ∈ Λ, then (λx.M) ∈ Λ';

# The body of an abstraction extends as far right as possible: λx.M N means
# λx.(M N) and not (λx.M) N
{
    is_deeply $lc.ast('λx.(λx.x) x'),
              $lc.ast('λx.((λx.x) x)'),
              'the body of an abstraction extends as far right as possible';
}

done;
