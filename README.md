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
