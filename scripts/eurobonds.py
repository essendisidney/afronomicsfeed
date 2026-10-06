"""
What African governments pay to borrow in dollars: the yield on each of their Eurobonds, from the government's
own published report.

- Nigeria: the Debt Management Office's daily "Nigeria's Eurobonds Closing Prices and Yields as at <date>" PDF,
  listed on https://www.dmo.gov.ng/fgn-bonds/eurobonds-trading (coupon, amount issued, maturity, price, yield).
- Kenya: Table 6 ("Performance of Key Market Indicators") of the Central Bank of Kenya's Weekly Bulletin, which
  prints each day's yield on every Kenyan Eurobond, by maturity year.

Writes data/eurobonds.json: for each country the latest day's table and a history of daily yields per bond.
A day whose table does not line up (a different number of bonds in each row) is skipped, not guessed.

    python scripts/eurobonds.py
"""

from __future__ import annotations

import io
import json
import re
import sys
import warnings
from datetime import datetime, timezone
from urllib.parse import urljoin

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "eurobonds.json"
DMO_PAGE = "https://www.dmo.gov.ng/fgn-bonds/eurobonds-trading"
MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
MON3 = [m[:3].upper() for m in MONTHS]
KEEP_DAYS = 400


def dmo_links(html: str, base: str) -> dict[str, str]:
    """{'2026-10-05': '<pdf download url>'} for every daily closing-prices PDF on the page."""
    out = {}
    for href in re.findall(r'href="([^"#]*eurobonds-closing-prices-and-yields-as-at-[^"#]*)"', html, flags=re.I):
        m = re.search(r"as-at-(?:[a-z]+-)?([a-z]+)-(\d{1,2})-(\d{4})", href, flags=re.I)
        if not m or m.group(1).lower() not in MONTHS:
            continue
        day = f"{m.group(3)}-{MONTHS.index(m.group(1).lower()) + 1:02d}-{int(m.group(2)):02d}"
        url = urljoin(base, href)
        out[day] = url if url.rstrip("/").endswith("/file") else url.rstrip("/") + "/file"
    return out


