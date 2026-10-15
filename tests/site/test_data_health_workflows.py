"""The desk cockpit's health lane (docs/rebuild/phase-7b-plan.md, 7b-1): workflow failures counted from GitHub's API."""

from __future__ import annotations

import io
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

import data_health  # noqa: E402


def run(name, conclusion, at, status="completed"):
    return {"name": name, "conclusion": conclusion, "status": status, "created_at": at}


def fake_api(monkeypatch, runs):
    monkeypatch.setenv("GITHUB_TOKEN", "t")
    monkeypatch.setenv("GITHUB_REPOSITORY", "o/r")
    body = json.dumps({"workflow_runs": runs}).encode()
    monkeypatch.setattr(data_health.urllib.request, "urlopen", lambda req, timeout=0: io.BytesIO(body))


def test_failures_in_a_row_stop_at_the_last_success(monkeypatch):
    fake_api(monkeypatch, [
        run("Site QA", "failure", "2026-10-15T07:00:00Z"),
        run("Site QA", "failure", "2026-10-15T05:00:00Z"),
        run("Site QA", "success", "2026-10-14T23:00:00Z"),
        run("Site QA", "failure", "2026-10-14T20:00:00Z"),
        run("Morning note", "success", "2026-10-15T04:00:00Z"),
        run("Morning note", "cancelled", "2026-10-15T06:00:00Z"),
        run("Probe", None, "2026-10-15T08:00:00Z", status="in_progress"),
    ])
    flows = {w["name"]: w for w in data_health.workflows()}
    assert flows["Site QA"]["failures_in_row"] == 2 and flows["Site QA"]["result"] == "failure"
    assert flows["Morning note"] == {"name": "Morning note", "result": "success", "day": "2026-10-15", "failures_in_row": 0}
    assert "Probe" not in flows  # still running: no result yet


def test_no_token_means_no_network_and_no_entries(monkeypatch):
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    assert data_health.workflows() == []
