"""The editorial calls ledger (docs/rebuild/receipts-r2-plan.md): written once, never after its date, graded by code."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

import calls_ledger as cl  # noqa: E402

CALL = {"statement": "Demand comes in below 150%", "measure": "Total demand, % of shares", "comparator": "<", "threshold": 150, "unit": "%", "check_source": "Results", "check_date": "2026-11-06"}


def receipt(status="published", calls=None):
    return [("2026-10-14-quickmart-ipo", {"status": status, "calls": calls if calls is not None else [CALL, {**CALL, "statement": "Lists", "measure": "Listed", "comparator": "is", "threshold": "yes", "check_date": "2026-11-12"}]})]


def test_the_real_ledger_and_receipts_pass():
    assert cl.check(cl.load(), cl.receipts()) == []


def test_a_call_without_a_measure_is_refused():
    bad = {k: v for k, v in CALL.items() if k != "measure"}
    assert any("measure" in p for p in cl.check(cl.empty(), receipt(calls=[bad])))
    assert any("between" in p for p in cl.call_problems({**CALL, "comparator": "between", "threshold": 5}, "x"))


def test_drafts_are_not_written():
    ledger = cl.empty()
    assert cl.publish(ledger, "2026-10-20", "2026-10-20T06:00:00Z", receipt(status="draft")) == 0
    assert ledger["calls"] == []


def test_publishing_writes_each_call_once():
    ledger = cl.empty()
    assert cl.publish(ledger, "2026-10-20", "2026-10-20T06:00:00Z", receipt()) == 2
    assert cl.publish(ledger, "2026-10-21", "2026-10-21T06:00:00Z", receipt()) == 0
    assert [c["id"] for c in ledger["calls"]] == ["RC-2026-10-14-quickmart-ipo-1", "RC-2026-10-14-quickmart-ipo-2"]
    assert ledger["calls"][0]["written_at"] == "2026-10-20T06:00:00Z"


def test_no_credit_for_hindsight():
    ledger = cl.empty()
    assert cl.publish(ledger, "2026-11-10", "2026-11-10T06:00:00Z", receipt()) == 1  # the 6 Nov call is past its date
    assert ledger["not_recorded"][0]["id"] == "RC-2026-10-14-quickmart-ipo-1"
    assert ledger["calls"][0]["id"] == "RC-2026-10-14-quickmart-ipo-2"
    assert cl.publish(ledger, "2026-11-11", "2026-11-11T06:00:00Z", receipt()) == 0  # and it is never written later


def test_held_and_missed_are_worked_out_by_code():
    assert cl.held(CALL, 120) and not cl.held(CALL, 150)
    between = {"comparator": "between", "threshold": [6.75, 8.25]}
    assert cl.held(between, 7.5) and not cl.held(between, 8.3)
    assert cl.held({"comparator": "is", "threshold": "yes"}, "Yes")
    assert cl.held({"comparator": ">", "threshold": 77}, 80) and not cl.held({"comparator": ">=", "threshold": 77}, 76)


def test_status_open_due_held_missed_void():
    call = {**CALL, "check_date": "2026-11-06"}
    assert cl.status(call, None, "2026-11-01") == "open"
    assert cl.status(call, None, "2026-11-07") == "due"
    assert cl.status(call, {"value": 130}, "2026-11-07") == "held"
    assert cl.status(call, {"value": 210}, "2026-11-07") == "missed"
    assert cl.status(call, {"value": None, "void": True}, "2026-11-07") == "void"


def test_an_outcome_needs_its_source_and_quote():
    ledger = cl.empty()
    cl.publish(ledger, "2026-10-20", "t", receipt())
    ledger["outcomes"].append({"call": "RC-2026-10-14-quickmart-ipo-1", "value": 130, "source_url": "", "quote": ""})
    found = cl.check(ledger, receipt())
    assert any("link" in p for p in found) and any("quote" in p for p in found)
    ledger["outcomes"].append({"call": "RC-2026-10-14-quickmart-ipo-1", "value": 130, "source_url": "https://x.org", "quote": "q"})
    assert any("second outcome" in p for p in cl.check(ledger, receipt()))


def test_a_kenya_tbill_call_is_graded_from_our_data():
    ledger = {**cl.empty(), "calls": [{**CALL, "id": "RC-x-1", "measure": "kenya_tbill_rate:364", "comparator": "<", "threshold": 9.0, "check_date": "2026-10-19"}]}
    rows = [{"tenor": 364, "value_date": "2026-10-12", "weighted_avg_rate": 9.04, "source": "https://cbk/a.pdf"}, {"tenor": 364, "value_date": "2026-10-19", "weighted_avg_rate": 8.95, "source": "https://cbk/b.pdf"}]
    assert cl.grade(ledger, "now", rows) == 1
    o = ledger["outcomes"][0]
    assert o["value"] == 8.95 and o["source_url"] == "https://cbk/b.pdf" and o["recorded_by"] == "code"
    assert cl.status(ledger["calls"][0], o, "2026-10-20") == "held"
    assert cl.grade(ledger, "now", rows) == 0  # added once
