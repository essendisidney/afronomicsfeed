"""
What it costs to send money to Africa, corridor by corridor, from the World Bank's Remittance Prices Worldwide
(RPW) dataset: for each sending country -> African country, the average total cost of sending the equivalent of
$200 (fee plus exchange-rate margin, as a % of the amount sent), the cheapest service surveyed, and the average by
type of provider.

Finds the newest RPW Excel file linked from the World Bank's data-download page (or the next quarters' file names),
reads the latest survey period, and writes data/remittances/corridors.json. Writes nothing if the table cannot be
read. Re-run quarterly; the World Bank surveys each quarter.

    python scripts/remittance_prices.py
"""

from __future__ import annotations

import io
import json
import re
import sys
import warnings
from collections import defaultdict
from datetime import datetime, timezone
from statistics import mean
from urllib.parse import urljoin

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "remittances" / "corridors.json"
PAGE = "https://remittanceprices.worldbank.org/data-download"
FILES = "https://remittanceprices.worldbank.org/sites/default/files/"

# ISO3 of the 54 African countries (as in lib/data/countries.ts).
AFRICA = set(
    "DZA AGO BEN BWA BFA BDI CPV CMR CAF TCD COM COD COG CIV DJI EGY GNQ ERI SWZ ETH GAB GMB GHA GIN GNB KEN LSO LBR LBY "
    "MDG MWI MLI MRT MUS MAR MOZ NAM NER NGA RWA STP SEN SYC SLE SOM ZAF SSD SDN TZA TGO TUN UGA ZMB ZWE".split()
)


def find_files() -> list[str]:
    """Excel files linked from the download page, plus the likely names of the next quarters' files."""
    urls = []
    try:
        html = requests.get(PAGE, headers=UA, timeout=(15, 60), verify=False).text
        urls += [urljoin(PAGE, h) for h in re.findall(r'href="([^"]+\.xlsx)"', html, flags=re.I)]
    except Exception as error:
        print(f"  download page: {str(error)[:80]}")
    for year in (2026, 2025):
        for q in (4, 3, 2, 1):
            urls.append(f"{FILES}rpw_dataset_2011_{year}_q{q}.xlsx")
    seen, ordered = set(), []
    for u in urls:
        if u not in seen:
            seen.add(u)
            ordered.append(u)
    # newest period first, judged by the year and quarter in the name
    def key(u: str):
        m = re.search(r"(\d{4})_q(\d)", u, flags=re.I)
        return (int(m.group(1)), int(m.group(2))) if m else (0, 0)
    return sorted(ordered, key=key, reverse=True)


def norm(h) -> str:
    return re.sub(r"[^a-z0-9%]+", " ", str(h or "").lower()).strip()


def pick(header: list[str], *needles: str, avoid: tuple[str, ...] = ()) -> int | None:
    for i, h in enumerate(header):
        if all(n in h for n in needles) and not any(a in h for a in avoid):
            return i
    return None


def columns(header: list[str]) -> dict:
    either = lambda a, b: a if a is not None else b
    return {
        "period": pick(header, "period"),
        "src": either(pick(header, "source", "code"), pick(header, "source", "iso")),
        "src_name": pick(header, "source", "name"),
        "dst": either(pick(header, "destination", "code"), pick(header, "destination", "iso")),
        "dst_name": pick(header, "destination", "name"),
        "firm": pick(header, "firm", avoid=("type",)),
        "firm_type": pick(header, "firm", "type"),
        # cost of sending the equivalent of $200 ("cc1"), as a % of the amount sent
        "cost": either(pick(header, "cc1", "total cost", "%"), pick(header, "cc1", "total cost")),
    }


def read_quotes(content: bytes):
    """Every quote into an African country, from every sheet that carries the dataset (the file splits the years
    across sheets, each with its own header)."""
    import openpyxl

    wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    found = False
    for ws in wb.worksheets:
        rows = ws.iter_rows(values_only=True)
        col = None
        for _, row in zip(range(30), rows):
            header = [norm(c) for c in row]
            if pick(header, "destination") is not None and pick(header, "total cost") is not None:
                col = columns(header)
                break
        if col is None:
            print(f"  sheet {ws.title!r}: no dataset header")
            continue
        if any(col[k] is None for k in ("period", "dst", "cost", "firm")):
            print(f"  sheet {ws.title!r}: a needed column is missing {col}")
            continue
        found = True
        n = 0
        for row in rows:
            if not row or col["dst"] >= len(row):
                continue
            dst = str(row[col["dst"]] or "").strip().upper()
            if dst not in AFRICA:
                continue
            try:
                cost = float(row[col["cost"]])
            except (TypeError, ValueError):
                continue
            if not (0 <= cost < 100):
                continue
            get = lambda k: str(row[col[k]] or "").strip() if col[k] is not None and col[k] < len(row) else ""
            n += 1
            yield {
                "period": get("period"), "src": get("src").upper(), "src_name": get("src_name"), "dst": dst,
                "dst_name": get("dst_name") or dst, "firm": get("firm"), "firm_type": get("firm_type"), "cost": cost,
            }
        print(f"  sheet {ws.title!r}: {n} quotes into Africa")
    if not found:
        print("  no sheet with the dataset columns")


