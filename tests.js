/* QUnit tests for StructuredJS. */

// Detect if run in-browser or via node.
if (typeof global !== "undefined") {
    Structured = global["structured"];
} else {
    Structured = this.Structured;
}

var basicTests = function() {
    QUnit.module("Basic detection");

    test("Positive tests of syntax", function() {

        ok(Structured.match("",
            function() {}),
            "Empty structure matches empty string.");

        ok(Structured.match("if (y > 30 && x > 13) {x += y;}",
            function() { if (_) {} }),
            "Basic if-statement structure matches.");

        ok(Structured.match("if (y > 30 && x > 13) {x += y;}",
            function foo() { if (_) {} }),
            "Using a named function is allowable as well.");

        ok(Structured.match("if (y > 30 && x > 13) {x += y;} else { y += 2;}",
            function() { if (_) {} else {}}),
            "Basic if-else statement structure matches.");

        ok(Structured.match("if (y > 30 && x > 13) {x += y;} \
            else if(x <10) {y -= 20;} else { y += 2;}",
            function() { if (_) {} else if (_) {} else {}}),
            "Basic if, else-if, else statement structure matches.");

        ok(Structured.match("for (var a = 0; a < 10; a += 1) { a -= 2;}",
            function() { for (_; _; _) {} }),
            "Basic for-statement structure matches.");

        ok(Structured.match("var a = 30;",
            function() { var _ = _; }),
            "Basic variable declaration + initialization matches.");

        ok(Structured.match("var test = function() {return 3+2;}",
            function() { var _ = function() {};}),
            "Basic function assignment into var matches.");

        ok(Structured.match("function foo() {return x+2;}",
            function() { function _() {};}),
            "Basic standalone function declaration matches.");

        ok(Structured.match("rect();",
            function() { rect(); }),
            "No-parameter call to function matches.");

        ok(Structured.match("rect(3);",
            function() { rect(); }),
            "Parameterized call to no-param function structure matches.");

        ok(Structured.match("rect(30, 40, 10, 11);",
            function() { rect(30, 40, 10, 11); }),
            "Fully specified parameter call to function matches.");

        ok(Structured.match("rect(30, 40, 10, 11);",
            function() { rect(30, _, _, 11); }),
            "Parameters with wildcards call to function matches.");

        ok(Structured.match("rect(30, 40);",
            function() { rect(_, _); }),
            "Parameters with all wildcards call to function matches.");

        ok(Structured.match("rect(30, 40, 30);",
            function() { rect(_, _); }),
            "Extra params to function matches.");
    });

    test("Negative tests of syntax", function() {

        equal(Structured.match("if (y > 30 && x > 13) {x += y;}",
            function() { if (_) {_} else {}}),
            false,
            "If-else does not match only an if.");

        equal(Structured.match("if (y > 30 && x > 13) {x += y;} else {y += 2;}",
            function() { if (_) {} else if (_) {} else {}}),
            false,
            "If, else if, else structure does not match only if else.");

        equal(Structured.match("var a;",
            function() { var _ = _; }),
            false,
            "Variable declaration + init does not match just declaration.");

        equal(Structured.match("while(true) { a -= 2;}",
            function() { for (_; _; _) {} }),
            false,
            "For-statement does not match a while loop.");

        equal(Structured.match("var test = 3+5",
            function() { var _ = function() {};}),
            false,
            "Basic function declaration does not match basic var declaration");

        equal(Structured.match("var test = function foo() {return 3+2;}",
            function() { function _() {};}),
            false,
            "Function declaration does not match function assignment into var");

        equal(Structured.match("rect();",
            function() { ellipse(); }),
            false,
            "Call to function does not match differently-named function.");

        equal(Structured.match("rect(300, 400, 100, 110);",
            function() { rect(30, 40, 10, 11); }),
            false,
            "Fully specified parameter call to function identifies mismatch.");

        equal(Structured.match("rect(30);",
            function() { rect(30, 40); }),
            false,
            "Too few parameters does not match.");

        equal(Structured.match("rect(60, 40, 10, 11);",
            function() { rect(30, _, _, 11); }),
            false,
            "Parameters with wildcards call to function identifies mismatch.");

        equal(Structured.match("rect();",
            function() { rect(_, _); }),
            false,
            "Wildcard params do not match no-params for function call.");

        equal(Structured.match("rect(30, 40);",
            function() { rect(_, _, _); }),
            false,
            "Parameters with too few wildcards call to function mismatches.");
    });
};

var clutterTests = function() {
    QUnit.module("Clutter testing");
    test("Simple tests of distracting syntax", function() {
        var structure, code;

        ok(Structured.match("if (y > 30 && x > 13) {x += y;} \
            else if(x <10) {y -= 20;} else { y += 2;}",
            function() { if (_) {} else {}}),
            "Extra else-if statement correctly allowed though not specified.");

        structure = function() {
            for (; _ < 10; _ += 1) {
                if (_) {

                }
            }
        };
        code = "  \
        var x = 30; \n \
        for (var i = 0; i < 10; j += 1) { \n \
            if (y > 30 && x > 13) {x += y;} \n \
            console.log(x); \n \
        }";
        ok(Structured.match(code, structure),
            "Correctly matching for-loop condition.");

        code = "  \
        var x = 30; \n \
        for (var i = 0; i < 20; i += 1) { \n \
            if (y > 30 && x > 13) {x += y;} \n \
            console.log(x); \n \
        }";
        equal(Structured.match(code, structure),
            false, "Correctly not matching for-loop condition.");
    });
};


