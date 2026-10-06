"""
Keeps Kenya's next policy-rate decision current on the calendar. The Central Bank of Kenya announces one MPC
meeting at a time, in a notice that says "The next Monetary Policy Committee (MPC) meeting will be held on
<Weekday>, <Month> <day>, <year>." This reads the newest such notice (the bank's own WordPress posts feed, then
its RSS feed, then its home page) and adds the date to data/mpc_calendar.json if it is new.

    python scripts/kenya_mpc.py
"""

from __future__ import annotations

import html
import json
import re
import sys
import warnings
from datetime import datetime

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
CAL = ROOT / "data" / "mpc_calendar.json"
SOURCES = [
    "https://www.centralbank.go.ke/wp-json/wp/v2/posts?search=next%20mpc%20meeting&per_page=5&_fields=date,link,content",
    "https://www.centralbank.go.ke/feed/",
    "https://www.centralbank.go.ke/",
]
NEXT = re.compile(
    r"next Monetary Policy Committee \(MPC\) meeting (?:will be|is scheduled to be) held on (?:[A-Z][a-z]+day,?\s+)?([A-Z][a-z]+ \d{1,2},? 20\d\d)",
    re.I,
)


def text(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", html.unescape(s))
    return re.sub(r"\s+", " ", s)


def find(raw: str, link: str) -> list[tuple[str, str, str]]:
    """(ISO date, quoted sentence, link) for every 'next MPC meeting' sentence in the text."""
    out = []
    for m in NEXT.finditer(text(raw)):
        try:
            day = datetime.strptime(m.group(1).replace(",", ""), "%B %d %Y").date().isoformat()
        except ValueError:
            continue
        out.append((day, m.group(0) + ".", link))
    return out


def candidates() -> list[tuple[str, str, str]]:
    found = []
    for url in SOURCES:
        try:
            r = requests.get(url, headers=UA, timeout=(15, 40), verify=False)
        except Exception as error:
            print(f"  {url}: {str(error)[:80]}")
            continue
        if url.endswith("_fields=date,link,content"):
            try:
                for post in r.json():
                    found += find((post.get("content") or {}).get("rendered", ""), post.get("link") or url)
            except ValueError:
                pass
        elif url.endswith("/feed/"):
            for item in re.findall(r"<item>(.*?)</item>", r.text, flags=re.S):
                link = re.search(r"<link>(.*?)</link>", item)
                found += find(item, link.group(1).strip() if link else url)
        else:
            found += find(r.text, url)
        print(f"  {url}: {r.status_code}, {len(found)} found so far")
        if found:
            break
    return found


def main() -> int:
    found = candidates()
    if not found:
        print("  no 'next MPC meeting' notice found; calendar unchanged")
        return 0
    day, quote, link = max(found)  # the latest date announced
    cal = json.loads(CAL.read_text(encoding="utf-8"))
    kenya = cal["banks"].setdefault("kenya", {"source_url": link, "quote": quote, "meetings": []})
    if any(m.get("start") == day for m in kenya["meetings"]):
        print(f"  {day} already on the calendar")
        return 0
    kenya["meetings"].append({"start": day, "end": None, "announce": None})
    kenya["meetings"].sort(key=lambda m: m["start"])
    kenya["source_url"], kenya["quote"] = link, quote
    cal["updated"] = datetime.utcnow().date().isoformat()
    CAL.write_text(json.dumps(cal, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"  added Kenya MPC meeting {day} ({link})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
