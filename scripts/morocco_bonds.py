"""
Morocco Treasury auction results (bons du Trésor) from the Treasury (Direction du Trésor et des Finances Extérieures).

The Ministry of Economy and Finance lists every DTFE communiqué on https://www.finances.gov.ma/fr/Pages/communiques.aspx
(one year at a time, chosen with a form post); each weekly auction has a "Résultat de l'adjudication du dd/mm/yyyy"
PDF with one line per security: ISIN, coupon, issue and maturity dates, the amount bid with its weighted average
price and rate, then the amount accepted with its weighted average price and rate (TMP) and the previous TMP. Lines
the Treasury did not take ("Néant") keep the bids with nothing accepted. Tenor is computed from the settlement and
maturity dates, so 13- and 52-week bills and 2- to 30-year bonds are told apart. PDFs already read are not downloaded
again.

Writes data/morocco/auctions.json; writes nothing if no results are read.

    python scripts/morocco_bonds.py                 # this year and last year, new PDFs only
    python scripts/morocco_bonds.py --years 2015    # backfill from 2015 (one page per year)
    python scripts/morocco_bonds.py --inspect       # parse the newest 3 PDFs and print; write nothing
"""

from __future__ import annotations

import io
import json
import re
import sys
import time
import warnings
from datetime import date, datetime, timezone
from html import unescape
from urllib.parse import quote

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "morocco" / "auctions.json"
PAGE = "https://www.finances.gov.ma/fr/Pages/communiques.aspx"
DATE = r"(\d{2}/\d{2}/\d{4})"
TOKEN = re.compile(r"\d{1,3}(?:[   ]\d{3})*,\d+\s*%?|-")


def iso(d: str) -> str:
    return f"{d[6:10]}-{d[3:5]}-{d[0:2]}"


def num(t: str | None) -> float | None:
    if not t or t == "-":
        return None
    return float(re.sub(r"[\s  %]", "", t).replace(",", "."))


