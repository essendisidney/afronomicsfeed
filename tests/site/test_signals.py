"""Reader signals (lib/signals-core.ts, lib/track.ts): read depth, return windows, empty searches, and the buckets the server accepts.

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
const s = await import(process.argv[1]);
const [fn, ...calls] = JSON.parse(process.argv[2]);
console.log(JSON.stringify(calls.map((args) => s[fn](...args))));
"""


def run(fn, *calls, module="signals-core"):
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / f"{module}.ts"), json.dumps([fn, *calls])],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_depths_reached_counts_the_end_from_97_percent():
    assert run("depthsReached", [0.1], [0.26], [0.74], [0.97], [1.0]) == [[], [25], [25, 50], [25, 50, 75, 100], [25, 50, 75, 100]]


def test_cohort_week_is_the_iso_week():
    # 19 Oct 2026 is a Monday in ISO week 43; 1 Jan 2027 (a Friday) still belongs to 2026-w53.
    assert run("cohortWeek", ["2026-10-19"], ["2026-10-25"], ["2027-01-01"], ["2027-01-04"]) == ["2026-w43", "2026-w43", "2026-w53", "2027-w01"]


def test_return_windows():
    first = "2026-10-01"
    days = ["2026-10-01", "2026-10-02", "2026-10-08", "2026-10-09", "2026-10-29", "2026-10-30", "2026-12-24", "2026-12-25"]
    assert run("returnWindow", *[[first, d] for d in days]) == [None, "w1", "w1", "w2-4", "w2-4", "w5-12", "w5-12", None]


def test_searches_are_cleaned_and_contact_details_never_kept():
    out = run(
        "cleanSearch",
        ["  Dangote IPO! "],
        ["Kenya 91-day T-bill"],
        ["ab"],
        ["jane@example.com"],
        ["0712 345 678"],
        ["ID 12345678"],
        ["inflation 2024"],
        ["Côte d'Ivoire"],
    )
    assert out == ["dangote-ipo", "kenya-91-day-t-bill", None, None, None, None, "inflation-2024", "cote-divoire"]


def test_the_server_only_accepts_known_buckets():
    cases = [
        ["read_depth", "50"],
        ["read_depth", "60"],
        ["engaged", "120"],
        ["engaged", "45"],
        ["first_visit", "2026-w43"],
        ["first_visit", "2026-43"],
        ["return_reader", "2026-w43.w1"],
        ["return_reader", "2026-w43.w9"],
        ["search_miss", "dangote-ipo"],
        ["search_miss", "a"],
        ["search_miss", "drop table;"],
        ["share", "whatsapp"],
    ]
    assert run("signalSuffix", *cases, module="track") == ["50", None, "120", None, "2026-w43", None, "2026-w43.w1", None, "dangote-ipo", None, None, None]


def test_buckets_are_stored_after_a_comma_and_every_name_is_in_the_migration():
    paths = run("eventPath", ["read_depth", "/brief/x", "50"], ["search_miss", "/search", "dangote-ipo"], ["read_depth", "/brief/x", "9"], module="track")
    assert paths == ["/brief/x,50", "/search,dangote-ipo", "/brief/x"]
    sql = (ROOT / "supabase" / "migrations" / "0043_reader_signals.sql").read_text()
    for name in ("read_depth", "engaged", "first_visit", "return_reader", "search_miss"):
        assert f"'{name}'" in sql
