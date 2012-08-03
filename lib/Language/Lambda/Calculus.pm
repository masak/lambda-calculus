class Language::Lambda::Calculus {
    my grammar Expression {
        regex TOP { ^ <expression> $ }

        regex expression { <variable> | <abstraction> }
        regex variable { <:Letter> }
        regex abstraction { '(' 'λ' <variable> '.' <expression> ')' }
    }

    method is_expression($text) {
        ?Expression.parse($text);
    }
}
