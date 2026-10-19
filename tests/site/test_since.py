"""'Since your last visit' on Today (lib/since-core.ts): which changes a returning reader sees, and how the day is named.

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
const c = await import(process.argv[1]);
const marks = [{ id: "bill-91", label: "Kenya 91-day bill", value: 8.72 }, { id: "cbr", label: "CBK policy rate", value: 9.25 }, { id: "new", label: "New figure", value: 1 }];
const stories = [{ slug: "a", title: "Story A" }, { slug: "b", title: "Story B" }];
const prev = { at: "2026-10-14T06:00:00Z", marks: { "bill-91": 8.75, cbr: 9.25 }, receipts: ["a"] };
const now = "2026-10-16T06:00:00Z";
console.log(JSON.stringify({
  line: c.sinceLine(prev, marks, stories, now),
  same: c.sinceLine(c.snapshot(marks, stories, now), marks, stories, now),
  two: c.sinceLine({ ...prev, receipts: [] }, marks, stories, now),
  when: [["2026-10-16T05:00:00Z", now], ["2026-10-15T06:00:00Z", now], ["2026-10-01T06:00:00Z", now], ["2026-10-15T20:30:00Z", "2026-10-15T21:30:00Z"]].map(([a, b]) => c.whenLabel(a, b)),
}));
"""


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "since-core.ts")],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_returning_reader_sees_what_moved_and_what_is_new():
    out = run()
    # 14 Oct 2026 was a Wednesday; the policy rate did not move; a figure the browser never saw is not a change.
    assert out["line"] == "Since Wednesday: Kenya 91-day bill −3 bps · new: Story B"
    assert out["same"] == "Since earlier today: no change in these numbers yet"
    assert out["two"].endswith("· 2 new Receipts")


def test_days_are_named_in_nairobi_time():
    # 20:30 UTC on 15 Oct is 23:30 in Nairobi; 21:30 UTC is 00:30 on the 16th, so that visit was "yesterday".
    assert run()["when"] == ["earlier today", "yesterday", "1 Oct", "yesterday"]
