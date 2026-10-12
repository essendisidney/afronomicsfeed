"""
Uganda Treasury bond auction results from Bank of Uganda press releases.

The bond notices sit in the same content API as the bill notices (scripts/uganda_tbills.py, whose download, OCR
and number helpers this reuses). Each notice has one column per bond: ISIN and coupon, auction date, tenor,
maturity, cut-off price, yield at cut-off, offered, tendered, accepted and bid-to-cover. Notices without a text layer
are read with OCR (Tesseract) when it is installed. A row is kept only when it passes the notice's own cross-check
(tendered / accepted = the published bid-to-cover, within rounding) and its yield and price are plausible.
Notices already read are not downloaded again; each run reads at most --budget new ones, newest first.

Writes data/uganda/bond_auctions.json; writes nothing if no results are read.

    python scripts/uganda_bonds.py                # read new notices and write
    python scripts/uganda_bonds.py --budget 40    # read at most 40 new notices (default 60)
    python scripts/uganda_bonds.py --inspect      # parse the 4 newest notices and print; write nothing
"""

from __future__ import annotations

import io
import json
import re
import sys
from datetime import datetime, timezone

import pdfplumber
import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
import uganda_tbills as ug  # noqa: E402
from bills_common import ROOT  # noqa: E402

OUT = ROOT / "data" / "uganda" / "bond_auctions.json"
SOURCE_PAGE = "https://www.bou.or.ug/bouwebsite/FinancialMarkets/tbondsauctionresults.html"


def bond_notices(session: requests.Session) -> list[dict]:
    data = session.get(ug.API, headers=ug.UA, timeout=(15, 90), verify=False).json()
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
        url = (f.get("file") or {}).get("url")
        if not url or not re.search(r"bond", title, flags=re.I):
            continue
        url = url if url.startswith("http") else ug.BASE + url
        out[url] = {"url": url, "title": title}
    return list(out.values())


def parse(text: str, source: str) -> list[dict]:
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in text.splitlines() if ln.strip()]
    flat = " ".join(lines)
    held = re.search(r"AUCTION DATE\s*:?\s*(\d{1,2}[\s-]+[A-Za-z]{3,9}[\s-]+\d{2,4})", flat, re.I)
    settled = re.search(r"SETTLEMENT DATE\s*:?\s*(\d{1,2}[\s-]+[A-Za-z]{3,9}[\s-]+\d{2,4})", flat, re.I)
    tenors = [int(v) for v in re.findall(r"(\d{1,2})\s*-?\s*Y(?:ea)?rs?", ug_line(lines, r"^(?:BENCHMARK\s*)?MATURITIES") or "", re.I)]
    n = len(tenors)
    if not held or not n:
        return []
    isins = re.findall(r"(UG\d{2}[A-Z]\d{7})\s*(?:(\d{1,2}\.\d{1,4})\s*%|NEW)?", flat)
    maturities = re.findall(r"(\d{1,2}-[A-Za-z]{3}-\d{2,4})", ug_line(lines, r"^MATURITY\s*DATES?") or "")
    price = ug.field(lines, r"^CUT[- ]?OFF\s*PRICE(?:\s*\(\s*PER\s*100\s*\))?[^:\d]*:?")
    yld = ug.field(lines, r"^(?:YIELD\s*AT\s*CUT[- ]?OFF(?:\s*PRICE)?|WEIGHTED\s*AVERAGE\s*YIELD|YIELD\s*TO\s*MATURITY)[^:\d]*:?")
    offered = ug.field(lines, r"^OFFERED\s*:?")
    tendered = ug.field(lines, r"^TENDERED\s*:?")
    accepted = ug.field(lines, r"^ACCEPTED(?:\s*BIDS)?\s*:?")
    btc = ug.field(lines, r"^BID\s*TO\s*COVER(?:\s*RATIO)?\s*:?")
    if len(yld) != n:
        return []  # the yield row does not line up with the tenors: leave the notice out rather than guess
    at = lambda xs, k: xs[k] if len(xs) == n else None  # noqa: E731
    rows = []
    for k, tenor in enumerate(tenors):
        y, p, t, a, b = yld[k], at(price, k), at(tendered, k), at(accepted, k), at(btc, k)
        if not (0 < y < 40) or (p is not None and not (40 < p < 160)):
            continue
        if t and a and b and abs(t / a - b) > 0.02:
            continue  # fails the notice's own cross-check
        isin = isins[k] if len(isins) == n else None
        rows.append({
            "auction_date": ug.parse_date(held.group(1)),
            "settlement_date": ug.parse_date(settled.group(1)) if settled else None,
            "tenor_years": tenor,
            "isin": isin[0] if isin else None,
            "coupon": float(isin[1]) if isin and isin[1] else None,
            "maturity": ug.parse_date(maturities[k]) if len(maturities) == n else None,
            "offered_ugx_m": round(at(offered, k) / 1e6, 2) if at(offered, k) else None,
            "tendered_ugx_m": round(t / 1e6, 2) if t else None,
            "accepted_ugx_m": round(a / 1e6, 2) if a else None,
            "bid_cover": b if b else (round(t / a, 3) if t and a else None),
            "cutoff_price": p,
            "yield": y,
            "source": source,
        })
    return rows


