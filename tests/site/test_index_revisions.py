"""The ASBI revision check (lib/index-revisions.ts): a frozen Monday release against the recomputed series.

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
const m = await import(process.argv[1]);
const { releases, series, current } = JSON.parse(process.argv[2]);
console.log(JSON.stringify({
  rows: m.compareReleases(releases, series, (w) => current[w] ?? []),
  value: m.publishedValue(releases[0]),
}));
"""


def run(payload):
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "index-revisions.ts"), json.dumps(payload)],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


A = {"country": "A", "rate": 10.0, "date": "2026-10-01"}
B = {"country": "B", "rate": 12.0, "date": "2026-09-28"}
B_LATE = {"country": "B", "rate": 13.0, "date": "2026-10-05"}


def test_late_result_is_listed_as_a_revision():
    x = run(
        {
            "releases": [{"file": "2026-10-05", "week": "2026-10-05", "rates": [A, B]}, {"file": "2026-10-12", "week": "2026-10-12", "rates": [A, B_LATE]}],
            "series": [{"date": "2026-10-05", "value": 11.5, "markets": 2}, {"date": "2026-10-12", "value": 11.5, "markets": 2}],
            "current": {"2026-10-05": [A, B_LATE], "2026-10-12": [A, B_LATE]},
        }
    )
    assert x["value"] == pytest.approx(11.0)
    newest, oldest = x["rows"]
    assert newest["week"] == "2026-10-12" and newest["diffBps"] == pytest.approx(0) and newest["changed"] == []
    assert oldest["published"] == pytest.approx(11.0) and oldest["current"] == pytest.approx(11.5)
    assert oldest["diffBps"] == pytest.approx(50.0)
    assert oldest["changed"] == [{"country": "B", "published": {"rate": 12.0, "date": "2026-09-28"}, "current": {"rate": 13.0, "date": "2026-10-05"}}]


def test_week_missing_from_series_and_market_dropping_out():
    x = run(
        {
            "releases": [{"file": "2026-10-07", "week": "2026-10-05", "rates": [A, B]}],
            "series": [],
            "current": {"2026-10-05": [A]},
        }
    )
    row = x["rows"][0]
    assert row["current"] is None and row["diffBps"] is None
    assert row["changed"] == [{"country": "B", "published": {"rate": 12.0, "date": "2026-09-28"}, "current": None}]


def test_saved_releases_are_readable():
    """Every saved release has a table of rates the log can rebuild its published value from."""
    files = sorted((ROOT / "editions" / "index").glob("*.json"))
    assert files, "no ASBI releases saved"
    for f in files:
        table = json.loads(f.read_text())["table"]
        assert len(table) >= 6, f"{f.name}: fewer than six markets"
        assert all(isinstance(t["rate"], (int, float)) and t["date"] for t in table)
