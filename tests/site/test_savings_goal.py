"""The savings goal planner (lib/savings-goal.ts): monthly saving needed for a goal, by place and rate.

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
const fund = { name: "Fund", net: 12, effective: true, note: "" };
const bank = { name: "Bank", net: 12, effective: false, note: "" };
const cash = { name: "Cash", net: 0, effective: false, note: "" };
console.log(JSON.stringify({
  rFund: c.monthlyRate(fund), rBank: c.monthlyRate(bank),
  cash: c.monthlyNeeded(60000, 0, 12, 0), bank: c.monthlyNeeded(60000, 0, 12, 0.01),
  fv: c.futureValue(0, c.monthlyNeeded(60000, 0, 12, 0.01), 12, 0.01),
  covered: c.monthlyNeeded(10000, 20000, 6, 0.01),
  withStart: c.monthlyNeeded(60000, 12000, 12, 0),
  plan: c.plan(60000, 0, 12, [cash, bank, fund]).map((x) => [x.place.name, x.monthly, x.interest, x.paidIn]),
  months: [c.monthsUntil("2026-10-15", "2027-01"), c.monthsUntil("2026-10-15", "2026-10"), c.monthsUntil("2026-10-15", "2027-10")],
}));
"""


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "savings-goal.ts")],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_monthly_rates():
    out = run()
    assert out["rBank"] == pytest.approx(0.01)
    assert (1 + out["rFund"]) ** 12 == pytest.approx(1.12)


def test_monthly_needed_reaches_the_goal():
    out = run()
    assert out["cash"] == pytest.approx(5000)
    # Ordinary annuity: 60,000 x 0.01 / (1.01^12 - 1)
    assert out["bank"] == pytest.approx(60000 * 0.01 / (1.01**12 - 1))
    assert out["fv"] == pytest.approx(60000)
    assert out["withStart"] == pytest.approx(4000)
    assert out["covered"] == 0


def test_plan_orders_cheapest_first_and_counts_interest():
    rows = run()["plan"]
    assert [r[0] for r in rows] == ["Bank", "Fund", "Cash"]
    for name, monthly, interest, paid_in in rows:
        assert paid_in + interest == pytest.approx(60000, abs=0.01)
    assert rows[-1][2] == 0


def test_months_until():
    assert run()["months"] == [3, 1, 12]
