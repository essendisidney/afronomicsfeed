"""The forecast ledger (scripts/forecast_ledger.py, docs/rebuild/phase-4-plan.md): forecasts only before bids close,
grading by code, a ledger that only grows, and a method that stays in step with the site's (lib/data/auction-intel.ts)."""

from __future__ import annotations

import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

import forecast_ledger as fl

ROOT = Path(__file__).resolve().parents[2]


def weekly_rows(tenor: int, rates: list[float], start: str = "2026-01-05") -> list[dict]:
    d0 = datetime.fromisoformat(start)
    return [
        {"tenor": tenor, "value_date": (d0 + timedelta(days=7 * i)).date().isoformat(), "weighted_avg_rate": r, "source": f"https://cbk/{i}"}
        for i, r in enumerate(rates)
    ]


def rows_all(n: int = 30) -> list[dict]:
    out = []
    for tenor, base in ((91, 8.0), (182, 8.5), (364, 9.0)):
        out += weekly_rows(tenor, [base + 0.01 * (i % 5) for i in range(n)])
    return out


def test_method_matches_the_site_code():
    ts = (ROOT / "lib/data/auction-intel.ts").read_text()
    assert "const WINDOW = 26;" in ts and fl.WINDOW == 26
    assert "quantile(sorted, 0.1)" in ts and "quantile(sorted, 0.9)" in ts


def test_band_by_hand():
    rates = [10.0 + 0.1 * i for i in range(27)]  # every weekly move is +0.1
    b = fl.band(rates, len(rates))
    assert round(b["low"], 6) == round(rates[-1] + 0.1, 6) == round(b["high"], 6)
    assert round(b["typical"], 6) == 0.1


def test_bids_close_is_thursday_14_nairobi():
    assert fl.bids_close("2026-10-19").strftime("%Y-%m-%dT%H:%M") == "2026-10-15T11:00"


def test_logs_before_the_deadline_and_refuses_after():
    rows = rows_all()
    latest = max(r["value_date"] for r in rows)
    value_date = (datetime.fromisoformat(latest) + timedelta(days=7)).date().isoformat()
    close = fl.bids_close(value_date)
    empty = {"forecasts": [], "outcomes": []}
    before, _ = fl.due_forecasts(rows, empty, close - timedelta(hours=1))
    assert [f["tenor"] for f in before] == [91, 182, 364]
    assert all(f["written_at"] < f["bids_close"] for f in before)
    after, why = fl.due_forecasts(rows, empty, close)
    assert after == [] and "too late" in why
    again, _ = fl.due_forecasts(rows, {"forecasts": before, "outcomes": []}, close - timedelta(minutes=5))
    assert again == []  # never logged twice


def test_grading_inside_outside_and_missing():
    rows = rows_all()
    latest = max(r["value_date"] for r in rows)
    value_date = (datetime.fromisoformat(latest) + timedelta(days=7)).date().isoformat()
    close = fl.bids_close(value_date)
    forecasts, _ = fl.due_forecasts(rows, {"forecasts": [], "outcomes": []}, close - timedelta(days=1))
    f91, f182 = forecasts[0], forecasts[1]
    results = [
        {"tenor": 91, "value_date": value_date, "weighted_avg_rate": f91["low"], "source": "https://cbk/r91"},  # on the edge: inside
        {"tenor": 182, "value_date": value_date, "weighted_avg_rate": f182["high"] + 0.25, "source": "https://cbk/r182"},
    ]
    ledger = {"forecasts": forecasts, "outcomes": []}
    out = {o["id"]: o for o in fl.grade(rows + results, ledger, close + timedelta(days=2))}
    assert out[f91["id"]]["inside"] is True and out[f91["id"]]["miss_bps"] == 0
    assert out[f182["id"]]["inside"] is False and out[f182["id"]]["side"] == "above" and out[f182["id"]]["miss_bps"] == 25.0
    assert forecasts[2]["id"] not in out  # no 364-day result yet, not 21 days: wait
    late = {o["id"]: o for o in fl.grade(rows, {"forecasts": [forecasts[2]], "outcomes": []}, close + timedelta(days=22))}
    assert late[forecasts[2]["id"]]["status"] == "no_result"


def test_check_ledger_catches_a_late_forecast_and_double_grading():
    f = {"id": "x", "written_at": "2026-10-15T11:00:00Z", "bids_close": "2026-10-15T11:00:00Z", "low": 1, "high": 2}
    assert any("after bids closed" in p for p in fl.check_ledger({"forecasts": [f], "outcomes": []}))
    ok = {**f, "written_at": "2026-10-14T09:00:00Z"}
    assert fl.check_ledger({"forecasts": [ok], "outcomes": [{"id": "x"}, {"id": "x"}]})


def test_committed_ledger_is_valid():
    path = ROOT / "data/forecasts/kenya_tbills.json"
    ledger = json.loads(path.read_text())
    assert fl.check_ledger(ledger) == []
    for f in ledger["forecasts"]:
        assert re.match(r"^KE-TB-\d{4}-\d{2}-\d{2}-(91|182|364)$", f["id"])
        assert f["method"] in ledger["methods"]
