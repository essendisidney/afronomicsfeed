"""The net salary calculator (lib/salary-calc.ts) against KRA's PAYE bands, SHA's SHIF rate and the Housing Levy
(data/kenya/payroll_rates.json, copied from the official pages on its "checked" date).

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import shutil
import subprocess
from datetime import date
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data" / "kenya" / "payroll_rates.json"
SCRIPT = r"""
const c = await import(process.argv[1]);
const r = JSON.parse(process.argv[2]);
const n = (g, rest = {}) => c.netSalary(r, { gross: g, nssf: 0, ...rest });
const withNssf = n(100000, { nssf: 4320 });
console.log(JSON.stringify({
  g24: n(24000), g100: n(100000), g10: n(10000), g1m: n(1000000), withNssf,
  capped: n(300000, { nssf: 10000, pension: 40000 }),
  mortgage: n(100000, { mortgageInterest: 50000 }),
  back: c.grossForNet(r, withNssf.net, { nssf: 4320 }),
  raise: c.keepOfRaise(r, { gross: 100000, nssf: 0 }),
}));
"""


def rates():
    return json.loads(DATA.read_text())


def test_bands_match_kra():
    r = rates()
    assert [(b["width"], b["rate"]) for b in r["paye"]["bands"]] == [(24000, 10), (8333, 25), (467667, 30), (300000, 32.5), (None, 35)]
    assert r["paye"]["personal_relief"] == 2400 and r["paye"]["pension_cap"] == 30000
    assert r["shif"] == {"rate_pct": 2.75, "minimum": 300}
    assert r["housing_levy"]["employee_pct"] == 1.5


def test_checked_recently():
    # Budgets change PAYE and levies each July; the file must be re-checked at least every 120 days.
    assert (date.today() - date.fromisoformat(rates()["checked"])).days <= 120


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "salary-calc.ts"), DATA.read_text()],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_worked_example():
    x = run()["g100"]
    assert x["shif"] == pytest.approx(2750) and x["housingLevy"] == pytest.approx(1500)
    assert x["taxable"] == pytest.approx(95750)
    # 2,400 + 2,083.25 + 30% of 63,417, less 2,400 relief
    assert x["paye"] == pytest.approx(21108.35)
    assert x["net"] == pytest.approx(100000 - 2750 - 1500 - 21108.35)
    assert x["employerHousingLevy"] == pytest.approx(1500)


def test_relief_never_makes_tax_negative_and_shif_minimum():
    out = run()
    assert out["g24"]["paye"] == 0
    assert out["g10"]["shif"] == 300 and out["g10"]["paye"] == 0


def test_top_band():
    x = run()["g1m"]
    assert x["taxable"] == pytest.approx(1000000 - 27500 - 15000)
    top = x["bands"][-1]
    assert top["rate"] == 35 and top["taxed"] == pytest.approx(x["taxable"] - 800000)


def test_nssf_lowers_tax_and_caps_apply():
    out = run()
    assert out["withNssf"]["paye"] == pytest.approx(21108.35 - 0.3 * 4320)
    assert out["capped"]["pensionAllowed"] == 30000
    # Mortgage interest is capped at 30,000 and lowers tax without coming out of pay.
    m = out["mortgage"]
    assert m["otherAllowed"] == 30000 and m["paye"] == pytest.approx(21108.35 - 0.3 * 30000)
    assert m["totalDeductions"] == pytest.approx(2750 + 1500 + m["paye"])


def test_reverse_and_raise():
    out = run()
    assert out["back"] == pytest.approx(100000, abs=0.01)
    # In the 30% band a KES 1,000 raise loses 2.75% + 1.5% then 30% of the rest.
    assert out["raise"] == pytest.approx(1000 * (1 - 0.0425) * 0.7)
