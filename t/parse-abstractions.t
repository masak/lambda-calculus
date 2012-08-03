use v6;
use Test;

use Language::Lambda::Calculus;

my $lc = Language::Lambda::Calculus.new();

ok $lc.is_expression('(λx.x)'),
    'If x is a variable and M ∈ Λ, then (λx.M) ∈ Λ';

done;
