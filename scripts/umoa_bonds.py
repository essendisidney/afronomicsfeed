"""
WAEMU government securities auctions (Benin, Burkina Faso, Cote d'Ivoire, Guinea-Bissau, Mali, Niger, Senegal, Togo)
from UMOA-Titres, the regional agency that runs them.

Work in progress: this first version only inspects the issues page (https://www.umoatitres.org/fr/emissions/) so the
reader can be written against its real structure. It prints the page's tables (headers and first rows) and the
links to each issue's results. Writes nothing.

    python scripts/umoa_bonds.py --inspect
"""

from __future__ import annotations

import re
import sys
import warnings
from html import unescape

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import UA  # noqa: E402

warnings.filterwarnings("ignore")
PAGE = "https://www.umoatitres.org/fr/emissions/"


def text(html: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", html))).strip()


def main() -> int:
    html = requests.get(PAGE, headers=UA, timeout=(15, 120), verify=False).text
    print(f"{len(html)} bytes of HTML")
    tables = re.findall(r"<table.*?</table>", html, re.S | re.I)
    print(f"{len(tables)} tables")
    for i, t in enumerate(tables[:4]):
        rows = re.findall(r"<tr.*?</tr>", t, re.S | re.I)
        print(f"== table {i}: {len(rows)} rows")
        for r in rows[:6]:
            print("   ", [text(c) for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", r, re.S | re.I)][:16])
    links = re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', html, re.S | re.I)
    res = [(h, text(t)) for h, t in links if re.search(r"sultat|\.pdf|xls", h + t, re.I)]
    print(f"{len(res)} result or document links; first 25:")
    for h, t in res[:25]:
        print(f"   {t[:60]!r} -> {h}")
    # Cards rather than tables: show one issue block in raw form
    i = html.find("Résultats")
    if i < 0:
        i = html.find("R&eacute;sultats")
    if i > 0:
        print("--- raw around the first 'Résultats':")
        print(html[max(0, i - 2500): i + 600])
    return 0


if __name__ == "__main__":
    sys.exit(main())
