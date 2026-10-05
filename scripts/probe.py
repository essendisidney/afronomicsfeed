"""
Look at what a publisher's page says before writing a reader for it. Prints the text around each match.

    python scripts/probe.py "yield|rate" https://example.com/a https://example.com/b

Run from GitHub with the Probe workflow when the desk machine cannot reach the publisher. Reads only;
writes nothing.
"""

from __future__ import annotations

import re
import sys
import warnings

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
        t = text_of(r.text)
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
