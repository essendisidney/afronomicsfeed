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


def test_dangote_was_published_with_its_checks_closed():
    # Published 15 Oct 2026 (decision D-022): disclosure confirmed and verdict approved by the founder, legal read waived.
    data, body = receipt_check.split((ROOT / "content" / "receipts" / "2026-10-15-dangote-refinery-ipo.md").read_text())
    assert data["status"] == "published"
    assert not data.get("verify")
    assert "[" not in data["disclosure"]
    # The KES 535 minimum and the 27 October close rest on press reports until we hold the amended memorandum.
    assert "We have not yet seen the amended memorandum" in body


# The reading boxes at the top of a Receipt (keyNumbers, "The 3 numbers"; forYou, "What it means for you").


def published():
    for path in sorted((ROOT / "content" / "receipts").glob("*.md")):
        data, body = receipt_check.split(path.read_text())
        if data.get("status") == "published":
            yield path, data, body


def test_every_published_receipt_has_three_key_numbers_quoted_from_its_text():
    found = list(published())
    assert found
    for path, data, body in found:
        nums = data.get("keyNumbers")
        assert isinstance(nums, list) and len(nums) == 3, path.name
        free = body.split(receipt_check.SPLIT)[0]
        names = {s["name"] for s in data["sources"]}
        for k in nums:
            assert k["value"] in body, f"{path.name}: {k['value']!r} is not in the body"
            assert k["value"] in free, f"{path.name}: {k['value']!r} is not in the free piece"
            assert k["source"] in names, f"{path.name}: {k['source']!r} is not one of its sources"


def test_every_published_receipt_says_what_it_means_for_you():
    for path, data, _ in published():
        lines = data.get("forYou")
        assert isinstance(lines, list) and 2 <= len(lines) <= 3, path.name
        assert "Analysis" in data["labels"], path.name


def test_a_key_number_not_in_the_text_is_refused():
    data, body = load()
    nums = [{**data["keyNumbers"][0], "value": "KES 99 billion"}, *data["keyNumbers"][1:]]
    found = receipt_check.problems({**data, "keyNumbers": nums}, body, QUICKMART.name)
    assert any("keyNumbers[0]" in p and "verbatim" in p for p in found)


def test_a_key_number_label_cannot_add_a_figure():
    data, body = load()
    nums = [{**data["keyNumbers"][0], "label": "Up 73.1% on the year"}, *data["keyNumbers"][1:]]
    found = receipt_check.problems({**data, "keyNumbers": nums}, body, QUICKMART.name)
    assert any("keyNumbers[0].label" in p for p in found)


def test_key_numbers_come_in_threes_and_cite_the_receipts_own_sources():
    data, body = load()
    found = receipt_check.problems({**data, "keyNumbers": data["keyNumbers"][:2]}, body, QUICKMART.name)
    assert any("exactly 3" in p for p in found)
    nums = [{**data["keyNumbers"][0], "source": "A blog nobody listed"}, *data["keyNumbers"][1:]]
    found = receipt_check.problems({**data, "keyNumbers": nums}, body, QUICKMART.name)
    assert any("keyNumbers[0].source" in p for p in found)


def test_for_you_lines_add_no_figures_and_give_no_advice():
    data, body = load()
    found = receipt_check.problems({**data, "forYou": [data["forYou"][0], "Rates will reach 21% next year."]}, body, QUICKMART.name)
    assert any("forYou[1]" in p and "figure 21 " in p for p in found)
    found = receipt_check.problems({**data, "forYou": [data["forYou"][0], "You should buy the shares now."]}, body, QUICKMART.name)
    assert any("forYou[1]: advice" in p for p in found)
    found = receipt_check.problems({**data, "forYou": data["forYou"][:1]}, body, QUICKMART.name)
    assert any("2 or 3" in p for p in found)
