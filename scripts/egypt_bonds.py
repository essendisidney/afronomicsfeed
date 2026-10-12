"""
Egypt Treasury bond auction history from the Central Bank of Egypt (agent for the Ministry of Finance).

Each bond type (fixed coupon, zero coupon, floating rate) has a "Historical Data" page that offers the auction
record as an Excel download through a form post with an anti-forgery token, the same mechanism as T-bills
(scripts/egypt_tbills.py). Every sheet is read by its header names, not column positions, and only rows with an
issue date and a plausible weighted-average yield are kept. Writes data/egypt/bond_auctions.json; writes nothing if
no rows are read.

    python scripts/egypt_bonds.py            # read and write
    python scripts/egypt_bonds.py --inspect  # print each workbook's sheets, headers and first rows; write nothing
"""

from __future__ import annotations

import io
import json
import re
import sys
import time
import warnings
from datetime import date, datetime, timezone

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA, num  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "egypt" / "bond_auctions.json"
API = "https://www.cbe.org.eg/api/statistics/GetHistoricalData"
KINDS = {
    "fixed": "https://www.cbe.org.eg/en/auctions/egp-t-bonds-fixed-coupon/historical-data",
    "zero": "https://www.cbe.org.eg/en/auctions/egp-t-bonds-zero-coupon/historical-data",
    "floating": "https://www.cbe.org.eg/en/auctions/egp-t-bonds-frn/historical-data",
}


def fetch_workbook(page: str, start: str, end: str) -> bytes:
    """One Excel file for a date range (dd/mm/yyyy)."""
    s = requests.Session()
    s.headers.update(UA)
    html = s.get(page, timeout=(15, 60), verify=False).text
    i = html.find('id="historicalDataForm"')
    if i < 0:
        raise RuntimeError(f"no historical-data form on {page}")
    form = html[i:]
    form = form[: form.find("</form>")]
    data = dict(re.findall(r'<input name="([^"]+)" type="hidden" value="([^"]*)"', form))
    uid = re.search(r'name="uid" type="hidden" value="([^"]+)"', form)
    if uid:
        data["uid"] = uid.group(1)
    data.update(FromDateRaw=start, ToDateRaw=end, SubmitAction="2")
    r = s.post(API, data=data, headers={"Referer": page}, timeout=(15, 180), verify=False)
    if r.content[:2] != b"PK":
        raise RuntimeError(f"no workbook from {page} (status {r.status_code}, {r.content[:80]!r})")
    return r.content


def as_date(v) -> str | None:
    if isinstance(v, datetime):
        return v.date().isoformat()
    if isinstance(v, date):
        return v.isoformat()
    m = re.match(r"^\s*(\d{1,2})/(\d{1,2})/(\d{4})", str(v or ""))
    return f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}" if m else None


def pick(rec: dict, *needles: str):
    """The first column whose header contains every needle (headers lower-cased)."""
    for k, v in rec.items():
        if all(n in k for n in needles):
            return v
    return None


def parse_sheet(ws, kind: str, page: str) -> list[dict]:
    header = None
    rows = []
    for raw in ws.iter_rows(values_only=True):
        cells = list(raw)
        low = [str(c or "").strip().lower() for c in cells]
        if any(c.startswith("tenor") for c in low) or ("issue date" in low and "isin" in low):
            header = low
            continue
        if header is None:
            continue
        rec = dict(zip(header, cells))
        issue = as_date(rec.get("issue date") or pick(rec, "issue date"))  # the issue date, not "original issue date"
        rate = num(pick(rec, "weighted", "yield")) or num(pick(rec, "weighted", "rate"))
        if not issue or rate is None or not (0 < rate < 80):
            continue
        m = lambda *n: (lambda x: x / 1e6 if x else None)(num(pick(rec, *n)))  # noqa: E731
        days = num(pick(rec, "tenor"))
        accepted = m("accepted", "amount") or m("accepted", "nominal")
        received = m("submitted", "amount") or m("submitted", "nominal")
        rows.append({
            "kind": kind,
            "isin": (pick(rec, "isin") or None),
            "auction_date": as_date(pick(rec, "auction date")),
            "value_date": issue,
            "maturity": as_date(pick(rec, "maturity")),
            "tenor_days": int(days) if days else None,
            "tenor_years": round(days / 365, 1) if days else None,
            "type": (str(pick(rec, "new") or pick(rec, "type") or "").strip() or None),
            "offered_egp_m": m("required"),
            "received_egp_m": received,
            "accepted_egp_m": accepted,
            "bid_cover": round(received / accepted, 2) if received and accepted else None,
            "min_yield": num(pick(rec, "min", "yield")),
            "max_yield": num(pick(rec, "max", "yield")),
            "weighted_avg_yield": rate,
            "coupon": num(pick(rec, "coupon")),
            "source": page,
        })
    return rows


def main() -> int:
    import openpyxl

    inspect = "--inspect" in sys.argv
    end = date.today().strftime("%d/%m/%Y")
    rows: list[dict] = []
    for kind, page in KINDS.items():
        content = None
        for attempt in range(3):
            try:
                content = fetch_workbook(page, "01/01/2000", end)
                break
            except Exception as error:
                print(f"{kind}: attempt {attempt + 1}: {str(error)[:160]}")
                time.sleep(8)
        if content is None:
            continue
        wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
        if inspect:
            for ws in wb.worksheets:
                print(f"== {kind} / sheet {ws.title!r}")
                for i, raw in enumerate(ws.iter_rows(values_only=True)):
                    print("   ", [c for c in raw][:18])
                    if i >= 6:
                        break
        got = []
        for ws in wb.worksheets:
            got += parse_sheet(ws, kind, page)
        print(f"{kind}: {len(got)} auction rows")
        rows += got
    if inspect:
        print(f"inspect only: {len(rows)} rows parsed, nothing written")
        if rows:
            print(json.dumps(rows[:3], indent=1, default=str))
        return 0
    if not rows:
        print("no bond rows read; nothing written")
        return 1
    rows.sort(key=lambda r: (r["value_date"], r["kind"], r["isin"] or ""), reverse=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Egypt Treasury bond auctions",
        "publisher": "Central Bank of Egypt (on behalf of the Ministry of Finance)",
        "source_pages": KINDS,
        "currency": "EGP",
        "rate_note": "weighted average yield of accepted bids, percent per annum; amounts in EGP millions",
        "updated": rows[0]["value_date"],
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "rows": rows,
    }, ensure_ascii=False, indent=0), encoding="utf-8")
    print(f"wrote {len(rows)} Egypt bond auction rows; latest {rows[0]['value_date']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
