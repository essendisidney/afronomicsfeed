"""The Kenya Poverty Premium (lib/poverty-premium.ts, docs/rebuild/upgrade-U3-plan.md).

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
Checks each line's arithmetic on small hand-made inputs, that missing data is published as a gap and never filled,
and that every committed monthly file adds up and names a source and date for every figure.
"""

import csv
import io
import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
MODULE = ROOT / "lib" / "poverty-premium.ts"
FILES = sorted((ROOT / "data" / "kenya" / "poverty_premium").glob("*.json"))

INPUTS = {
    "bankRates": {"source": "https://cbk.example/rates", "rows": [{"month": "2026-08", "savings": 4.0, "lending": 14.6}, {"month": "2026-07", "savings": 9.0, "lending": 99.0}]},
    "tbills": {
        "source_page": "https://cbk.example/bills",
        "rows": [
            {"tenor": 364, "weighted_avg_rate": 9.0, "value_date": "2026-10-19", "source": "https://cbk.example/new.pdf"},
            {"tenor": 364, "weighted_avg_rate": 20.0, "value_date": "2026-10-12", "source": "https://cbk.example/old.pdf"},
            {"tenor": 91, "weighted_avg_rate": 7.0, "value_date": "2026-10-19", "source": "https://cbk.example/new.pdf"},
        ],
    },
    "mmf": {
        "as_of": "2026-10-21T20:00:00+00:00",
        "rows": [
            {"name": "Fund A", "manager": "A", "source": "https://a.example", "effective_annual_yield": 12.0},
            {"name": "Fund B", "manager": "B", "source": "https://b.example", "effective_annual_yield": 10.0},
            {"name": "Fund C", "manager": "C", "source": "https://c.example", "effective_annual_yield": 8.0, "period_end": "2026-09-30"},
        ],
    },
    "mobileLoans": [
        {"product": "Loan flat", "provider": "P1", "source": "https://p1.example", "read_on": "2026-10-05", "basis": "flat", "pct": 9.0, "days": 30, "from": False},
        {"product": "Loan daily", "provider": "P2", "source": "https://p2.example", "read_on": "2026-10-05", "basis": "per_day", "pct": 0.3, "days": 30, "from": True},
        {"product": "Overdraft", "provider": "P3", "source": "https://p3.example", "read_on": "2026-10-05", "basis": "access_plus_daily", "pct": 1.0, "daily_kes_per_1000": 6.0, "days": 30, "from": False},
    ],
    "mpesa": {
        "checked": "2026-10-15",
        "sources": {"fuliza": "https://safaricom.example/fuliza"},
        "fuliza": {"access_fee_pct": 1, "daily": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 3}, {"min": 501, "max": 1000, "fee": 6}]},
    },
    "corridors": {
        "publisher": "World Bank, Remittance Prices Worldwide",
        "source": "https://wb.example/data.xlsx",
        "source_page": "https://wb.example/download",
        "period": "2025_1Q",
        "read_at": "2026-10-12T11:58:00+00:00",
        "corridors": [
            {"src": "GBR", "src_name": "United Kingdom", "dst": "KEN", "services": 30, "avg_cost_pct": 5.0, "cheapest": {"type": "Money Transfer Operator", "cost_pct": 1.5}},
            {"src": "GBR", "src_name": "United Kingdom", "dst": "UGA", "services": 10, "avg_cost_pct": 9.0, "cheapest": {"type": "Bank", "cost_pct": 2.0}},
        ],
    },
}

SCRIPT = r"""
const m = await import(process.argv[1]);
const inputs = JSON.parse(process.argv[2]);
const file = m.buildPremium(inputs, { month: "2026-10", generatedAt: "2026-10-22T00:00:00Z" });
const noBank = m.buildPremium({ ...inputs, bankRates: { source: "x", rows: [] } }, { month: "2026-10", generatedAt: "x" });
const custom = m.buildPremium(inputs, { month: "2026-10", generatedAt: "x", amounts: { savingKes: 50000 } });
console.log(JSON.stringify({
  file, csv: m.premiumCsv(file), noBank, custom,
  fuliza2000: m.fulizaCost(inputs.mpesa, 2000, 7),
  quarter: [m.quarterEnd("2025_1Q"), m.quarterEnd("2024_4Q")],
  monthEnd: [m.monthEnd("2026-02"), m.monthEnd("2024-02"), m.monthEnd("2026-10-19")],
}));
"""


@pytest.fixture(scope="module")
def out():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, MODULE.as_uri(), json.dumps(INPUTS)],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:300]}")
    return json.loads(proc.stdout)


def line(file, line_id):
    return next(l for l in file["lines"] if l["id"] == line_id)


def test_overdraft_week(out):
    l = line(out["file"], "borrow-overdraft-week")
    # KES 1,000 for 7 days: 1% access fee (10) + KES 6 a day (42) = 52, against 1,000 × 14.6% × 7 ÷ 365.
    assert l["low"]["money"] == 52
    assert l["best"]["money"] == pytest.approx(1000 * 0.146 * 7 / 365, abs=0.005)
    assert l["premium"] == pytest.approx(52 - 1000 * 0.146 * 7 / 365, abs=0.01)
    assert l["low"]["rate"] == pytest.approx(52 / 1000 * 365 / 7 * 100, abs=0.01)
    assert l["best"]["kind"] == "benchmark"
    assert l["best"]["source"]["asOf"] == "2026-08", "the newest CBK month is used"


