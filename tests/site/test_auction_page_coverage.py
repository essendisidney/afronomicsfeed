"""Every market we hold auction data for has dated auction pages (docs/rebuild/upgrade-U6-plan.md, item A; master
plan v2, build item 8). The pages are generated from the market lists in lib/data/sovereign-bonds.ts and
lib/data/sovereign-bills.ts, so a new data file whose market is missing from those lists would have no pages, no
sitemap entries and no Dataset markup. This pins the data folder to the lists."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"


def slugs(ts_file: str, type_name: str) -> set[str]:
    src = (ROOT / ts_file).read_text(encoding="utf-8")
    m = re.search(type_name + r' = \{\s*slug:\s*([^;]+);', src)
    assert m, f"no slug union in {ts_file}"
    return set(re.findall(r'"([a-z]+)"', m.group(1)))


def rows(f: Path) -> int:
    return len(json.loads(f.read_text(encoding="utf-8")).get("rows") or [])


def test_every_bond_file_is_a_bond_market_with_pages():
    markets = slugs("lib/data/sovereign-bonds.ts", "export type BondMarket")
    held = {f.parent.name for f in DATA.glob("*/bond_auctions.json") if rows(f)}
    # Morocco's and WAEMU's readers write one auctions.json per market (bonds only).
    held |= {f.parent.name for f in DATA.glob("*/auctions.json") if rows(f)}
    assert held, "no bond data found"
    assert held <= markets, f"bond data with no dated pages: {sorted(held - markets)}"


def test_every_bill_file_is_a_bill_market_with_pages():
    markets = slugs("lib/data/sovereign-bills.ts", "export type BillMarket")
    held = {f.parent.name for f in DATA.glob("*/tbill_auctions.json") if rows(f)}
    assert held <= markets, f"bill data with no dated pages: {sorted(held - markets)}"


def test_dated_pages_are_in_the_sitemap():
    src = (ROOT / "app/sitemap.ts").read_text(encoding="utf-8")
    for needle in ("allAuctionPaths", "bondDates()", "allTbillWeeks()", "marketDates(m.slug)", 'page("/press"'):
        assert needle in src, f"sitemap lost {needle}"
