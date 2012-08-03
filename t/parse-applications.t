use v6;
use Test;

use Language::Lambda::Calculus;

my $lc = Language::Lambda::Calculus.new();

ok $lc.is_expression('((λx.x) y)'), 'If M, N ∈ Λ, then (M N) ∈ Λ';
ok $lc.is_expression('((λx.x)  y)'), 'two spaces are fine, too';
ok $lc.is_expression('((λx.x)y)'), 'no spaces are fine, too';
ok $lc.is_expression(qq[((λx.x)\ny)]), 'a newline is fine, too';

done;
