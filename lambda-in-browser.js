/* global $ */

import { ast } from "./index";

const FADED_BG_COLORS = [
    "#ffddaa",
    "#fedfb1",
    "#fde2bb",
    "#fce4b2",
    "#fbe7cc",
    "#faeac3",
    "#f9ecdd",
    "#f8eee4",
    "#f7f1ee",
    "#f6f3f1",
    "#f5f5f5",
];
const ESCAPE_KEY = 27;

$(".js-eval-text").on("focus", function() {
    $(this).select();
});

$(".js-eval-text").on("keydown", function(event) {
    if (event.which === ESCAPE_KEY) {
        $(this).blur();
    }
});

function evaluateJsExpression(event) {
    let $form = $(event.delegateTarget);
    event.preventDefault();

    let $evalText = $form.find(".js-eval-text");
    let jsExpression = $evalText.val();
    let $result;
    try {
        let result = ast(jsExpression).constructor.name;
        $result = $("<pre></pre>").text(result);
    } catch (ex) {
        $result = $("<em></em>").append(
            $("<pre></pre>").text(ex.message).addClass("js-error")
        );
    }

    let $evalResult = $form.find(".js-result");
    $evalResult.empty();
    $evalResult.append($result);
    function fade(n) {
        $result.css("background-color", FADED_BG_COLORS[n]);
    }
    for (let i = 0; i < FADED_BG_COLORS.length; i++) {
        setTimeout(fade.bind(null, i), i * 50);
    }

    $evalText.select();
}

$(".js-eval-form").on("click", ".js-run-button", evaluateJsExpression);
$(".js-eval-form").on("submit", evaluateJsExpression);
