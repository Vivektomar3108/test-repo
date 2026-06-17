import math

import pytest

from calculator import Calculator


@pytest.fixture
def calc():
    return Calculator()


# --- arithmetic -------------------------------------------------------------
def test_add(calc):
    assert calc.add(2, 3) == 5.0
    assert isinstance(calc.add(2, 3), float)


def test_sub(calc):
    assert calc.sub(5, 3) == 2.0


def test_mul(calc):
    assert calc.mul(4, 3) == 12.0


def test_div(calc):
    assert calc.div(10, 4) == 2.5


def test_div_by_zero_raises(calc):
    with pytest.raises(ZeroDivisionError):
        calc.div(1, 0)


# --- exponential ------------------------------------------------------------
def test_power(calc):
    assert calc.power(2, 10) == 1024.0


def test_sqrt(calc):
    assert calc.sqrt(9) == 3.0


def test_sqrt_negative_raises(calc):
    with pytest.raises(ValueError):
        calc.sqrt(-1)


def test_factorial(calc):
    assert calc.factorial(5) == 120
    assert isinstance(calc.factorial(5), int)


def test_factorial_negative_raises(calc):
    with pytest.raises(ValueError):
        calc.factorial(-1)


# --- trigonometry -----------------------------------------------------------
def test_sin(calc):
    assert calc.sin(0) == 0.0
    assert math.isclose(calc.sin(math.pi / 2), 1.0)


def test_cos(calc):
    assert calc.cos(0) == 1.0
    assert math.isclose(calc.cos(math.pi), -1.0)


def test_tan(calc):
    assert math.isclose(calc.tan(0), 0.0)
    assert math.isclose(calc.tan(math.pi / 4), 1.0)


# --- logarithms / exponentials ---------------------------------------------
def test_log_default_base_10(calc):
    assert math.isclose(calc.log(1000), 3.0)


def test_log_custom_base(calc):
    assert math.isclose(calc.log(8, 2), 3.0)


def test_log_non_positive_raises(calc):
    with pytest.raises(ValueError):
        calc.log(0)
    with pytest.raises(ValueError):
        calc.log(-5)


def test_ln(calc):
    assert math.isclose(calc.ln(math.e), 1.0)


def test_ln_non_positive_raises(calc):
    with pytest.raises(ValueError):
        calc.ln(0)


def test_exp(calc):
    assert math.isclose(calc.exp(1), math.e)
    assert math.isclose(calc.exp(0), 1.0)
