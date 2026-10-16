"""Workflow guards from the security reviews (docs/security/).

The repository is public: workflow inputs show in run logs and uploaded artifacts can be downloaded by any signed-in
GitHub user. So:
- no workflow uses pull_request_target (it runs PR code with the base repository's secrets and write token);
- no `run:` script interpolates a secret directly (secrets go through `env:`, review 2026-10-13 L-4);
- documents.yml takes no inputs and uploads no artifact (a private pack's signed link and PDF would be public,
  review 2026-10-16 M-1);
- fixtures.yml validates the folder name before writing it to $GITHUB_ENV (review 2026-10-16 L-1).
"""

from __future__ import annotations

import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
WORKFLOWS = sorted((ROOT / ".github/workflows").glob("*.yml"))


def _load(path: Path) -> dict:
    return yaml.safe_load(path.read_text())


def _on(doc: dict) -> dict:
    # PyYAML reads the bare key `on` as the boolean True.
    on = doc.get("on", doc.get(True))
    if isinstance(on, str):
        return {on: None}
    if isinstance(on, list):
        return {k: None for k in on}
    return on or {}


def test_there_are_workflows():
    assert WORKFLOWS


def test_no_pull_request_target():
    for path in WORKFLOWS:
        assert "pull_request_target" not in _on(_load(path)), path.name


def test_no_secret_interpolated_into_run_scripts():
    for path in WORKFLOWS:
        for job in (_load(path).get("jobs") or {}).values():
            for step in job.get("steps") or []:
                run = step.get("run") or ""
                assert not re.search(r"\$\{\{\s*secrets\.", run), f"{path.name}: {step.get('name') or run[:40]}"


def test_documents_workflow_has_no_private_path():
    doc = _load(ROOT / ".github/workflows/documents.yml")
    dispatch = _on(doc).get("workflow_dispatch")
    assert not (dispatch or {}).get("inputs"), "documents.yml must not take inputs (public run logs)"
    for job in doc["jobs"].values():
        for step in job.get("steps") or []:
            assert "upload-artifact" not in str(step.get("uses", "")), "documents.yml must not upload artifacts"


def test_fixtures_validates_before_github_env():
    text = (ROOT / ".github/workflows/fixtures.yml").read_text()
    check = text.index('=~ ^[a-z0-9_-]+$ ]]; then echo "bad folder"')
    write = text.index('echo "FOLDER=$FOLDER" >> "$GITHUB_ENV"')
    assert check < write