def test_overdraft_outside_bands_is_left_out(out):
    assert out["fuliza2000"] is None


def test_mobile_loan_uses_the_lowest_charge_and_prefers_a_firm_price_on_a_tie(out):
    l = line(out["file"], "borrow-mobile-loan-month")
    # Both loans cost 9% for 30 days (450 on KES 5,000); the firm price wins over a "from" price; the overdraft is excluded.
    assert l["low"]["money"] == 450
    assert "Loan flat" in l["low"]["detail"]
    assert l["low"]["source"]["publisher"] == "P1"
    assert l["premium"] == pytest.approx(450 - 5000 * 0.146 * 30 / 365, abs=0.01)
    assert l["low"]["rate"] == pytest.approx(9 * 365 / 30, abs=0.01)


def test_saving_after_tax_uses_the_latest_364_day_bill(out):
    l = line(out["file"], "save-year")
    assert l["low"]["rate"] == pytest.approx(4.0 * 0.85, abs=0.005)
    assert l["best"]["rate"] == pytest.approx(9.0 * 0.85, abs=0.005)
    assert l["best"]["source"]["asOf"] == "2026-10-19"
    assert l["premium"] == pytest.approx(10000 * (9.0 - 4.0) * 0.85 / 100, abs=0.01)
    median, top = l["context"]
    assert median["rate"] == pytest.approx(10.0 * 0.85, abs=0.005)
    assert top["rate"] == pytest.approx(12.0 * 0.85, abs=0.005) and "Fund A" in top["detail"]


def test_amounts_can_change_and_are_recorded(out):
    c = out["custom"]
    assert c["amounts"]["savingKes"] == 50000
    assert line(c, "save-year")["premium"] == pytest.approx(50000 * 5.0 * 0.85 / 100, abs=0.01)


def test_sending_only_into_kenya(out):
    send = [l for l in out["file"]["lines"] if l["need"] == "Sending money"]
    assert [l["id"] for l in send] == ["send-gbr-ken"]
    l = send[0]
    assert l["low"]["money"] == 10 and l["best"]["money"] == 3
    assert l["premium"] == 7 and l["premiumRatePoints"] == 3.5
    assert l["best"]["source"]["asOf"] == "2025-03-31"


def test_gaps_are_published_not_filled(out):
    gaps = {l["id"]: l for l in out["file"]["lines"] if l["status"] == "gap"}
    assert set(gaps) == {"borrow-sacco-loan", "protect-deposit-cover"}
    for g in gaps.values():
        assert "premium" not in g and "low" not in g
        assert g["missing"] and g["wouldNeed"]


def test_no_bank_data_drops_the_lines_that_need_it(out):
    ids = {l["id"] for l in out["noBank"]["lines"]}
    assert not {"borrow-overdraft-week", "borrow-mobile-loan-month", "save-year"} & ids
    assert {"borrow-sacco-loan", "protect-deposit-cover", "send-gbr-ken"} <= ids


def test_old_inputs_are_flagged(out):
    old = out["file"]["oldInputs"]
    assert [o["id"] for o in old] == ["data/remittances/corridors.json#corridors"]
    assert old[0]["ageDays"] == 579  # 31 Mar 2025 to 31 Oct 2026


def test_dates(out):
    assert out["quarter"] == ["2025-03-31", "2024-12-31"]
    assert out["monthEnd"] == ["2026-02-28", "2024-02-29", "2026-10-19"]


def test_csv_has_one_row_per_line(out):
    rows = list(csv.DictReader(io.StringIO(out["csv"])))
    assert len(rows) == len(out["file"]["lines"])
    assert {r["status"] for r in rows} == {"ok", "gap"}
    ok = next(r for r in rows if r["line"] == "save-year")
    assert float(ok["premium_money"]) == line(out["file"], "save-year")["premium"]


# ---- The committed monthly files ----


def test_there_is_a_monthly_file():
    assert FILES, "data/kenya/poverty_premium/ holds no month"


@pytest.mark.parametrize("path", FILES, ids=lambda p: p.name)
def test_committed_file_adds_up_and_is_sourced(path):
    f = json.loads(path.read_text())
    assert path.stem == f["month"]
    assert (path.parent / f"{f['month']}.csv").exists()
    assert "Information, not advice." in f["notice"]
    needs = {l["need"] for l in f["lines"]}
    assert needs == {"Borrowing", "Saving", "Sending money", "Protection"}
    for l in f["lines"]:
        if l["status"] == "gap":
            continue
        assert l["premium"] == pytest.approx(l["low"]["money"] - l["best"]["money"] if l["need"] != "Saving" else l["best"]["money"] - l["low"]["money"], abs=0.02), l["id"]
        for side in [l["low"], l["best"], *l.get("context", [])]:
            s = side["source"]
            assert s["file"].startswith("data/") and s["field"] and s["publisher"] and s["url"] and s["asOf"], l["id"]
            assert (ROOT / s["file"]).exists(), s["file"]
