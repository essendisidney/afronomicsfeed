"""Receipts (docs/rebuild/RECEIPTS.md; docs/rebuild/receipts-r1-plan.md): the house rules are enforced before a build."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

import receipt_check  # noqa: E402

QUICKMART = ROOT / "content" / "receipts" / "2026-10-14-quickmart-ipo.md"


def load():
    return receipt_check.split(QUICKMART.read_text())


def test_every_receipt_passes():
    assert receipt_check.check_all() == []


def test_quickmart_was_published_with_its_checks_closed():
    # Published 15 Oct 2026 (decision D-020): disclosure confirmed by the founder, every source check closed.
    data, _ = load()
    assert data["status"] == "published"
    assert not data.get("verify")
    assert "[" not in data["disclosure"]


def test_publishing_needs_a_confirmed_disclosure_and_no_open_checks():
    data, body = load()
    unconfirmed = {**data, "disclosure": "[Confirm before publishing] holds no shares", "verify": ["Legal read"]}
    found = receipt_check.problems(unconfirmed, body, QUICKMART.name)
    assert any("disclosure" in p for p in found)
    assert any("verify" in p for p in found)


def test_the_free_piece_needs_the_split_and_the_no_advice_line():
    data, body = load()
    found = receipt_check.problems(data, body.replace("<!-- full-file -->", "").replace("Information, not advice.", ""), QUICKMART.name)
    assert any("full-file" in p for p in found)
    assert any("not advice" in p for p in found)


def test_advice_language_is_refused():
    data, body = load()
    found = receipt_check.problems(data, body + "\nYou should buy the shares.\n", QUICKMART.name)
    assert any("advice language" in p for p in found)


def test_a_chart_must_cite_one_of_the_receipts_sources():
    data, body = load()
    charts = [{**data["charts"][0], "source": "A blog nobody listed"}]
    found = receipt_check.problems({**data, "charts": charts}, body, QUICKMART.name)
    assert any("charts[0].source" in p for p in found)


def test_desks_are_never_people():
    data, body = load()
    found = receipt_check.problems({**data, "desk": "Jane Doe"}, body, QUICKMART.name)
    assert any("desk" in p for p in found)


def test_no_allegation_without_a_finding():
    # RECEIPTS.md section 2: no allegation of fraud unless a court or regulator found it and the Receipt links to it.
    assert "fraud" not in QUICKMART.read_text().lower()


def test_the_dividend_after_tax_is_worked_out_correctly():
    # 0.50 / 7.50 = 6.67%, less 5% withholding = 6.33%.
    assert "about 6.3%" in QUICKMART.read_text()