def result_links(html: str) -> list[tuple[str, str]]:
    out = []
    for href, label in re.findall(r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', html, re.S | re.I):
        text = re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", label))).strip()
        m = re.search(r"sultat de l.adjudication du " + DATE, text, re.I)
        if m:
            out.append((iso(m.group(1)), href if href.startswith("http") else "https://www.finances.gov.ma" + href))
    return list(dict.fromkeys(out))


def year_page(session: requests.Session, year: int | None) -> str:
    html = session.get(PAGE, headers=UA, timeout=(15, 90), verify=False).text
    if year is None:
        return html
    field = re.search(r'name="([^"]*DDLYears)"', html)
    if not field:
        return html
    form = dict(re.findall(r'<input type="hidden" name="([^"]+)" id="[^"]*" value="([^"]*)"', html))
    form.update({"__EVENTTARGET": "", "__EVENTARGUMENT": "", field.group(1): str(year)})
    button = re.search(r'name="([^"]*BtnRevuesFilter)"', html)  # the filter's "OK" button submits the year
    if button:
        form[button.group(1)] = "OK"
    text_box = re.search(r'name="([^"]*txtYears)"', html)
    if text_box:
        form[text_box.group(1)] = str(year)
    return session.post(PAGE, data=form, headers={**UA, "Referer": PAGE}, timeout=(15, 120), verify=False).text


def fetch_pdf(session: requests.Session, url: str) -> bytes:
    head, _, path = url.partition("finances.gov.ma")
    return session.get(head + "finances.gov.ma" + quote(path, safe="/%'"), headers=UA, timeout=(15, 90), verify=False).content


def parse(text: str, source: str) -> list[dict]:
    flat = " ".join(text.split())
    held = re.search(r"Date de l.adjudication\s*:?\s*" + DATE, flat)
    settle = re.search(r"Date de r[èe]glement\s*:?\s*" + DATE, flat)
    if not held or not settle:
        return []
    settled = date.fromisoformat(iso(settle.group(1)))
    rows = []
    for line in text.splitlines():
        m = re.search(r"(MA\d{10}|-)?\s*(?:\d+\s*ans\s*)?(?:(\d+,\d+)\s*%\s*)?" + DATE + r"\s+" + DATE + r"\s+(.*)$", line.strip())
        if not m:
            continue
        tokens = TOKEN.findall(m.group(5))
        if len(tokens) < 7:
            continue
        bid, bid_price, bid_rate, acc, price, rate, last = tokens[:7]
        if bid == "-" and acc == "-":
            continue  # no bids on this line
        maturity = iso(m.group(4))
        days = (date.fromisoformat(maturity) - settled).days
        if days <= 0:
            continue
        rows.append({
            "auction_date": iso(held.group(1)),
            "settlement_date": settled.isoformat(),
            "isin": m.group(1) if m.group(1) and m.group(1) != "-" else None,
            "coupon": num(m.group(2)),
            "issue_date": iso(m.group(3)),
            "maturity": maturity,
            "tenor_days": days,
            "tenor_years": round(days / 365.25, 1),
            "bids_mad_m": num(bid),
            "bid_avg_price": num(bid_price),
            "bid_avg_rate": num(bid_rate),
            "accepted_mad_m": num(acc) or 0.0,
            "price": num(price),
            "rate": num(rate),
            "previous_rate": num(last),
            "source": source,
        })
    return rows


def pdf_rows(session: requests.Session, url: str, show: bool = False) -> list[dict]:
    import pdfplumber

    data = fetch_pdf(session, url)
    if data[:4] != b"%PDF":
        return []
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        text = "\n".join((p.extract_text() or "") for p in pdf.pages[:2])
    rows = parse(text, url)
    if show and not rows:
        print(f"--- no lines parsed; text of {url}:\n{text[:2500]}")
    return rows


def previous() -> tuple[list[dict], set[str]]:
    try:
        raw = json.loads(OUT.read_text())
        return raw["rows"], set(raw.get("documents_read", []))
    except Exception:
        return [], set()


def main() -> int:
    inspect = "--inspect" in sys.argv
    this_year = date.today().year
    first = int(sys.argv[sys.argv.index("--years") + 1]) if "--years" in sys.argv else this_year - 1
    s = requests.Session()
    links: list[tuple[str, str]] = []
    for year in [None] + list(range(this_year, first - 1, -1)):
        try:
            got = result_links(year_page(s, year))
        except Exception as error:
            print(f"year {year}: {str(error)[:100]}")
            continue
        links += got
        if inspect:
            print(f"year {year}: {len(got)} result PDFs listed")
            if year is not None and year < this_year:
                break
        time.sleep(1)
    links = sorted(set(links), reverse=True)
    rows, done = previous()
    todo = links[:4] if inspect else [(d, u) for d, u in links if u not in done]
    print(f"{len(links)} auction result PDFs listed; reading {len(todo)}")
    new, empty = [], []
    for d, url in todo:
        try:
            got = pdf_rows(s, url, show=inspect)
        except Exception as error:
            empty.append(f"{d} ({str(error)[:60]})")
            continue
        if inspect:
            print(f"== {d} {url}: {len(got)} lines")
            for r in got:
                print("   ", json.dumps(r, ensure_ascii=False))
        if got:
            new += got
            done.add(url)
        else:
            empty.append(d)
        time.sleep(0.5)
    if empty:
        print(f"{len(empty)} PDFs gave no lines: {empty[:15]}")
    if inspect:
        print("inspect only: nothing written")
        return 0
    rows += new
    if not rows:
        print("no Morocco auction results read; nothing written")
        return 1
    seen, uniq = set(), []
    for r in sorted(rows, key=lambda r: (r["auction_date"], r["tenor_days"]), reverse=True):
        key = (r["auction_date"], r["maturity"], r["isin"])
        if key not in seen:
            seen.add(key)
            uniq.append(r)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Morocco Treasury auctions",
        "publisher": "Direction du Trésor et des Finances Extérieures (Ministry of Economy and Finance)",
        "source_page": PAGE,
        "currency": "MAD",
        "rate_note": "weighted average rate (TMP) of accepted bids, percent per annum; amounts in MAD millions; "
        "accepted 0 = the Treasury took nothing on that line",
        "updated": uniq[0]["auction_date"],
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "documents_read": sorted(done),
        "rows": uniq,
    }, ensure_ascii=False, indent=0), encoding="utf-8")
    print(f"wrote {len(uniq)} Morocco auction lines ({len(new)} new); latest {uniq[0]['auction_date']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
