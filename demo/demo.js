/* Simple control code for allowing user to type code into two editors,
    and check whether the code in the first editor matches the wildcard
    structure in the second editor.

    Also generates QUnit test code based on the editor contents. */

$(document).ready(function() {
    // Set up the editors (disable workers so we can run locally as well.)
    var editorStructure = ace.edit("structure");
    setupEditor(editorStructure);
    var editorTest = ace.edit("test-code");
    setupEditor(editorTest);
    var editorCallbacks = ace.edit("var-callbacks");
    setupEditor(editorCallbacks);
    var oldFocus = editorStructure;

    // Run Structured.match when the user presses the button.
    $("#run-button").click(function(evt) {
        var structure = "function() {\n" + editorStructure.getValue() + "\n}";
        var code = editorTest.getValue();
        //  Pull in the object with function callbacks.
        eval("var varCallbacks = " + editorCallbacks.getValue());
        var message, errorMessage;
        try {
            var result = !!Structured.match(code, structure,
                {varCallbacks: varCallbacks});
            message = "Match: " + result;
            errorMessage = varCallbacks.failure || "";
        } catch (error) {
            message = "";
            errorMessage = error;
        }
        $("#results").hide().html(message).fadeIn();
        $(".match-fail-message").html(errorMessage);
        $(".test-wrapper").hide();
        oldFocus.focus();
        makeTest(structure, code, editorCallbacks.getValue(), result);
    });

    // Show QUnit test code
    $(".gen-test").click(function(evt) {
        $("#run-button").click();
        $(".test-wrapper").show();
    });


    $(".var-callbacks-show-hide").click(function(evt) {
        $("#var-callbacks").css('visibility', function(i, visibility) {
            return visibility === "visible" ? "hidden" : "visible";
        });
    });

    // Output results on the initial load.
    $("#run-button").click();


    function setupEditor(editor) {
        editor.getSession().setUseWorker(false);
        editor.getSession().setMode("ace/mode/javascript");
        editor.renderer.setShowGutter(false);
        editor.renderer.setPadding(6);
        // Save the user's focus so we can restore it afterwards.
        editor.on("focus", function() {
            oldFocus = editor;
        });
    }
});

/* Generates the QUnit test code based on editor contents.
    Handles multiline string nonsense. */
function makeTest(structure, code, editorCallbacks, result) {
    var testCode = "// QUnit test code \n";
    testCode += "editorCallbacks = " + editorCallbacks + ";";
    testCode += "\nstructure = " + structure + ";";
    testCode += "\ncode = \" \\n \\ \n";
    _.each(code.split("\n"), function(line) {
        testCode += line + "   \\n \\ \n";
    });
    testCode += "\"; \n";
    testCode += "equal(Structured.match(code, structure, " +
        "{editorCallbacks: editorCallbacks}),\n\t" +
        result + ", \"message\");";
    $(".test-code").hide().html(testCode).fadeIn();
}
