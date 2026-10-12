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
    for u in issues[:2]:
        page = requests.get(u, headers=UA, timeout=(15, 120), verify=False).text
        print(f"=== {u} ({len(page)} bytes)")
        for i, t in enumerate(re.findall(r"<table.*?</table>", page, re.S | re.I)[:6]):
            rows = re.findall(r"<tr.*?</tr>", t, re.S | re.I)
            print(f"  -- table {i}: {len(rows)} rows")
            for r in rows[:30]:
                print("    ", [text(c) for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", r, re.S | re.I)][:12])
        docs = [h for h in re.findall(r'href="([^"]+)"', page) if re.search(r"\.(pdf|xlsx?)$", h, re.I)]
        print("  documents:", docs[:8])
        body = text(page)
        j = body.find("sultats")
        print("  text:", body[j: j + 1500] if j >= 0 else body[:1500])
    return 0


if __name__ == "__main__":
    sys.exit(main())
