"""The institutions registry readers (docs/rebuild/phase-3-plan.md), against trimmed copies of the regulators' own
documents in tests/readers/fixtures/registry/: SASRA's 2026 licensed list and 2025 annual report (appendices III-VI
and the pages stating the sector totals), CBK's 2025 Bank Supervision Annual Report (appendices I-XIII) and its
bank and microfinance directories."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

import cbk_bsar
import cbk_directories
import registry_common
import sasra_annual
import sasra_list
from registry_common import county_at_end, match_key, open_pdf

FIX = Path(__file__).parent / "fixtures" / "registry"


@pytest.fixture(scope="module")
def sasra_rows():
    with open_pdf(FIX / "sasra_list_2026.pdf") as pdf:
        return sasra_list.parse(pdf)


@pytest.fixture(scope="module")
def annual():
    return sasra_annual.read(FIX / "sasra_annual_2025_trim.pdf")


@pytest.fixture(scope="module")
def cbk():
    return cbk_bsar.read(FIX / "cbk_bsar_2025_trim.pdf", 2025, "https://example.org/bsar.pdf")


# --- shared helpers


def test_match_key_joins_the_same_institution_across_documents():
    assert match_key("Mwalimu National Sacco Society Ltd") == match_key("MWALIMU NATIONAL DT")
    assert match_key("I&M Bank Ltd") == match_key("I M Bank Limited")
    assert match_key("Stanbic Bank (Kenya) Ltd") == match_key("Stanbic Bank Kenya Ltd")
    assert match_key("Kenya Women Microfinance Bank PLC") != match_key("Faulu Microfinance Bank Limited")


def test_county_at_end_handles_dashes_and_variants():
    assert county_at_end("Kapenguria West – Pokot") == "West Pokot"
    assert county_at_end("Oyugis Town, Homabay Homabay") == "Homa Bay"
    assert county_at_end("Chuka Town Tharaka Nithi") == "Tharaka Nithi"
    assert county_at_end("Nanyuki Munici- Nanyuki") is None  # a town, not a county: left blank, not guessed


def test_append_rows_never_rewrites_history(tmp_path, monkeypatch):
    monkeypatch.setattr(registry_common, "DATA", tmp_path)
    first = [{"k": 1, "v": "a"}]
    assert registry_common.append_rows("x.json", first, ("k",), {}) == 1
    # A later run that reads a different value for the same key adds nothing and changes nothing.
    assert registry_common.append_rows("x.json", [{"k": 1, "v": "changed"}, {"k": 2, "v": "b"}], ("k",), {}) == 1
    rows = json.loads((tmp_path / "x.json").read_text())["rows"]
    assert rows == [{"k": 1, "v": "a"}, {"k": 2, "v": "b"}]


# --- SASRA licensed list


def test_sasra_list_reads_every_schedule_in_full(sasra_rows):
    rows, stated, signed = sasra_rows
    assert stated == {"I": 176, "II": 176, "III": 5, "IV": 1, "V": 1}
    assert sasra_list.check(rows, stated) == []
    assert signed == "2026-02-03"


def test_sasra_list_names_and_counties(sasra_rows):
    rows, _, _ = sasra_rows
    by = {(r["schedule"], r["number"]): r for r in rows}
    assert by[("I", 1)]["name"] == "2NK Sacco Society Ltd" and by[("I", 1)]["county"] == "Nyeri"
    assert by[("IV", 1)]["name"] == "Nufaika Sacco Society Ltd"
    restricted = sasra_list.to_rows([r for r in rows if r["schedule"] == "III"], 2026, "u", "2026-02-03")
    assert {r["type"] for r in restricted} == {"dt", "nwdt"}  # the restricted list mixes both kinds
    assert all("Regulated" not in r["name"] for r in rows)
    assert sum(1 for r in rows if r["county"]) >= len(rows) - 3


def test_sasra_list_refuses_a_short_list(sasra_rows):
    rows, stated, _ = sasra_rows
    assert sasra_list.check(rows[1:], stated)


# --- SASRA annual report


def test_sasra_annual_reads_all_four_appendices(annual):
    tables, problems = annual
    assert problems == []
    assert {k: len(v) for k, v in tables.items()} == {"III": 179, "IV": 178, "V": 179, "VI": 178}


def test_sasra_annual_figures(annual):
    tables, _ = annual
    rows, withheld = sasra_annual.to_rows(tables, 2025, "u")
    get = {(r["name"], r["metric"], r["year"]): r for r in rows}
    assert get[("MWALIMU NATIONAL DT", "assets", 2025)]["value"] == 76.31
    assert get[("MWALIMU NATIONAL DT", "deposits", 2024)]["value"] == 52.19
    assert get[("KENYA NATIONAL POLICE DT", "assets", 2025)]["value"] == 66.40  # name wrapped over two lines
    assert get[("MWALIMU NATIONAL DT", "npl_ratio", 2025)]["value"] == 2.42
    # Real SACCOs whose names look like headers or start with a digit are kept.
    names = {r["name"] for r in tables["IV"]}
    assert {"TOTAL", "GRAND GRANITE", "3N"} <= names
    assert "2NK DT" in {r["name"] for r in tables["III"]}


def test_sasra_annual_withholds_the_repeated_deposits_column(annual):
    tables, _ = annual
    rows, withheld = sasra_annual.to_rows(tables, 2025, "u")
    assert withheld == 125
    ngarisha = [r for r in rows if r["name"] == "NGÁRISHA" and r["metric"] == "deposits"]
    assert ngarisha and all(r["value"] is None and "repeats total assets" in r["note"] for r in ngarisha)


def test_sasra_annual_fills_one_missing_rank_and_reads_one_year_rows(annual):
    tables, _ = annual
    kasneb = next(r for r in tables["IV"] if r["name"] == "KASNEB")
    assert kasneb["rank"] == 124 and kasneb.get("rank_inferred")
    setyon = next(r for r in tables["V"] if r["name"] == "SETYON")
    rows, _ = sasra_annual.to_rows({"V": [setyon]}, 2025, "u")
    assert {r["year"] for r in rows} == {2025}  # new to the table: the report year only


def test_sasra_annual_unit_check_refuses_a_total_the_report_does_not_state(annual):
    tables, _ = annual
    assert sasra_annual.check(tables, [1069.3, 141.36]) == []
    assert any("no total the report states" in p for p in sasra_annual.check(tables, [5.0]))


# --- CBK Bank Supervision Annual Report


def test_cbk_report_passes_its_own_totals(cbk):
    rows, problems = cbk
    assert problems == []
    banks = {match_key(r["name"]) for r in rows if r["type"] == "bank"}
    assert len(banks) == 39


def test_cbk_bank_figures(cbk):
    rows, _ = cbk
    get = {(r["name"], r["metric"], r["year"]): r["value"] for r in rows}
    assert get[("KCB Bank Kenya Limited", "profit_before_tax", 2025)] == 63691
    assert get[("KCB Bank Kenya Ltd", "gross_npl", 2024)] == 176811
    assert get[("Credit Bank PLC", "roe", 2025)] == -61.6  # printed "(61.6)"
    cib = [r for r in rows if r["name"] == "Commercial International Bank (CIB) Kenya Limited"]
    assert cib, "a name printed above and below its row is joined back up"


def test_cbk_microfinance_columns(cbk):
    rows, _ = cbk
    mfb = {(r["name"], r["metric"]): r for r in rows if r["type"] == "mfb"}
    assert len({n for n, _ in mfb}) == 14
    kwft = mfb[("Kenya Women Microfinance Bank", "shareholders_funds")]
    assert kwft["value"] == -3306 and "unaudited" in kwft["note"]
    assert mfb[("Faulu Microfinance Bank", "assets")]["value"] == 17390
    assert mfb[("Choice Microfinance Bank", "profit_before_tax")]["value"] == 41


def test_cbk_total_check_catches_a_misread_column():
    problems: list[str] = []
    cbk_bsar.check_sum("t", [[1.0, 2.0], [3.0, 4.0]], [4.0, 9.0], [0, 1], problems)
    assert len(problems) == 1 and "column 2" in problems[0]


# --- CBK directories


def test_cbk_bank_directory():
    with open_pdf(FIX / "cbk_bank_directory_2026-07.pdf") as pdf:
        rows = cbk_directories.parse(pdf, "bank")
    assert cbk_directories.check(rows) == []
    sections = {s: sum(1 for r in rows if r["section"] == s) for s in ("bank", "mortgage", "holding")}
    assert sections == {"bank": 38, "mortgage": 1, "holding": 8}
    absa = rows[0]
    assert (absa["name"], absa["peer_group"], absa["branches"], absa["licensed_on"]) == ("ABSA Bank Kenya PLC", "large", 96, "1916")


def test_cbk_microfinance_directory():
    with open_pdf(FIX / "cbk_mfb_directory_2026-02.pdf") as pdf:
        rows = cbk_directories.parse(pdf, "mfb")
    assert len(rows) == 14 and cbk_directories.check(rows) == []
    caritas = rows[0]
    assert caritas["licensed_on"] == "2015-06-02" and caritas["branches"] == 2
    branch = next(r for r in rows if r["name"].startswith("Branch"))
    assert branch.get("licensed_on") is None  # CBK leaves Branch's date blank


def test_licensed_on_formats():
    assert cbk_directories.licensed_on("8th January 1985") == "1985-01-08"
    assert cbk_directories.licensed_on("02.06.2015") == "2015-06-02"
    assert cbk_directories.licensed_on("1916") == "1916"
    assert cbk_directories.licensed_on("") is None


def test_sasra_file_link_drops_the_refresh_token():
    html = """<a class='wpdm-download-link' href='#' data-downloadurl="https://www.sasra.go.ke/download/sacco-supervision-annual-report-2025/?wpdmdl=1772&refresh=6acfc7066d29c1792001798">Download</a>"""
    assert registry_common.sasra_file_link(html) == "https://www.sasra.go.ke/?wpdmdl=1772"
    assert registry_common.sasra_file_link("<p>no file</p>") is None


# --- SASRA quarterly report (Phase 5)

import sasra_quarterly  # noqa: E402

QFIX = Path(__file__).parent / "fixtures" / "sasra-quarterly"


def test_sasra_quarterly_june_2026():
    parsed, problems = sasra_quarterly.read(QFIX / "sasra_quarterly_2026_06.pdf")
    assert problems == []
    assert parsed["period"] == "2026-06-30"
    assert parsed["quarters"] == ["2025-03-31", "2025-06-30", "2025-09-30", "2025-12-31", "2026-03-31", "2026-06-30"]
    rows = {(r["segment"], r["metric"], r["period"]): r for r in sasra_quarterly.to_rows(parsed, "u")}
    assert rows[("dt", "assets", "2026-06-30")]["value"] == 1105.60
    assert rows[("dt", "assets", "2025-12-31")]["value"] == 1069.34  # audited, as the June edition gives it
    assert rows[("dt", "npl_ratio", "2026-06-30")]["value"] == 6.56
    assert rows[("dt", "core_capital_to_assets", "2026-06-30")]["prescribed"] == "10%"


def test_sasra_quarterly_march_2026_keeps_its_own_december():
    parsed, problems = sasra_quarterly.read(QFIX / "sasra_quarterly_2026_03.pdf")
    assert problems == [] and parsed["period"] == "2026-03-31" and len(parsed["quarters"]) == 5
    rows = {(r["segment"], r["metric"], r["period"]): r for r in sasra_quarterly.to_rows(parsed, "u")}
    assert rows[("dt", "assets", "2025-12-31")]["value"] == 1069.05  # from returns, before the audit


def test_sasra_quarterly_quarter_ends_run_back_in_order():
    assert sasra_quarterly.periods_back(__import__("datetime").date(2026, 3, 31), 3) == ["2025-09-30", "2025-12-31", "2026-03-31"]
