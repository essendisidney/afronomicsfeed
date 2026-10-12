"""
Nigeria FGN bond auction results from the Debt Management Office.

The DMO publishes a "Summary of FGN Bond Auction Results for <Month>, <Year>" PDF each month on
https://www.dmo.gov.ng/fgn-bonds/auction (a document list, paged with ?start=N; history from 2013). Each summary is a
table with one column per bond: auction, settlement and maturity dates, tenor, amount offered, number of bids,
subscription, allotments and the marginal rate (the DMO runs uniform-price auctions, so every successful bid is
allotted at the marginal rate). A block is kept only when every key row has one value per bond; otherwise it is left
out rather than guessed. Summaries already read are not downloaded again.

Writes data/nigeria/bond_auctions.json; writes nothing if no results are read.

    python scripts/nigeria_bonds.py            # read new summaries and write
    python scripts/nigeria_bonds.py --inspect  # parse the 3 newest and the oldest summary and print; write nothing
"""

from __future__ import annotations

import io
import json
import re
import sys
import time
import warnings
from datetime import datetime, timezone

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "nigeria" / "bond_auctions.json"
PAGE = "https://www.dmo.gov.ng/fgn-bonds/auction"
MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
BOND = re.compile(r"(\d{1,2}\.\d{1,4})%\s*FGN\s+([A-Z]{3})\s+(\d{4})")
DATE = re.compile(r"([A-Z][a-z]+)\s+(\d{1,2}),\s*(\d{4})")
AMOUNT = re.compile(r"[N₦]\s?([\d,]+(?:\.\d+)?)\s*(billion|million)", re.I)


def get(url: str) -> requests.Response:
    for attempt in range(3):
        try:
            return requests.get(url, headers=UA, timeout=(15, 90), verify=False)
        except Exception:
            if attempt == 2:
                raise
            time.sleep(4 + attempt * 4)
    raise RuntimeError("unreachable")


def summaries() -> list[tuple[str, str]]:
    """((year-month), document url) for every monthly summary, newest first; walks the list's pages."""
    found: dict[str, str] = {}
    start = 0
    while start <= 400:
        html = get(f"{PAGE}?start={start}" if start else PAGE).text
        new = 0
        for path, month, year in re.findall(
            r"""href=["']((?:https://www\.dmo\.gov\.ng)?/\d+-summary-of-[a-z0-9-]*?auction-results-for-([a-z]+)-?(\d{4})[a-z0-9-]*)["']""", html, re.I
        ):
            url = path if path.startswith("http") else "https://www.dmo.gov.ng" + path
            month = month.lower()
            if month in MONTHS and url not in found.values():
                key = f"{year}-{MONTHS.index(month) + 1:02d}"
                if key not in found:
                    found[key] = url
                    new += 1
        if not new:
            break
        start += 20
    return sorted(found.items(), reverse=True)


def pdf_text(url: str) -> str | None:
    import pdfplumber

    r = get(url.rstrip("/") + "/file")
    if r.content[:4] != b"%PDF":
        return None
    with pdfplumber.open(io.BytesIO(r.content)) as pdf:
        return "\n".join((p.extract_text() or "") for p in pdf.pages[:4])


def iso(m: tuple[str, str, str]) -> str | None:
    month = m[0].lower()
    return f"{m[2]}-{MONTHS.index(month) + 1:02d}-{int(m[1]):02d}" if month in MONTHS else None


def row(lines: list[str], *labels: str) -> str | None:
    """The text after the first line starting with any of the labels."""
    for line in lines:
        for label in labels:
            if line.lower().startswith(label.lower()):
                return line[len(label):]
    return None


def amounts(s: str | None) -> list[float]:
    """NGN millions."""
    return [float(v.replace(",", "")) * (1000 if unit.lower() == "billion" else 1) for v, unit in AMOUNT.findall(s or "")]


