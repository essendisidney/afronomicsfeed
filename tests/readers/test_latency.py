"""Publication latency (scripts/latency.py): first-seen and publisher times per auction result, from fixture datasets."""

import json
from datetime import datetime, timedelta, timezone

import pytest

import latency as lt

T0 = datetime(2026, 10, 13, 6, 0, tzinfo=timezone.utc)
HTTP = "%a, %d %b %Y %H:%M:%S GMT"


def write(root, rel, rows, **extra):
    f = root / "data" / rel
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps({"source_page": "https://publisher.example/list", **extra, "rows": rows}), encoding="utf-8")


def kenya_bill(day, pdf):
    return {"tenor": 91, "value_date": day, "weighted_avg_rate": 8.0, "source": pdf}


def egypt_bond(day, isin="EG1"):
    return {"issue_date": day, "isin": isin, "weighted_avg_yield": 25.0, "source": "https://www.cbe.org.eg/historical-data"}


def headers_for(table):
    """A fake fetcher: url -> headers, recording every call (no network)."""
    calls = []

    def fetch(url):
        calls.append(url)
        return table.get(url, {})

    fetch.calls = calls
    return fetch


@pytest.fixture
def root(tmp_path):
    write(tmp_path, "kenya/tbill_auctions.json", [kenya_bill("2026-10-12", "https://cbk.example/r-12-10.pdf")])
    write(tmp_path, "egypt/bond_auctions.json", [egypt_bond("2026-10-12")], source_page="https://www.cbe.org.eg/historical-data")
    return tmp_path


def load(root):
    return json.loads((root / "data" / "latency.json").read_text(encoding="utf-8"))


def test_first_run_is_baseline_and_fetches_nothing(root):
    fetch = headers_for({})
    body = lt.record(root, now=T0, fetch=fetch)
    assert fetch.calls == []
    assert body["since"] == "2026-10-13"
    assert {r["key"] for r in body["results"]} == {"bills:kenya:2026-10-12", "bonds:egypt:2026-10-12"}
    assert all(r["baseline"] and r["first_seen_at"] is None for r in body["results"])
    assert body["overall"] == {"timed": 0, "results": 0, "p50_h": None, "p90_h": None}
    kenya = next(s for s in body["summary"] if s["kind"] == "bills" and s["market"] == "kenya")
    assert kenya["status"] == "no new result since measuring began"


def test_new_result_gets_first_seen_and_own_document_last_modified(root):
    lt.record(root, now=T0, fetch=headers_for({}))
    pdf = "https://cbk.example/r-19-10.pdf"
    written = T0 + timedelta(days=4, minutes=5)
    write(root, "kenya/tbill_auctions.json", [kenya_bill("2026-10-19", pdf), kenya_bill("2026-10-12", "https://cbk.example/r-12-10.pdf")],
          updated_at=written.isoformat())
    now = written + timedelta(minutes=30)
    published = written - timedelta(hours=3)
    fetch = headers_for({pdf: {"Last-Modified": published.strftime(HTTP), "Date": now.strftime(HTTP)}})
    body = lt.record(root, now=now, fetch=fetch)
    assert fetch.calls == [pdf]  # only the new result's document is looked up
    r = next(x for x in body["results"] if x["key"] == "bills:kenya:2026-10-19")
    assert r["first_seen_at"] == written.isoformat()  # the reader's own write time, not this script's
    assert r["published_at"] == published.isoformat()
    assert r["delay_h"] == 3.0
    assert "own document" in r["published_how"]


def test_generated_last_modified_is_not_a_release_time(root):
    lt.record(root, now=T0, fetch=headers_for({}))
    pdf = "https://cbk.example/r-19-10.pdf"
    write(root, "kenya/tbill_auctions.json", [kenya_bill("2026-10-19", pdf)])
    now = T0 + timedelta(days=4)
    fetch = headers_for({pdf: {"Last-Modified": now.strftime(HTTP), "Date": (now + timedelta(seconds=1)).strftime(HTTP)}})
    r = next(x for x in lt.record(root, now=now, fetch=fetch)["results"] if x["key"] == "bills:kenya:2026-10-19")
    assert r["published_at"] is None and "delay_h" not in r
    assert r["first_seen_at"] == now.isoformat()  # no updated_at in the file: this run's time


