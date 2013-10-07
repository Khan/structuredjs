/* QUnit tests for StructuredJS. */

// Detect if run in-browser or via node.
if (typeof global !== "undefined") {
    Structured = global["structured"];
} else {
    Structured = this.Structured;
}

var basicTests = function() {

    QUnit.module("Basic detection");

    test("Accepts string for structure", function() {
        ok(Structured.match("var draw = function() {}",
           "function() { var draw = function() {};}"),
           "Accepts string and matches");

        equal(Structured.match("var drow = function() {}",
           "function() { var draw = function() {};}"),
           false,
           "Accepts string and doesn't match it");
    });

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
            function() { function _() {}}),
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
            function() { if (_) {_;} else {}}),
            false,
            "If-else does not match only an if.");

        equal(Structured.match("if(y > 30 && x > 13) {x += y;} else {y += 2;}",
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
            function() { function _() {}}),
            false,
            "Function declaration doesn't match function assignment into var");

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
            else if (x <10) {y -= 20;} else { y += 2;}",
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
            var _ = _;
        };
        code = "var a = 0; var b = 1; var c = 30;";
        ok(Structured.match(code, structure), "Back-to-back vars matched.");
        equal(Structured.match("var a = 0; var b = 1;",
            structure), false, "Partial match does not suffice.");

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

