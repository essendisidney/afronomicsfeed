"""
Look at what a publisher's page says before writing a reader for it. Prints the text around each match.

    python scripts/probe.py "yield|rate" https://example.com/a https://example.com/b
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
                t = re.sub(r"\s+", " ", " ".join((page.extract_text() or "") for page in pdf.pages[:12]))
        else:
            t = text_of(r.text)
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
