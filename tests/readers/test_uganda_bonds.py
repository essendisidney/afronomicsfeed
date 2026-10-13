"""Uganda Treasury bond press release (Bank of Uganda), 7 Oct 2026: 3, 10 and 20 year bonds."""

import pytest

import uganda_bonds as ub

OCT_7_2026 = """\
PRESS RELEASE
RESULTS OF THE TREASURY BOND AUCTION
AUCTION DATE: 07-Oct-2026
SETTLEMENT DATE: 08-Oct-2026
BENCHMARK MATURITIES 3 YR 10 YR 20 YR
ISIN UG12G0609291 12.000% UG12K1405378 16.000% UG12L1608466 15.000%
MATURITY DATES 06-Sep-2029 14-May-2037 16-Aug-2046
CUT OFF PRICE (PER 100) 96.230 101.641 90.188
YIELD AT CUT OFF PRICE 14.000 16.850 16.925
OFFERED 230,000,000,000 330,000,000,000 430,000,000,000
TENDERED 237,849,000,000 361,387,200,000 859,389,900,000
ACCEPTED 210,491,000,000 228,244,200,000 600,389,900,000
BID TO COVER 1.130 1.583 1.431
"""
SRC = "https://bou.or.ug/uploads/Press_Release_Report_for_the_3_YR_10_YR_20_YR_T_Bonds_07_OCT_2026.pdf"


@pytest.fixture
def rows():
    return ub.parse(OCT_7_2026, SRC)


def test_one_row_per_tenor(rows):
    assert [r["tenor_years"] for r in rows] == [3, 10, 20]
    assert all(r["auction_date"] == "2026-10-07" and r["settlement_date"] == "2026-10-08" for r in rows)


def test_yields_and_prices(rows):
    assert [r["yield"] for r in rows] == [14.0, 16.85, 16.925]
    assert [r["cutoff_price"] for r in rows] == [96.23, 101.641, 90.188]


def test_isin_coupon_maturity(rows):
    assert [r["isin"] for r in rows] == ["UG12G0609291", "UG12K1405378", "UG12L1608466"]
    assert [r["coupon"] for r in rows] == [12.0, 16.0, 15.0]
    assert [r["maturity"] for r in rows] == ["2029-09-06", "2037-05-14", "2046-08-16"]


def test_amounts_in_ugx_millions(rows):
    assert [r["offered_ugx_m"] for r in rows] == [230000.0, 330000.0, 430000.0]
    assert [r["tendered_ugx_m"] for r in rows] == [237849.0, 361387.2, 859389.9]
    assert [r["accepted_ugx_m"] for r in rows] == [210491.0, 228244.2, 600389.9]
    assert [r["bid_cover"] for r in rows] == [1.13, 1.583, 1.431]


def test_cross_check_failure_drops_only_that_tenor():
    # the 10-year bid-to-cover no longer equals tendered / accepted (1.583): that bond is left out
    text = OCT_7_2026.replace("BID TO COVER 1.130 1.583 1.431", "BID TO COVER 1.130 1.950 1.431")
    assert [r["tenor_years"] for r in ub.parse(text, SRC)] == [3, 20]


def test_yield_row_not_lining_up_gives_nothing():
    text = OCT_7_2026.replace("YIELD AT CUT OFF PRICE 14.000 16.850 16.925", "YIELD AT CUT OFF PRICE 14.000 16.850")
    assert ub.parse(text, SRC) == []


def test_implausible_price_is_dropped():
    text = OCT_7_2026.replace("CUT OFF PRICE (PER 100) 96.230", "CUT OFF PRICE (PER 100) 9623.0")
    assert [r["tenor_years"] for r in ub.parse(text, SRC)] == [10, 20]


def test_no_auction_date_gives_nothing():
    assert ub.parse(OCT_7_2026.replace("AUCTION DATE: 07-Oct-2026", ""), SRC) == []
