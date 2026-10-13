"""Zambia: Bank of Zambia results notice PDF line and the JSON:API bond_auction nodes."""

import json

import zambia_bonds as zb

NOTICE = """\
BANK OF ZAMBIA
GOVERNMENT BOND AUCTION RESULTS - TENDER No. 07/2026/BA
Tenor ISIN Amount Offered Bids Received (Face) Bids Received (Cost) Allocated (Face) Allocated (Cost) Dirty Price Coupon Yield
7 Years ZM1000007683 K1,575.00 Mn K1,916.80 Mn K2,292.74 Mn K967.28 Mn K1,136.66 Mn 117.5112 16.0000 13.7500
"""


def test_notice_line():
    got = zb.notice_amounts(NOTICE)
    assert list(got) == ["ZM1000007683"]
    a = got["ZM1000007683"]
    assert a["offered_zmw_m"] == 1575.0
    assert (a["bid_face_zmw_m"], a["bid_cost_zmw_m"]) == (1916.8, 2292.74)
    assert (a["allocated_face_zmw_m"], a["allocated_cost_zmw_m"]) == (967.28, 1136.66)
    assert a["bid_cover"] == 1.98
    assert a["dirty_price"] == 117.5112


def test_notice_without_table():
    assert zb.notice_amounts("") == {}


def api_page():
    return {
        "data": [{
            "attributes": {"title": "07/2026/BA", "field_bond_auction_date": "2026-09-25T10:00:00+02:00"},
            "relationships": {
                "field_results_file": {"data": {"id": "f1"}},
                "field_auction_results": {"data": [{"id": "p7"}, {"id": "p10"}]},
            },
        }],
        "included": [
            {"id": "f1", "attributes": {"uri": {"url": "/sites/default/files/2026-09/results.pdf"}}},
            {"id": "p7", "type": "paragraph--7_year_bond", "attributes": {
                "field_isin": "ZM1000007683", "field_coupon_rate": "16.0000", "field_7_year_yield_rate": "13.75"}},
            {"id": "p10", "type": "paragraph--10_year_bond", "attributes": {
                "field_10_year_isin": "ZM1000007700", "field_10_year_coupon_rate": "17.0", "field_10_year_yield_rate": "Nil"}},
        ],
        "links": {},
    }


def test_main_reads_nodes_and_notice(monkeypatch, tmp_path):
    out = tmp_path / "bond_auctions.json"
    monkeypatch.setattr(zb, "OUT", out)
    monkeypatch.setattr(zb, "get_json", lambda url: api_page())
    fetched = []
    monkeypatch.setattr(zb, "pdf_text", lambda url: fetched.append(url) or NOTICE)
    monkeypatch.setattr("sys.argv", ["zambia_bonds.py"])
    assert zb.main() == 0
    rows = json.loads(out.read_text())["rows"]
    assert len(rows) == 1  # the suspended ("Nil") 10-year tenor is left out
    r = rows[0]
    assert (r["tender"], r["auction_date"], r["tenor_years"]) == ("07/2026/BA", "2026-09-25", 7)
    assert (r["isin"], r["coupon"], r["yield"]) == ("ZM1000007683", 16.0, 13.75)  # fields matched by suffix
    assert r["bid_cover"] == 1.98 and r["offered_zmw_m"] == 1575.0
    assert r["notice"] == fetched[0] == "https://www.boz.zm/sites/default/files/2026-09/results.pdf"
