"""
Ghana Treasury bill auction history, extracted from Bank of Ghana tender result notices.

The Bank of Ghana files each weekly Government of Ghana tender as a PDF ("Auctresults-<tender>.pdf", or lately
"Auctresult<tender>.pdf").
This script lists them through the site's public media index, reads every notice it has not seen,
and writes one row per tender per tenor to data/ghana/tbill_auctions.json. Each row keeps its notice URL.

    python scripts/ghana_tbills.py          # incremental
    python scripts/ghana_tbills.py --full   # re-read everything
"""

from __future__ import annotations

import argparse
import io
import json
import re
import sys
import time
import warnings
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

warnings.filterwarnings("ignore")

import pdfplumber  # noqa: E402
import requests  # noqa: E402

MEDIA_API = "https://www.bog.gov.gh/wp-json/wp/v2/media"
SOURCE_PAGE = "https://www.bog.gov.gh/gog_auction_results/"
OUT = Path(__file__).resolve().parent.parent / "data" / "ghana" / "tbill_auctions.json"
UA = {"User-Agent": "Mozilla/5.0 (compatible; AfronomicsBot/1.0; +https://www.afronomicsfeed.com/method)"}

MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}
# "Auctresults-2026.pdf", and since Oct 2026 also "Auctresult2027.pdf" (singular, no hyphen).
NAME = re.compile(r"/Auctresults?[-_ ]?(\d{3,4})[^/]*\.pdf$", re.I)


def list_notices(session: requests.Session) -> list[dict]:
    """Every Government of Ghana tender notice (not the separate BoG bill notices), newest upload per tender."""
    found: dict[int, dict] = {}
    page = 1
    while True:
        r = session.get(MEDIA_API, params={"search": "Auctresult", "per_page": 100, "page": page, "_fields": "source_url,date"}, headers=UA, timeout=60)
        if r.status_code != 200:
            break
        items = r.json()
        if not items:
            break
        for item in items:
            url = item.get("source_url") or ""
            if "/BOG-" in url.upper().replace("%20", " ") or "BOG-AUCT" in url.upper():
                continue
            m = NAME.search(url)
            if not m:
                continue
            tender = int(m.group(1))
            if tender not in found or item.get("date", "") > found[tender]["uploaded"]:
                found[tender] = {"url": url, "tender": tender, "uploaded": item.get("date", "")}
        if page >= int(r.headers.get("X-WP-TotalPages", "1")):
            break
        page += 1
    return sorted(found.values(), key=lambda n: n["tender"])


def parse_date(text: str) -> str | None:
    m = re.search(r"(\d{1,2})\s*(?:ST|ND|RD|TH)?\s+([A-Z]{3})[A-Z]*\.?,?\s+(\d{4})", text, flags=re.I)
    if not m:
        return None
    month = MONTHS.get(m.group(2).lower())
    return f"{m.group(3)}-{month:02d}-{int(m.group(1)):02d}" if month else None


def numbers(text: str) -> list[float]:
    text = re.sub(r"(?<![\d.,])(\d)\s(?=[\d,]*\.\d)", r"\1", text)  # a lone digit split off: "1 2,550.50" -> "12,550.50"
    return [float(x.replace(",", "")) for x in re.findall(r"\d[\d,]*\.\d+", text)]


