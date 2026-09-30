"""
Uganda Treasury bill auction history, extracted from Bank of Uganda auction result press releases.

The BoU publishes each auction as a PDF, listed through its site's content API. Notices up to 2024 carry
text; later ones are images, which are read with OCR (Tesseract) and kept only when every figure passes
the notice's own cross-checks (bid-to-cover = tendered / accepted; yields ordered discount < money-market
<= effective). One row per auction per tenor goes to data/uganda/tbill_auctions.json.

    python scripts/uganda_tbills.py          # incremental
    python scripts/uganda_tbills.py --full   # re-read everything
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

try:  # OCR is optional: without it, image-only notices are reported as unparsed.
    import pytesseract  # noqa: E402
except Exception:  # pragma: no cover
    pytesseract = None

API = (
    "https://bou.or.ug/api/financial-market-auction-information"
    "?populate=auctionInformation.items.file.file.file&populate=auctionInformation.items.file.fileWithMonth.file.file"
)
BASE = "https://bou.or.ug"
SOURCE_PAGE = "https://www.bou.or.ug/bouwebsite/FinancialMarkets/tbillsauctionresults.html"
OUT = Path(__file__).resolve().parent.parent / "data" / "uganda" / "tbill_auctions.json"
UA = {"User-Agent": "Mozilla/5.0 (compatible; AfronomicsBot/1.0; +https://www.afronomicsfeed.com/method)"}
MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def list_notices(session: requests.Session) -> list[dict]:
    data = session.get(API, headers=UA, timeout=(15, 90), verify=False).json()
    items = data["data"]["auctionInformation"]["items"]
    results = next(i for i in items if str(i.get("category", "")).lower().startswith("auction results"))
    files = []
    for year in results.get("file", []):
        for month in year.get("fileWithMonth", []):
            files += month.get("file", [])
        files += year.get("file", [])
    out = {}
    for f in files:
        title = f.get("title") or ""
        if not re.search(r"t-?bills?|treasury[- ]bills?|tbill", title, flags=re.I) or re.search(r"bond", title, flags=re.I):
            continue
        url = (f.get("file") or {}).get("url")
        if not url:
            continue
        url = url if url.startswith("http") else BASE + url
        out[url] = {"url": url, "title": title}
    return list(out.values())


def parse_date(text: str) -> str | None:
    m = re.search(r"(\d{1,2})[\s-]+([A-Za-z]{3})[A-Za-z]*[\s-]+(\d{2,4})", text)
    if not m:
        return None
    month = MONTHS.get(m.group(2).lower())
    year = int(m.group(3)) + (2000 if len(m.group(3)) == 2 else 0)
    return f"{year}-{month:02d}-{int(m.group(1)):02d}" if month else None


def values(line: str) -> list[float]:
    line = re.sub(r"(\d)\s*,\s*(\d)", r"\1,\2", line)  # OCR spacing: "62,096, 100,000" -> "62,096,100,000"
    return [float(x.replace(",", "")) for x in re.findall(r"\d[\d,]*(?:\.\d+)?", line)]


def field(lines: list[str], pattern: str) -> list[float]:
    for line in lines:
        m = re.match(pattern, line, flags=re.I)
        if m:
            return values(line[m.end():])
    return []


def parse_notice(text: str) -> list[dict]:
    lines = [re.sub(r"\s+", " ", l).strip() for l in text.splitlines() if l.strip()]
    flat = " ".join(lines)
    no = re.search(r"AUCTION\s*NO\s*[:.]?\s*(\d{3,4})", flat, flags=re.I)
    held = re.search(r"(?:HELD ON|AUCTION DATE\s*:?(?:\s*[A-Z]+DAY)?)\s*(\d{1,2}[\s-]+[A-Za-z]{3,9}[\s-]+\d{2,4})", flat, flags=re.I)
    settled = re.search(r"(?:SETTLED|ISSUE DATE\s*:|SETTLEMENT DATE\s*:?(?:\s*[A-Z]+DAY)?)\s*(\d{1,2}[\s-]+[A-Za-z]{3,9}[\s-]+\d{2,4})", flat, flags=re.I)
    tenors = [int(v) for v in field(lines, r"^MATURITIES(?:\s*\(DAYS\))?\s*:?") if int(v) in (91, 182, 364)]
    if not no or not tenors:
        return []
    auction_date = parse_date(held.group(1)) if held else None
    value_date = parse_date(settled.group(1)) if settled else auction_date
    disc = field(lines, r"^ANN\.?\s*DISC(?:OUNT)?\s*RATE[^:\d]*:?")
    mmy = field(lines, r"^MON(?:EY)?\.?\s*MKT\.?\s*YIELD[^:\d]*:?")
    eff = field(lines, r"^EFFECTIVE\s*YIELD[^:\d]*:?")
    price = field(lines, r"^(?:CUT[- ]?OFF PRICE|WEIGHTED AVERAGE PRICE)\s*:?")
    offered = field(lines, r"^OFFERED\s*:?")
    tendered = field(lines, r"^TENDERED\s*:?")
    accepted = field(lines, r"^ACCEPTED(?:\s*BIDS)?\s*:?")
    btc = field(lines, r"^BID\s*TO\s*COVER(?:\s*RATIO)?\s*:?")
    rows = []
    for k, tenor in enumerate(tenors):
        at = lambda xs: xs[k] if k < len(xs) else None  # noqa: E731
        rate = at(mmy)
        if rate is None or not (0 < rate < 40):
            continue
        row = {
            "tenor": tenor,
            "auction_no": int(no.group(1)),
            "auction_date": auction_date,
            "value_date": value_date,
            "offered_ugx_m": at(offered) / 1e6 if at(offered) else None,
            "received_ugx_m": at(tendered) / 1e6 if at(tendered) else None,
            "accepted_ugx_m": at(accepted) / 1e6 if at(accepted) else None,
            "discount_rate": at(disc),
            "weighted_avg_rate": rate,
            "effective_yield": at(eff),
            "price_per_100": at(price),
            "bid_to_cover": at(btc),
        }
        rows.append(row)
    return rows


def checks_pass(row: dict) -> bool:
    """The notice's own arithmetic, used to reject misread figures (essential for OCR)."""
    d, m, e = row["discount_rate"], row["weighted_avg_rate"], row["effective_yield"]
    if d is not None and not (d <= m + 0.01):
        return False
    if e is not None and not (m <= e + 0.01):
        return False
    t, a, b = row["received_ugx_m"], row["accepted_ugx_m"], row["bid_to_cover"]
    if t and a and b and abs(t / a - b) > 0.02:
        return False
    if row["price_per_100"] is not None and not (50 < row["price_per_100"] <= 100):
        return False
    return True


