"""
Malawi Treasury bill auction history from the Reserve Bank of Malawi.

The RBM Treasury Bills page lists every auction since 2015 with a results notice (text PDF). Each notice has
one line per tenor: applied (face, cost), allotted (face, cost), lowest, highest and average yield, plus the
previous average. Reopening auctions are kept and marked.

    python scripts/malawi_tbills.py          # incremental
    python scripts/malawi_tbills.py --full   # re-read every notice
"""

from __future__ import annotations

import argparse
import io
import re
import sys
import time
import warnings
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import UA, load_existing, write  # noqa: E402

warnings.filterwarnings("ignore")
PAGE = "https://www.rbm.mw/FinancialMarkets/TreasuryBills/"
BASE = "https://www.rbm.mw"
MONTHS = {m: i for i, m in enumerate(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"], 1)}


def list_notices() -> list[dict]:
    html = requests.get(PAGE, headers=UA, timeout=(15, 90), verify=False).text
    start = html.find('id="TreasuryBillsAuctionResults"')
    end = html.find('id="TreasuryBillsAuctionNotice"', start + 10)
    seg = html[start:end if end > start else start + 600000]
    out = []
    for row in re.findall(r"<tr[^>]*>(.*?)</tr>", seg, flags=re.S):
        d = re.search(r"([A-Z][a-z]{2}) (\d{2}), (\d{4})", row)
        link = re.search(r'href="(/Home/GetContentFile/\?ContentID=\d+)"', row)
        if d and link:
            listed = datetime.strptime(d.group(0), "%b %d, %Y").date().isoformat()
            out.append({"url": BASE + link.group(1), "listed": listed})
    return out


def parse(text: str, listed: str) -> list[dict]:
    flat = re.sub(r"\s+", " ", text)
    held = re.search(r"HELD ON (\d{1,2})(?:ST|ND|RD|TH)? ([A-Z]+),? (\d{4})", flat, flags=re.I)
    day = listed
    if held and held.group(2).lower() in MONTHS:
        day = f"{held.group(3)}-{MONTHS[held.group(2).lower()]:02d}-{int(held.group(1)):02d}"
    kind = "reopening" if re.search(r"REOPENING|RE-OPENING", flat, flags=re.I) else "primary"
    rows = []
    for line in text.splitlines():
        m = re.match(r"^\s*(91|182|364)\s+(.*)$", line)
        if not m:
            continue
        nums = [float(x.replace(",", "")) for x in re.findall(r"-?\d[\d,]*\.\d+|-?\d[\d,]*", m.group(2))]
        if len(nums) < 7:
            continue
        applied_face, applied_cost, allot_face, allot_cost = nums[:4]
        avg = nums[6]
        if allot_face <= 0 or not (0 < avg < 80):
            continue
        rows.append({
            "tenor": int(m.group(1)),
            "auction_date": day,
            "value_date": day,
            "kind": kind,
            "offered_mwk_m": None,
            "received_mwk_m": applied_face,
            "accepted_mwk_m": allot_face,
            "accepted_cost_mwk_m": allot_cost,
            "lowest_yield": nums[4],
            "highest_yield": nums[5],
            "weighted_avg_rate": avg,
        })
    return rows


def fetch(notice: dict):
    import pdfplumber

    for attempt in range(3):
        try:
            content = requests.get(notice["url"], headers=UA, timeout=(15, 90), verify=False).content
            if content[:4] != b"%PDF":
                return notice, [], "not a pdf"
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n".join((p.extract_text() or "") for p in pdf.pages[:2])
            rows = parse(text, notice["listed"])
            return notice, rows, None if rows else ("no text" if not text.strip() else "no table")
        except Exception as error:
            if attempt == 2:
                return notice, [], str(error)[:100]
            time.sleep(3 + attempt * 3)
    return notice, [], "unreachable"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--full", action="store_true")
    args = ap.parse_args()
    existing = {"rows": [], "sources": {}} if args.full else load_existing("malawi")
    sources = dict(existing.get("sources", {}))
    rows = list(existing.get("rows", []))
    notices = [n for n in list_notices() if sources.get(n["url"], {}).get("status") != "parsed"]
    print(f"{len(notices)} notices to read")
    with ThreadPoolExecutor(max_workers=6) as pool:
        for notice, parsed, reason in pool.map(fetch, notices):
            for r in parsed:
                r["source"] = notice["url"]
            rows += parsed
            sources[notice["url"]] = {"status": "parsed", "tenors": [r["tenor"] for r in parsed]} if parsed else {"status": "unparsed", "reason": reason}
    bad = [u for u, s in sources.items() if s["status"] != "parsed"]
    print(f"parsed notices: {len(sources) - len(bad)}, unparsed: {len(bad)}")
    write(
        "malawi",
        dataset="Malawi Treasury bill auctions",
        publisher="Reserve Bank of Malawi",
        source_page=PAGE,
        currency="MWK",
        rate_note="average yield of allotted bids, percent per annum",
        rows=rows,
        sources=sources,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