def parse_notice(text: str) -> list[dict]:
    flat = re.sub(r"[^\x20-\x7E\n]", " ", text)
    held = re.search(r"TENDER\s+(\d+)\s+HELD\s+ON\s+(.{6,30}?\d{4})", flat, flags=re.I)
    issued = re.search(r"(?:TO\s+BE\s+)?ISSUED\s+ON\s+(.{6,30}?\d{4})", flat, flags=re.I)
    if not held:
        return []
    tender = int(held.group(1))
    auction_date = parse_date(held.group(2))
    value_date = parse_date(issued.group(1)) if issued else None
    target = re.search(r"TARGET FOR[^\n]*?T/?BILLS?[^\d\n]*([\d,]+\.\d+)", flat, flags=re.I)
    rows = []
    for line in flat.splitlines():
        m = re.search(r"\b(91|182|364)\s*-?\s*DAY\s+BILL", line, flags=re.I)
        if not m:
            continue
        values = numbers(line[m.end():])
        if len(values) < 4:
            continue
        tenor = int(m.group(1))
        received, accepted = values[0], values[1]
        discount, interest = values[-2], values[-1]
        row = {
            "tenor": tenor,
            "tender": tender,
            "auction_date": auction_date,
            "value_date": value_date or auction_date,
            "received_ghs_m": received,
            "accepted_ghs_m": accepted,
            "discount_rate": discount,
            "weighted_avg_rate": interest,
            "target_total_ghs_m": float(target.group(1).replace(",", "")) if target else None,
        }
        # Plausibility: the interest-rate equivalent is never below the discount rate; amounts make sense.
        if not (0 < interest < 60) or discount > interest + 0.01:
            continue
        if accepted > received * 1.01:
            row["received_ghs_m"] = None
        rows.append(row)
    return rows


def fetch_and_parse(notice: dict, session: requests.Session):
    for attempt in range(3):
        try:
            pdf = session.get(notice["url"], headers=UA, timeout=90).content
            if not pdf.startswith(b"%PDF"):
                return notice, [], "not a pdf"
            with pdfplumber.open(io.BytesIO(pdf)) as doc:
                text = "\n".join((page.extract_text() or "") for page in doc.pages[:2])
            return notice, parse_notice(text), None
        except Exception as error:
            if attempt == 2:
                return notice, [], str(error)[:120]
            time.sleep(2 + attempt * 3)
    return notice, [], "unreachable"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true")
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    existing = {"rows": [], "sources": {}}
    if OUT.exists() and not args.full:
        existing = json.loads(OUT.read_text(encoding="utf-8"))
    done = set(existing.get("sources", {}).keys())

    session = requests.Session()
    notices = [n for n in list_notices(session) if n["url"] not in done]
    if args.limit:
        notices = notices[-args.limit:]
    print(f"{len(notices)} new notices to read", flush=True)
    if not notices and OUT.exists():
        print("Nothing new; dataset unchanged.")
        return 0

    rows = list(existing.get("rows", []))
    sources = dict(existing.get("sources", {}))
    failures = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        for count, (notice, parsed, error) in enumerate(pool.map(lambda n: fetch_and_parse(n, session), notices), 1):
            if error or not parsed:
                failures.append((notice["url"].rsplit("/", 1)[-1], error or "no table found"))
                sources[notice["url"]] = {"status": "unparsed", "reason": error or "no table found"}
                continue
            for row in parsed:
                row["source"] = notice["url"]
                rows.append(row)
            sources[notice["url"]] = {"status": "parsed", "tenors": [r["tenor"] for r in parsed]}
            if count % 100 == 0:
                print(f"  {count}/{len(notices)}", flush=True)

    unique = {}
    for row in rows:
        unique[(row["tender"], row["tenor"])] = row
    ordered = sorted(unique.values(), key=lambda r: (r.get("value_date") or "", r["tenor"]), reverse=True)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Ghana Treasury bill auctions",
        "publisher": "Bank of Ghana",
        "source_page": SOURCE_PAGE,
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "units": {"amounts": "GHS millions", "rates": "percent per annum (interest-rate equivalent; discount rate also given)"},
        "rows": ordered,
        "sources": sources,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    parsed_count = sum(1 for s in sources.values() if s.get("status") == "parsed")
    print(f"rows: {len(ordered)} | notices parsed: {parsed_count} | unparsed this run: {len(failures)}")
    for name, reason in failures[:40]:
        print(f"  unparsed: {name} ({reason})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
