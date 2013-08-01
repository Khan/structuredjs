/*
 * Takes the structure created in the code editor and generates pretty
 *  HTML/CSS with the StructuredJS variables and blanks contained in special
 *  spans.
*/

$(document).ready(function() {
    // Set up the editor
    var editor = ace.edit("structure");
    setupEditor(editor);
    // Output results on the initial load.
    showPrettyCode(editor.getValue());
});

function setupEditor(editor) {
    editor.getSession().setUseWorker(false);
    editor.getSession().setMode("ace/mode/javascript");
    editor.renderer.setShowGutter(false);
    editor.renderer.setPadding(6);
    editor.getSession().on('change', function(e) {
        showPrettyCode(editor.getValue());
    });
}

function showPrettyCode(code) {
    Structured.prettify(code, function(pretty) {
        $("#pretty-display").html(pretty);
    });
}