def ocr_text(pdf: bytes) -> str:
    if pytesseract is None:
        return ""
    import pypdfium2 as pdfium  # installed with pdfplumber

    doc = pdfium.PdfDocument(pdf)
    parts = []
    for i in range(min(2, len(doc))):
        image = doc[i].render(scale=300 / 72).to_pil().convert("L")
        parts.append(pytesseract.image_to_string(image, config="--psm 6"))
    return "\n".join(parts)


def fetch_and_parse(notice: dict, session: requests.Session):
    for attempt in range(3):
        try:
            pdf = session.get(notice["url"], headers=UA, timeout=(15, 60), verify=False).content
            if not pdf.startswith(b"%PDF"):
                return notice, [], "not a pdf", False
            with pdfplumber.open(io.BytesIO(pdf)) as doc:
                text = "\n".join((page.extract_text() or "") for page in doc.pages[:2])
            rows = parse_notice(text)
            used_ocr = False
            if not rows:
                rows = parse_notice(ocr_text(pdf))
                used_ocr = True
            kept = [r for r in rows if checks_pass(r)]
            if used_ocr:
                for r in kept:
                    r["read_by"] = "ocr"
            reason = None if kept else ("image notice, OCR unavailable" if used_ocr and pytesseract is None else "no table found")
            return notice, kept, reason, used_ocr
        except Exception as error:
            if attempt == 2:
                return notice, [], str(error)[:120], False
            time.sleep(2 + attempt * 3)
    return notice, [], "unreachable", False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true")
    args = parser.parse_args()

    existing = {"rows": [], "sources": {}}
    if OUT.exists() and not args.full:
        existing = json.loads(OUT.read_text(encoding="utf-8"))
    # Re-try notices that failed only for lack of OCR, once OCR is available.
    done = {u for u, s in existing.get("sources", {}).items() if s.get("status") == "parsed" or not (pytesseract and "OCR" in s.get("reason", ""))}

    session = requests.Session()
    notices = [n for n in list_notices(session) if n["url"] not in done]
    print(f"{len(notices)} new notices to read (OCR {'on' if pytesseract else 'off'})", flush=True)
    if not notices and OUT.exists():
        print("Nothing new; dataset unchanged.")
        return 0

    rows = list(existing.get("rows", []))
    sources = dict(existing.get("sources", {}))
    failures = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        for notice, parsed, reason, used_ocr in pool.map(lambda n: fetch_and_parse(n, session), notices):
            if not parsed:
                failures.append((notice["title"], reason))
                sources[notice["url"]] = {"status": "unparsed", "reason": reason or "no table found"}
                continue
            for row in parsed:
                row["source"] = notice["url"]
                rows.append(row)
            sources[notice["url"]] = {"status": "parsed", "ocr": used_ocr, "tenors": [r["tenor"] for r in parsed]}

    unique = {(r["auction_no"], r["tenor"]): r for r in rows}
    ordered = sorted(unique.values(), key=lambda r: (r.get("value_date") or "", r["tenor"]), reverse=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Uganda Treasury bill auctions",
        "publisher": "Bank of Uganda",
        "source_page": SOURCE_PAGE,
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "units": {"amounts": "UGX millions", "rates": "money-market yield, percent per annum (discount rate and effective yield also given)"},
        "rows": ordered,
        "sources": sources,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    parsed_count = sum(1 for s in sources.values() if s.get("status") == "parsed")
    print(f"rows: {len(ordered)} | notices parsed: {parsed_count} | unparsed this run: {len(failures)}")
    for title, reason in failures[:40]:
        print(f"  unparsed: {title} ({reason})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