def parse_block(block: str, source: str) -> list[dict]:
    lines = [ln.strip() for ln in block.splitlines() if ln.strip()]
    i = next((k for k, ln in enumerate(lines) if ln.lower().startswith("auction date")), None)
    if i is None:
        return []
    # The bond names: the nearest line above "Auction Date" that names bonds (a "DESCRIPTION" header or bare names).
    names = []
    for ln in reversed(lines[:i]):
        names = BOND.findall(ln)
        if names:
            break
    n = len(names)
    if not n:
        return []
    kinds = {f"{c}|{m}|{y}": k for c, m, y, k in re.findall(r"(\d{1,2}\.\d{1,4})%\s*FGN\s+([A-Z]{3})\s+(\d{4})\s*\(\s*(New Issue|Re-?\s?opening)", block, re.I)}
    auction = [iso(d) for d in DATE.findall(row(lines, "Auction Date:", "Auction Dates:") or "")]
    settle = [iso(d) for d in DATE.findall(row(lines, "Settlement Date:", "Settlement Dates:") or "")]
    maturity = [iso(d) for d in DATE.findall(row(lines, "Maturity Date:", "Maturity Dates:") or "")]
    tenors = [int(t) for t in re.findall(r"(\d+)\s*-?\s*Years?", row(lines, "Tenors:", "Tenor:") or "", re.I)]
    offered = amounts(row(lines, "Amount Offered:"))
    subscription = amounts(row(lines, "Subscription:"))
    noncomp = amounts(row(lines, "Non-Competitive Allotment:", "Non Competitive Allotment:"))
    market = amounts(row(lines, "Amount Allotted to Market:", "Amount Allotted:"))
    bids = [int(x) for x in re.findall(r"\d+", row(lines, "Total Bids:") or "")]
    winners = [int(x) for x in re.findall(r"\d+", row(lines, "Successful Bids:") or "")]
    rates = [float(x) for x in re.findall(r"(\d{1,2}\.\d+)\s*%?", row(lines, "Marginal Rates:", "Marginal Rate:") or "")]
    ranges = re.findall(r"(\d{1,2}\.\d+)\s*%?\s*-\s*(\d{1,2}\.\d+)", row(lines, "Range of Bids:") or "")
    if len(rates) != n or len(auction) != n or not all(auction):
        return []  # a row does not line up with the bonds: leave the block out rather than guess
    at = lambda xs, k: xs[k] if len(xs) == n else None  # noqa: E731
    out = []
    for k, (coupon, mon, year) in enumerate(names):
        rate = rates[k]
        if not (0 < rate < 60):
            continue
        sub, mkt = at(subscription, k), at(market, k)
        rng = at(ranges, k)
        kind = kinds.get(f"{coupon}|{mon}|{year}", "")
        out.append({
            "bond": f"{coupon}% FGN {mon} {year}",
            "coupon": float(coupon),
            "type": "new" if kind.lower().startswith("new") else ("reopening" if kind else None),
            "auction_date": auction[k],
            "settlement_date": at(settle, k),
            "maturity": at(maturity, k),
            "tenor_years": at(tenors, k),
            "offered_ngn_m": at(offered, k),
            "subscription_ngn_m": sub,
            "allotted_market_ngn_m": mkt,
            "noncompetitive_ngn_m": at(noncomp, k) if noncomp else None,
            "bid_cover": round(sub / mkt, 2) if sub and mkt else None,
            "bids": at(bids, k),
            "successful_bids": at(winners, k),
            "bid_low": float(rng[0]) if rng else None,
            "bid_high": float(rng[1]) if rng else None,
            "marginal_rate": rate,
            "source": source,
        })
    return out


def parse(text: str, source: str) -> list[dict]:
    # A summary can hold more than one auction: each starts with "Auction Result for".
    parts = re.split(r"(?=Auction Results? for )", text)
    rows = []
    for p in parts:
        rows += parse_block(p, source)
    return rows


def previous() -> tuple[list[dict], set[str]]:
    try:
        raw = json.loads(OUT.read_text())
        return raw["rows"], set(raw.get("documents_read", []))
    except Exception:
        return [], set()


def main() -> int:
    inspect = "--inspect" in sys.argv
    docs = summaries()
    print(f"{len(docs)} monthly summaries; newest {docs[0][0] if docs else None}, oldest {docs[-1][0] if docs else None}")
    rows, done = previous()
    todo = (docs[:3] + docs[-1:]) if inspect else [(k, u) for k, u in docs if u not in done]
    new, unread = [], []
    for key, url in todo:
        text = pdf_text(url)
        got = parse(text or "", url)
        if inspect:
            print(f"== {key} {url}: {len(got)} bonds")
            for r in got:
                print("   ", json.dumps(r))
        if got:
            new += got
            done.add(url)
        else:
            unread.append(key)
        time.sleep(0.3)
    if unread:
        print(f"{len(unread)} summaries gave no rows (layout not recognised or not a PDF): {', '.join(unread[:20])}")
    if inspect:
        print("inspect only: nothing written")
        return 0
    rows += new
    if not rows:
        print("no FGN bond results read; nothing written")
        return 1
    seen, uniq = set(), []
    for r in sorted(rows, key=lambda r: (r["auction_date"], r["bond"]), reverse=True):
        key = (r["auction_date"], r["bond"])
        if key not in seen:
            seen.add(key)
            uniq.append(r)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Nigeria FGN bond auctions",
        "publisher": "Debt Management Office, Nigeria",
        "source_page": PAGE,
        "currency": "NGN",
        "rate_note": "marginal (stop) rate, percent per annum; uniform-price auctions, so all successful bids pay it; "
        "amounts in NGN millions; bid cover = subscription / amount allotted to the market",
        "updated": uniq[0]["auction_date"],
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "documents_read": sorted(done),
        "rows": uniq,
    }, ensure_ascii=False, indent=0), encoding="utf-8")
    print(f"wrote {len(uniq)} FGN bond results ({len(new)} new); latest {uniq[0]['auction_date']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
