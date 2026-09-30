"""
Zambia Treasury bill auction history from the Bank of Zambia.

The BoZ website is backed by a Drupal JSON:API. Each auction is a `tbills_auction_results` node with one
paragraph per tenor carrying the yield rate and discount rate, plus the result notice PDF. The structured
paragraphs only exist for recent auctions, so every notice PDF is also read for amounts, price and the cut-off
yield. Notices already read are kept in the output's `sources` and not fetched again.

    python scripts/zambia_tbills.py
"""

from __future__ import annotations

import io
import re
import sys
import time
import warnings

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import UA, load_existing, num, write  # noqa: E402

warnings.filterwarnings("ignore")
BASE = "https://www.boz.zm/jsonapi/node/tbills_auction_results"
PAGE = "https://www.boz.zm/markets-securities/treasury-bills"


def parse_notice(text: str) -> dict[int, dict]:
    """Tenor lines read: '91 DAYS ZM3000012994 K440.00 Mn K400.23 Mn K389.18 Mn K399.17 Mn K388.04 Mn 97.2163 11.5000 ...'
    = offered, bids (face), bids (cost), allocated (face), allocated (cost), cut-off price, cut-off yield."""
    out = {}
    for line in text.splitlines():
        m = re.match(r"^\s*(91|182|273|364)\s*-?\s*DAYS?\b(.*)$", line, flags=re.I)
        if not m:
            continue
        rest = re.sub(r"\bZM\d{6,}\b", " ", m.group(2))
        rest = re.sub(r"\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?", " ", rest)  # yield ranges
        nums = [float(x.replace(",", "")) for x in re.findall(r"\d[\d,]*\.?\d*", rest)]
        if len(nums) < 7:
            continue
        offered, bid_face, _bid_cost, alloc_face, _alloc_cost, price, rate = nums[:7]
        if not (40 < price <= 100) or not (0 < rate < 80):
            continue
        out[int(m.group(1))] = {"offered": offered, "received": bid_face, "accepted": alloc_face, "price": price, "rate": rate}
    return out


def read_pdf(url: str) -> dict[int, dict] | None:
    import pdfplumber

    for attempt in range(3):
        try:
            content = requests.get(url, headers=UA, timeout=(15, 90), verify=False).content
            if content[:4] != b"%PDF":
                return None
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                return parse_notice("\n".join((p.extract_text() or "") for p in pdf.pages[:2]))
        except Exception:
            if attempt == 2:
                return None
            time.sleep(3 + attempt * 3)
    return None


def pages():
    url = f"{BASE}?include=field_tbills_auction_results,field_auction&sort=-field_tbills_auction_date&page[limit]=50"
    while url:
        for attempt in range(3):
            try:
                body = requests.get(url, headers=UA, timeout=(15, 90), verify=False).json()
                break
            except Exception:
                if attempt == 2:
                    raise
                time.sleep(3 + attempt * 3)
        yield body
        url = (body.get("links", {}).get("next") or {}).get("href")


def main() -> int:
    from concurrent.futures import ThreadPoolExecutor

    existing = load_existing("zambia")
    cache = {u: v for u, v in existing.get("sources", {}).items() if v.get("status") == "parsed"}
    records = []
    for body in pages():
        included = {i["id"]: i for i in body.get("included", [])}
        for node in body.get("data", []):
            a = node["attributes"]
            day = a.get("field_tbills_auction_date")
            if not day:
                continue
            rel = node.get("relationships", {})
            pdf = None
            f = (rel.get("field_auction") or {}).get("data")
            if f and f.get("id") in included:
                uri = (included[f["id"]]["attributes"].get("uri") or {}).get("url")
                pdf = f"https://www.boz.zm{uri}" if uri and uri.startswith("/") else uri
            structured = {}
            for ref in (rel.get("field_tbills_auction_results") or {}).get("data") or []:
                p = included.get(ref["id"])
                m = re.search(r"(\d+)_days", p["type"]) if p else None
                if not m:
                    continue
                attrs = p["attributes"]
                structured[int(m.group(1))] = {
                    "rate": next((num(v) for k, v in attrs.items() if "yield" in k), None),
                    "discount": next((num(v) for k, v in attrs.items() if "discount" in k), None),
                    "isin": next((v for k, v in attrs.items() if k.endswith("isin")), None),
                }
            records.append({"day": day, "tender": a.get("title"), "pdf": pdf, "structured": structured})

    todo = [r["pdf"] for r in records if r["pdf"] and r["pdf"] not in cache]
    print(f"auction records: {len(records)}, notices to read: {len(todo)}")
    with ThreadPoolExecutor(max_workers=6) as pool:
        for url, parsed in zip(todo, pool.map(read_pdf, todo)):
            cache[url] = {"status": "parsed", "tenors": {str(k): v for k, v in parsed.items()}} if parsed else {"status": "unparsed"}

    rows = []
    for rec in records:
        notice = {int(k): v for k, v in (cache.get(rec["pdf"], {}).get("tenors") or {}).items()}
        for tenor in sorted(set(notice) | set(rec["structured"])):
            s_ = rec["structured"].get(tenor, {})
            n_ = notice.get(tenor, {})
            rate = s_.get("rate") or n_.get("rate")
            if rate is None or not (0 < rate < 80):
                continue
            rows.append({
                "tenor": tenor,
                "auction_date": rec["day"],
                "value_date": rec["day"],
                "tender": rec["tender"],
                "isin": s_.get("isin"),
                "discount_rate": s_.get("discount"),
                "price_per_100": n_.get("price"),
                "weighted_avg_rate": rate,
                "offered_zmw_m": n_.get("offered"),
                "received_zmw_m": n_.get("received"),
                "accepted_zmw_m": n_.get("accepted"),
                "source": rec["pdf"] or PAGE,
            })
    unparsed = sum(1 for v in cache.values() if v["status"] != "parsed")
    print(f"notices parsed: {len(cache) - unparsed}, unparsed: {unparsed}")
    write(
        "zambia",
        dataset="Zambia Treasury bill auctions",
        publisher="Bank of Zambia",
        source_page=PAGE,
        currency="ZMW",
        rate_note="cut-off yield rate at the auction, percent per annum",
        rows=rows,
        sources=cache,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
