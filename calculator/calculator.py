"""A small scientific calculator.

Exposes a single ``Calculator`` class with one method per operation so it can
be used as a library today and as the basis for a CLI later. All methods rely
only on the standard :mod:`math` module (no third-party runtime dependencies).
"""

import math


class Calculator:
    """Basic arithmetic plus a small set of scientific functions.

    All methods return ``float`` except :meth:`factorial`, which returns ``int``.
    """

    # --- arithmetic ---------------------------------------------------------
    def add(self, a, b):
        """Return ``a + b`` as a float."""
        return float(a + b)

    def sub(self, a, b):
        """Return ``a - b`` as a float."""
        return float(a - b)

    def mul(self, a, b):
        """Return ``a * b`` as a float."""
        return float(a * b)

    def div(self, a, b):
        """Return ``a / b`` as a float.

        Raises:
            ZeroDivisionError: if ``b`` is zero.
        """
        if b == 0:
            raise ZeroDivisionError("division by zero")
        return float(a / b)

    # --- exponential --------------------------------------------------------
    def power(self, base, exp):
        """Return ``base`` raised to ``exp`` as a float."""
        return float(math.pow(base, exp))

    def sqrt(self, x):
        """Return the square root of ``x`` as a float.

        Raises:
            ValueError: if ``x`` is negative.
        """
        if x < 0:
            raise ValueError("cannot take the square root of a negative number")
        return float(math.sqrt(x))

    def factorial(self, n):
        """Return ``n!`` as an int.

        Raises:
            ValueError: if ``n`` is negative (or not an integer).
        """
        if n < 0:
            raise ValueError("factorial is not defined for negative numbers")
        return int(math.factorial(n))

    # --- trigonometry (radians) --------------------------------------------
    def sin(self, x):
        """Return the sine of ``x`` (radians) as a float."""
        return float(math.sin(x))

    def cos(self, x):
        """Return the cosine of ``x`` (radians) as a float."""
        return float(math.cos(x))

    def tan(self, x):
        """Return the tangent of ``x`` (radians) as a float."""
        return float(math.tan(x))

    # --- logarithms / exponentials -----------------------------------------
    def log(self, x, base=10):
        """Return the logarithm of ``x`` to the given ``base`` (default 10).

        Raises:
            ValueError: if ``x`` is not positive.
        """
        if x <= 0:
            raise ValueError("logarithm is only defined for positive numbers")
        return float(math.log(x, base))

    def ln(self, x):
        """Return the natural logarithm of ``x`` as a float.

        Raises:
            ValueError: if ``x`` is not positive.
        """
        if x <= 0:
            raise ValueError("logarithm is only defined for positive numbers")
        return float(math.log(x))

    def exp(self, x):
        """Return ``e`` raised to ``x`` as a float."""
        return float(math.exp(x))