var nestedTests = function() {
    QUnit.module("Nested testing");
    test("More involved tests of nested syntax", function() {
        var structure, code;

        structure = function() {
            if (_) {
                if (_) {

                }
            }
        };
        code = "  \
        var x = 30; \n \
        if (x > 10) { \n \
            if (y > 30 && x > 13) {x += y;} \n \
            console.log(x); \n \
        } \n ";
        ok(Structured.match(code, structure),
            "Nested if with distractions matches.");

        code = "  \
        var x = 30; \n \
        if (x > 10) { \n \
            for (var a = 0; a < 2; a += 1) { \n \
            if (y > 30 && x > 13) {x += y;} \n } \
            console.log(x); \n \
        } \n ";
        ok(Structured.match(code, structure),
            "More complex nested if with distractions matches.");

        code = "  \
        var x = 30; \n \
        if (x > 10) { \n \
            while (y > 30 && x > 13) {x += y;} \n \
            console.log(x); \n \
        } if (y > 30 && x > 13) {x += y;} \n ";
        equal(Structured.match(code, structure),
            false, "Non-nested if does not match.");
    });
};

var drawingTests = function() {
    QUnit.module("Draw-specific testing");
    test("Draw loop specific tests", function() {
        var structure, code;

        structure = function() {
            var draw = function() {
                rect(_, _, _, _);
            };
        };
        code = "  \
        var draw = function() { \n \
            rect(x, y, 30, 30); \n \
        }; \n ";
        ok(Structured.match(code, structure),
            "Draw with wildcard rect call matches.");

        structure = function() {
            var draw = function() {
                rect();
            };
        };
        code = "  \
        var draw = function() { \n \
            20; \n \
            rect(); \n \
        }; \n ";
        ok(Structured.match(code, structure),
            "Draw with wildcard rect call and distractions matches.");

        structure = function() {
            var draw = function() {
                var _ = 10;
                if (_) {
                    var _ = _;
                    if (_) {
                        _ = _ / 2;
                        _ = _ % 2;
                        rect();
                    }
                }
                rect();
                ellipse();
            };
        };
        code = "  \
        var draw = function() { \n \
            var a = 20; \n \
            var b = 40; \n \
            var c = 10; \n \
            if (a > 10 && b > 30) {   \n \
              a -= 3; \n \
              var d = 2; \n \
              if (d > 1 && c > 3) {   \n \
                d = 2; \n \
                c = a / 2; \n \
                b = 20; \n \
                d = b; \n \
                a = c % 2; \n \
                rect(); \n \
                ellipse(); \n \
              } d += 10; c *= d; rect(3, c, d, a); \n \
              ellipse(a, a, c, d); rect(); f += 3; \n \
            } rect(); \n \
            var b = 10; \n \
            ellipse(); \n \
        }; \n ";
        ok(Structured.match(code, structure),
            "Larger drawing test successful.");
    });
};

var peerTests = function() {
    QUnit.module("Peer detection testing");
    test("Basic detection of neighbors", function() {
        var structure, code;

        ok(Structured.match("rect(); ellipse();",
            function() { rect(); ellipse()}),
            "Back-to-back function calls match.");

        equal(Structured.match("rect();",
            function() { rect(); ellipse()}),
            false,
            "Back-to-back function calls do not match only the first.");

        structure = function() {
            var _ = 0;
            var _ = 1;
        };
        code = "var a = 0; var b = 1;";
        ok(Structured.match(code, structure), "Back-to-back vars matched.");

        structure = function() {
            var draw = function() {
                rect();
                ellipse();
                var _ = 3;
            };
        };
        code = "  \
        var draw = function() { \n \
            var a = 20; \n \
            rect(); \n \
            var b = 10; \n \
            ellipse(); \n \
            var c = 30; \n \
            var d = 3; \n \
            c = a + b; \n \
        }; \n ";
        ok(Structured.match(code, structure),
            "Multi-function call separated by statements matches.");
    });
};

var combinedTests = function() {
    QUnit.module("Combined functionality tests");
    test("Simple combined tests", function() {
        var structure, code;
        structure = function() {
          if (_ % 2) {
            _ += _;
          }
        };
        code = " \n \
        if (y % 2 == 1 ) {   \n \
           x += y;   \n \
        }   \n \
        ";
        equal(Structured.match(code, structure),
            true, "Simple mod, if, and += works");
    });
};

var runAll = function() {
    basicTests();
    clutterTests();
    nestedTests();
    drawingTests();
    peerTests();
    combinedTests();
};

runAll();
