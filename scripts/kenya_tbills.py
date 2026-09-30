"""
Kenya Treasury bill auction history, extracted from Central Bank of Kenya result notices.

The CBK publishes each weekly auction as a PDF. This script reads the CBK Treasury bills page,
downloads every result notice it has not seen before, extracts the auction table for each tenor
(91, 182, 364 days) and writes one row per auction per tenor to data/kenya/tbill_auctions.json.

Run it again at any time: it only downloads notices that are new.

    python scripts/kenya_tbills.py            # incremental update
    python scripts/kenya_tbills.py --full     # re-read every notice

Every row keeps the URL of the notice it came from.
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
LIST_URL = f"{BASE}/bills-bonds/treasury-bills/"
OUT = Path(__file__).resolve().parent.parent / "data" / "kenya" / "tbill_auctions.json"
UA = {"User-Agent": "AfronomicsBot/1.0 (+https://www.afronomicsfeed.com/method)"}

AMOUNT = re.compile(r"\d{1,3}(?:,\d{3})*\.\d{2}")
PRICE = re.compile(r"\d{1,3}\.\d{3,4}")
DATE = re.compile(r"(\d{2})/(\d{2})/(\d{4})")


# --------------------------------------------------------------------------- listing


def absolute(href: str) -> str:
    href = href.strip()
    if href.startswith("http"):
        url = href
    else:
        url = BASE + "/" + href.lstrip("/")
    return url.replace(" ", "%20")


def list_notices(session: requests.Session) -> list[dict]:
    html = session.get(LIST_URL, headers=UA, timeout=60).text
    hrefs = re.findall(r'href="([^"]+\.pdf)"', html, flags=re.I)
    seen: dict[str, dict] = {}
    for href in hrefs:
        name = href.rsplit("/", 1)[-1]
        if "result" not in href.lower():
            continue
        # The same notice is filed under the 91-, 182- and 364-day folders with different prefixes.
        signature = re.sub(r"^\d+_", "", name).upper().replace("%20", " ")
        signature = re.sub(r"\s+", " ", signature)
        if signature in seen:
            continue
        seen[signature] = {"url": absolute(href), "name": name.replace("%20", " ")}
    return list(seen.values())


def value_date_from_name(name: str) -> str | None:
    match = re.search(r"DATED\s*(\d{2})[-._ ](\d{2})[-._ ](\d{4})", name, flags=re.I)
    if not match:
        return None
    d, m, y = match.groups()
    return f"{y}-{m}-{d}"


# --------------------------------------------------------------------------- parsing


def amounts(text: str) -> list[float]:
    return [float(x.replace(",", "")) for x in AMOUNT.findall(re.sub(r"\s+", "", text))]


def rates(text: str) -> list[float]:
    compact = re.sub(r"\s+", "", text)
    out = []
    for piece in compact.split("%"):
        match = re.search(r"\d{1,2}\.\d{2,4}$", piece)
        if match:
            out.append(float(match.group()))
    return out


def prices(text: str) -> list[float]:
    """Prices come as 95.309 or 97.8584, sometimes with a stray space after the first digit (9 5.934)."""
    tokens = text.split()
    merged: list[str] = []
    k = 0
    while k < len(tokens):
        token = tokens[k]
        if re.fullmatch(r"\d", token) and k + 1 < len(tokens) and re.match(r"\d", tokens[k + 1]):
            token += tokens[k + 1]
            k += 1
        merged.append(token)
        k += 1
    return [float(t) for t in merged if re.fullmatch(r"\d{2,3}\.\d{2,4}", t)]


def field(lines: list[str], labels: list[str], extract, need: int = 1, exclude: str | None = None) -> list[float]:
    """Values after the first line matching any label; looks up to two lines ahead when the values wrap."""
    for index, line in enumerate(lines):
        low = line.lower()
        if exclude and exclude in low:
            continue
        for label in labels:
            if label in low:
                rest = line[low.index(label) + len(label):]
                values = extract(rest)
                look = 1
                while len(values) < need and look <= 2 and index + look < len(lines):
                    values += extract(lines[index + look])
                    look += 1
                if values:
                    return values
    return []


def parse_notice(text: str, name: str) -> list[dict]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    tenors: list[int] = []
    # The table header lists the tenors: "Tenor 91 DAYS 182 DAYS 364 DAYS TOTAL" or "91 DAYS 182 DAYS TOTAL".
    for line in lines[:25]:
        found = re.findall(r"\b(91|182|364)\s*-?\s*DAYS?\b", line, flags=re.I)
        leftover = re.sub(r"\b(91|182|364)\s*-?\s*DAYS?\b|TENOR|TOTAL|\s", "", line, flags=re.I)
        if found and leftover == "":
            tenors = [int(t) for t in found]
            break
    if not tenors:
        # Older one-tenor notices: the heading names the tenor ("RESULTS OF 364 DAYS TREASURY BILLS").
        heading = next((l for l in lines if "RESULTS OF" in l.upper()), "")
        found = re.findall(r"\b(91|182|364)\b", heading.split("TREASURY")[0] if "TREASURY" in heading.upper() else heading)
        if len(found) == 1:
            tenors = [int(found[0])]
        elif not found:
            match = re.search(r"-(91|182|364)\.pdf$", name, flags=re.I)
            tenors = [int(match.group(1))] if match else []
        else:
            return []  # several tenors but no table header: layout unknown, don't guess
    tenors = [t for t in tenors if t in (91, 182, 364)]
    if not tenors:
        return []
    n = len(tenors)

    offered = field(lines, ["amount offered"], amounts, n)
    received = field(lines, ["bids received (k", "bids received(k", "bids received"], amounts, n, exclude="number of")
    accepted = field(lines, ["total amount accepted", "amount accepted"], amounts, n)
    noncomp = field(lines, ["non-competitive bids", "non competitive bids"], amounts, n)
    comp = field(lines, ["competitive bids"], amounts, n, exclude="non")
    mwar = field(lines, ["market weighted average"], rates, n)
    war = field(lines, ["weighted average interest rate of", "weighted average rate of accepted"], rates, n, exclude="market")
    price = field(lines, ["price per kshs 100"], prices, n)
    due = []
    for line in lines:
        if line.lower().startswith("due date"):
            due = ["-".join(reversed(m)) for m in DATE.findall(line)]
            break

    dated = re.search(r"DATED\s+(\d{2})/(\d{2})/(\d{4})", text, flags=re.I)
    text_value_date = f"{dated.group(3)}-{dated.group(2)}-{dated.group(1)}" if dated else None

    issues = re.findall(r"(\d{3,4})\s*-\s*(\d{2,3})(?!\d)", name)
    issue_by_tenor = {int(t): i for i, t in issues}

    rows = []
    for k, tenor in enumerate(tenors):
        def at(values):
            return values[k] if k < len(values) else None

        row = {
            "tenor": tenor,
            "issue": issue_by_tenor.get(tenor),
            "maturity": at(due),
            "offered_kes_m": at(offered),
            "received_kes_m": at(received),
            "accepted_kes_m": at(accepted),
            "competitive_kes_m": at(comp),
            "noncompetitive_kes_m": at(noncomp),
            "weighted_avg_rate": at(war),
            "market_weighted_avg_rate": at(mwar),
            "price_per_100": at(price),
            "value_date": text_value_date,
        }
        # Plausibility: a misread cell is dropped rather than published.
        rate = row["weighted_avg_rate"]
        if row["price_per_100"] and rate:
            implied = 100 / (1 + rate / 100 * tenor / 364)
            if abs(implied - row["price_per_100"]) > 0.5:
                row["price_per_100"] = None
        if row["received_kes_m"] is not None and row["accepted_kes_m"] and row["received_kes_m"] < row["accepted_kes_m"] * 0.99:
            row["received_kes_m"] = None
        if row["offered_kes_m"] and row["received_kes_m"] is not None:
            row["subscription_pct"] = round(row["received_kes_m"] / row["offered_kes_m"] * 100, 2)
        if row["weighted_avg_rate"] is None or not (0 < row["weighted_avg_rate"] < 40):
            continue  # without the accepted rate the row is not usable
        rows.append(row)
    return rows


def fetch_and_parse(notice: dict, session: requests.Session) -> tuple[dict, list[dict], str | None]:
    for attempt in range(3):
        try:
            pdf = session.get(notice["url"], headers=UA, timeout=90).content
            if not pdf.startswith(b"%PDF"):
                return notice, [], "not a pdf"
            with pdfplumber.open(io.BytesIO(pdf)) as doc:
                text = "\n".join((page.extract_text() or "") for page in doc.pages[:2])
            return notice, parse_notice(text, notice["name"]), None
        except Exception as error:  # network hiccups: retry, then report
            if attempt == 2:
                return notice, [], str(error)[:120]
            time.sleep(2 + attempt * 3)
    return notice, [], "unreachable"


# --------------------------------------------------------------------------- main


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--full", action="store_true", help="re-read every notice")
    parser.add_argument("--limit", type=int, default=0, help="only process N notices (testing)")
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
            value_date = value_date_from_name(notice["name"])
            if error or not parsed:
                failures.append((notice["name"], error or "no table found"))
                sources[notice["url"]] = {"status": "unparsed", "reason": error or "no table found"}
                continue
            for row in parsed:
                row["value_date"] = value_date or row.get("value_date")
                row["source"] = notice["url"]
                rows.append(row)
            sources[notice["url"]] = {"status": "parsed", "tenors": [r["tenor"] for r in parsed]}
            if count % 25 == 0:
                print(f"  {count}/{len(notices)}", flush=True)

    # One row per (value date, tenor); newest parse wins. Rows without a value date are kept at the end.
    unique: dict[tuple, dict] = {}
    for row in rows:
        key = (row.get("value_date") or row["source"], row["tenor"])
        unique[key] = row
    ordered = sorted(unique.values(), key=lambda r: (r.get("value_date") or "", r["tenor"]), reverse=True)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "dataset": "Kenya Treasury bill auctions",
                "publisher": "Central Bank of Kenya",
                "source_page": LIST_URL,
                "compiled_by": "Afronomics (afronomicsfeed.com)",
                "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "units": {"amounts": "KES millions", "rates": "percent per annum"},
                "rows": ordered,
                "sources": sources,
            },
            ensure_ascii=False,
            indent=1,
        ),
        encoding="utf-8",
    )
    parsed_count = sum(1 for s in sources.values() if s.get("status") == "parsed")
    print(f"rows: {len(ordered)} · notices parsed: {parsed_count} · unparsed this run: {len(failures)}")
    for name, reason in failures[:15]:
        print(f"  unparsed: {name} ({reason})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
