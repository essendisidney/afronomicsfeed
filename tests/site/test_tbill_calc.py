"""The Treasury bill calculator's arithmetic (lib/tbill-calc.ts) against the CBK's own published figures.

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
const out = {
  price364: c.billPrice(9.0352, 364),
  pay: c.quoteBill(9.0352, 364, 100000, "pay", 91.7343),
  face: c.quoteBill(8.7615, 91, 100000, "face", 97.8623),
  small: c.quoteBill(8.7615, 91, 20000, "pay", 97.8623),
  rolled: c.rolledOver(c.quoteBill(8.7615, 91, 100000, "pay", 97.8623), 364),
  simple: c.simpleEarnings(100000, 10, 365),
  date: c.addDays("2026-10-19", 364),
};
console.log(JSON.stringify(out));
"""


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "tbill-calc.ts")],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_price_reproduces_the_cbk_notice():
    # CBK auction of 12 Oct 2026: 364-day at 9.0352%, published price 91.7343 per KES 100.
    assert run()["price364"] == pytest.approx(91.7343, abs=0.005)


def test_money_in_mode():
    q = run()["pay"]
    assert q["cost"] == 100000
    assert q["face"] == pytest.approx(100000 * 100 / 91.7343, abs=0.01)
    assert q["interest"] == pytest.approx(q["face"] - 100000, abs=0.01)
    assert q["tax"] == pytest.approx(q["interest"] * 0.15, abs=0.01)
    assert q["net"] == pytest.approx(q["interest"] * 0.85, abs=0.01)
    assert q["netYield"] == pytest.approx(q["net"] / 100000 * 36500 / 364, abs=1e-6)
    assert not q["belowMinimum"]


def test_face_value_mode_and_minimum():
    out = run()
    q = out["face"]
    assert q["face"] == 100000 and q["cost"] == pytest.approx(97862.3, abs=0.01)
    assert q["net"] == pytest.approx((100000 - 97862.3) * 0.85, abs=0.01)
    assert out["small"]["belowMinimum"]


def test_rollover_and_comparison():
    out = run()
    assert out["rolled"] > 0
    assert out["simple"] == pytest.approx(8500, abs=0.01)
    assert out["date"] == "2027-10-18"
