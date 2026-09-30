"""
South Africa Treasury bill tender rates from the South African Reserve Bank.

The SARB publishes the average rate at which each tenor is allotted in the weekly Treasury bill auction as
daily time series (MMRD203A, MMRD206A, MMRD209A, MMRD212A) through its public web API. The value holds between
auctions, so a row is kept each time a tenor's rate changes, dated to the first day the new rate appears.

    python scripts/southafrica_tbills.py
"""

from __future__ import annotations

import sys
import time
import warnings
from datetime import date

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import UA, num, write  # noqa: E402

warnings.filterwarnings("ignore")
CODES = {91: "MMRD203A", 182: "MMRD206A", 273: "MMRD209A", 364: "MMRD212A"}
API = "https://custom.resbank.co.za/SarbWebApi/WebIndicators/Shared/GetTimeseriesObservations/{code}/2000-01-01/{today}"
PAGE = "https://www.resbank.co.za/en/home/what-we-do/statistics/key-statistics/current-market-rates"


def series(code: str) -> list[tuple[str, float]]:
    url = API.format(code=code, today=date.today().isoformat())
    for attempt in range(3):
        try:
            data = requests.get(url, headers=UA, timeout=(15, 180), verify=False).json()
            break
        except Exception:
            if attempt == 2:
                raise
            time.sleep(5)
    out = [(o["Period"][:10], num(o["Value"])) for o in data if num(o.get("Value"))]
    return sorted(out)


def main() -> int:
    rows = []
    for tenor, code in CODES.items():
        prev_val = None
        for day, value in series(code):
            if value != prev_val:
                rows.append({
                    "tenor": tenor,
                    "auction_date": None,
                    "value_date": day,
                    "weighted_avg_rate": value,
                    "offered_zar_m": None,
                    "received_zar_m": None,
                    "accepted_zar_m": None,
                    "series": code,
                    "source": PAGE,
                })
            prev_val = value
    write(
        "southafrica",
        dataset="South Africa Treasury bill tender rates",
        publisher="South African Reserve Bank",
        source_page=PAGE,
        currency="ZAR",
        rate_note="average rate at which bills are allotted in the weekly auction, percent per annum",
        rows=rows,
        notes="Dated to the first day the SARB series shows each new tender rate. A week in which a tenor's rate was unchanged adds no row for that tenor.",
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
