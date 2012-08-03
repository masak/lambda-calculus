use v6;
use Test;

use Language::Lambda::Calculus;

my $lc = Language::Lambda::Calculus.new();

ok $lc.is_expression('a'), 'If x is a variable, then x ∈ Λ';
ok $lc.is_expression('m'), 'another variable';
nok $lc.is_expression('2'), 'digits can not be variables';
nok $lc.is_expression('_'), 'underscores can not be variables';

done;
