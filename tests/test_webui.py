"""Static checks for the vanilla scientific-calculator web UI.

There is no JS runtime in CI, so these tests assert the structural contract of
the static assets under ``webui/``: the files exist, they are self-contained
(no CDN / off-site scripts so the page works fully offline), every required
button is wired, and the expression logic does not lean on ``eval()``.
"""

import os
import re

import pytest

WEBUI_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "webui")


@pytest.fixture
def html():
    with open(os.path.join(WEBUI_DIR, "index.html"), encoding="utf-8") as fh:
        return fh.read()


@pytest.fixture
def css():
    with open(os.path.join(WEBUI_DIR, "styles.css"), encoding="utf-8") as fh:
        return fh.read()


@pytest.fixture
def js():
    with open(os.path.join(WEBUI_DIR, "app.js"), encoding="utf-8") as fh:
        return fh.read()


# --- files exist ------------------------------------------------------------
def test_webui_files_exist():
    for name in ("index.html", "styles.css", "app.js"):
        assert os.path.isfile(os.path.join(WEBUI_DIR, name)), name


# --- self-contained / offline ----------------------------------------------
def test_local_assets_are_referenced(html):
    assert 'href="styles.css"' in html
    assert 'src="app.js"' in html


def test_no_external_or_cdn_references(html):
    # No off-site scripts/links: the page must load with zero network requests.
    assert "http://" not in html
    assert "https://" not in html
    # No protocol-relative CDN URLs either (e.g. src="//cdn...").
    assert 'src="//' not in html
    assert 'href="//' not in html


def test_no_raw_eval(js):
    # eval() on raw input is explicitly forbidden by the task. Strip comments
    # first so prose mentioning eval() in the source docs does not count.
    no_block = re.sub(r"/\*.*?\*/", "", js, flags=re.DOTALL)
    no_line = re.sub(r"//[^\n]*", "", no_block)
    assert "eval(" not in no_line


# --- all required buttons are present --------------------------------------
DIGIT_AND_DOT = [str(d) for d in range(10)] + ["."]
ARITHMETIC = ["+", "-", "*", "/", "(", ")"]
SCIENTIFIC = ["sin(", "cos(", "tan(", "log(", "ln(", "exp(", "^", "sqrt(", "pi", "e", "!"]


@pytest.mark.parametrize("token", DIGIT_AND_DOT + ARITHMETIC + SCIENTIFIC)
def test_button_present(html, token):
    assert 'data-insert="%s"' % token in html


@pytest.mark.parametrize("action", ["clear", "back", "sign", "equals"])
def test_action_button_present(html, action):
    assert 'data-action="%s"' % action in html


# --- behaviour hooks the JS must implement ----------------------------------
def test_js_handles_error_cases(js):
    for needle in (
        "division by zero",
        "sqrt of negative",
        "factorial of negative",
        '"Error"',
    ):
        assert needle in js


def test_js_has_keyboard_support(js):
    assert "keydown" in js
    for key in ("Enter", "Backspace", "Escape"):
        assert key in js


def test_js_exposes_evaluate(js):
    # The pure evaluator is the unit-testable core of the parser.
    assert "function evaluate" in js


def test_display_element_present(html):
    assert 'id="display"' in html
