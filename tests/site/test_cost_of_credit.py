"""The Kenya Cost of Credit Index, v0 (lib/cost-of-credit.ts): the yardstick, the windows and minimums, the gaps, and
the reading from the files we hold today (data/kenya/rates.json, data/kenya/mobile_loans.json).

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
const k = await import(process.argv[1]);
const cases = JSON.parse(process.argv[2]);
const out = {};
for (const [name, c] of Object.entries(cases)) out[name] = c.fn ? k[c.fn](...c.args) : k.computeKcci(c);
console.log(JSON.stringify(out));
"""

BANK = {"month": "2026-08", "lending": 14.34, "source": "https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/"}
MSHWARI = {"product": "M-Shwari loan", "provider": "P1", "source": "https://example.org/a", "readOn": "2026-10-05", "termCostPct": 9.0, "days": 30, "from": False}
FULIZA = {"product": "Fuliza M-PESA overdraft", "provider": "P2", "source": "https://example.org/b", "readOn": "2026-10-05", "termCostPct": 19.0, "days": 30, "from": False}
TALA = {"product": "Tala loan", "provider": "P3", "source": "https://example.org/c", "readOn": "2026-10-05", "termCostPct": 9.0, "days": 30, "from": True}


def run(cases):
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "cost-of-credit.ts"), json.dumps(cases)],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def comp(reading, key):
    return next(c for c in reading["components"] if c["key"] == key)


def test_yardstick():
    x = run({"y": {"fn": "yearlySimple", "args": [9, 30]}, "p": {"fn": "per1000", "args": [14.34]}, "m": {"fn": "median", "args": [[3, 1, 2, 10]]}, "e": {"fn": "monthEnd", "args": ["2024-02"]}})
    assert x["y"] == pytest.approx(109.5)
    assert x["p"] == pytest.approx(1000 * 14.34 * 30 / 365 / 100)
    assert x["m"] == pytest.approx(2.5)
    assert x["e"] == "2024-02-29"


def test_full_reading_and_gaps():
    r = run({"r": {"asOf": "2026-10-22", "bank": BANK, "mobile": [MSHWARI, FULIZA, TALA]}})["r"]
    bank, mobile, sacco, apps = (comp(r, k) for k in ("bank", "mobile", "sacco", "loan_apps"))
    assert bank["status"] == "included" and bank["yearly"] == pytest.approx(14.34) and bank["per1000"] == pytest.approx(11.79)
    # Median of the two counted products (109.5% and 19% × 365 / 30 = 231.17%); the "from" price is shown, not counted.
    assert mobile["status"] == "included"
    assert mobile["yearly"] == pytest.approx((109.5 + 19 * 365 / 30) / 2, abs=0.01)
    assert mobile["per1000"] == pytest.approx(140.0, abs=0.01)
    tala = next(p for p in r["mobileProducts"] if p["product"] == "Tala loan")
    assert tala["counted"] is False and "from" in tala["reason"]
    # SACCO loans are a gap and loan-app reports are excluded: no figure for either, ever, in v0.
    assert sacco["status"] == "gap" and sacco["yearly"] is None
    assert apps["status"] == "excluded" and apps["yearly"] is None
    assert r["composite"] is None
    assert (r["included"], r["categories"]) == (2, 4)


def test_products_listed_alphabetically_not_ranked():
    r = run({"r": {"asOf": "2026-10-22", "bank": BANK, "mobile": [TALA, FULIZA, MSHWARI]}})["r"]
    assert [p["product"] for p in r["mobileProducts"]] == ["Fuliza M-PESA overdraft", "M-Shwari loan", "Tala loan"]


def test_stale_and_insufficient_inputs_print_nothing():
    old_bank = {**BANK, "month": "2026-03"}  # ended 31 Mar: more than 120 days before 22 Oct
    stale = {**FULIZA, "readOn": "2026-06-01"}  # read more than 92 days before
    x = run(
        {
            "stale": {"asOf": "2026-10-22", "bank": old_bank, "mobile": [MSHWARI, stale, TALA]},
            "none": {"asOf": "2026-10-22", "bank": None, "mobile": []},
            "future": {"asOf": "2026-08-15", "bank": BANK, "mobile": [MSHWARI, FULIZA]},
        }
    )
    s = x["stale"]
    assert comp(s, "bank")["status"] == "insufficient" and comp(s, "bank")["yearly"] is None
    # Only one counted product left: below the two-product minimum.
    assert comp(s, "mobile")["status"] == "insufficient" and comp(s, "mobile")["yearly"] is None
    assert s["included"] == 0
    assert comp(x["none"], "bank")["status"] == "insufficient"
    # A CBK month that has not ended by the reading date, and terms read after it, are not counted.
    f = x["future"]
    assert comp(f, "bank")["status"] == "insufficient"
    assert comp(f, "mobile")["status"] == "insufficient"


def test_reading_from_the_files_we_hold():
    """The v0 reading from today's data files: CBK's latest month and every published mobile-loan row."""
    rates = json.loads((ROOT / "data/kenya/rates.json").read_text())
    loans = json.loads((ROOT / "data/kenya/mobile_loans.json").read_text())["rows"]
    latest = max(rates["bank_rates"]["rows"], key=lambda r: r["month"])

    def term(r):
        if r["basis"] == "flat":
            return r["pct"]
        if r["basis"] == "per_day":
            return r["pct"] * r["days"]
        return r["pct"] + r.get("daily_kes_per_1000", 0) * r["days"] / 10

    mobile = [{"product": r["product"], "provider": r["provider"], "source": r["source"], "readOn": r["read_on"], "termCostPct": term(r), "days": r["days"], "from": r["from"]} for r in loans]
    as_of = max(r["read_on"] for r in loans)
    r = run({"r": {"asOf": as_of, "bank": {"month": latest["month"], "lending": latest["lending"], "source": rates["bank_rates"]["source"]}, "mobile": mobile}})["r"]
    for row in r["mobileProducts"]:
        assert row["source"].startswith("https://") and row["readOn"]
    assert comp(r, "bank")["yearly"] == pytest.approx(latest["lending"])
    counted = sorted(t["termCostPct"] * 365 / t["days"] for t in mobile if not t["from"])
    if len(counted) >= 2:
        mid = len(counted) // 2
        expect = counted[mid] if len(counted) % 2 else (counted[mid - 1] + counted[mid]) / 2
        assert comp(r, "mobile")["yearly"] == pytest.approx(expect, abs=0.01)
