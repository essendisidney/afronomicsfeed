"""
Mozambique Treasury bill (Bilhetes do Tesouro) auction history from Banco de Moçambique.

The bank publishes the full series of BT auctions as one spreadsheet on its money-market page
("Série Leilões Bilhetes de Tesouro"). The file link is read from the page each run, since its
media path changes when the file is replaced. Only "BT Tipo A" rows (the Treasury's financing bills) are
kept; the other bill types in the file are left out so each auction date and tenor carries one rate.

    python scripts/mozambique_tbills.py
"""

from __future__ import annotations

import html as htmllib
import io
import re
import sys
import warnings
from collections import Counter
from datetime import datetime
from urllib.parse import quote, urljoin

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import UA, num, write  # noqa: E402

warnings.filterwarnings("ignore")
PAGE = "https://www.bancomoc.mz/pt/areas-de-actuacao/mercados/mercado-monetario/"


def workbook_url() -> str:
    page = requests.get(PAGE, headers=UA, timeout=(15, 60), verify=False).text
    for href in re.findall(r'href="([^"]+\.xlsx)"', page):
        name = htmllib.unescape(href)
        if re.search(r"leil[õo]es-bilhetes-de-tesouro", name, flags=re.I):
            return urljoin(PAGE, quote(name, safe="/:%"))
    raise SystemExit("BT auction series link not found on the Banco de Moçambique page")


def main() -> int:
    import openpyxl

    url = workbook_url()
    content = requests.get(url, headers=UA, timeout=(15, 300), verify=False).content
    wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    ws = wb.worksheets[0]
    rows, kinds = [], Counter()
    for i, raw in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            continue
        auction, settle, tenor, _maturity, instrument, offer, demand, taken, rate = (list(raw) + [None] * 9)[:9]
        if not isinstance(auction, datetime):
            if auction is None and i > 10:
                # the sheet is padded with empty rows to a million lines
                if all(c is None for c in raw[:9]):
                    break
            continue
        kinds[str(instrument)] += 1
        # "BT Tipo A" are the Treasury's financing bills; other types are kept out so each date/tenor has one rate.
        if "tipo a" not in str(instrument).lower():
            continue
        rate = num(rate)
        tenor = num(tenor)
        if rate is None or not tenor or rate <= 0:
            continue
        pct = rate * 100 if rate < 1 else rate
        m = lambda v: (num(v) / 1e6) if num(v) else None  # noqa: E731
        rows.append({
            "tenor": int(tenor),
            "auction_date": auction.date().isoformat(),
            "value_date": (settle if isinstance(settle, datetime) else auction).date().isoformat(),
            "instrument": instrument,
            "offered_mzn_m": m(offer),
            "received_mzn_m": m(demand),
            "accepted_mzn_m": m(taken),
            "weighted_avg_rate": round(pct, 4),
            "source": url,
        })
    print("instruments:", dict(kinds))
    write(
        "mozambique",
        dataset="Mozambique Treasury bill auctions",
        publisher="Banco de Moçambique",
        source_page=PAGE,
        currency="MZN",
        rate_note="weighted average subscription rate (taxa de juro média ponderada de subscrição), percent per annum",
        rows=rows,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
