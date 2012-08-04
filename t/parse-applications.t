use v6;
use Test;

use Language::Lambda::Calculus;

my $lc = Language::Lambda::Calculus.new();

ok $lc.is_expression('((λx.x) y)'), 'If M, N ∈ Λ, then (M N) ∈ Λ';
ok $lc.is_expression('((λx.x)  y)'), 'two spaces are fine, too';
ok $lc.is_expression('((λx.x)y)'), 'no spaces are fine, too';
ok $lc.is_expression(qq[((λx.x)\ny)]), 'a newline is fine, too';

# Outermost parentheses are dropped: M N instead of (M N)
{
    ok $lc.is_expression('(λx.x) y'), 'outermost parentheses can be dropped';
}

# Applications are assumed to be left associative: M N P may be written instead
# of ((M N) P)
{
    ok $lc.is_expression('(λx.x) (λx.x) y'), 'chaining applications';
    is_deeply $lc.ast('(λx.x) (λy.y) z'),
              $lc.ast('((λx.x) (λy.y)) z'),
              'a chaining application is parsed as being left associative';
}

done;
