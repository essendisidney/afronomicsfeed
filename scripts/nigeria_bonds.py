"""
Nigeria FGN bond auction results from the Debt Management Office.

The DMO publishes a "Summary of FGN Bond Auction Results for <Month>, <Year>" PDF each month on
https://www.dmo.gov.ng/fgn-bonds/auction (a document list, paged with ?start=N). Work in progress: this version
collects every summary's link and, with --inspect, prints the newest one's text so the parser can be written against
the real layout. Writes nothing yet.

    python scripts/nigeria_bonds.py --inspect
"""

from __future__ import annotations

import io
import re
import sys
import time
import warnings

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import UA  # noqa: E402

warnings.filterwarnings("ignore")
PAGE = "https://www.dmo.gov.ng/fgn-bonds/auction"
MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]


def get(url: str) -> requests.Response:
    for attempt in range(3):
        try:
            return requests.get(url, headers=UA, timeout=(15, 90), verify=False)
        except Exception:
            if attempt == 2:
                raise
            time.sleep(4 + attempt * 4)
    raise RuntimeError("unreachable")


def summaries() -> list[tuple[str, str]]:
    """((year-month), document url) for every monthly summary, newest first; walks the list's pages."""
    found: dict[str, str] = {}
    start = 0
    while start <= 400:
        html = get(f"{PAGE}?start={start}" if start else PAGE).text
        new = 0
        for path, month, year in re.findall(
            r"""href=["']((?:https://www\.dmo\.gov\.ng)?/\d+-summary-of-[a-z0-9-]*?auction-results-for-([a-z]+)-?(\d{4})[a-z0-9-]*)["']""", html, re.I
        ):
            url = path if path.startswith("http") else "https://www.dmo.gov.ng" + path
            month = month.lower()
            if month in MONTHS and url not in found.values():
                key = f"{year}-{MONTHS.index(month) + 1:02d}"
                if key not in found:
                    found[key] = url
                    new += 1
        if not new:
            break
        start += 20
    return sorted(found.items(), reverse=True)


def pdf_text(url: str) -> str:
    import pdfplumber

    r = get(url.rstrip("/") + "/file")
    if r.content[:4] != b"%PDF":
        return f"(not a PDF: {r.status_code} {r.content[:80]!r})"
    with pdfplumber.open(io.BytesIO(r.content)) as pdf:
        return "\n".join((p.extract_text() or "") for p in pdf.pages[:3])


def main() -> int:
    docs = summaries()
    print(f"{len(docs)} monthly summaries; newest {docs[0][0] if docs else None}, oldest {docs[-1][0] if docs else None}")
    for key, url in docs[:3] + docs[-2:]:
        print("   ", key, url)
    if "--inspect" in sys.argv and docs:
        for key, url in [docs[0], docs[-1]]:
            print(f"--- {key}: {url}")
            print(pdf_text(url))
    return 0


if __name__ == "__main__":
    sys.exit(main())
