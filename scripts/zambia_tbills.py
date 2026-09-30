"""
Zambia Treasury bill auction history from the Bank of Zambia.

The BoZ website is backed by a Drupal JSON:API. Each auction is a `tbills_auction_results` node with one
paragraph per tenor carrying the yield rate and discount rate, plus the result notice PDF. Amounts are not in
the structured record, so this dataset carries rates only.

    python scripts/zambia_tbills.py
"""

from __future__ import annotations

import re
import sys
import time
import warnings

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import UA, num, write  # noqa: E402

warnings.filterwarnings("ignore")
BASE = "https://www.boz.zm/jsonapi/node/tbills_auction_results"
PAGE = "https://www.boz.zm/markets-securities/treasury-bills"


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
    rows, nodes, with_rates = [], 0, 0
    for body in pages():
        included = {i["id"]: i for i in body.get("included", [])}
        for node in body.get("data", []):
            nodes += 1
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
            got = False
            for ref in (rel.get("field_tbills_auction_results") or {}).get("data") or []:
                p = included.get(ref["id"])
                if not p:
                    continue
                m = re.search(r"(\d+)_days", p["type"])
                if not m:
                    continue
                attrs = p["attributes"]
                yield_rate = next((num(v) for k, v in attrs.items() if "yield" in k), None)
                discount = next((num(v) for k, v in attrs.items() if "discount" in k), None)
                isin = next((v for k, v in attrs.items() if k.endswith("isin")), None)
                if yield_rate is None or not (0 < yield_rate < 80):
                    continue
                got = True
                rows.append({
                    "tenor": int(m.group(1)),
                    "auction_date": day,
                    "value_date": day,
                    "tender": a.get("title"),
                    "isin": isin,
                    "discount_rate": discount,
                    "weighted_avg_rate": yield_rate,
                    "offered_zmw_m": None,
                    "received_zmw_m": None,
                    "accepted_zmw_m": None,
                    "source": pdf or PAGE,
                })
            with_rates += got
    print(f"auction records: {nodes}, with structured rates: {with_rates}")
    write(
        "zambia",
        dataset="Zambia Treasury bill auctions",
        publisher="Bank of Zambia",
        source_page=PAGE,
        currency="ZMW",
        rate_note="yield rate at the auction, percent per annum (discount rate also given)",
        rows=rows,
        notes="The Bank of Zambia's structured record carries rates only; amounts are in each linked notice.",
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
