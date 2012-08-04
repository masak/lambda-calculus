class Language::Lambda::Calculus {
    my grammar Expression {
        regex TOP { ^ <expression> $ }

        regex expression {
            <application-step>+ % [\s*]
        }

        regex application-step { <variable> | <abstraction> | '(' <expression> ')' }

        regex variable { <:Letter> }
        regex abstraction { 'λ' <variable>+ '.' <expression> }
    }

    my class AST {
        method TOP($/) { make $<expression>.ast }

        method expression($/) {
            make $<application-step>[0].ast;
            for $<application-step>[1..*] -> $step {
                make {
                    :application,
                    :left($step.ast),
                    :right($/.ast),
                };
            }
        }

        method application-step($/) {
            make ($<variable> // $<abstraction> // $<expression>).ast;
        }

        method variable($/) {
            make {
                :variable,
                :name(~$/),
            };
        }

        method abstraction($/) {
            make {
                :abstraction,
                :left(~$<variable>[*-1]),
                :right($<expression>.ast),
            };
            for reverse $<variable>[0..*-2] -> $variable {
                make {
                    :abstraction,
                    :left(~$variable),
                    :right($/.ast),
                };
            }
        }
    }

    method is_expression($text) {
        ?Expression.parse($text);
    }

    method ast($text) {
        my $match = Expression.parse($text, :actions(AST.new))
            or die "Could not parse '$text'";
        $match.ast;
    }
}
