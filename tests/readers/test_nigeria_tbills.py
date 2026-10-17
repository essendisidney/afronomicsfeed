"""Offline checks on the Nigeria T-bill reader's unit-slip guards."""

import nigeria_tbills as reader


def item(received, accepted, offered="100000"):
    return {"auction": "Primary", "tenor": "364 Days", "auctionDate": "Aug-12-2026", "rate": "17.59",
            "totalSubscription": received, "totalSuccessful": accepted, "amtOffered": offered}


def test_ordinary_amounts_kept():
    row = reader.normalise(item("30104", "29544"))
    assert row["received_ngn_m"] == 30104 and row["accepted_ngn_m"] == 29544


def test_impossible_amounts_dropped():
    # 12 Aug 2026 as the CBN feed carries it: NGN 4,188 trillion received is a unit slip, not a result.
    row = reader.normalise(item("4188416475", "1260000000", "500000"))
    assert row["received_ngn_m"] is None and row["accepted_ngn_m"] is None
    assert row["stop_rate"] == 17.59


def test_accepted_above_received_dropped():
    row = reader.normalise(item("1000", "5000"))
    assert row["received_ngn_m"] == 1000 and row["accepted_ngn_m"] is None
