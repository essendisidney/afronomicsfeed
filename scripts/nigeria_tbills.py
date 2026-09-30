"""
Nigerian Treasury bill (NTB) primary-market auction history from the Central Bank of Nigeria.

The CBN publishes every NTB auction since 2002 as JSON behind its Government Securities page
(https://www.cbn.gov.ng/rates/GovtSecurities.html). This script reads it, normalises tenors, dates and
amounts, and writes one row per auction per tenor to data/nigeria/tbill_auctions.json.

    python scripts/nigeria_tbills.py
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

API = "https://www.cbn.gov.ng/api/GetAllSecuritiesNTB"
SOURCE_PAGE = "https://www.cbn.gov.ng/rates/GovtSecurities.html"
OUT = Path(__file__).resolve().parent.parent / "data" / "nigeria" / "tbill_auctions.json"
UA = {"User-Agent": "Mozilla/5.0 (compatible; AfronomicsBot/1.0; +https://www.afronomicsfeed.com/method)", "Accept": "application/json"}
MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def parse_date(value: str | None) -> str | None:
    m = re.match(r"([A-Za-z]+)-(\d{1,2})-(\d{4})", (value or "").strip())
    if not m:
        return None
    month = MONTHS.get(m.group(1)[:3].lower())
    return f"{m.group(3)}-{month:02d}-{int(m.group(2)):02d}" if month else None


def num(value) -> float | None:
    try:
        n = float(str(value).replace(",", "").replace("%", "").strip())
    except ValueError:
        return None
    return n if n > 0 else None


def rate_range(value: str | None) -> tuple[float | None, float | None]:
    parts = re.findall(r"\d+(?:\.\d+)?", value or "")
    if len(parts) >= 2:
        return float(parts[0]), float(parts[1])
    return None, None


def normalise(item: dict) -> dict | None:
    if "primary" not in str(item.get("auction", "")).lower():
        return None
    tenor_digits = re.match(r"\s*(\d+)", str(item.get("tenor", "")))
    tenor = int(tenor_digits.group(1)) if tenor_digits else None
    date = parse_date(item.get("auctionDate"))
    rate = num(item.get("rate"))
    if tenor not in (91, 182, 364) or not date or rate is None or not (0 < rate < 80):
        return None
    received = num(item.get("totalSubscription"))
    accepted = num(item.get("totalSuccessful"))
    low, high = rate_range(item.get("rangeBid"))
    return {
        "tenor": tenor,
        "value_date": date,
        "maturity": parse_date(item.get("maturityDate")),
        "offered_ngn_m": num(item.get("amtOffered")),
        "received_ngn_m": received,
        "accepted_ngn_m": accepted,
        "stop_rate": rate,
        "true_yield": num(item.get("trueYield")),
        "bid_range_low": low,
        "bid_range_high": high,
        "cbn_id": item.get("id"),
    }


def main() -> int:
    response = requests.get(API, headers=UA, timeout=120)
    response.raise_for_status()
    raw = response.json()
    rows = [row for row in (normalise(item) for item in raw) if row]
    unique = {}
    for row in rows:
        unique[(row["value_date"], row["tenor"])] = row
    ordered = sorted(unique.values(), key=lambda r: (r["value_date"], r["tenor"]), reverse=True)
    for row in ordered:
        row["source"] = SOURCE_PAGE

    previous = json.loads(OUT.read_text(encoding="utf-8")).get("rows", []) if OUT.exists() else []
    if previous == ordered:
        print(f"Nothing new; dataset unchanged ({len(ordered)} rows).")
        return 0

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Nigerian Treasury bill primary auctions",
        "publisher": "Central Bank of Nigeria",
        "source_page": SOURCE_PAGE,
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "units": {"amounts": "NGN millions", "rates": "percent per annum; stop rate is the CBN's published issue rate"},
        "rows": ordered,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"rows: {len(ordered)} from {len(raw)} records; newest {ordered[0]['value_date']}, oldest {ordered[-1]['value_date']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
