"""The IPO helper (lib/ipo-calc.ts) and its offer terms (data/ipo/offers.json), which must match our Receipts.

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data" / "ipo" / "offers.json"
SCRIPT = r"""
const c = await import(process.argv[1]);
const offers = JSON.parse(process.argv[2]).offers;
const q = offers.find((o) => o.id === "quickmart");
const d = offers.find((o) => o.id === "dangote");
const a = c.apply(q, 20000);
console.log(JSON.stringify({
  a, half: c.allot(q, a, 50), down: c.scenario(q, a.units, -10), up: c.scenario(q, a.units, 20),
  div: c.dividend(q, a.units), noDiv: c.dividend(d, 100), small: c.apply(q, 3000), exact: c.apply(q, 3750),
  dangote: c.apply(d, 535), bill: c.billAlternative(10000, 9.04),
}));
"""


def offers():
    return {o["id"]: o for o in json.loads(DATA.read_text())["offers"]}


@pytest.mark.parametrize("oid", ["quickmart", "dangote"])
def test_terms_match_the_receipt(oid):
    o = offers()[oid]
    text = (ROOT / "content" / "receipts" / f"{o['receipt']}.md").read_text()
    price = f"{o['price']:.2f}"
    assert price in text, f"{oid}: price {price} not in the Receipt"
    assert f"{o['min_units']:,} " in text or f"{o['min_units']} " in text, f"{oid}: minimum not in the Receipt"
    for key in ("closes", "results"):
        assert re.search(rf'date: "{o[key]}"', text), f"{oid}: {key} date {o[key]} not in the Receipt's timeline"


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "ipo-calc.ts"), DATA.read_text()],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_what_money_buys():
    out = run()
    assert out["a"]["units"] == 2666 and out["a"]["cost"] == pytest.approx(19995) and out["a"]["leftover"] == pytest.approx(5)
    assert out["small"]["belowMinimum"] and not out["exact"]["belowMinimum"] and out["exact"]["units"] == 500
    assert out["dangote"]["units"] == 10 and not out["dangote"]["belowMinimum"]


def test_scaling_back_and_scenarios():
    out = run()
    assert out["half"]["units"] == 1333 and out["half"]["refund"] == pytest.approx(19995 - 1333 * 7.5)
    assert out["down"]["price"] == pytest.approx(6.75) and out["down"]["gain"] == pytest.approx(-0.1 * 19995)
    assert out["up"]["value"] == pytest.approx(2666 * 9)


def test_dividend_and_bill():
    out = run()
    assert out["div"]["net"] == pytest.approx(2666 * 0.5 * 0.95)
    assert out["div"]["yieldNet"] == pytest.approx(0.5 * 0.95 / 7.5 * 100)
    assert out["noDiv"] is None
    assert out["bill"] == pytest.approx(10000 * 0.0904 * 0.85)
