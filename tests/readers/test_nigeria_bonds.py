"""Nigeria DMO monthly FGN bond auction summary (PDF text, one column per bond)."""

import pytest

import nigeria_bonds as ng

SEP_2026 = """\
Summary of FGN Bond Auction Results for September, 2026
Auction Result for the 16.79% FGN SEP 2036 (New Issue) and 15.45% FGN JUN 2038 (Re-opening)
DESCRIPTION 16.79% FGN SEP 2036 15.45% FGN JUN 2038
Auction Date: September 14, 2026 September 14, 2026
Settlement Date: September 16, 2026 September 16, 2026
Maturity Date: September 16, 2036 June 21, 2038
Tenors: 10 Years 15 Years
Amount Offered: ₦400.00 billion ₦600.00 billion
Total Bids: 198 243
Successful Bids: 101 103
Subscription: ₦546.90 billion ₦947.83 billion
Non-Competitive Allotment: ₦600.00 billion ₦250.00 billion
Amount Allotted to Market: ₦288.63 billion ₦460.01 billion
Range of Bids: 15.0000% - 20.0000% 15.0000% - 18.0000%
Marginal Rates: 16.7900% 16.8500%
"""
SRC = "https://www.dmo.gov.ng/6051-summary-of-fgn-bond-auction-results-for-september-2026"


@pytest.fixture
def rows():
    return ng.parse(SEP_2026, SRC)


def test_one_row_per_bond(rows):
    assert [r["bond"] for r in rows] == ["16.79% FGN SEP 2036", "15.45% FGN JUN 2038"]


def test_rates_tenors_and_amounts(rows):
    a, b = rows
    assert (a["marginal_rate"], b["marginal_rate"]) == (16.79, 16.85)
    assert (a["tenor_years"], b["tenor_years"]) == (10, 15)
    assert (a["offered_ngn_m"], b["offered_ngn_m"]) == (400000.0, 600000.0)
    assert (a["subscription_ngn_m"], b["subscription_ngn_m"]) == (546900.0, 947830.0)
    assert (a["allotted_market_ngn_m"], b["allotted_market_ngn_m"]) == (288630.0, 460010.0)
    assert (a["noncompetitive_ngn_m"], b["noncompetitive_ngn_m"]) == (600000.0, 250000.0)
    assert (a["bid_cover"], b["bid_cover"]) == (1.89, 2.06)


def test_dates_counts_ranges_and_kind(rows):
    a, b = rows
    assert a["auction_date"] == b["auction_date"] == "2026-09-14"
    assert a["settlement_date"] == "2026-09-16"
    assert (a["maturity"], b["maturity"]) == ("2036-09-16", "2038-06-21")
    assert (a["bids"], a["successful_bids"], b["bids"], b["successful_bids"]) == (198, 101, 243, 103)
    assert (a["bid_low"], a["bid_high"], b["bid_low"], b["bid_high"]) == (15.0, 20.0, 15.0, 18.0)
    assert (a["type"], b["type"]) == ("new", "reopening")
    assert (a["coupon"], b["coupon"]) == (16.79, 15.45)
    assert a["source"] == SRC


def test_misaligned_rate_row_is_left_out():
    text = SEP_2026.replace("Marginal Rates: 16.7900% 16.8500%", "Marginal Rates: 16.7900%")
    assert ng.parse(text, SRC) == []


def test_two_auctions_in_one_summary():
    second = SEP_2026.replace("September 14", "September 28").replace("September 16, 2026", "September 30, 2026")
    rows = ng.parse(SEP_2026 + second, SRC)
    assert [r["auction_date"] for r in rows] == ["2026-09-14"] * 2 + ["2026-09-28"] * 2
    assert rows[2]["settlement_date"] == "2026-09-30"


def test_amounts_in_millions():
    assert ng.amounts("N750.5 million ₦1,200.00 billion") == [750.5, 1200000.0]
