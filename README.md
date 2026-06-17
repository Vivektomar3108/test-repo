# test-repo

## Calculator module

A small scientific `Calculator` built on Python's standard `math` module
(no runtime dependencies). It supports basic arithmetic plus exponential,
trigonometric, and logarithmic functions.

### Usage

```python
from calculator import Calculator

calc = Calculator()

calc.add(2, 3)        # 5.0
calc.div(10, 4)       # 2.5
calc.power(2, 10)     # 1024.0
calc.sqrt(9)          # 3.0
calc.factorial(5)     # 120
calc.sin(0)           # 0.0
calc.log(1000)        # 3.0  (base 10 by default)
calc.log(8, 2)        # 3.0
calc.ln(2.718281828)  # ~1.0
calc.exp(1)           # ~2.718...
```

Error cases raise the expected exceptions: `div(a, 0)` raises
`ZeroDivisionError`; `sqrt` / `factorial` of a negative number and `log` / `ln`
of a non-positive number raise `ValueError`.

### Running the tests

```bash
pytest
```

## Scientific calculator web UI

A single-page scientific calculator built with **vanilla HTML, CSS, and
JavaScript** — no build step, no framework, no npm, and no CDN. It works fully
offline.

### Opening the page

Just open the file in any modern browser:

```bash
open webui/index.html        # macOS
xdg-open webui/index.html    # Linux
```

Or double-click `webui/index.html` in a file manager. No server is required.

### Features

- Digits `0`–`9`, decimal point, and `=`.
- Arithmetic: `+ - * /`, parentheses, sign toggle (`+/-`), percent (`%`),
  clear (`C`), backspace (`←`).
- Scientific functions (angles in **radians**): `sin`, `cos`, `tan`,
  `log` (base 10), `ln`, `exp`, `x^y`, `sqrt`, `pi`, `e`, factorial (`n!`).
- Keyboard input: digits, operators, `Enter` (=), `Backspace` (←), `Escape` (C).
- Domain errors (divide by zero, `sqrt` of a negative, `log`/`ln` of a
  non-positive number, factorial of a negative number) show `Error` and reset
  on the next keystroke.

Expressions are parsed and evaluated with a small built-in tokenizer +
shunting-yard parser — **`eval()` is never called on input**.

The static assets under `webui/` are covered by `tests/test_webui.py`, which
runs as part of `pytest`.
