"""
Zambia government bond auction results from the Bank of Zambia.

The BoZ website is backed by a Drupal JSON:API (the same one scripts/zambia_tbills.py reads). Each bond auction is a
`bond_auction` node (title like "07/2026/BA", field_bond_auction_date) with one paragraph per tenor
(paragraph--2_year_bond ... 15_year_bond) carrying the ISIN, coupon rate and yield rate, plus the results notice PDF
(field_results_file). Field names carry a tenor prefix on some paragraphs (field_10_year_yield_rate), so they are
matched by suffix. Writes data/zambia/bond_auctions.json; writes nothing if no auctions are read.

    python scripts/zambia_bonds.py            # read and write
    python scripts/zambia_bonds.py --inspect  # print the newest auctions and the first results PDF's text; write nothing
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
from bills_common import ROOT, UA, num  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "zambia" / "bond_auctions.json"
BASE = "https://www.boz.zm/jsonapi/node/bond_auction"
PAGE = "https://www.boz.zm/markets-securities/bonds"


def get_json(url: str) -> dict:
    for attempt in range(3):
        try:
            return requests.get(url, headers=UA, timeout=(15, 90), verify=False).json()
        except Exception:
            if attempt == 2:
                raise
            time.sleep(3 + attempt * 3)
    return {}


def pages(limit: int | None = None):
    url = f"{BASE}?include=field_auction_results,field_results_file&sort=-field_bond_auction_date&page[limit]=50"
    n = 0
    while url:
        body = get_json(url)
        yield body
        n += 1
        if limit and n >= limit:
            return
        url = (body.get("links", {}).get("next") or {}).get("href")


def attr(attrs: dict, suffix: str):
    return next((v for k, v in attrs.items() if k.startswith("field_") and k.endswith(suffix)), None)


def pdf_text(url: str) -> str | None:
    import pdfplumber

    try:
        content = requests.get(url, headers=UA, timeout=(15, 90), verify=False).content
        if content[:4] != b"%PDF":
            return None
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            return "\n".join((p.extract_text() or "") for p in pdf.pages[:2])
    except Exception:
        return None


LINE = re.compile(
    r"(\d+)\s*Years?\s+(ZM\d{10})\s+"
    + r"\s+".join([r"K\s?([\d,]+\.?\d*)\s*Mn"] * 5)
    + r"\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)",
    re.I,
)


def notice_amounts(text: str) -> dict[str, dict]:
    """Per-ISIN amounts from a results notice: offered, bid and allocated (face and cost), in ZMW millions."""
    out = {}
    for m in LINE.finditer(text or ""):
        f = [float(x.replace(",", "")) for x in m.groups()[2:7]]
        out[m.group(2)] = {
            "offered_zmw_m": f[0],
            "bid_face_zmw_m": f[1],
            "bid_cost_zmw_m": f[2],
            "allocated_face_zmw_m": f[3],
            "allocated_cost_zmw_m": f[4],
            "bid_cover": round(f[1] / f[0], 2) if f[0] else None,
            "dirty_price": float(m.group(8)),
        }
    return out


def previous() -> dict[tuple, dict]:
    try:
        return {(r["tender"], r["isin"]): r for r in json.loads(OUT.read_text())["rows"]}
    except Exception:
        return {}


def main() -> int:
    inspect = "--inspect" in sys.argv
    rows: list[dict] = []
    old = previous()
    notices: dict[str, dict] = {}
    for body in pages(limit=1 if inspect else None):
        included = {i["id"]: i for i in body.get("included", [])}
        for node in body.get("data", []):
            a = node["attributes"]
            day = (a.get("field_bond_auction_date") or "")[:10]
            if not day:
                continue
            rel = node.get("relationships", {})
            pdf = None
            f = (rel.get("field_results_file") or {}).get("data")
            if f and f.get("id") in included:
                uri = (included[f["id"]]["attributes"].get("uri") or {}).get("url")
                pdf = f"https://www.boz.zm{uri}" if uri and uri.startswith("/") else uri
            for ref in (rel.get("field_auction_results") or {}).get("data") or []:
                p = included.get(ref["id"])
                m = re.search(r"(\d+)_year", p["type"]) if p else None
                if not m:
                    continue
                at = p["attributes"]
                y = num(attr(at, "yield_rate"))
                if y is None or not (0 < y < 60):
                    continue  # a suspended tenor ("Nil") or an unreadable figure
                isin = attr(at, "isin")
                amounts = {k: v for k, v in (old.get((a.get("title"), isin)) or {}).items() if k.endswith("_m") or k in ("bid_cover", "dirty_price")}
                if not amounts and pdf:
                    if pdf not in notices:  # one download per notice, and only for auctions not already on file
                        notices[pdf] = notice_amounts(pdf_text(pdf) or "")
                    amounts = notices[pdf].get(isin, {})
                rows.append({
                    "tender": a.get("title"),
                    "auction_date": day,
                    "tenor_years": int(m.group(1)),
                    "isin": isin,
                    "coupon": num(attr(at, "coupon_rate")),
                    "yield": y,
                    **amounts,
                    "notice": pdf,
                    "source": PAGE,
                })
    if inspect:
        print(f"{len(rows)} tenor results on the first page")
        print(json.dumps(rows[:8], indent=1))
        with_amounts = sum(1 for r in rows if "offered_zmw_m" in r)
        print(f"{with_amounts} of {len(rows)} results have amounts from the notice PDFs")
        print("inspect only: nothing written")
        return 0
    if not rows:
        print("no bond auctions read; nothing written")
        return 1
    rows.sort(key=lambda r: (r["auction_date"], r["tenor_years"]), reverse=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Zambia government bond auctions",
        "publisher": "Bank of Zambia",
        "source_page": PAGE,
        "currency": "ZMW",
        "rate_note": "cut-off yield of the auction by tenor, percent per annum, as the Bank of Zambia publishes it; coupon in percent; amounts in ZMW millions from the results notice (face value unless marked cost)",
        "updated": rows[0]["auction_date"],
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "rows": rows,
    }, ensure_ascii=False, indent=0), encoding="utf-8")
    auctions = len({r["tender"] for r in rows})
    print(f"wrote {len(rows)} tenor results from {auctions} Zambia bond auctions; latest {rows[0]['auction_date']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
