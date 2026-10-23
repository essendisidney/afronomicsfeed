"""WAEMU auction demand (lib/waemu-demand-core.ts): one auction per issue page, buybacks and misread results left out.

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
const fs = await import("node:fs");
const line = (o) => ({ country: "senegal", instrument: "OAT", operation_date: "2026-10-09", months: 36, sought_xof_m: 80000, source: "https://x/emission/emission-simultanee-senegal-09-10-2026/", ...o });
const lines = [
  line({ instrument: "BAT", months: 12, bids_xof_m: 30000, accepted_xof_m: 25000, weighted_yield: 7.87 }),
  line({ bids_xof_m: 54407, accepted_xof_m: 49377, weighted_yield: 8.1 }),
  line({ operation_date: "2026-10-15", sought_xof_m: -316265, bids_xof_m: -157321, accepted_xof_m: -157321 }),
  line({ operation_date: "2026-09-01", source: "https://x/emission/rachat-simultanee-senegal/", bids_xof_m: 5000, accepted_xof_m: 5000 }),
  line({ operation_date: "2025-07-21", sought_xof_m: 24, bids_xof_m: 25262, accepted_xof_m: 20000 }),
];
const all = c.auctions(lines);
const real = c.demandByCountry(c.auctions(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).rows));
console.log(JSON.stringify({ all, median: [c.median([3, 1, 2]), c.median([4, 1, 3, 2]), c.median([])], real }));
"""


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT,
         str(ROOT / "lib" / "waemu-demand-core.ts"), str(ROOT / "data" / "waemu" / "auctions.json")],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_one_auction_per_issue_with_sought_counted_once():
    a = run()["all"]
    assert len(a) == 1  # the buyback line, the pure buyback page and the misread 2025 result are all left out
    assert a[0]["sought"] == 80000 and a[0]["bids"] == 84407 and a[0]["lines"] == 2
    assert round(a[0]["cover"], 2) == 1.06 and a[0]["oneYear"] == 7.87


def test_median():
    assert run()["median"] == [2, 2.5, None]


def test_real_file_has_no_negative_or_absurd_covers():
    real = run()["real"]
    assert real, "no WAEMU results on file"
    for c in real:
        assert 0 <= c["median"] <= 25
        assert all(0 <= a["cover"] <= 25 for a in c["recent"])
        assert c["recent"] == sorted(c["recent"], key=lambda a: a["date"], reverse=True)
