**structured.js** is a Javascript library that provides a simple interface for verifying the structure of Javascript code, backed by the abstract syntax tree generated by Esprima. It is particularly useful in checking beginner code to provide feedback as part of [Khan Academy's CS curriculum](https://www.khanacademy.org/cs).

Structured.js works in-browser `<script src='structured.js'></script>`, or as a standalone npm module.

A structure is any valid Javascript code which contains blanks ( _ characters) and stand-ins ($str) to match values. The structure is sensitive to nesting and ordering. The matcher only requires that code contain the structure -- extra code has no effect.

### Demo

**[Try structured.js yourself](http://khan.github.io/structuredjs/index.html)** to see it in action.

Also check out the [pretty display demo](http://khan.github.io/structuredjs/pretty-display/index.html) for more user-friendly structures.

### Examples

    var structure = function() {
      if (_) {
        _ += _;
        for (var $a = _; $a < $b; $a += _) {
            _($a, $b, 30, 30);
        }
      }
    };

    var code = "/* some code */";

    var result = Structured.match(code, structure);

Returns true for the code:

    if (y > 30 && x > 13) {
       x += y;
       for (var i = 0; i < 100; i += 1) {
         rect(i, 100, 30, 30);
         bar();
       }
    }

**[Check out the demo](http://khan.github.io/structuredjs/index.html)** for more, or look at the tests.

### Advanced -- Variable Callbacks

To allow tighter control over what exactly is allowed to match your $variable, you may provide a mapping from variable names to function callbacks. These callbacks can enable NOT, OR, and AND functionality on the wildcard variables, for example.

Callback parameters should be the same as the name of the wildcard variables they are matching. The callback takes in a proposed value for the variable and accepts/rejects it by returning a boolean. The callback may instead return an object such as `{failure: "failure message"}` as well if you'd like to explain exactly why this value is not allowed.

For instance, say we want to check the value we assign to a var -- check that it is really big, and that it is bigger than whatever we increment it by. It would look like this:

    var structure = function() {var _ = $num; $num += $incr; };
    var code = "var foo = 400; foo += 3;";
    var varCallbacks = [
      function($num) {
        return num.value > 100;  // Just return true/false
      },
      function($num, $incr) {
        if (num.value <= incr.value) {
          // Return the failure message
          return {failure: "The increment must be smaller than the number."};
        }
        return true;
      }
    ];
    var match = Structured.match(code, structure, {varCallbacks: varCallbacks});
    if (!match) {
      // varCallbacks.failure contains the error message, if any.
      console.log("The problem is: " + varCallbacks.failure);
    }

Note that the callbacks receive objects that contain a subtree of the [Esprima](http://esprima.org) parse tree, not a raw value. Also note that the callbacks run statically, not dynamically -- so, you will only be able to directly check literal values (i.e., 48), not computed values (24*2, myVar, etc). The callbacks also ignore any variable callbacks for variables that do not actually appear in the structure you've passed in.

Go to [the demo](http://khan.github.io/structuredjs/index.html) to try it out.

### Tests

Run structured.js tests with `npm test` or by opening browser-test/index.html.

### Dependencies

[Esprima](http://esprima.org) and [UnderscoreJS](http://underscorejs.org) for the framework,
[QUnit](http://qunitjs.com/) for the test suite,