def parse_dmo(text: str) -> list[dict] | None:
    """The DMO table: one column per bond. Rows: coupons, amounts issued, maturities, prices, yields."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    nums = lambda l: re.fullmatch(r"(?:\d+(?:\.\d+)?\s+)+\d+(?:\.\d+)?", l)
    coupons = next(([float(x) for x in re.findall(r"(\d+(?:\.\d+)?)%", l)] for l in lines if re.fullmatch(r"(?:\d+(?:\.\d+)?%\s*)+", l)), None)
    sizes = next((l.split() for l in lines if re.fullmatch(r"(?:US\$?[\d.]+[BM]\s*)+", l)), None)
    mats = next((re.findall(r"([A-Z]{3}) (20\d\d)", l) for l in lines if re.fullmatch(r"(?:[A-Z]{3} 20\d\d\s*)+", l)), None)
    yields = next(([float(x) for x in l.split()[2:]] for l in lines if l.startswith("Yield (%)")), None)
    price = None
    for i, l in enumerate(lines):
        if l == "Price" and i + 1 < len(lines) and nums(lines[i + 1]):
            price = [float(x) for x in lines[i + 1].split()]
            break
    if not (coupons and mats and yields and price):
        print(f"  DMO table: a row is missing (coupons {bool(coupons)}, maturities {bool(mats)}, prices {bool(price)}, yields {bool(yields)})")
        return None
    n = len(mats)
    if not (len(coupons) == len(yields) == len(price) == n) or (sizes and len(sizes) != n):
        print(f"  DMO table: rows do not line up ({len(coupons)} coupons, {n} maturities, {len(price)} prices, {len(yields)} yields)")
        return None
    bonds = []
    for i, (mon, year) in enumerate(mats):
        if mon not in MON3 or not (0 < yields[i] < 40) or not (20 < price[i] < 200):
            print(f"  DMO table: implausible column {i}: {mon} {year} {price[i]} {yields[i]}")
            return None
        size = sizes[i] if sizes else None
        bonds.append({
            "id": f"{coupons[i]:.3f}-{year}-{MON3.index(mon) + 1:02d}",
            "coupon": coupons[i],
            "maturity": f"{year}-{MON3.index(mon) + 1:02d}",
            "size": re.sub(r"^US\$?", "US$", size) if size else None,
            "price": price[i],
            "yield": yields[i],
        })
    return bonds


def nigeria(previous: dict) -> dict | None:
    import pdfplumber

    page = requests.get(DMO_PAGE, headers=UA, timeout=(15, 60), verify=False)
    links = dmo_links(page.text, page.url)
    print(f"  DMO: {len(links)} daily reports listed; newest {max(links) if links else '-'}")
    if not links:
        return None
    history = {h["date"]: h for h in previous.get("history", [])}
    latest = previous.get("latest")
    for day in sorted(links, reverse=True)[:12]:
        if day in history and latest and latest.get("date", "") >= day:
            continue
        r = requests.get(links[day], headers=UA, timeout=(15, 60), verify=False)
        if r.content[:5] != b"%PDF-":
            print(f"  {day}: not a PDF")
            continue
        with pdfplumber.open(io.BytesIO(r.content)) as pdf:
            text = "\n".join(p.extract_text() or "" for p in pdf.pages[:2])
        bonds = parse_dmo(text)
        if not bonds:
            print(f"  {day}: skipped")
            continue
        print(f"  {day}: {len(bonds)} bonds, yields {min(b['yield'] for b in bonds)}-{max(b['yield'] for b in bonds)}%")
        history[day] = {"date": day, "yields": {b["id"]: b["yield"] for b in bonds}}
        if not latest or day >= latest.get("date", ""):
            latest = {"date": day, "source": links[day], "bonds": bonds}
    if not latest:
        return None
    return {
        "country": "Nigeria",
        "publisher": "Debt Management Office, Nigeria",
        "source_page": DMO_PAGE,
        "note": "Closing prices and yields as the DMO publishes them each business day (its stated source: Bloomberg).",
        "latest": latest,
        "history": sorted(history.values(), key=lambda h: h["date"], reverse=True)[:KEEP_DAYS],
    }


CBK_PAGE = "https://www.centralbank.go.ke/releases/weekly-bulletin/"
MON_ABBR = {m[:3].lower(): i for i, m in enumerate(MONTHS, 1)}


def cbk_links(html: str, base: str) -> dict[str, str]:
    """{'2026-10-02': '<pdf url>'} for every weekly bulletin on the page (its link text is the date, dd-mm-yyyy)."""
    out = {}
    for href, label in re.findall(r'<a[^>]+href="([^"#]*weekly_?bulletin[^"#]*\.pdf)"[^>]*>(.*?)</a>', html, flags=re.S | re.I):
        m = re.fullmatch(r"\s*(\d{2})-(\d{2})-(20\d\d)\s*", re.sub(r"<[^>]+>", "", label))
        if m:
            out[f"{m.group(3)}-{m.group(2)}-{m.group(1)}"] = urljoin(base, href)
    return out


def parse_cbk(text: str) -> dict[str, dict[str, float]] | None:
    """Table 6: daily rows '1-Oct-26 <8 equity and bond-market figures> <one yield per Eurobond>'. The maturity years
    sit in a header broken across lines; the columns run from the nearest maturity to the furthest, so the years
    are put in order and must match the number of yields on every row."""
    start = text.find("Table 6")
    if start < 0 or "EuroBond Yields" not in text[start:start + 800]:
        print("  CBK: Table 6 with Eurobond yields not found")
        return None
    block = text[start:]
    first = re.search(r"^\d{1,2}-[A-Z][a-z]{2}-\d\d ", block, flags=re.M)
    if not first:
        return None
    head = block[block.find("EuroBond Yields"):first.start()]
    years = sorted(int(y) for y in re.findall(r"\b(20[2-9]\d)\b", head))
    if not years or len(set(years)) != len(years):
        print(f"  CBK: maturity years unclear: {years}")
        return None
    days: dict[str, dict[str, float]] = {}
    for m in re.finditer(r"^(\d{1,2})-([A-Z][a-z]{2})-(\d\d) (.+)$", block, flags=re.M):
        vals = m.group(4).split()
        if m.group(2).lower() not in MON_ABBR or len(vals) != 8 + len(years):
            print(f"  CBK: row {m.group(0)[:40]!r} has {len(vals)} figures, expected {8 + len(years)}; skipped")
            continue
        ys = [num_or_none(v) for v in vals[-len(years):]]
        if any(y is None or not (0 < y < 40) for y in ys):
            continue
        day = f"20{m.group(3)}-{MON_ABBR[m.group(2).lower()]:02d}-{int(m.group(1)):02d}"
        days[day] = {str(yr): y for yr, y in zip(years, ys)}
    return days or None


def num_or_none(v: str) -> float | None:
    try:
        return float(v.replace(",", ""))
    except ValueError:
        return None


def kenya(previous: dict) -> dict | None:
    import pdfplumber

    page = requests.get(CBK_PAGE, headers=UA, timeout=(15, 60), verify=False)
    links = cbk_links(page.text, page.url)
    print(f"  CBK: {len(links)} bulletins listed; newest {max(links) if links else '-'}")
    if not links:
        return None
    history = {h["date"]: h for h in previous.get("history", [])}
    done = set(previous.get("bulletins", []))
    latest = previous.get("latest")
    for week in sorted(links, reverse=True)[:6]:
        if week in done:
            continue
        r = requests.get(links[week], headers=UA, timeout=(15, 90), verify=False)
        if r.content[:5] != b"%PDF-":
            print(f"  bulletin {week}: not a PDF")
            continue
        with pdfplumber.open(io.BytesIO(r.content)) as pdf:
            text = "\n".join(p.extract_text() or "" for p in pdf.pages[:8])
        days = parse_cbk(text)
        if not days:
            print(f"  bulletin {week}: no yields read")
            continue
        done.add(week)
        print(f"  bulletin {week}: {len(days)} days, {sorted(days)[0]} to {sorted(days)[-1]}")
        for day, ys in days.items():
            history[day] = {"date": day, "yields": ys}
        newest = max(days)
        if not latest or newest >= latest.get("date", ""):
            latest = {
                "date": newest,
                "source": links[week],
                "bonds": [{"id": yr, "coupon": None, "maturity": yr, "size": None, "price": None, "yield": y} for yr, y in sorted(days[newest].items())],
            }
    if not latest:
        return None
    return {
        "country": "Kenya",
        "publisher": "Central Bank of Kenya",
        "source_page": CBK_PAGE,
        "note": "Daily yields from Table 6 of the CBK Weekly Bulletin (its stated sources: the Nairobi Securities Exchange and Thomson Reuters), by year of maturity.",
        "latest": latest,
        "history": sorted(history.values(), key=lambda h: h["date"], reverse=True)[:KEEP_DAYS],
        "bulletins": sorted(done, reverse=True)[:60],
    }


def main() -> int:
    data = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    countries = data.get("countries", {})
    changed = False
    for key, fn in [("nigeria", nigeria), ("kenya", kenya)]:
        try:
            got = fn(countries.get(key, {}))
        except Exception as error:
            print(f"  {key}: {str(error)[:160]}")
            continue
        if got and got != {k: countries.get(key, {}).get(k) for k in got}:
            countries[key] = got
            changed = True
    if not changed:
        print("  nothing new")
        return 0
    OUT.write_text(json.dumps({
        "dataset": "African government Eurobond yields",
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "countries": countries,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  wrote {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
