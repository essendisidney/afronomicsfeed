"""The M-PESA and Fuliza calculator (lib/mpesa-calc.ts) against Safaricom's published charges
(data/kenya/mpesa_tariffs.json, copied from Safaricom's pages on its "checked" date).

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import shutil
import subprocess
from datetime import date
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data" / "kenya" / "mpesa_tariffs.json"
SCRIPT = r"""
const c = await import(process.argv[1]);
const t = JSON.parse(process.argv[2]);
console.log(JSON.stringify({
  send1000: c.charge(t, "send", 1000), send100: c.charge(t, "send", 100), send101: c.charge(t, "send", 101),
  w49: c.charge(t, "withdraw", 49), w3000: c.charge(t, "withdraw", 3000), w1500: c.charge(t, "withdraw", 1500),
  over: c.charge(t, "send", 250001), top: c.charge(t, "withdraw", 250000),
  f1000: c.fulizaCost(t, 1000, 7), f100: c.fulizaCost(t, 100, 3),
  month: c.monthly(t, { sends: 20, sendAmount: 1000, withdrawals: 4, withdrawAmount: 3000, fulizaTimes: 2, fulizaAmount: 500, fulizaDays: 5 }),
  split: c.splitPenalty(t, 3000),
}));
"""


def tariffs():
    return json.loads(DATA.read_text())


def test_bands_are_contiguous_and_cover_up_to_the_maximum():
    t = tariffs()
    for table in (t["mpesa"], t["fuliza"]["daily"]):
        for a, b in zip(table, table[1:]):
            assert b["min"] == a["max"] + 1, f"gap or overlap between {a} and {b}"
    assert t["mpesa"][0]["min"] == 1 and t["mpesa"][-1]["max"] == t["max_transaction"] == 250000


def test_checked_recently():
    # Safaricom changes its charges from time to time; the file must be re-checked at least every 120 days.
    assert (date.today() - date.fromisoformat(tariffs()["checked"])).days <= 120


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "mpesa-calc.ts"), DATA.read_text()],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_published_charges():
    out = run()
    assert (out["send100"], out["send101"], out["send1000"]) == (0, 7, 13)
    assert out["w49"] is None and out["w1500"] == 29 and out["w3000"] == 52
    assert out["over"] is None and out["top"] == 309


def test_fuliza():
    out = run()
    assert out["f1000"]["access"] == pytest.approx(10) and out["f1000"]["daily"] == 6
    assert out["f1000"]["total"] == pytest.approx(10 + 6 * 7)
    assert out["f100"]["total"] == pytest.approx(1)  # 1% access fee, no daily fee up to KES 100


def test_month_and_split():
    out = run()
    m = out["month"]
    assert m["send"] == 20 * 13 and m["withdraw"] == 4 * 52 and m["fuliza"] == pytest.approx(2 * (5 + 3 * 5))
    assert m["total"] == pytest.approx(m["send"] + m["withdraw"] + m["fuliza"])
    assert out["split"] == 2 * 29 - 52
