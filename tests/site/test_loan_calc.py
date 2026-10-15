"""The loan true-cost calculator (lib/loan-calc.ts): flat and reducing-balance loans, fees, and the true yearly rate.

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
const L = (o) => { const x = c.loanCost(o); delete x.schedule; return x; };
const base = { amount: 100000, months: 12 };
const flat = c.loanCost({ ...base, rate: 14, unit: "year", basis: "flat" });
console.log(JSON.stringify({
  reducing: L({ ...base, rate: 12, unit: "year", basis: "reducing" }),
  reducingMonth: L({ ...base, rate: 1, unit: "month", basis: "reducing" }),
  flat: { ...flat, schedule: undefined, lastBalance: flat.schedule.at(-1).balance, firstInterest: flat.schedule[0].interest, lastInterest: flat.schedule.at(-1).interest },
  fees: L({ ...base, rate: 12, unit: "year", basis: "reducing", upfrontFees: 2000, monthlyFees: 100 }),
  zero: L({ ...base, rate: 0, unit: "year", basis: "reducing" }),
  irr: c.irrMonthly(100000, 8884.88, 12),
}));
"""


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "loan-calc.ts")],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_reducing_balance_annuity():
    x = run()["reducing"]
    # 1% a month for 12 months on 100,000: the standard annuity of 8,884.88
    assert x["instalment"] == pytest.approx(8884.88, abs=0.01)
    assert x["totalInterest"] == pytest.approx(8884.88 * 12 - 100000, abs=0.1)
    # With no fees the true yearly rate is the quoted rate
    assert x["apr"] == pytest.approx(12, abs=1e-6)
    assert x["effective"] == pytest.approx((1.01**12 - 1) * 100, abs=1e-6)
    assert run()["reducingMonth"]["instalment"] == pytest.approx(x["instalment"])


def test_flat_rate_costs_more_than_it_says():
    x = run()["flat"]
    assert x["totalInterest"] == pytest.approx(14000)
    assert x["instalment"] == pytest.approx(9500)
    assert x["firstInterest"] == pytest.approx(x["lastInterest"])
    assert x["lastBalance"] == pytest.approx(0, abs=1e-6)
    assert 24 < x["apr"] < 26


def test_fees_raise_the_true_rate():
    out = run()
    f = out["fees"]
    assert f["received"] == 98000
    assert f["totalFees"] == pytest.approx(2000 + 1200)
    assert f["totalCost"] == pytest.approx(out["reducing"]["totalInterest"] + 3200, abs=0.1)
    assert f["apr"] > out["reducing"]["apr"] + 3


def test_zero_rate_and_irr():
    out = run()
    assert out["zero"]["instalment"] == pytest.approx(100000 / 12) and out["zero"]["apr"] == 0
    assert out["irr"] == pytest.approx(0.01, abs=1e-6)
