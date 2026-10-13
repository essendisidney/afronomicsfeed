"""Morocco DTFE "Résultat de l'adjudication" PDF (one line per security, French number format)."""

from datetime import date

import pytest

import morocco_bonds as mb

SEP_23_2026 = """\
Résultat de l’adjudication des bons du Trésor
Date de l’adjudication 23/09/2026
Date de règlement : 28/09/2026
Code ISIN Taux nominal Date d'émission Date d'échéance Montant proposé Prix moyen Taux moyen Montant adjugé Prix moyen pondéré TMP Dernier TMP Variation
MA0002019562 2,30% 10/08/2026 14/02/2028 1 560,0 99,90% 2,255% 850,0 99,93% 2,242% 2,233% +0,9
MA0002019999 3,40% 15/06/2026 15/06/2036 200,0 98,10% 3,640% - - - 3,600%
MA0002020000 3,90% 15/06/2026 15/06/2046 - - - - - - -
"""
SRC = "https://www.finances.gov.ma/Publication/dtfe/2026/resultat-23-09-2026.pdf"


@pytest.fixture
def rows():
    return mb.parse(SEP_23_2026, SRC)


def test_header_dates_without_colon(rows):
    assert rows and all(r["auction_date"] == "2026-09-23" and r["settlement_date"] == "2026-09-28" for r in rows)


def test_line_with_thousands_space(rows):
    r = rows[0]
    assert r["isin"] == "MA0002019562"
    assert r["coupon"] == 2.30
    assert (r["issue_date"], r["maturity"]) == ("2026-08-10", "2028-02-14")
    assert r["bids_mad_m"] == 1560.0
    assert (r["bid_avg_price"], r["bid_avg_rate"]) == (99.90, 2.255)
    assert r["accepted_mad_m"] == 850.0
    assert (r["price"], r["rate"], r["previous_rate"]) == (99.93, 2.242, 2.233)


def test_tenor_from_settlement_to_maturity(rows):
    days = (date(2028, 2, 14) - date(2026, 9, 28)).days
    assert rows[0]["tenor_days"] == days
    assert rows[0]["tenor_years"] == round(days / 365.25, 1) == 1.4


def test_nothing_taken_keeps_bids_with_zero_accepted(rows):
    assert len(rows) == 2  # the all-dash line has no bids and is skipped
    r = rows[1]
    assert r["bids_mad_m"] == 200.0 and r["accepted_mad_m"] == 0.0
    assert r["price"] is None and r["rate"] is None and r["previous_rate"] == 3.6


def test_missing_settlement_date_gives_nothing():
    assert mb.parse(SEP_23_2026.replace("Date de règlement : 28/09/2026", ""), SRC) == []


def test_num():
    assert mb.num("1 560,0") == 1560.0
    assert mb.num("2,255%") == 2.255
    assert mb.num("-") is None
