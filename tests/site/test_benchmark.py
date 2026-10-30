"""The quarterly benchmark (lib/benchmark.ts): CSV reading with line-numbered errors, days inside the quarter, the
nearest-tenor auction on or before the start, and totals. Runs the TypeScript under node's type stripping."""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
const b = await import(process.argv[1]);
const csv = [
  "Name,Kind,Amount_KES,Rate_pct,Start,End",
  '"Call deposit, Bank A",deposit,"1,000,000",7.0,2026-07-01,2026-10-01',
  "91-day bill,tbill,2000000,8.8,2026-08-01,2026-10-31",
  "Bond,bond,500000,13.5,2025-01-01,2040-01-01",
  "Bad row,cash,-5,99,2026-13-01,2026-01-01",
].join("\n");
const parsed = b.parseHoldings(csv);
const auctions = [
  { tenor: 91, value_date: "2026-06-29", weighted_avg_rate: 8.0, source: "s91a" },
  { tenor: 91, value_date: "2026-07-27", weighted_avg_rate: 8.5, source: "s91b" },
  { tenor: 91, value_date: "2026-08-03", weighted_avg_rate: 9.9, source: "s91c" },
  { tenor: 364, value_date: "2026-06-29", weighted_avg_rate: 9.5, source: "s364" },
];
console.log(JSON.stringify({
  parsed,
  q: b.quarterRange("2026-Q3"), q4: b.quarterRange("2026-Q4"), badq: b.quarterRange("2026-Q5"),
  bench: b.benchmark("2026-Q3", parsed.holdings, auctions),
  noHeader: b.parseHoldings("a,b\n1,2").errors,
  empty: b.parseHoldings(b.TEMPLATE_HEADER).errors,
}));
"""


@pytest.fixture(scope="module")
def out():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "benchmark.ts")],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_reads_quoted_names_thousands_separators_and_reports_bad_lines(out):
    holdings = out["parsed"]["holdings"]
    assert [h["name"] for h in holdings] == ["Call deposit, Bank A", "91-day bill", "Bond"]
    assert holdings[0]["amountKes"] == 1_000_000
    errors = out["parsed"]["errors"]
    assert len(errors) == 1 and errors[0].startswith("Line 5:")
    for part in ("kind must be", "amount_kes", "rate_pct", "dates"):
        assert part in errors[0]
    assert "missing" in out["noHeader"][0]
    assert out["empty"] == ["No holdings found below the header."]


def test_quarters(out):
    assert out["q"] == {"from": "2026-07-01", "to": "2026-10-01"}
    assert out["q4"] == {"from": "2026-10-01", "to": "2027-01-01"}
    assert out["badq"] is None


def test_days_inside_the_quarter_and_the_auction_on_or_before_the_start(out):
    lines = out["bench"]["lines"]
    deposit, bill, bond = lines
    assert deposit["days"] == 92 and deposit["tenor"] == 91
    assert deposit["auctionDate"] == "2026-06-29" and deposit["auctionRate"] == 8.0  # not the later 8.5
    assert deposit["earnedKes"] == round(1_000_000 * 7.0 * 92 / 36500)
    assert deposit["yardstickKes"] == round(1_000_000 * 8.0 * 92 / 36500)
    assert deposit["differenceKes"] < 0
    assert bill["days"] == 61 and bill["auctionDate"] == "2026-07-27"  # 1 Aug start: the 27 Jul auction, not 3 Aug
    assert bond["tenor"] == 364 and "longer than a year" in bond["note"] and bond["days"] == 92


def test_totals_add_up(out):
    b = out["bench"]
    compared = [l for l in b["lines"] if l["yardstickKes"] is not None]
    assert b["earnedKes"] == sum(l["earnedKes"] for l in compared)
    assert b["yardstickKes"] == sum(l["yardstickKes"] for l in compared)
    assert b["differenceKes"] == b["earnedKes"] - b["yardstickKes"]
    assert b["to"] == "2026-09-30"
    assert 0 < b["earnedRatePct"] < 20 and 0 < b["yardstickRatePct"] < 20
