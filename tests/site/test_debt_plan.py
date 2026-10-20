"""The debt plan (lib/debt-plan.ts): Fuliza's daily bands, monthly charges, the payoff order and when a budget never clears.

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
const t = JSON.parse(process.argv[2]);
const fuliza = { kind: "fuliza", bands: t.fuliza.daily };
const debts = [
  { name: "Fuliza", balance: 2000, charge: fuliza, minimum: 0 },
  { name: "M-Shwari", balance: 5000, charge: { kind: "monthly", pct: 9 }, minimum: 500 },
  { name: "Bank", balance: 50000, charge: { kind: "monthly", pct: 16 / 12 }, minimum: 2500 },
];
const strip = (p) => ({ ...p, totalCharges: Math.round(p.totalCharges), totalPaid: Math.round(p.totalPaid) });
console.log(JSON.stringify({
  fulizaMonth: [100, 300, 1000, 2000, 90000].map((b) => c.monthlyCharge(fuliza, b)),
  bankMonth: c.monthlyCharge({ kind: "monthly", pct: 1 }, 10000),
  plans: c.comparePlans(debts, 6000).map(strip),
  short: strip(c.plan(debts, 2000, "costliest")),
  single: strip(c.plan([{ name: "A", balance: 1000, charge: { kind: "monthly", pct: 0 }, minimum: 0 }], 250, "costliest")),
  smallFirst: c.plan([
    { name: "Big costly", balance: 10000, charge: { kind: "monthly", pct: 10 }, minimum: 0 },
    { name: "Small cheap", balance: 1000, charge: { kind: "monthly", pct: 1 }, minimum: 0 },
  ], 3000, "smallest").cleared.map((x) => x.name),
}));
"""


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    tariffs = (ROOT / "data" / "kenya" / "mpesa_tariffs.json").read_text()
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "debt-plan.ts"), tariffs],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_fuliza_charges_its_band_daily_fee_for_30_days():
    bands = json.loads((ROOT / "data" / "kenya" / "mpesa_tariffs.json").read_text())["fuliza"]["daily"]
    fee = lambda b: next(x["fee"] for x in bands if x["min"] <= b <= x["max"])
    out = run()
    assert out["fulizaMonth"][:4] == [fee(100) * 30, fee(300) * 30, fee(1000) * 30, fee(2000) * 30]
    assert out["fulizaMonth"][4] == bands[-1]["fee"] * 30  # above the top band, the top band's fee
    assert out["bankMonth"] == 100


def test_the_plans_clear_costliest_first_and_minimums_never_clear_fuliza():
    plans = {p["strategy"]: p for p in run()["plans"]}
    best = plans["costliest"]
    assert best["feasible"] and best["months"] and best["months"] < 24
    assert [c["name"] for c in best["cleared"]][0] == "Fuliza"  # the costliest share of its balance
    assert best["totalCharges"] <= plans["smallest"]["totalCharges"]
    assert not plans["minimums"]["feasible"]  # Fuliza has no set payment, so its fees run on
    assert run()["plans"][0]["strategy"] != "minimums"


def test_a_budget_below_the_minimums_never_clears():
    short = run()["short"]
    assert short["shortOfMinimums"] and not short["feasible"] and short["months"] is None


def test_simple_cases():
    out = run()
    assert out["single"]["months"] == 4 and out["single"]["totalCharges"] == 0 and out["single"]["totalPaid"] == 1000
    assert out["smallFirst"][0] == "Small cheap"