def test_shared_page_only_counts_for_the_single_newest_result(root):
    lt.record(root, now=T0, fetch=headers_for({}))
    page = "https://www.cbe.org.eg/historical-data"
    write(root, "egypt/bond_auctions.json", [egypt_bond("2026-10-12"), egypt_bond("2026-10-14", "EG2"), egypt_bond("2026-10-15", "EG3")], source_page="https://www.cbe.org.eg/")
    now = T0 + timedelta(days=3)
    fetch = headers_for({page: {"Last-Modified": (now - timedelta(hours=5)).strftime(HTTP), "Date": now.strftime(HTTP)}})
    body = lt.record(root, now=now, fetch=fetch)
    got = {x["date"]: x for x in body["results"] if x["market"] == "egypt" and not x.get("baseline")}
    assert set(got) == {"2026-10-14", "2026-10-15"}
    assert got["2026-10-14"]["published_at"] is None  # two new results share the page: it dates neither
    assert got["2026-10-15"]["published_at"] is None
    assert fetch.calls == []


def test_reader_hint_wins_and_is_consumed(root):
    lt.record(root, now=T0, fetch=headers_for({}))
    write(root, "kenya/tbill_auctions.json", [kenya_bill("2026-10-19", "https://cbk.example/r-19-10.pdf")])
    now = T0 + timedelta(days=4)
    lt.latency_hint("bills", "kenya", "2026-10-19", (now - timedelta(hours=2)).isoformat(), "upload time in a listing", root=root)
    lt.latency_hint("bills", "kenya", "2026-10-19", (now - timedelta(hours=1)).isoformat(), "later re-upload", root=root)  # earliest kept
    lt.latency_hint("bills", "kenya", "2026-10-19", "2026-10-15T09:00:00", "no zone", root=root)  # zone-less: ignored
    fetch = headers_for({})
    r = next(x for x in lt.record(root, now=now, fetch=fetch)["results"] if x["key"] == "bills:kenya:2026-10-19")
    assert r["delay_h"] == 2.0 and r["published_how"] == "upload time in a listing"
    assert fetch.calls == []
    assert not (root / "data" / "latency_hints.json").exists()


def test_publisher_time_after_first_sight_is_kept_but_excluded(root):
    lt.record(root, now=T0, fetch=headers_for({}))
    write(root, "kenya/tbill_auctions.json", [kenya_bill("2026-10-19", "https://cbk.example/r.pdf")])
    now = T0 + timedelta(days=4)
    lt.latency_hint("bills", "kenya", "2026-10-19", (now + timedelta(hours=1)).isoformat(), "listing", root=root)
    r = next(x for x in lt.record(root, now=now)["results"] if x["key"] == "bills:kenya:2026-10-19")
    assert r["delay_h"] == -1.0 and r["excluded"]


def test_history_filled_in_is_not_news(root):
    lt.record(root, now=T0, fetch=headers_for({}))
    write(root, "kenya/tbill_auctions.json", [kenya_bill("2026-08-03", "https://cbk.example/old.pdf"), kenya_bill("2026-10-12", "https://cbk.example/r-12-10.pdf")])
    fetch = headers_for({})
    body = lt.record(root, now=T0 + timedelta(hours=2), fetch=fetch)
    assert not any(x["date"] == "2026-08-03" for x in body["results"])
    assert fetch.calls == []


def test_a_market_seen_for_the_first_time_starts_as_baseline(root):
    lt.record(root, now=T0, fetch=headers_for({}))
    write(root, "zambia/bond_auctions.json", [{"auction_date": "2026-10-10", "yield": 15.0, "notice": "https://boz.example/n.pdf"}])
    body = lt.record(root, now=T0 + timedelta(days=1), fetch=headers_for({}))
    z = next(x for x in body["results"] if x["market"] == "zambia")
    assert z["baseline"] and body["markets"]["bonds:zambia"] == "2026-10-14"