def build(content: bytes) -> dict | None:
    by_period = defaultdict(list)
    for q in read_quotes(content):
        by_period[q.pop("period")].append(q)
    if not by_period:
        print("  no African corridors found")
        return None

    def period_key(p: str):
        m = re.search(r"(\d{4})\D*Q?(\d)", p, flags=re.I) or re.search(r"Q(\d)\D*(\d{4})", p, flags=re.I)
        if not m:
            return (0, 0)
        a, b = m.groups()
        return (int(a), int(b)) if len(a) == 4 else (int(b), int(a))

    periods = sorted(by_period, key=period_key)
    latest = periods[-1]
    print(f"  periods: {periods[:3]} … {periods[-3:]}; latest {latest}, {len(by_period[latest])} quotes into Africa")

    corridors = []
    groups = defaultdict(list)
    for q in by_period[latest]:
        groups[(q["src"], q["dst"])].append(q)
    for (src, dst), quotes in groups.items():
        if len(quotes) < 2:
            continue
        cheapest = min(quotes, key=lambda q: q["cost"])
        types = defaultdict(list)
        for q in quotes:
            types[q["firm_type"] or "Other"].append(q["cost"])
        corridors.append({
            "src": src, "src_name": quotes[0]["src_name"], "dst": dst, "dst_name": quotes[0]["dst_name"],
            "services": len(quotes),
            "avg_cost_pct": round(mean(q["cost"] for q in quotes), 2),
            "cheapest": {"firm": cheapest["firm"], "type": cheapest["firm_type"], "cost_pct": round(cheapest["cost"], 2)},
            "dearest_pct": round(max(q["cost"] for q in quotes), 2),
            "by_type": {t: round(mean(v), 2) for t, v in sorted(types.items())},
        })
    corridors.sort(key=lambda c: (c["dst_name"], c["avg_cost_pct"]))

    # The previous period, per corridor, so the page can say whether costs are falling.
    prev = periods[-2] if len(periods) > 1 else None
    if prev:
        pg = defaultdict(list)
        for q in by_period[prev]:
            pg[(q["src"], q["dst"])].append(q["cost"])
        for c in corridors:
            v = pg.get((c["src"], c["dst"]))
            c["prev_avg_cost_pct"] = round(mean(v), 2) if v and len(v) >= 2 else None
    return {"period": latest, "previous_period": prev, "corridors": corridors}


def main() -> int:
    for url in find_files():
        try:
            r = requests.get(url, headers=UA, timeout=(15, 120), verify=False)
        except Exception as error:
            print(f"  {url}: {str(error)[:80]}")
            continue
        if r.status_code != 200 or r.content[:2] != b"PK":
            print(f"  {url}: {r.status_code}")
            continue
        print(f"  reading {url} ({len(r.content) // 1024} KB)")
        built = build(r.content)
        if not built:
            return 1
        if OUT.exists() and json.loads(OUT.read_text(encoding="utf-8")).get("period") == built["period"]:
            print(f"  period {built['period']} already published")
            return 0
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(json.dumps({
            "dataset": "Cost of sending money to African countries, by corridor",
            "publisher": "World Bank, Remittance Prices Worldwide",
            "source": url,
            "source_page": PAGE,
            "licence": "World Bank Terms of Use for Datasets (attribution)",
            "compiled_by": "Afronomics (afronomicsfeed.com)",
            "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "note": "Average total cost of sending the equivalent of USD 200 (fee plus exchange-rate margin) as a % of the amount sent, across the services the World Bank surveyed in the corridor that quarter.",
            **built,
        }, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"  wrote {len(built['corridors'])} corridors for {built['period']}")
        return 0
    print("  no dataset found")
    return 1


if __name__ == "__main__":
    sys.exit(main())
