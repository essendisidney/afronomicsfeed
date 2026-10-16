"""Rate series: sparklines draw only stored history, and the compare view's default pairs are checked by the site QA.

Offline: rebuilds each series' point count from data/*.json the way lib/data/rate-series.ts does, checks the
three-point rule in lib/rate-series-core.ts and components/rates/Spark.tsx, and checks that every default compare
pair is in tests/site/pages.json (so site-qa fetches it and fails on anything but 200).

Against a running build (AF_BASE_URL=http://localhost:3203): fetches the pages that carry sparklines and checks
every drawn sparkline has three or more points and that no series with fewer is drawn, and that each default compare
URL answers 200.
"""

import json
import os
import re
import statistics
import urllib.request
from collections import defaultdict
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
CORE = (ROOT / "lib/rate-series-core.ts").read_text(encoding="utf-8")
SPARK = (ROOT / "components/rates/Spark.tsx").read_text(encoding="utf-8")
CATALOG = (ROOT / "lib/data/rate-series.ts").read_text(encoding="utf-8")
PAGES = json.loads((ROOT / "tests/site/pages.json").read_text(encoding="utf-8"))["pages"]
BASE = os.environ.get("AF_BASE_URL", "").rstrip("/")


def load(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def fund_slug(name):
    s = re.sub(r"\(.*?\)", "", name.lower())
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def series_counts():
    """Stored points per series id (one per date), mirroring lib/data/rate-series.ts."""
    counts = {}
    tb = load("data/kenya/tbill_auctions.json")["rows"]
    for tenor in (91, 182, 364):
        counts[f"kenya-{tenor}d"] = len({r["value_date"] for r in tb if r["tenor"] == tenor and r.get("weighted_avg_rate") is not None})
    for market in ["nigeria", "ghana", "uganda", "tanzania", "egypt", "southafrica", "zambia", "malawi", "mozambique"]:
        f = ROOT / "data" / market / "tbill_auctions.json"
        if not f.exists():
            continue
        rows = json.loads(f.read_text(encoding="utf-8")).get("rows", [])
        key = "stop_rate" if market == "nigeria" else "weighted_avg_rate"
        for tenor in (91, 182, 364):
            dates = {
                r.get("value_date")
                for r in rows
                if int(r.get("tenor") or 0) == tenor and isinstance(r.get(key), (int, float)) and r.get("kind") in (None, "primary")
                and re.match(r"^\d{4}-\d{2}-\d{2}$", str(r.get("value_date", "")))
            }
            if dates:
                counts[f"{market}-{tenor}d"] = len(dates)
    history = load("data/policy_rate_history.json")["rows"]
    for row in load("data/policy_rates.json")["rows"]:
        m = row["market"]
        n = len({h["first_seen"] for h in history if h["market"] == m})
        if n:
            counts["kenya-cbr" if m == "kenya" else f"{m}-policy"] = n
    rates = load("data/kenya/rates.json")
    current = [f["name"] for f in rates["money_market_funds"]["rows"]]
    by_day = defaultdict(dict)
    for r in load("data/kenya/mmf_history.json")["rows"]:
        by_day[r["date"]][r["name"]] = r["effective_annual_yield"]
    for name in current:
        counts[f"kenya-mmf-{fund_slug(name)}"] = sum(1 for d in by_day.values() if name in d)
    counts["kenya-mmf"] = sum(1 for d in by_day.values() if all(n in d for n in current))
    months = {r["month"] for r in rates["bank_rates"]["rows"]}
    for k in ("deposit", "savings", "lending"):
        counts[f"kenya-bank-{k}"] = len(months)
    counts["kenya-cpi"] = len({l["month"] for l in load("data/kenya/cpi.json")["rebased"]["levels"]})
    return counts


def default_pairs():
    block = CORE.split("export const defaultPairs", 1)[1].split("];", 1)[0]
    return re.findall(r'\["([a-z0-9-]+)",\s*"([a-z0-9-]+)"\]', block)


def hub_ids():
    block = CATALOG.split("export const hubSeriesIds", 1)[1].split("];", 1)[0]
    return re.findall(r'"([a-z0-9-]+)"', block)


def test_three_point_rule_is_in_the_code():
    assert re.search(r"export const MIN_SPARK_POINTS = 3;", CORE)
    assert "pts.length >= MIN_SPARK_POINTS ? pts : []" in CORE, "sparkPoints() must return nothing below three points"
    assert "if (pts.length < MIN_SPARK_POINTS) return null;" in SPARK, "Spark must draw nothing below three points"


def test_no_chart_library_in_sparklines():
    assert '"use client"' not in SPARK, "sparklines are rendered on the server"
    assert not re.search(r'from "(recharts|chart\.js|d3[^"]*|@nivo[^"]*|victory)"', SPARK)


def test_every_sparkline_series_has_three_points_or_is_hidden():
    counts = series_counts()
    hidden = sorted(k for k, n in counts.items() if n < 3)
    shown = sorted(k for k, n in counts.items() if n >= 3)
    # The hub leads with these; each must exist in the stored data, drawn or not.
    for sid in hub_ids():
        assert sid in counts, f"hub series {sid} has no stored history"
    # The Kenya series the rates pages lean on must have enough history to draw.
    for sid in ("kenya-91d", "kenya-182d", "kenya-364d", "kenya-bank-deposit", "kenya-bank-savings", "kenya-mmf"):
        assert counts.get(sid, 0) >= 3, f"{sid}: only {counts.get(sid, 0)} stored points"
    assert shown, "no series can draw a sparkline"
    print("hidden (fewer than 3 stored points):", hidden)


def test_default_compare_pairs_are_in_the_site_qa_page_list():
    pairs = default_pairs()
    assert len(pairs) >= 2
    assert pairs[0] == ("kenya-91d", "kenya-cbr")
    assert ("kenya-91d", "kenya-mmf") in pairs
    listed = {p for p in PAGES if isinstance(p, str)}
    counts = series_counts()
    for a, b in pairs:
        assert a in counts and b in counts, f"default pair {a} / {b} names a series with no data"
        assert f"/rates/compare?a={a}&b={b}" in listed, f"site-qa must fetch /rates/compare?a={a}&b={b}"


needs_server = pytest.mark.skipif(not BASE, reason="set AF_BASE_URL to a running build to check rendered pages")


def fetch(path):
    req = urllib.request.Request(BASE + path, headers={"x-afronomics-internal": "site-qa"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.status, r.read().decode("utf-8")


@needs_server
@pytest.mark.parametrize("path", ["/numbers", "/rates/kenya", "/rates/kenya/money-market-funds", "/rates/policy", "/markets/tbills", "/markets/kenya-tbills"])
def test_rendered_sparklines_have_three_points(path):
    counts = series_counts()
    status, html = fetch(path)
    assert status == 200
    drawn = re.findall(r'data-spark="([a-z0-9-]+)" data-points="(\d+)"', html)
    assert drawn, f"{path} draws no sparkline"
    for sid, n in drawn:
        assert int(n) >= 3, f"{path}: {sid} drawn with {n} points"
        assert counts.get(sid, 0) >= 3, f"{path}: {sid} drawn but has {counts.get(sid, 0)} stored points"


@needs_server
@pytest.mark.parametrize("pair", default_pairs())
def test_default_compare_urls_answer_200(pair):
    status, html = fetch(f"/rates/compare?a={pair[0]}&b={pair[1]}")
    assert status == 200
    assert "Information, not advice" in html
