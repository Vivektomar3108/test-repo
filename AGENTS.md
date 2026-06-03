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
- Two GitHub tokens are present: the PAT embedded in the remote URL / `GH_TOKEN` is read-only
  (metadata only). The keyring OAuth token (`gho_`, via `gh auth token` with GH_TOKEN/GITHUB_TOKEN
  unset) has write access. Use the keyring token for `git push` and `gh` write operations.
- The repo started empty (no commits); `main` was bootstrapped with the initial scaffolding.

## Last updated
2026-06-03 — task #mock-001 (add /hello endpoint)
