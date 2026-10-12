"""
Uganda Treasury bond auction results from Bank of Uganda notices.

The bond notices sit in the same content API as the bill notices (scripts/uganda_tbills.py, whose helpers this
reuses). Work in progress: this version lists the bond notices and, with --inspect, prints the text of a few so the
parser can be written against the real layout. Writes nothing yet.

    python scripts/uganda_bonds.py --inspect
"""

from __future__ import annotations

import io
import re
import sys

import pdfplumber
import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
import uganda_tbills as ug  # noqa: E402


def bond_notices(session: requests.Session) -> list[dict]:
    data = session.get(ug.API, headers=ug.UA, timeout=(15, 90), verify=False).json()
    items = data["data"]["auctionInformation"]["items"]
    results = next(i for i in items if str(i.get("category", "")).lower().startswith("auction results"))
    files = []
    for year in results.get("file", []):
        for month in year.get("fileWithMonth", []):
            files += month.get("file", [])
        files += year.get("file", [])
    out = {}
    for f in files:
        title = f.get("title") or ""
        url = (f.get("file") or {}).get("url")
        if not url or not re.search(r"bond", title, flags=re.I):
            continue
        url = url if url.startswith("http") else ug.BASE + url
        out[url] = {"url": url, "title": title, "date": f.get("date") or f.get("publishedAt") or f.get("createdAt")}
    return list(out.values())


def text_of(session: requests.Session, url: str) -> str:
    data = ug.download(session, url)
    if data.startswith(b"%PDF"):
        with pdfplumber.open(io.BytesIO(data)) as doc:
            return "\n".join((p.extract_text() or "") for p in doc.pages[:2])
    if data.startswith(b"PK"):
        return ug.office_text(data)
    return ""


def main() -> int:
    s = requests.Session()
    notices = bond_notices(s)
    print(f"{len(notices)} bond notices")
    for n in notices[:6]:
        print("   ", n["title"], n["date"], n["url"])
    if "--inspect" in sys.argv:
        shown = 0
        for n in notices:
            t = text_of(s, n["url"])
            if len(t.strip()) < 200:
                continue
            print(f"--- {n['title']} ({n['url']})")
            print(t[:3000])
            shown += 1
            if shown >= 2:
                break
    return 0


if __name__ == "__main__":
    sys.exit(main())
