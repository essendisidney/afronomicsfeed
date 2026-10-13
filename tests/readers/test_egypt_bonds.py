"""Egypt CBE historical-data workbooks, read by header name (fixed and zero coupon sheets)."""

from datetime import datetime

import openpyxl
import pytest

import egypt_bonds as eg

FIXED_HEADERS = [
    "Issue Date", "ISIN", "Tenor (Years)", "Type (New / Reopening)", "Required Amount", "Submitted Amount",
    "Accepted Amount", "Coupon Rate (%)", "Coupon Frequency", "Min. Yield (%)", "Max. Yield (%)", "Weighted Avg. Yield (%)",
]
ZERO_HEADERS = [
    "Issue Date", "ISIN", "Tenor (Days)", "Required Amount", "Submitted Amount", "Accepted Amount",
    "Min. Yield (%)", "Max. Yield (%)", "Weighted Avg. Yield (%)",
]


def sheet(title, headers, rows):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = title
    ws.append(["EGP T-Bonds historical data"])  # a title line above the header is skipped
    ws.append(headers)
    for r in rows:
        ws.append(r)
    return ws


@pytest.fixture
def fixed():
    ws = sheet("Maturity Date 29-04-2030", FIXED_HEADERS, [
        [datetime(2026, 10, 5), "EGBGR05301F9", 5, "Reopening", 5_000_000_000, 12_000_000_000, 6_000_000_000,
         22.5, 2, 23.1, 23.9, 23.45],
        ["12/10/2026", "EGBGR05301F9", 5, "New", 4_000_000_000, 9_000_000_000, 3_000_000_000, 22.5, 2, 23.0, 23.5, 23.2],
        [None, "EGBGR05301F9", 5, "New", 1, 1, 1, 22.5, 2, 1, 1, 23.0],  # no issue date: skipped
        [datetime(2026, 10, 19), "EGBGR05301F9", 5, "New", 1, 1, 1, 22.5, 2, 1, 1, None],  # no yield: skipped
    ])
    return eg.parse_sheet(ws, "fixed", eg.KINDS["fixed"])


def test_fixed_rows(fixed):
    assert [r["issue_date"] for r in fixed] == ["2026-10-05", "2026-10-12"]
    r = fixed[0]
    assert r["isin"] == "EGBGR05301F9"
    assert r["maturity"] == "2030-04-29"  # from the sheet title
    assert r["tenor_years"] == 5
    assert r["type"] == "reopening" and fixed[1]["type"] == "new"
    assert (r["offered_egp_m"], r["received_egp_m"], r["accepted_egp_m"]) == (5000.0, 12000.0, 6000.0)
    assert r["bid_cover"] == 2.0
    assert (r["min_yield"], r["max_yield"], r["weighted_avg_yield"]) == (23.1, 23.9, 23.45)


def test_coupon_is_the_rate_not_the_frequency(fixed):
    assert [r["coupon"] for r in fixed] == [22.5, 22.5]


def test_coupon_ignores_frequency_even_when_it_comes_first():
    headers = FIXED_HEADERS[:7] + ["Coupon Frequency", "Coupon Rate (%)"] + FIXED_HEADERS[9:]
    ws = sheet("Maturity Date 29-04-2030", headers, [
        [datetime(2026, 10, 5), "EGBGR05301F9", 5, "New", 1e9, 2e9, 1e9, 2, 22.5, 23.1, 23.9, 23.45],
    ])
    assert eg.parse_sheet(ws, "fixed", eg.KINDS["fixed"])[0]["coupon"] == 22.5


def test_zero_coupon_tenor_days_to_years():
    ws = sheet("Maturity Date 05-10-2028", ZERO_HEADERS, [
        [datetime(2026, 10, 6), "EGBZC10281Z2", 728, 3_000_000_000, 7_500_000_000, 2_500_000_000, 24.0, 24.6, 24.31],
        [datetime(2026, 10, 13), "EGBZC10281Z2", 1092, 3_000_000_000, 4_500_000_000, 3_000_000_000, 24.0, 24.6, 24.2],
    ])
    rows = eg.parse_sheet(ws, "zero", eg.KINDS["zero"])
    assert [r["tenor_years"] for r in rows] == [2.0, 3.0]
    assert rows[0]["coupon"] is None
    assert rows[0]["bid_cover"] == 3.0
    assert rows[0]["maturity"] == "2028-10-05"
    assert rows[0]["benchmark"] is None and rows[0]["spread"] is None


def test_headers_collected():
    seen = set()
    eg.parse_sheet(sheet("x", ZERO_HEADERS, []), "zero", eg.KINDS["zero"], seen)
    assert seen == {tuple(h.lower() for h in ZERO_HEADERS)}
