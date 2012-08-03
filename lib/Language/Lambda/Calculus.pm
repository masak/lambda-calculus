class Language::Lambda::Calculus {
    my grammar Expression {
        regex TOP { ^ <variable> $ }

        regex variable { <:Letter> }
    }

    method is_expression($text) {
        ?Expression.parse($text);
    }
}
