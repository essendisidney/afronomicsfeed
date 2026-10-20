"""
Look at what a publisher's page says before writing a reader for it. Prints the text around each match.

    python scripts/probe.py "yield|rate" https://example.com/a https://example.com/b
    PROBE_FULL=1 python scripts/probe.py x https://example.com/report.pdf   # print a PDF's full text, page by page
    PROBE_PAGES=170-188 PROBE_LAYOUT=1 python scripts/probe.py x https://example.com/report.pdf   # chosen pages, columns kept
    PROBE_LINKS=1 python scripts/probe.py "bond|bill" https://example.com/   # also list matching links

PDFs are read as text (pdfplumber).

Run from GitHub with the Probe workflow when the desk machine cannot reach the publisher. Reads only;
writes nothing.
"""

from __future__ import annotations

import io
import os
import re
import sys
import warnings
from urllib.parse import urljoin

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import UA  # noqa: E402

warnings.filterwarnings("ignore")


def text_of(html: str) -> str:
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t).replace("&nbsp;", " ").replace("&#8211;", "-").replace("&amp;", "&")
    return re.sub(r"\s+", " ", t)


def pages_of(spec: str, total: int) -> list[int]:
    """ "170-188,96" -> [170, ..., 188, 96], kept within the document and capped at 80 pages a run."""
    out: list[int] = []
    for part in spec.replace(" ", "").split(","):
        if not part:
            continue
        a, _, b = part.partition("-")
        lo, hi = int(a), int(b or a)
        out += [n for n in range(lo, hi + 1) if 1 <= n <= total]
    return out[:80]


def main() -> int:
    pattern, urls = re.compile(sys.argv[1], re.I), sys.argv[2:]
    for url in urls:
        print(f"\n=== {url}")
        try:
            r = requests.get(url, headers=UA, timeout=(15, 40), verify=False)
        except Exception as error:
            print(f"  error: {str(error)[:120]}")
            continue
        if "pdf" in r.headers.get("content-type", "").lower() or r.content[:5] == b"%PDF-":
            import pdfplumber

            with pdfplumber.open(io.BytesIO(r.content)) as pdf:
                if os.environ.get("PROBE_PAGES"):  # e.g. "170-188,96": those pages only, deep in a long report
                    wanted = pages_of(os.environ["PROBE_PAGES"], len(pdf.pages))
                    layout = bool(os.environ.get("PROBE_LAYOUT"))  # keep column positions, for multi-column tables
                    for n in wanted:
                        print(f"--- page {n}\n{pdf.pages[n - 1].extract_text(layout=layout) or ''}")
                elif os.environ.get("PROBE_FULL"):  # every page, line breaks kept, to write a table reader
                    for n, page in enumerate(pdf.pages[:60], 1):
                        print(f"--- page {n}\n{page.extract_text() or ''}")
                print(f"  {len(pdf.pages)} pages")
                t = re.sub(r"\s+", " ", " ".join((page.extract_text() or "") for page in pdf.pages[:12]))
        else:
            t = text_of(r.text)
            if os.environ.get("PROBE_FULL"):  # the whole page's text, from the first match on, in lines
                m = pattern.search(t)
                body = t[m.start() if m else 0 :][:20000]
                for i in range(0, len(body), 400):
                    print(f"  | {body[i:i + 400]}")
            if os.environ.get("PROBE_RAW"):  # search the raw HTML too: where a page loads its figures from
                for m in list(pattern.finditer(r.text))[:25]:
                    print(f"  raw: {r.text[max(0, m.start() - 160):m.end() + 160]!r}")
            if os.environ.get("PROBE_LINKS"):
                for href, label in re.findall(r'<a[^>]+href="([^"#]+)"[^>]*>(.*?)</a>', r.text, flags=re.S | re.I)[:2000]:
                    text = re.sub(r"<[^>]+>|\s+", " ", label).strip()
                    if pattern.search(text) or pattern.search(href):
                        print(f"  link: {text[:80]} -> {urljoin(r.url, href)}")
        print(f"  status {r.status_code}, final {r.url}, {len(t)} chars of text")
        shown = 0
        for m in pattern.finditer(t):
            if shown >= 12:
                break
            print(f"  … {t[max(0, m.start() - 140):m.end() + 140]}")
            shown += 1
        if not shown:
            print(f"  no match; start of text: {t[:400]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
