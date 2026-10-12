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
    issues = list(dict.fromkeys(re.findall(r'href="?(https://www\.umoatitres\.org/fr/emission/[^"\s>]+)', html)))
    print(f"{len(issues)} distinct issue pages linked; first 5 and last 3:")
    for u in issues[:5] + issues[-3:]:
        print("   ", u)
    # The listing table: first rows, with each row's link
    lst = re.search(r'<table[^>]*liste-emission.*?</table>', html, re.S | re.I)
    if lst:
        rows = re.findall(r"<tr.*?</tr>", lst.group(0), re.S | re.I)
        print(f"listing table: {len(rows)} rows")
        for r in rows[:4] + rows[-2:]:
            cells = [text(c) for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", r, re.S | re.I)]
            link = re.search(r'href="?([^"\s>]+)', r)
            print("   ", cells[:9], link.group(1) if link else None)
    # One issue page: each accordion panel's title and the start of its text
    u = issues[1]
    page = requests.get(u, headers=UA, timeout=(15, 120), verify=False).text
    print(f"=== {u}")
    for title, body in re.findall(r'vc_tta-panel-title">.*?<span[^>]*>(.*?)</span>.*?vc_tta-panel-body">(.*?)(?=<div class="vc_tta-panel"|$)', page, re.S):
        print(f"  [panel] {text(title)}: {text(body)[:1600]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