var varCallbackTests = function() {
    QUnit.module("User-defined variable callbacks");
    test("Basic single variable callbacks", function() {
        var structure, code;

        equal(Structured.match("var x = 10; var y = 20;",
            function() {var _ = $a;}, {
                "varCallbacks": {
                    "$a": function(obj) {
                        return false;
                    }
                }
            }),
            false, "Always false varCallback causes failure.");

        equal(Structured.match("var x = 10; var y = 20; var k = 42;",
            function() {var _ = $a; var _ = $b;}, {
                "varCallbacks": {
                    "$a": function(obj) {
                        return false;
                    },
                    "$b": function(obj) {
                        return true;
                    }
                }
            }),
            false, "One always false varCallback of two causes failure.");

        equal(Structured.match("var x = 10; var y = 20;",
            function() {var _ = $a;}, {
                "varCallbacks": {
                    "$a": function(obj) {
                        return true;
                    }
                }
            }),
            true, "Always true varCallback still matches.");

        equal(Structured.match("var x = 10; var y = 20;",
            function() {var z = $a;}, {
                "varCallbacks": {
                    "$a": function(obj) {
                        return true;
                    }
                }
            }),
            false, "Always true varCallback with no match does not match.");

        equal(Structured.match("var x = 10; var y = 20; var z = 40;",
            function() {var _ = $a;}, {
                "varCallbacks": {
                    "$a": function(obj) {
                        return obj.type === "Literal" && obj.value === 40;
                    }
                }
            }),
            true, "Basic single-matching var callback matches.");

        equal(Structured.match("var x = 10; var y = 20; var z = 40;",
            function() {var _ = $a; var _ = $b;}, {
                "varCallbacks": {
                    "$a": function(obj) {
                        return obj.type === "Literal" && obj.value > 11;
                    },
                    "$b": function(obj) {
                        return obj.type === "Literal" && obj.value > 30;
                    }
                }
            }),
            true, "Two single-matching var callbacks match correctly.");

        equal(Structured.match("var x = 10; var y = 20; var z = 40;",
            function() {var _ = $a; var _ = $b;}, {
                "varCallbacks": {
                    "$a": function(obj) {
                        return obj.type === "Literal" && obj.value > 11;
                    },
                    "$b": function(obj) {
                        return obj.type === "Literal" && obj.value < 11;
                    }
                }
            }),
            false, "Two single-matching var callbacks still need ordering.");


        var varCallbacks;
        varCallbacks = {
            "$a": function(obj) {
                return {"failure": "Nothing can match $a!"};
            }
        };
        var result = Structured.match("var x = 10; var y = 20",
            function() {var $a = _;}, {"varCallbacks": varCallbacks});
        equal(result, false, "Returning failure object will be false");
        equal(varCallbacks.failure, "Nothing can match $a!",
            "Failure message is correctly set, basic.");

        varCallbacks = {
            "$a": function(obj) {
                return true;
            },
            "$b": function(obj) {
                if (obj.value > 30) {
                    return true;
                }
                return {"failure": "Make sure the value is big"}
            }
        };
        var result = Structured.match("var x = 10; var y = 20; var c = 0;",
            function() {var $a = $b;}, {"varCallbacks": varCallbacks});
        equal(result, false, "Returning failure object is false");
        equal(varCallbacks.failure, "Make sure the value is big",
            "Failure message is correctly set, basic.");

        varCallbacks = {
            "$a": function(obj) {
                return true;
            },
            "$b": function(obj) {
                if (obj.value > 90) {
                    return true;
                }
                return {"failure": "Make sure the value is big"};
            }
        };
        var result = Structured.match("var x = 10; var y = 20; var c = 100;",
            function() {var $a = $b;}, {"varCallbacks": varCallbacks});
        equal(result, true, "Matches still work around failure messages");
        equal(varCallbacks.failure, undefined,
            "Failure message is not set if no failure.");
    });

    test("More complicated single variable callbacks", function() {
        var code, structure, varCallbacks;
        structure = function() {
            var $a = _, _ = $val;
            var $d = function() {};
            var draw = function() {
                var $b = $a + _;
                $d(_, $e, $b, _);
                $d($a);
                $a = $e.length;
            };
        };
        code = " \n \
        var a = 10, z = 3, b = 20, y = 1, k = foo();   \n \
        var bar = function(x) {return x + 3;};   \n \
        var foo = function(x) {return x + 3;};   \n \
        var draw = function() {   \n \
            var t = z + y;   \n \
            foo(t);   \n \
            foo(3, 'falcon', t, 10);   \n \
            foo(3, 'eagle', t, 10);   \n \
            test(z);   \n \
            foo(z);   \n \
            z = 'falcon'.length;   \n \
            z = 'eagle'.length;   \n \
        }   \n \
        ";
        var varCallbacks = {
            "$e": function(obj) {
                return obj.value === "eagle";
            },
            "$val": function(obj) {
                return (obj.type === "CallExpression" &&
                    obj.callee.name === "foo");
            }
        };
        equal(Structured.match(code, structure, {varCallbacks: varCallbacks}),
            true, "Complex with parameters, function names, etc works.");
    });

    test("Multiple variable callbacks", function() {
        var varCallbacks, code, structure, result;
        varCallbacks = {
            "$a, $b": function(a, b) {
                return a.value > b.value;
            }
        };
        result = Structured.match("var x = 50; var y = 20;",
            function() {var _ = $a; var _ = $b;},
            {"varCallbacks": varCallbacks});
        equal(result, true, "Simple multiple variable callback works.");


        varCallbacks = {
            "$a, $b": function(a, b) {
                return a.value > b.value;
            }
        };
        result = Structured.match("var x = 50; var y = 20;",
            function() {var _ = $a; var _ = $b;},
            {"varCallbacks": varCallbacks});
        equal(result, true, "Simple multiple variable callback works.");


        varCallbacks = {
            "$a,$b,   $c": function(a, b, c) {
                return a.value > b.value && c.value !== 40;
            }
        };
        equal(Structured.match("var a = 3; var b = 1; var c = 4;",
            function() {var a = $a; var b = $b; var c = $c;}),
            true, "Trim from left works.");


        // TODO test more involved var callbacks.
        varCallbacks = {
            "$c, $a, $b": function(c, a, b) {
                return a.value > b.value;
            },
            "$c": function(c) {
                return c.type === "Identifier" && c.name !== "foo";
            },
            "$c, $d, $e": function(c, d, e) {
                return d.value === e.value;
            }
        };
        structure = function() {
            _ += $a + $b;
            $c($e, $d);
        };
        code = "tree += 30 + 50 + 10; plant(40, 20); forest(30, 30);";
        result = Structured.match(code, structure,
            {"varCallbacks": varCallbacks});
        equal(result, true, "Multiple multiple-var callbacks work.");

        code = ("tree += 30 + 50 + 70; plant(40, 0) + forest(30, 30);" +
            "tree += 30 + 50 + 10; plant(40, 0) + forest(30, 60);");
        result = Structured.match(code, structure,
            {"varCallbacks": varCallbacks});
        equal(result, false, "False multiple multiple-var callbacks work.");
        equal(varCallbacks.failure, undefined,
            "No failure message if none specified.");


        varCallbacks = {
            "$red, $green, $blue": function(red, green, blue) {
                if (red.value < 50) {
                    return {"failure": "Red must be greater than 50"};
                }
                if (green.value < blue.value) {
                    return {"failure": "Use more green than blue"};
                }
                return true;
            }
        };
        structure = function() {
            fill($red, $green, $blue);
        };
        result = Structured.match("var foo = 5; foo += 2; fill(100, 40, 200);",
            structure, {"varCallbacks": varCallbacks});
        equal(result, false, "False RGB matching works.");
        equal(varCallbacks.failure, "Use more green than blue",
            "False RGB message works");

        result = Structured.match("var foo = 5; foo += 2; fill(100, 40, 2);",
            structure, {"varCallbacks": varCallbacks});
        equal(result, true, "True RGB matching works.");
        equal(varCallbacks.failure, undefined, "True RGB message works");
    });
};

var constantFolding = function() {
    QUnit.module("Constant folding");
    test("Simple constant folding", function() {
        ok(Structured.match("var x = -5;",
            function() { var x = $num; },{
                "varCallbacks": {
                    "$num": function(num) {
                        return num && num.value && num.value < 0;
                    }
                }
            }),
            "Unary - operator folded on number literals.");

        ok(Structured.match("var x = +5;",
            function() { var x = $num; },{
                "varCallbacks": {
                    "$num": function(num) {
                        return num && num.value && num.value > -10;
                    }
                }
            }),
            "Unary + operator folded on number literals.");

        ok(Structured.match("var y = 10; var x = +y; x = -y;",
            function() { var x = +$var; x = -$var; }),
            "Unary + - operators work on non-literals.");
    });
};

