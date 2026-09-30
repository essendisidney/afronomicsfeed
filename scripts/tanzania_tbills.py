"""
Tanzania Treasury bill auction history from the Bank of Tanzania.

The BoT lists every auction on https://www.bot.go.tz/TBills and serves each auction's summary table as JSON
(the page's own "View" button). This script reads the list, fetches every auction it has not seen, and writes
one row per auction per tenor to data/tanzania/tbill_auctions.json.

    python scripts/tanzania_tbills.py          # incremental
    python scripts/tanzania_tbills.py --full   # re-read everything
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import requests
import urllib3

urllib3.disable_warnings()

LIST_URL = "https://www.bot.go.tz/TBills?lang=en"
DETAIL_URL = "https://www.bot.go.tz/Tbills/getTbillsDetails"
OUT = Path(__file__).resolve().parent.parent / "data" / "tanzania" / "tbill_auctions.json"
UA = {"User-Agent": "Mozilla/5.0 (compatible; AfronomicsBot/1.0; +https://www.afronomicsfeed.com/method)", "X-Requested-With": "XMLHttpRequest"}
MONTHS = {m: i for i, m in enumerate(["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], 1)}


def list_auctions(session: requests.Session) -> list[tuple[int, str]]:
    html = session.get(LIST_URL, headers=UA, timeout=60, verify=False).text
    out = []
    for no, day, mon, year in re.findall(r"Auction No\.\s*(\d+)\s+Held on\s+(\d{1,2})-([A-Z]{3})-(\d{4})", html, flags=re.I):
        month = MONTHS.get(mon.upper())
        if month:
            out.append((int(no), f"{year}-{month:02d}-{int(day):02d}"))
    return sorted(set(out))


def num(value) -> float | None:
    try:
        n = float(str(value).replace(",", "").strip())
    except ValueError:
        return None
    return n


def fetch(no: int, session: requests.Session):
    for attempt in range(3):
        try:
            r = session.post(DETAIL_URL, data={"au_no": str(no)}, headers=UA, timeout=60, verify=False)
            body = r.json()
            return body.get("TbillData") or []
        except Exception:
            time.sleep(2 + attempt * 3)
    return None


def parse(table: list, no: int, date: str) -> list[dict]:
    if not table or len(table) < 3:
        return []
    header = table[0]
    by_label = {str(row[0]).strip().lower(): row[1:] for row in table[1:] if row}

    def pick(*labels):
        for label, values in by_label.items():
            if any(label.startswith(l) for l in labels):
                return values
        return []

    yields = pick("weighted average yield")
    prices = pick("weighted average price")
    offered = pick("amount offered")
    tendered = pick("amount tendered")
    accepted = pick("successful bids tzs")
    rows = []
    for k, head in enumerate(header[1:]):
        m = re.match(r"\s*(\d+)\s*Days", str(head), flags=re.I)
        if not m:
            continue
        tenor = int(m.group(1))
        at = lambda values: num(values[k]) if k < len(values) else None  # noqa: E731
        rate = at(yields)
        if tenor not in (35, 91, 182, 364) or rate is None or not (0 < rate < 40):
            continue
        row = {
            "tenor": tenor,
            "auction_no": no,
            "value_date": date,
            "offered_tzs_m": at(offered),
            "received_tzs_m": at(tendered),
            "accepted_tzs_m": at(accepted),
            "weighted_avg_rate": rate,
            "price_per_100": at(prices),
        }
        if row["accepted_tzs_m"] and row["received_tzs_m"] and row["accepted_tzs_m"] > row["received_tzs_m"] * 1.01:
            row["accepted_tzs_m"] = None
        rows.append(row)
    return rows


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true")
    args = parser.parse_args()

    existing = {"rows": [], "sources": {}}
    if OUT.exists() and not args.full:
        existing = json.loads(OUT.read_text(encoding="utf-8"))
    done = {int(k) for k in existing.get("sources", {})}

    session = requests.Session()
    auctions = [(no, date) for no, date in list_auctions(session) if no not in done]
    print(f"{len(auctions)} new auctions to read", flush=True)
    if not auctions and OUT.exists():
        print("Nothing new; dataset unchanged.")
        return 0

    rows = list(existing.get("rows", []))
    sources = dict(existing.get("sources", {}))
    failures = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        for (no, date), table in zip(auctions, pool.map(lambda a: fetch(a[0], session), auctions)):
            parsed = parse(table or [], no, date)
            if not parsed:
                failures.append(no)
                sources[str(no)] = {"status": "unparsed"}
                continue
            for row in parsed:
                row["source"] = LIST_URL
                rows.append(row)
            sources[str(no)] = {"status": "parsed", "date": date}

    unique = {(r["auction_no"], r["tenor"]): r for r in rows}
    ordered = sorted(unique.values(), key=lambda r: (r["value_date"], r["tenor"]), reverse=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Tanzania Treasury bill auctions",
        "publisher": "Bank of Tanzania",
        "source_page": LIST_URL,
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "units": {"amounts": "TZS millions", "rates": "weighted average yield, percent per annum"},
        "rows": ordered,
        "sources": sources,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    parsed_count = sum(1 for s in sources.values() if s.get("status") == "parsed")
    print(f"rows: {len(ordered)} | auctions parsed: {parsed_count} | unparsed this run: {len(failures)} {failures[:20]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