def test_unchanged_run_leaves_the_file_alone(root):
    lt.record(root, now=T0, fetch=headers_for({}))
    before = (root / "data" / "latency.json").read_text(encoding="utf-8")
    lt.record(root, now=T0 + timedelta(hours=2), fetch=headers_for({}))
    assert (root / "data" / "latency.json").read_text(encoding="utf-8") == before


def test_figures_only_from_five_timed_results(root):
    lt.record(root, now=T0, fetch=headers_for({}))
    rows = []
    delays = [1, 2, 3, 4, 10]
    now = T0
    for i, h in enumerate(delays):
        day = (T0 + timedelta(days=i + 1)).date().isoformat()
        rows.insert(0, kenya_bill(day, f"https://cbk.example/{day}.pdf"))
        write(root, "kenya/tbill_auctions.json", rows)
        now = T0 + timedelta(days=i + 1, hours=12)
        lt.latency_hint("bills", "kenya", day, (now - timedelta(hours=h)).isoformat(), "listing", root=root)
        body = lt.record(root, now=now, fetch=headers_for({}))
        kenya = next(s for s in body["summary"] if s["kind"] == "bills" and s["market"] == "kenya")
        if i < 4:
            assert kenya["p50_h"] is None and kenya["timed"] == i + 1
    assert (kenya["p50_h"], kenya["p90_h"], kenya["status"]) == (3.0, 7.6, "measured")
    assert body["overall"]["p50_h"] == 3.0 and body["overall"]["timed"] == 5
    egypt = next(s for s in body["summary"] if s["kind"] == "bonds" and s["market"] == "egypt")
    assert egypt["status"] == "no new result since measuring began"


def test_results_without_publisher_time_say_so(root):
    lt.record(root, now=T0, fetch=headers_for({}))
    write(root, "egypt/bond_auctions.json", [egypt_bond("2026-10-12"), egypt_bond("2026-10-14", "EG2")])
    body = lt.record(root, now=T0 + timedelta(days=1), fetch=headers_for({}))
    egypt = next(s for s in body["summary"] if s["kind"] == "bonds" and s["market"] == "egypt")
    assert (egypt["results"], egypt["timed"], egypt["status"]) == (1, 0, "publisher time unknown")


def test_waemu_results_split_by_country(root):
    write(root, "waemu/auctions.json", [
        {"country": "senegal", "operation_date": "2026-10-09", "source": "https://umoa.example/sn"},
        {"country": "mali", "operation_date": "2026-10-09", "source": "https://umoa.example/ml"},
    ])
    body = lt.record(root, now=T0, fetch=headers_for({}))
    keys = {x["key"] for x in body["results"] if x["market"] == "waemu"}
    assert keys == {"bonds:waemu:2026-10-09:senegal", "bonds:waemu:2026-10-09:mali"}


def test_zambia_release_time_prefers_the_notice_file():
    import zambia_tbills as zt

    node = {"changed": "2026-10-01T18:00:00+00:00"}
    assert zt.release_time({"created": "2026-10-01T16:25:12+00:00"}, node)[0] == "2026-10-01T16:25:12+00:00"
    assert "last-changed" in zt.release_time({}, node)[1]
    assert zt.release_time(None, {}) is None


def test_last_modified_rules():
    lm = datetime(2026, 10, 13, 9, 0, tzinfo=timezone.utc)
    assert lt.last_modified({"last-modified": lm.strftime(HTTP)}) == (lm, "ok")
    assert lt.last_modified({})[0] is None
    assert lt.last_modified({"Last-Modified": lm.strftime(HTTP), "Date": (lm + timedelta(seconds=30)).strftime(HTTP)})[1] == "generated on request"
    assert lt.parse_time("2026-10-13T09:00:00") is None  # a time without a zone is not trusted
    assert lt.parse_time("2026-10-13T12:00:00+03:00") == lm