var wildcardVarTests = function() {
    QUnit.module("Wildcard variables");
    test("Simple wildcard tests", function() {
        var structure, code;

        ok(Structured.match("var x = 10; x -= 1;",
            function() { var $a = 10; $a -= 1; }),
            "Basic variable match works.");

        equal(Structured.match("var x = 10; y -= 1;",
            function() { var $a = 10; $a -= 1; }),
            false, "Basic variable no-match works.");

        ok(Structured.match("var x = 10; var y = 10; var t = 3; var c = 1; c = 3; t += 2; y += 2;",
            function() {var $a = 10; var $b = _; $b += 2; $a += 2;}),
            "Basic multiple-option variable match works.");

        equal(Structured.match("var x = 10; var y = 10; var t = 3; var c = 1; c = 3; y += 2;",
            function() {var $a = _; var $b = _; $b = 3 + 2; $a += 2;}), false,
            "Basic multiple-option variable no-match works.");

        equal(Structured.match("if(true) {var x = 2;} var y = 4; z = x + y",
            function() {if (_) {var $a = _;} var $b = 4; _ = $a + $b;}),
            true, "Simple multiple var match works");

        // QUnit test code
        structure = function() {
        function $k(bar) {}
            $k;
        };
        code = "function foo(bar) {} bar; foo;";
        equal(Structured.match(code, structure),
            true, "Matching declared function name works.");
    });
    test("Involved wildcard tests", function() {
        var structure, code;
        structure = function() {
            var $a, $b, $c, $d;
            $a = 1;
            $b = 1;
            $c = 1;
            $d = 1;
            $a += 3;
        };
        code = " \n \
        var r, s, t, u, v, w, x, y, z;   \n \
        r = 1; s = 1; t = 1; u = 1; v = 1; w = 1; x = 1; y = 1; z = 1;   \n \
        u += 3;   \n \
        ";
        equal(Structured.match(code, structure),
            true, "More ambiguous multi-variable matching works.");
        code = " \n \
        var r, s, t, u, v, w, x, y, z;   \n \
        r = 1; s = 1; t = 1; u = 1; v = 1; w = 1; x = 1; y = 1; z = 1;   \n \
        x += 3;   \n \
        ";
        equal(Structured.match(code, structure),
            false, "More ambiguous multi-variable non-matching works.");

        structure = function() {
            var $a = _;
            var $d = function() {}
            var draw = function() {
                var $b = $a + _;
                $d(_, $e, $b, _);
                $d($a);
                $a = $e.length;
            }
        };
        code = " \n \
        var a = 10, b = 20, z = 3, y = 1;   \n \
        var bar = function(x) {return x + 3;};   \n \
        var foo = function(x) {return x + 3;};   \n \
        var draw = function() {   \n \
            var t = z + y;   \n \
            foo(t);   \n \
            foo(3, 'eagle', t, 10);   \n \
            test(z);   \n \
            foo(z);   \n \
            z = 'eagle'.length;   \n \
        }   \n \
        ";
        equal(Structured.match(code, structure),
            true, "Complex vars with parameters, function names, etc works.");
        code = " \n \
        var a = 10, b = 20, z = 3, y = 1;   \n \
        var bar = function(x) {return x + 3;};   \n \
        var foo = function(x) {return x + 3;};   \n \
        var draw = function() {   \n \
            var t = z + y;   \n \
            foo(t);   \n \
            foo(3, 'eagle', t, 10);   \n \
            test(z);   \n \
            foo(z);   \n \
            z = 'eaglee'.length;   \n \
        }   \n \
        ";
        equal(Structured.match(code, structure),
            false, "Complex vars with small mismatch breaks.");

    });
};

var nestingOrder = function() {
    QUnit.module("Nesting order");
    /*
     * A structure implicitly applies a partial order constraint on
     * the nesting "levels" of expressions. In particular, if pattern
     * expression A lexically appears before pattern expression B, then
     * any binding of concrete expressions to A and B implies that B is
     * nested at the same or deeper level than A.
     */
    test("Simple nesting tests", function() {
            var structure, code;

            ok(Structured.match("var x = 5; while(true) { var y = 6; }",
                function() { var x = 5; var y = 6; }),
                "Downward expression ordering works.")

            ok(!Structured.match("while(true) { var x = 5; } var y = 6;",
                function() { var x = 5; var y = 6; }),
                "Upward expression ordering fails.")
        });
};

var runAll = function() {
    basicTests();
    clutterTests();
    nestedTests();
    drawingTests();
    peerTests();
    wildcardVarTests();
    varCallbackTests();
    constantFolding();
    combinedTests();
    nestingOrder();
};

runAll();