def ug_line(lines: list[str], pattern: str) -> str | None:
    for ln in lines:
        m = re.match(pattern, ln, re.I)
        if m:
            return ln[m.end():]
    return None


def read(session: requests.Session, url: str) -> tuple[list[dict], str]:
    data = ug.download(session, url)
    text = ""
    if data.startswith(b"%PDF"):
        with ug.PDF_LOCK, pdfplumber.open(io.BytesIO(data)) as doc:
            text = "\n".join((p.extract_text() or "") for p in doc.pages[:2])
    elif data.startswith(b"PK"):
        text = ug.office_text(data)
    rows = parse(text, url)
    if rows or ug.pytesseract is None or data.startswith(b"PK"):
        return rows, "text"
    rows = parse(ug.ocr_text(data), url)
    for r in rows:
        r["read_by"] = "ocr"
    return rows, "ocr"


def previous() -> tuple[list[dict], set[str]]:
    try:
        raw = json.loads(OUT.read_text())
        return raw["rows"], set(raw.get("notices_read", []))
    except Exception:
        return [], set()


def main() -> int:
    inspect = "--inspect" in sys.argv
    budget = int(sys.argv[sys.argv.index("--budget") + 1]) if "--budget" in sys.argv else 60
    s = requests.Session()
    notices = bond_notices(s)
    rows, done = previous()
    todo = notices[:4] if inspect else [n for n in notices if n["url"] not in done][:budget]
    print(f"{len(notices)} bond notices; reading {len(todo)}")
    new, failed = [], []
    for n in todo:
        try:
            got, how = read(s, n["url"])
        except Exception as error:
            failed.append(f"{n['title']}: {str(error)[:80]}")
            continue
        if inspect:
            print(f"== {n['title']} ({how}): {len(got)} bonds")
            for r in got:
                print("   ", json.dumps(r))
        if got:
            new += got
            done.add(n["url"])
        else:
            failed.append(n["title"])
    if failed:
        print(f"{len(failed)} notices gave no rows (layout not recognised, cross-check failed, or OCR unavailable): {failed[:10]}")
    if inspect:
        print("inspect only: nothing written")
        return 0
    rows += new
    if not rows:
        print("no Uganda bond results read; nothing written")
        return 1
    seen, uniq = set(), []
    for r in sorted(rows, key=lambda r: (r["auction_date"] or "", r["tenor_years"]), reverse=True):
        key = (r["auction_date"], r["tenor_years"], r["isin"])
        if key not in seen:
            seen.add(key)
            uniq.append(r)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Uganda Treasury bond auctions",
        "publisher": "Bank of Uganda (for the Ministry of Finance)",
        "source_page": SOURCE_PAGE,
        "currency": "UGX",
        "rate_note": "yield at the cut-off price, percent per annum; amounts in UGX millions; prices per 100",
        "updated": uniq[0]["auction_date"],
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "notices_read": sorted(done),
        "rows": uniq,
    }, ensure_ascii=False, indent=0), encoding="utf-8")
    print(f"wrote {len(uniq)} Uganda bond results ({len(new)} new); latest {uniq[0]['auction_date']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
