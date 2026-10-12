"""
Morocco Treasury bond auction results from the Treasury (Direction du Trésor et des Finances Extérieures).

The Ministry of Economy and Finance lists every DTFE communiqué on https://www.finances.gov.ma/fr/Pages/communiques.aspx;
each weekly auction has a "Résultat de l'adjudication du dd/mm/yyyy" PDF. Work in progress: this version lists those
PDFs and, with --inspect, prints the newest one's text so the parser can be written against the real layout.
Writes nothing yet.

    python scripts/morocco_bonds.py --inspect
"""

from __future__ import annotations

import io
import re
import sys
import warnings
from html import unescape
from urllib.parse import quote

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import UA  # noqa: E402

warnings.filterwarnings("ignore")
PAGE = "https://www.finances.gov.ma/fr/Pages/communiques.aspx"


def result_links(html: str) -> list[tuple[str, str]]:
    out = []
    for href, label in re.findall(r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', html, re.S | re.I):
        text = re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", label))).strip()
        m = re.search(r"sultat de l.adjudication du (\d{2}/\d{2}/\d{4})", text, re.I)
        if m:
            out.append((m.group(1), href))
    return list(dict.fromkeys(out))


def fetch_pdf(href: str) -> bytes:
    url = href if href.startswith("http") else "https://www.finances.gov.ma" + href
    # file names contain spaces and accents: encode the path, keep the scheme and host
    head, _, path = url.partition("finances.gov.ma")
    return requests.get(head + "finances.gov.ma" + quote(path, safe="/%'"), headers=UA, timeout=(15, 90), verify=False).content


def main() -> int:
    import pdfplumber

    html = requests.get(PAGE, headers=UA, timeout=(15, 90), verify=False).text
    links = result_links(html)
    print(f"{len(links)} auction result PDFs on the current page")
    for d, h in links[:5]:
        print("   ", d, h)
    if "--inspect" in sys.argv and links:
        data = fetch_pdf(links[0][1])
        if data[:4] != b"%PDF":
            print(f"not a PDF: {data[:120]!r}")
            return 0
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            for i, p in enumerate(pdf.pages[:2]):
                print(f"--- page {i + 1} text")
                print(p.extract_text() or "(no text layer)")
                for t in p.extract_tables()[:3]:
                    print("--- table")
                    for row in t[:25]:
                        print("   ", row)
    # The year filter is a form post: show its field names for the backfill.
    form_fields = sorted(set(re.findall(r'name="([^"]*(?:ddl|Year|annee|Annee|year)[^"]*)"', html)))
    print("year filter fields:", form_fields[:10])
    return 0


if __name__ == "__main__":
    sys.exit(main())
