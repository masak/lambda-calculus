class Language::Lambda::Calculus {
    my grammar Expression {
        regex TOP { ^ <expression> $ }

        regex expression { <variable> | <abstraction> | <application> }
        regex variable { <:Letter> }
        regex abstraction { '(' 'λ' <variable> '.' <expression> ')' }
        regex application { '(' <expression> \s* <expression> ')' }
    }

    method is_expression($text) {
        ?Expression.parse($text);
    }
}
