/*
 * Scientific calculator — vanilla JS, no dependencies.
 *
 * Expressions are evaluated WITHOUT eval()/Function(): the input string is
 * tokenised, converted to Reverse Polish Notation with the shunting-yard
 * algorithm, then evaluated against a whitelisted set of operators and
 * functions. Anything outside that whitelist is a parse error.
 */
(function () {
  "use strict";

  // ----- whitelist ---------------------------------------------------------
  var CONSTANTS = {
    pi: Math.PI,
    e: Math.E,
  };

  // Unary functions exposed as name( ... ). Each may throw on a bad domain.
  var FUNCTIONS = {
    sin: function (x) { return Math.sin(x); },
    cos: function (x) { return Math.cos(x); },
    tan: function (x) { return Math.tan(x); },
    exp: function (x) { return Math.exp(x); },
    sqrt: function (x) {
      if (x < 0) throw new Error("sqrt of negative");
      return Math.sqrt(x);
    },
    log: function (x) {
      if (x <= 0) throw new Error("log of non-positive");
      return Math.log10(x);
    },
    ln: function (x) {
      if (x <= 0) throw new Error("ln of non-positive");
      return Math.log(x);
    },
  };

  // Binary operators: precedence + associativity + apply fn.
  var OPERATORS = {
    "+": { prec: 2, assoc: "L", apply: function (a, b) { return a + b; } },
    "-": { prec: 2, assoc: "L", apply: function (a, b) { return a - b; } },
    "*": { prec: 3, assoc: "L", apply: function (a, b) { return a * b; } },
    "/": {
      prec: 3,
      assoc: "L",
      apply: function (a, b) {
        if (b === 0) throw new Error("division by zero");
        return a / b;
      },
    },
    "^": { prec: 4, assoc: "R", apply: function (a, b) { return Math.pow(a, b); } },
  };

  function factorial(n) {
    if (n < 0) throw new Error("factorial of negative");
    if (!Number.isInteger(n)) throw new Error("factorial of non-integer");
    var result = 1;
    for (var i = 2; i <= n; i++) {
      result *= i;
      if (!isFinite(result)) throw new Error("factorial overflow");
    }
    return result;
  }

  // ----- tokeniser ---------------------------------------------------------
  // Token kinds: number, op, lparen, rparen, func, const, fact (!), pct (%), uminus
  function tokenize(input) {
    var tokens = [];
    var i = 0;
    var n = input.length;

    function lastTok() {
      return tokens.length ? tokens[tokens.length - 1] : null;
    }

    // A '-' (or '+') is unary when it starts the expression or follows an
    // operator, an opening paren, or a unary minus.
    function prevAllowsUnary() {
      var t = lastTok();
      if (!t) return true;
      return t.kind === "op" || t.kind === "lparen" || t.kind === "uminus";
    }

    while (i < n) {
      var ch = input[i];

      if (ch === " " || ch === "\t") {
        i++;
        continue;
      }

      // numbers: digits with optional single decimal point
      if ((ch >= "0" && ch <= "9") || ch === ".") {
        var numStr = "";
        var seenDot = false;
        while (i < n && ((input[i] >= "0" && input[i] <= "9") || input[i] === ".")) {
          if (input[i] === ".") {
            if (seenDot) throw new Error("malformed number");
            seenDot = true;
          }
          numStr += input[i];
          i++;
        }
        if (numStr === ".") throw new Error("malformed number");
        tokens.push({ kind: "number", value: parseFloat(numStr) });
        continue;
      }

      // identifiers: function names or constants
      if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z")) {
        var name = "";
        while (i < n && /[a-zA-Z]/.test(input[i])) {
          name += input[i];
          i++;
        }
        var lower = name.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(FUNCTIONS, lower)) {
          tokens.push({ kind: "func", name: lower });
        } else if (Object.prototype.hasOwnProperty.call(CONSTANTS, lower)) {
          tokens.push({ kind: "number", value: CONSTANTS[lower] });
        } else {
          throw new Error("unknown name: " + name);
        }
        continue;
      }

      if (ch === "(") {
        tokens.push({ kind: "lparen" });
        i++;
        continue;
      }
      if (ch === ")") {
        tokens.push({ kind: "rparen" });
        i++;
        continue;
      }
      if (ch === "!") {
        tokens.push({ kind: "fact" });
        i++;
        continue;
      }
      if (ch === "%") {
        tokens.push({ kind: "pct" });
        i++;
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(OPERATORS, ch)) {
        if ((ch === "-" || ch === "+") && prevAllowsUnary()) {
          // unary sign: drop unary plus, mark unary minus
          if (ch === "-") tokens.push({ kind: "uminus" });
          // unary '+' is a no-op; skip it
          i++;
          continue;
        }
        tokens.push({ kind: "op", value: ch });
        i++;
        continue;
      }

      throw new Error("unexpected character: " + ch);
    }

    return tokens;
  }

  // ----- shunting-yard: tokens -> RPN --------------------------------------
  function toRPN(tokens) {
    var output = [];
    var stack = [];

    function top() {
      return stack[stack.length - 1];
    }

    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      switch (t.kind) {
        case "number":
          output.push(t);
          break;
        case "func":
          stack.push(t);
          break;
        case "fact": // postfix unary — binds tightest, emit immediately
        case "pct":
          output.push(t);
          break;
        case "uminus":
          // right-associative, higher precedence than ^ for our purposes
          stack.push(t);
          break;
        case "op": {
          var o1 = OPERATORS[t.value];
          while (stack.length) {
            var s = top();
            if (s.kind === "op") {
              var o2 = OPERATORS[s.value];
              if (
                o2.prec > o1.prec ||
                (o2.prec === o1.prec && o1.assoc === "L")
              ) {
                output.push(stack.pop());
                continue;
              }
            } else if (s.kind === "uminus") {
              output.push(stack.pop());
              continue;
            }
            break;
          }
          stack.push(t);
          break;
        }
        case "lparen":
          stack.push(t);
          break;
        case "rparen": {
          var foundParen = false;
          while (stack.length) {
            var st = stack.pop();
            if (st.kind === "lparen") {
              foundParen = true;
              break;
            }
            output.push(st);
          }
          if (!foundParen) throw new Error("mismatched parentheses");
          if (stack.length && top().kind === "func") {
            output.push(stack.pop());
          }
          break;
        }
        default:
          throw new Error("unexpected token");
      }
    }

    while (stack.length) {
      var rem = stack.pop();
      if (rem.kind === "lparen" || rem.kind === "rparen") {
        throw new Error("mismatched parentheses");
      }
      output.push(rem);
    }

    return output;
  }

  // ----- evaluate RPN ------------------------------------------------------
  function evalRPN(rpn) {
    var stack = [];

    function pop() {
      if (!stack.length) throw new Error("malformed expression");
      return stack.pop();
    }

    for (var i = 0; i < rpn.length; i++) {
      var t = rpn[i];
      if (t.kind === "number") {
        stack.push(t.value);
      } else if (t.kind === "op") {
        var b = pop();
        var a = pop();
        stack.push(OPERATORS[t.value].apply(a, b));
      } else if (t.kind === "uminus") {
        stack.push(-pop());
      } else if (t.kind === "func") {
        stack.push(FUNCTIONS[t.name](pop()));
      } else if (t.kind === "fact") {
        stack.push(factorial(pop()));
      } else if (t.kind === "pct") {
        stack.push(pop() / 100);
      } else {
        throw new Error("unexpected token");
      }
    }

    if (stack.length !== 1) throw new Error("malformed expression");
    var result = stack[0];
    if (typeof result !== "number" || !isFinite(result)) {
      throw new Error("non-finite result");
    }
    return result;
  }

  // Public-ish entry point used by the UI (and unit-testable in isolation).
  function evaluate(expression) {
    var trimmed = String(expression).trim();
    if (trimmed === "") throw new Error("empty expression");
    return evalRPN(toRPN(tokenize(trimmed)));
  }

  // Format a number for the display without trailing float noise.
  function formatResult(value) {
    if (Number.isInteger(value)) return String(value);
    // round to 12 significant digits, then strip trailing zeros
    var rounded = parseFloat(value.toPrecision(12));
    return String(rounded);
  }

  // Expose for tests / debugging in non-browser contexts.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { evaluate: evaluate, formatResult: formatResult };
  }

  // ----- UI wiring ---------------------------------------------------------
  function initUI() {
    var display = document.getElementById("display");
    if (!display) return; // not in a browser DOM (e.g. unit tests)

    var expr = "";
    var justEvaluated = false; // result currently shown; next input resets
    var isError = false;

    function render() {
      display.textContent = expr === "" ? "0" : expr;
      display.classList.toggle("error", isError);
    }

    function resetIfNeeded() {
      // After "=" or an error, the next keystroke starts a fresh expression,
      // unless it is an operator that should continue from the result.
      if (justEvaluated || isError) {
        if (isError) expr = "";
        justEvaluated = false;
        isError = false;
      }
    }

    function insert(text) {
      // operators after a result continue from that result
      var isOperator = /^[+\-*/^]$/.test(text);
      if ((justEvaluated && !isError) && isOperator) {
        justEvaluated = false;
      } else {
        resetIfNeeded();
      }
      expr += text;
      render();
    }

    function backspace() {
      if (isError) {
        expr = "";
        isError = false;
      } else {
        resetIfNeeded();
        expr = expr.slice(0, -1);
      }
      render();
    }

    function clearAll() {
      expr = "";
      justEvaluated = false;
      isError = false;
      render();
    }

    function toggleSign() {
      resetIfNeeded();
      // Wrap the whole current expression in a negation if it has content.
      if (expr === "") {
        expr = "-";
      } else if (expr.indexOf("(-(") === 0 && expr.slice(-2) === "))") {
        expr = expr.slice(3, -2);
      } else {
        expr = "(-(" + expr + "))";
      }
      render();
    }

    function equals() {
      if (expr.trim() === "") return;
      try {
        var result = evaluate(expr);
        expr = formatResult(result);
        isError = false;
        justEvaluated = true;
      } catch (err) {
        expr = "Error";
        isError = true;
        justEvaluated = false;
      }
      render();
    }

    // Click handling via event delegation on both key grids.
    document.querySelectorAll(".keys").forEach(function (grid) {
      grid.addEventListener("click", function (event) {
        var btn = event.target.closest("button.key");
        if (!btn) return;
        var action = btn.getAttribute("data-action");
        if (action) {
          if (action === "clear") clearAll();
          else if (action === "back") backspace();
          else if (action === "sign") toggleSign();
          else if (action === "equals") equals();
        } else {
          var ins = btn.getAttribute("data-insert");
          if (ins !== null) insert(ins);
        }
      });
    });

    // Keyboard support.
    document.addEventListener("keydown", function (event) {
      var key = event.key;

      if (key >= "0" && key <= "9") {
        insert(key);
      } else if (key === ".") {
        insert(".");
      } else if (key === "+" || key === "-" || key === "*" || key === "/" || key === "^") {
        insert(key);
      } else if (key === "(" || key === ")") {
        insert(key);
      } else if (key === "%") {
        insert("%");
      } else if (key === "!") {
        insert("!");
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        equals();
      } else if (key === "Backspace") {
        event.preventDefault();
        backspace();
      } else if (key === "Escape") {
        clearAll();
      } else {
        return; // let other keys behave normally
      }
    });

    render();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initUI);
    } else {
      initUI();
    }
  }
})();
