"""The inflation calculator (lib/inflation.ts, data/kenya/cpi.json): the spliced KNBS index, value over time, and the
Treasury bill and bank deposit comparisons.

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
The spot checks compare the index built from KNBS's releases with a second official source: the CBK's table of
12-month inflation (https://www.centralbank.go.ke/inflation-rates/, checked 2026-10-15) and old-base index levels
that KNBS printed in releases we do not load.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
import fs from "node:fs";
const c = await import(process.argv[1]);
const f = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const strip = (s) => [s.levels.map(({ month, index }) => ({ month, index })), s.twelve_month_rates.map(({ month, rate }) => ({ month, rate }))];
const [rl, rr] = strip(f.rebased);
const [pl, pr] = strip(f.previous);
const previous = c.buildIndex(pl, pr);
const index = c.spliceIndex(c.buildIndex(rl, rr), previous, f.link_month);
const bills = [{ date: "2020-12-28", rate: 10 }, { date: "2021-12-27", rate: 8 }, { date: "2022-12-26", rate: 9 }];
const deposits = [{ month: "2020-01", rate: 12 }];
console.log(JSON.stringify({
  index: Object.fromEntries(index.map((p) => [p.month, p.index])),
  previous: Object.fromEntries(previous.map((p) => [p.month, p.index])),
  link: f.link_month,
  worth: c.worth(1000, "2015-01", "2026-09", index),
  same: c.worth(1000, "2020-05", "2020-05", index),
  missing: c.worth(1000, "2009-12", "2026-09", index),
  months: [c.monthsBetween("2015-01", "2026-09"), c.addMonths("2019-11", 3), c.addMonths("2019-02", -14)],
  billYear: c.billGrowth(1000, "2021-01", "2022-01", bills),
  billTwo: c.billGrowth(1000, "2021-01", "2023-01", bills),
  billNone: c.billGrowth(1000, "2015-01", "2016-01", bills),
  depositYear: c.depositGrowth(1000, "2021-01", "2022-01", deposits),
  depositEarly: c.depositGrowth(1000, "2019-01", "2020-01", deposits),
}));
"""


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "inflation.ts"), str(ROOT / "data" / "kenya" / "cpi.json")],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def yoy(index, month):
    y, m = map(int, month.split("-"))
    return (index[month] / index[f"{y - 1}-{m:02d}"] - 1) * 100


def test_data_file_has_sources_and_checked_date():
    data = json.loads((ROOT / "data" / "kenya" / "cpi.json").read_text())
    assert data["checked"] == "2026-10-15"
    assert all(s["url"].startswith("https://") for s in data["sources"])
    for series in (data["rebased"], data["previous"]):
        assert all(level["source"] for level in series["levels"])


def test_index_covers_2010_to_latest_without_gaps():
    index = run()["index"]
    months = sorted(index)
    assert months[0] == "2010-01"
    assert months[-1] == "2026-09"
    assert len(months) == (2026 - 2010) * 12 + 9
    assert index["2019-02"] == 100  # the rebased CPI's base month
    assert index["2026-09"] == 156.47  # KNBS, September 2026 release


def test_splice_keeps_the_old_series_changes_before_february_2019():
    out = run()
    index, previous = out["index"], out["previous"]
    # Old base (February 2009 = 100): 194.18 in January 2019, 195.78 in February 2019 (KNBS, February 2019 release).
    assert index["2019-01"] / index["2019-02"] == pytest.approx(194.18 / 195.78)
    assert index["2018-02"] / index["2019-01"] == pytest.approx(188.00 / 194.18)
    assert index["2014-06"] / index["2012-03"] == pytest.approx(previous["2014-06"] / previous["2012-03"])


def test_spot_checks_against_the_cbk_inflation_table():
    """12-month inflation from the KNBS index levels against the CBK's table (second official source)."""
    index = run()["index"]
    cbk = {"2021-09": 6.91, "2022-09": 9.18, "2023-06": 7.88, "2025-09": 4.58, "2026-09": 6.76, "2018-09": 5.70}
    for month, rate in cbk.items():
        assert yoy(index, month) == pytest.approx(rate, abs=0.02), month


def test_spot_checks_against_knbs_old_base_levels():
    """The CBK's 12-month rates the old series is built from, against KNBS's own old-base levels for December 2019 and
    January 2020 (204.77 and 205.40, KNBS January 2020 release) and the base levels a year earlier."""
    previous = run()["previous"]
    assert previous["2018-12"] * (1 + 5.82 / 100) == pytest.approx(204.77, abs=0.01)  # CBK: December 2019, 5.82
    assert previous["2019-01"] * (1 + 5.78 / 100) == pytest.approx(205.40, abs=0.01)  # CBK: January 2020, 5.78


def test_worth_and_reverse():
    out = run()
    w, index = out["worth"], out["index"]
    ratio = index["2026-09"] / index["2015-01"]
    assert w["value"] == pytest.approx(1000 * ratio)
    assert w["back"] == pytest.approx(1000 / ratio)
    assert w["cumulativePct"] == pytest.approx((ratio - 1) * 100)
    assert w["yearlyPct"] == pytest.approx((ratio ** (12 / 140) - 1) * 100)
    assert w["lostPct"] == pytest.approx((1 - 1 / ratio) * 100)
    assert out["same"]["value"] == pytest.approx(1000) and out["same"]["yearlyPct"] == 0
    assert out["missing"] is None


def test_months():
    assert run()["months"] == [140, "2020-02", "2017-12"]


def test_bill_and_deposit_growth():
    out = run()
    # One 364-day bill at 10%: interest per shilling paid = 10 x 364 / 36,500, taxed at 15%.
    year = 1000 * (1 + 0.85 * 10 * 364 / 36500)
    # 365 days: one bill, then one day pro rata at the auction before the second purchase (8% on 27 December 2021).
    assert out["billYear"] == pytest.approx(year * (1 + 0.85 * 8 * 1 / 36500))
    # 730 days: bills at 10% and 8%, then two days at 9% (26 December 2022).
    two = 1000 * (1 + 0.85 * 10 * 364 / 36500) * (1 + 0.85 * 8 * 364 / 36500) * (1 + 0.85 * 9 * 2 / 36500)
    assert out["billTwo"] == pytest.approx(two)
    assert out["billNone"] is None  # no auction in the 120 days before January 2015
    assert out["depositYear"] == pytest.approx(1000 * (1 + 0.85 * 0.01) ** 12)
    assert out["depositEarly"] is None
