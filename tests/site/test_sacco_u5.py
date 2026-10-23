"""U5 (docs/rebuild/upgrade-U5-plan.md): the SACCO member widget, the sales page and the peer-comparison method.

Pins the named-institutions rule (docs/editorial/named-institutions.md, D-028): the widget shows only the regulator's
figures for its own SACCO, with source, date and "Information, not advice."; no grade, score, rank, tier median or
SASRA minimum appears in it; the demo describes no SACCO; the method page publishes no score; the sales page names no
SACCO and reads its price from the rate card.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WIDGET = (ROOT / "lib/embeds-sacco.ts").read_text()
ROUTE = (ROOT / "app/embed/sacco/[slug]/route.ts").read_text()
LOADER = (ROOT / "public/widgets/sacco.js").read_text()
METHOD = (ROOT / "app/method/peer-comparison/page.tsx").read_text()
SALES = (ROOT / "app/for-institutions/saccos/page.tsx").read_text()
WATCH = (ROOT / "lib/watch.ts").read_text()
WATCH_HTML = (ROOT / "lib/editions/watch-html.ts").read_text()

GRADES = re.compile(
    r"\b(weak|strong|healthy|unhealthy|risky|at risk|breach|fails?|failing|passes|below the minimum|above the minimum|warning|danger|"
    r"concern|grade [A-F]|score:|rated|ranked|top \d+|best SACCO|worst)\b",
    re.I,
)


def _own_widget_body() -> str:
    # The part of the widget that describes a real SACCO: from own() to the sample builder.
    return WIDGET.split("function own(", 1)[1].split("function sample(", 1)[0]


def test_widget_shows_own_figures_only():
    own = _own_widget_body()
    assert "latest(inst, metric)" in own and "growth(inst, metric)" in own
    for banned in ("tierStats", "tierMedian", "median", "STANDARDS", "minimum", "rank"):
        assert banned not in own, banned
    assert not GRADES.search(WIDGET), GRADES.search(WIDGET)


def test_widget_names_source_date_and_disclaimer():
    html = WIDGET.split("export function saccoWidgetHtml", 1)[1]
    assert "Information, not advice." in html
    assert "Data: ${site.name}" in html
    assert "Source: " in html and "As at " in html
    assert "SASRA licensed list" in html


def test_demo_widget_is_labelled_and_describes_no_sacco():
    sample = WIDGET.split("function sample(", 1)[1].split("export function saccoWidget(", 1)[0]
    assert 'name: "Demo SACCO (sample)"' in sample
    assert "sample: true" in sample and "licence: null" in sample
    assert "describes no SACCO" in WIDGET


def test_widget_route_is_frameable_and_not_indexed():
    assert '"Content-Security-Policy": "frame-ancestors *"' in ROUTE
    assert '"X-Robots-Tag": "noindex"' in ROUTE and "status: 404" in ROUTE


def test_loader_checks_the_sender():
    assert "e.origin !== origin" in LOADER and "contentWindow === e.source" in LOADER
    assert "afronomics:height" in LOADER and "afronomics:height" in WIDGET


def test_method_page_publishes_no_score():
    assert "We publish no score, grade, rating or ranking of any named SACCO" in METHOD
    assert "published on this page" in METHOD and "first" in METHOD
    assert "25th and 75th percentiles" in METHOD
    assert '"/method/peer-comparison"' in (ROOT / "app/method/page.tsx").read_text()


def test_sales_page_names_no_sacco_and_sets_no_price():
    names = {"Mwalimu", "Stima", "Kenya Police", "Harambee", "Unaitas", "Tower", "Kimisitu"}
    assert not [n for n in names if n in SALES]
    assert not re.search(r"KES\s?[\d,]{3,}", SALES), "prices come from lib/billing/ratecard.ts"
    assert 'rateItem("pack_plus")' in SALES and "priceText(pack)" in SALES
    assert "/pricing?from=sacco-watch#pilot" in SALES and 'EnquiryForm interest="pack"' in SALES


def test_watch_pack_spread_is_a_range_not_a_position():
    assert "export function quantile" in WATCH and "export function tierStats" in WATCH
    assert "middle half of the tier" in WATCH_HTML
    assert not re.search(r"\b(percentile rank|position|rank)\b", WATCH_HTML.split("function lineRows", 1)[1].split("function offerPage", 1)[0], re.I)
    assert "What a subscribing SACCO receives" in WATCH_HTML and "sample ? offerPage(" in WATCH_HTML
