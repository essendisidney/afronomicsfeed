"""
Egypt Treasury bill auction history from the Central Bank of Egypt.

The CBE's "EGP T-Bills Historical Data" page offers the full auction record as an Excel download
(a form post with an anti-forgery token). One row per auction per tenor.

    python scripts/egypt_tbills.py
"""

from __future__ import annotations

import io
import re
import sys
import warnings
from datetime import date, datetime

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import UA, num, write  # noqa: E402

warnings.filterwarnings("ignore")
PAGE = "https://www.cbe.org.eg/en/auctions/egp-t-bills/historical-data"
API = "https://www.cbe.org.eg/api/statistics/GetHistoricalData"


def fetch_workbook() -> bytes:
    s = requests.Session()
    s.headers.update(UA)
    html = s.get(PAGE, timeout=(15, 60), verify=False).text
    form = html[html.find('id="historicalDataForm"'):]
    form = form[: form.find("</form>")]
    data = dict(re.findall(r'<input name="([^"]+)" type="hidden" value="([^"]*)"', form))
    data["uid"] = re.search(r'name="uid" type="hidden" value="([^"]+)"', form).group(1)
    data.update(FromDateRaw="01/01/2000", ToDateRaw=date.today().strftime("%d/%m/%Y"), SubmitAction="2")
    r = s.post(API, data=data, headers={"Referer": PAGE}, timeout=(15, 180), verify=False)
    if r.content[:2] != b"PK":
        raise SystemExit(f"CBE did not return a workbook (status {r.status_code})")
    return r.content


def main() -> int:
    import openpyxl

    wb = openpyxl.load_workbook(io.BytesIO(fetch_workbook()), read_only=True, data_only=True)
    ws = wb.worksheets[0]
    header = None
    rows = []
    for raw in ws.iter_rows(values_only=True):
        cells = list(raw)
        if header is None:
            if cells and str(cells[0]).strip().lower().startswith("tenor"):
                header = [str(c or "").strip().lower() for c in cells]
            continue
        rec = dict(zip(header, cells))
        tenor = num(rec.get("tenor (days)"))
        issue = rec.get("issue date")
        rate = num(rec.get("weighted avg. yield (%)"))
        if not tenor or not isinstance(issue, datetime) or rate is None or not (0 < rate < 80):
            continue
        m = lambda k: (num(rec.get(k)) or 0) / 1e6 or None  # noqa: E731
        rows.append({
            "tenor": int(tenor),
            "auction_date": None,
            "value_date": issue.date().isoformat(),
            "isin": rec.get("isin"),
            "offered_egp_m": m("required amount"),
            "received_egp_m": m("submitted amount"),
            "accepted_egp_m": m("accepted amount"),
            "min_yield": num(rec.get("min. yield (%)")),
            "max_yield": num(rec.get("max. yield (%)")),
            "weighted_avg_rate": rate,
            "source": PAGE,
        })
    if not rows:
        raise SystemExit("No rows parsed from the CBE workbook")
    write(
        "egypt",
        dataset="Egypt Treasury bill auctions",
        publisher="Central Bank of Egypt",
        source_page=PAGE,
        currency="EGP",
        rate_note="weighted average yield of accepted bids, percent per annum",
        rows=rows,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
