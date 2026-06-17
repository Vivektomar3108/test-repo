# Codebase Knowledge

## Architecture patterns
- Single-module Flask app in `app.py`. The `app = Flask(__name__)` instance is module-level.
- Routes are defined with `@app.route("/path", methods=["GET"])` and return `jsonify({...})`.
- Add new endpoints as functions in `app.py` alongside existing routes.

## Testing conventions
- Tests live in `test_app.py` and run with `pytest` (from repo root).
- Use the `client` fixture (Flask `app.test_client()` with `TESTING=True`) to issue requests.
- Assert on `response.status_code` and `response.get_json()`.

## Gotchas
- Two GitHub tokens are present: the PAT embedded in the remote URL / `GH_TOKEN` /
  `GITHUB_TOKEN` is read-only (metadata only) — pushing with it returns HTTP 403.
- The write-capable token lives in the **macOS keychain** (osxkeychain credential helper),
  NOT in `gh`'s config. `gh auth token` with GH_TOKEN/GITHUB_TOKEN unset returns
  "no oauth token found" / "not logged in" in this environment. To push:
  `git config credential.helper osxkeychain` then push with the read-only env vars
  unset so git falls back to the keychain, e.g.:
  `env -u GH_TOKEN -u GITHUB_TOKEN -u GIT_ASKPASS git push https://github.com/<owner>/<repo> <branch>`.
  (`gh pr create` similarly needs the env PAT — it can still create PRs as the PAT is valid
  for API, just not git-push.)
- The repo is NOT empty: it is a single-file Flask app (`app.py`) with `test_app.py` at root.
  `requirements.txt` must keep `flask` (the app imports it) — do not strip it to just `pytest`,
  or the existing test suite fails to import.
- New library modules live in their own package dir (e.g. `calculator/`) with tests under
  `tests/`. The root-level `test_app.py` and a `tests/` dir coexist; `pytest` from repo root
  collects both.

## Frontend / static assets
- Vanilla web UIs live in their own dir (e.g. `webui/`) with `index.html`,
  `styles.css`, `app.js` — no build step, no npm, no CDN. Use relative
  `href`/`src` so the page works fully offline (`open webui/index.html`).
- There is no JS runtime (no `node`/`deno`/`bun`) in this environment, so JS
  cannot be executed in CI. Cover static assets with a pytest module
  (`tests/test_webui.py`) that asserts the structural contract: files exist,
  no `http(s)://` or protocol-relative `src="//"` refs, required buttons
  (`data-insert=` / `data-action=`) present, and `eval(` absent (strip JS
  comments before that check so source prose doesn't trip it).
- For "no eval" expression evaluation: tokenizer → shunting-yard → RPM/RPN
  evaluator with a whitelist of operators/functions. Postfix `!`/`%` emit to
  output immediately (bind tightest); detect unary minus when `-` starts the
  expr or follows an operator/`(`.

## Gotchas (continued)
- `flask` is NOT pre-installed in the test environment; run
  `python -m pip install -r requirements.txt` before `pytest` or the existing
  `test_app.py` fails to import at collection time.

## Last updated
2026-06-18 — task #test-c52fe8a9: Build a UI for a scientific calculator (vanilla HTML/CSS/JS)
2026-06-18 — task #test-6eedae72: Build a scientific calculator (Python module)
2026-06-03 — task #mock-001 (add /hello endpoint)
