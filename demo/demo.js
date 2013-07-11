/* Simple control code for allowing user to type code into two editors,
    and check whether the code in the first editor matches the wildcard
    structure in the second editor.

    Also generates QUnit test code based on the editor contents. */

$(document).ready(function() {
    // Set up the editors (disable workers so we can run locally as well.)
    var editorTest = ace.edit("test-code");
    var editorStructure = ace.edit("structure");
    editorTest.getSession().setUseWorker(false);
    editorStructure.getSession().setUseWorker(false);
    editorTest.getSession().setMode("ace/mode/javascript");
    editorStructure.getSession().setMode("ace/mode/javascript");

    // Save the user's focus so we can restore it after the button is pressed.
    var oldFocus = editorTest;
    editorTest.on("focus", function() {
        oldFocus = editorTest;
    });
    editorStructure.on("focus", function() {
        oldFocus = editorStructure;
    });

    // Run Structured.match when the user presses the button.
    $("#run-button").click(function(evt) {
        var structure = "function() {\n" + editorStructure.getValue() + "\n}";
        var code =  editorTest.getValue();
        var message;
        try {
            var result = Structured.match(code, structure);
            message = "Match: " + result;
        } catch (error) {
            message = "Error: " + error;
        }
        $("#results").hide().html(message).fadeIn();
        oldFocus.focus();
        makeTest(structure, code, result);
    });

    // Output results on the initial load.
    $("#run-button").click();
});

/* Generates the QUnit test code based on editor contents.
    Handles multiline string nonsense. */
function makeTest(structure, code, result) {
    var testCode = "";
    testCode += "structure = " + structure + ";";
    testCode += "\ncode = \" \\n \\ \n";
    _.each(code.split("\n"), function(line) {
        testCode += line + "   \\n \\ \n";
    });
    testCode += "\"; \n";
    testCode += "equal(Detect.matchStructure(code, structure),\n\t" +
        result + ", \"message\");";
    $(".test-code").hide().html(testCode).fadeIn();
}
