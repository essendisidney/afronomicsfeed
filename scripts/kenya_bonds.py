"""
Kenya Treasury bond auction history, extracted from Central Bank of Kenya result notices.

Reads every result notice on the CBK Treasury bonds page (primary issues, re-openings, tap sales and
switch auctions; fixed-coupon, infrastructure and savings bonds) and writes one row per bond per auction
to data/kenya/bond_auctions.json. Each row keeps the URL of its notice.

    python scripts/kenya_bonds.py          # incremental
    python scripts/kenya_bonds.py --full   # re-read everything
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

BASE = "https://www.centralbank.go.ke"
LIST_URL = f"{BASE}/bills-bonds/treasury-bonds/"
OUT = Path(__file__).resolve().parent.parent / "data" / "kenya" / "bond_auctions.json"
UA = {"User-Agent": "AfronomicsBot/1.0 (+https://www.afronomicsfeed.com/method)"}

ISSUE = re.compile(r"\b(FXD|IFB|SDB|FXB)\s*(\d)\s*[/-]\s*(\d{4})\s*[/-]\s*(\d{1,3}(?:\.\d)?)\b", re.I)
TBILL_NAME = re.compile(r"\b\d{4}\s*-\s*0?(91|182|364)\b")
MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def absolute(href: str) -> str:
    href = href.strip()
    url = href if href.startswith("http") else BASE + "/" + href.lstrip("/")
    return url.replace(" ", "%20")


def list_notices(session: requests.Session) -> list[dict]:
    html = session.get(LIST_URL, headers=UA, timeout=60).text
    seen: dict[str, dict] = {}
    for href in re.findall(r'href="([^"]+\.pdf)"', html, flags=re.I):
        name = href.rsplit("/", 1)[-1].replace("%20", " ")
        if "result" not in href.lower() and not ISSUE.search(name.replace("_", "/").replace("-", "/")):
            continue
        if "prospectus" in href.lower() or "advert" in name.lower() or TBILL_NAME.search(name):
            continue
        signature = re.sub(r"\s+", " ", re.sub(r"^\d+_", "", name).upper())
        if signature not in seen:
            seen[signature] = {"url": absolute(href), "name": name}
    return list(seen.values())


def tokens(text: str) -> list[str]:
    """Split on whitespace, re-joining the stray single-digit fragments the PDFs produce ("1 3.6799" -> "13.6799")."""
    raw = text.replace("%", " ").split()
    out: list[str] = []
    k = 0
    while k < len(raw):
        token = raw[k]
        while re.fullmatch(r"\d", token) and k + 1 < len(raw) and re.match(r"[\d.,]", raw[k + 1]):
            token += raw[k + 1]
            k += 1
        out.append(token)
        k += 1
    return out


def numbers(text: str) -> list[float]:
    values = []
    for token in tokens(text):
        clean = token.replace(",", "")
        if re.fullmatch(r"-?\d+(?:\.\d+)?", clean):
            values.append(float(clean))
    return values


def field(lines: list[str], labels: list[str], exclude: str | None = None) -> list[float]:
    for line in lines:
        low = line.lower()
        if exclude and exclude in low:
            continue
        for label in labels:
            if low.startswith(label) or f" {label}" in f" {low}":
                rest = line[low.index(label) + len(label):]
                rest = re.sub(r"^\s*\((?:kshs\.?\s*m|%)\)", "", rest, flags=re.I)
                return numbers(rest)
    return []


def parse_date(value: str) -> str | None:
    value = value.strip()
    m = re.fullmatch(r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})", value)
    if m:
        d, mo, y = m.groups()
        return f"{y}-{int(mo):02d}-{int(d):02d}"
    m = re.fullmatch(r"(\d{1,2})[/-]([A-Za-z]{3})[A-Za-z]*[/-](\d{2,4})", value)
    if m:
        d, mon, y = m.groups()
        month = MONTHS.get(mon.lower())
        if not month:
            return None
        year = int(y) + (2000 if len(y) == 2 else 0)
        return f"{year}-{month:02d}-{int(d):02d}"
    return None


def issue_code(match: tuple[str, str, str, str]) -> str:
    prefix, series, year, tenor = match
    whole, _, frac = tenor.partition(".")
    return f"{prefix.upper()}{series}/{year}/{int(whole):03d}" + (f".{frac}" if frac else "")


def parse_notice(text: str, name: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    head = " ".join(lines[:4])

    # Bonds in this notice, in table order: the "ISSUE NUMBER" / "TENOR" header row, else the heading.
    issues: list[str] = []
    for line in lines[:14]:
        if re.match(r"^(issue number|tenor|issue no)", line, flags=re.I) and ISSUE.search(line):
            issues = [issue_code(m) for m in ISSUE.findall(line)]
            break
    if not issues:
        issues = [issue_code(m) for m in ISSUE.findall(head)]
    issues = list(dict.fromkeys(issues))
    if not issues:
        return []
    n = len(issues)

    dated = re.search(r"DATED\s+(\d{2})/(\d{2})/(\d{4})", text, flags=re.I)
    value_date = f"{dated.group(3)}-{dated.group(2)}-{dated.group(1)}" if dated else None
    if not value_date:
        m = re.search(r"DATED\s*(\d{2})[-._ ](\d{2})[-._ ](\d{4})", name, flags=re.I)
        value_date = f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else None

    kind = "buyback" if re.search(r"BUY\s*-?\s*BACK", text[:400] + name, flags=re.I) else "switch" if "SWITCH" in text[:400].upper() else "tap" if re.search(r"\bTAP\s*SALE|\bTAP\b", text[:400], flags=re.I) else (
        "reopening" if re.search(r"RE-?OPEN", text[:400], flags=re.I) else "primary"
    )

    offered = field(lines, ["total amount offered", "amount offered", "total advertised amount"])
    received = field(lines, ["total bids received at cost", "total bids received", "bids received"], exclude="number of")
    accepted = field(lines, ["total amount accepted", "amount accepted", "total bids accepted at cost", "bids accepted"])
    comp = field(lines, ["of which : competitive bids", "of which: competitive bids", "competitive bids"], exclude="non")
    noncomp = field(lines, [": non-competitive bids", "non-competitive bids", "non competitive bids"])
    btc = field(lines, ["bid-to-cover ratio", "bid to cover ratio"])
    mwar = field(lines, ["market weighted average rate"], exclude="-")
    war = field(
        lines,
        ["weighted average rate of accepted bids", "allocated average rate for accepted bids", "weighted average of accepted bids", "average redemption yield"],
        exclude="-",
    )
    price = field(lines, ["price per kshs 100", "adjusted average price"])
    coupon = field(lines, ["coupon rate"])
    due_line = next((l for l in lines if re.match(r"^due dates?", l, flags=re.I)), "")
    dues = [parse_date(t) for t in due_line.split()[2:]] if due_line else []
    dues = [d for d in dues if d]

    rows = []
    for k, issue in enumerate(issues):
        def at(values):
            # With several bonds, a single value is the notice total, not this bond's figure.
            if n > 1 and len(values) < n:
                return None
            return values[k] if k < len(values) else None

        prefix, series, year, tenor = re.match(r"([A-Z]+)(\d)/(\d{4})/(\d{3}(?:\.\d)?)", issue).groups()
        row = {
            "value_date": value_date,
            "issue": issue,
            "type": {"FXD": "Fixed coupon", "IFB": "Infrastructure", "SDB": "Savings development", "FXB": "Floating"}.get(prefix, prefix),
            "tenor_years": float(tenor) if "." in tenor else int(tenor),
            "maturity": at(dues),
            "kind": kind,
            "offered_total_kes_m": offered[0] if offered else None,
            "received_kes_m": at(received),
            "accepted_kes_m": at(accepted),
            "competitive_kes_m": at(comp),
            "noncompetitive_kes_m": at(noncomp),
            "bid_to_cover": at(btc),
            "market_weighted_avg_rate": at(mwar),
            "weighted_avg_rate": at(war),
            "price_per_100": at(price),
            "coupon": at(coupon),
        }
        rate = row["weighted_avg_rate"]
        if rate is None or not (1 < rate < 30):
            continue
        for key in ("market_weighted_avg_rate", "coupon"):
            if row[key] is not None and not (0 < row[key] < 30):
                row[key] = None
        if row["price_per_100"] is not None and not (50 < row["price_per_100"] < 150):
            row["price_per_100"] = None
        # Tap sales report bids at face value and acceptances at cost; compare like with like.
        accepted_face = row["accepted_kes_m"] * 100 / row["price_per_100"] if row["accepted_kes_m"] and row["price_per_100"] else row["accepted_kes_m"]
        if row["received_kes_m"] is not None and accepted_face and row["received_kes_m"] < accepted_face * 0.97:
            row["received_kes_m"] = None
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
            return notice, parse_notice(text, notice["name"]), None
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
        notices = notices[: args.limit]
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
                failures.append((notice["name"], error or "no table found"))
                sources[notice["url"]] = {"status": "unparsed", "reason": error or "no table found"}
                continue
            for row in parsed:
                row["source"] = notice["url"]
                rows.append(row)
            sources[notice["url"]] = {"status": "parsed", "issues": [r["issue"] for r in parsed]}
            if count % 50 == 0:
                print(f"  {count}/{len(notices)}", flush=True)

    # Tap and re-opening notices often omit the due date; take it from another notice for the same bond.
    known = {row["issue"]: row["maturity"] for row in rows if row.get("maturity")}
    for row in rows:
        if not row.get("maturity") and row["issue"] in known:
            row["maturity"] = known[row["issue"]]

    unique = {}
    for row in rows:
        unique[(row.get("value_date") or row["source"], row["issue"], row.get("kind"))] = row
    ordered = sorted(unique.values(), key=lambda r: (r.get("value_date") or "", r["issue"]), reverse=True)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Kenya Treasury bond auctions",
        "publisher": "Central Bank of Kenya",
        "source_page": LIST_URL,
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "units": {"amounts": "KES millions", "rates": "percent per annum"},
        "rows": ordered,
        "sources": sources,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    parsed_count = sum(1 for s in sources.values() if s.get("status") == "parsed")
    print(f"rows: {len(ordered)} | notices parsed: {parsed_count} | unparsed this run: {len(failures)}")
    for name, reason in failures[:30]:
        print(f"  unparsed: {name} ({reason})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
