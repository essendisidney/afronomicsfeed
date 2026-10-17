"""Front-page rotation (lib/rotation.ts): Today changes every 3 hours, Nairobi time, without hiding a new story.

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import shutil
import subprocess
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
NAIROBI = timezone(timedelta(hours=3))
SCRIPT = r"""
const r = await import(process.argv[1]);
const cases = JSON.parse(process.argv[2]);
const out = cases.map(({ now, receipts, row }) => ({
  slot: r.slotOf(now),
  ends: r.slotEnds(now),
  lead: r.pickLead(receipts, now)?.slug ?? null,
  pool: r.leadPool(receipts, now).map((x) => x.slug),
  row: row ? r.rotateRow(row, 4, now) : null,
}));
console.log(JSON.stringify(out));
"""

OLD = [{"slug": f"2026-10-15-s{i}", "date": "2026-10-15"} for i in range(6)]
STALE = [{"slug": "2026-08-01-old", "date": "2026-08-01"}, {"slug": "2026-07-01-older", "date": "2026-07-01"}]


def ms(y, m, d, h, mi=0):
    return int(datetime(y, m, d, h, mi, tzinfo=NAIROBI).timestamp() * 1000)


def run(cases):
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "rotation.ts"), json.dumps(cases)],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_windows_are_three_hours_in_nairobi_time():
    a, b, c = run([{"now": ms(2026, 10, 17, 9, 0), "receipts": []}, {"now": ms(2026, 10, 17, 11, 59), "receipts": []}, {"now": ms(2026, 10, 17, 12, 0), "receipts": []}])
    assert a["slot"] == b["slot"] and c["slot"] == a["slot"] + 1
    assert a["ends"] == ms(2026, 10, 17, 12, 0)


def test_lead_takes_turns_among_recent_receipts():
    cases = [{"now": ms(2026, 10, 17, h), "receipts": OLD} for h in range(0, 24, 3)]
    leads = [c["lead"] for c in run(cases)]
    assert set(leads) == {r["slug"] for r in OLD}, "every recent Receipt leads at some point in the day"
    assert all(a != b for a, b in zip(leads, leads[1:])), "the lead changes every window"


def test_a_receipt_published_today_always_leads():
    new = {"slug": "2026-10-17-new", "date": "2026-10-17"}
    out = run([{"now": ms(2026, 10, 17, h), "receipts": OLD + [new]} for h in range(0, 24, 3)])
    assert {c["lead"] for c in out} == {new["slug"]}


def test_two_today_take_turns_and_stale_ones_fall_back_to_newest():
    two = [{"slug": "2026-10-17-a", "date": "2026-10-17"}, {"slug": "2026-10-17-b", "date": "2026-10-17"}]
    out = run([{"now": ms(2026, 10, 17, h), "receipts": OLD + two} for h in (9, 12)] + [{"now": ms(2026, 10, 17, 9), "receipts": STALE}, {"now": ms(2026, 10, 17, 9), "receipts": []}])
    assert {out[0]["lead"], out[1]["lead"]} == {"2026-10-17-a", "2026-10-17-b"}
    assert out[2]["pool"] == ["2026-08-01-old"] and out[2]["lead"] == "2026-08-01-old"
    assert out[3]["lead"] is None


def test_rows_keep_the_newest_first_and_rotate_the_rest():
    row = [f"c{i}" for i in range(10)]
    out = run([{"now": ms(2026, 10, 17, h), "receipts": [], "row": row} for h in (9, 12)] + [{"now": ms(2026, 10, 17, 9), "receipts": [], "row": row[:3]}])
    first, second, short = (c["row"] for c in out)
    assert first[0] == second[0] == "c0" and len(first) == len(second) == 4
    assert len(set(first)) == 4 and first != second
    assert short == ["c0", "c1", "c2"]
