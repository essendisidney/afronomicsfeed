"""
Tell Bing, Yandex, Seznam, Naver and the other IndexNow engines which of our pages are new or changed, so they are
crawled within hours instead of weeks. Google does not use IndexNow; it reads the sitemap named in robots.txt.

The key is public by design: IndexNow checks that https://www.afronomicsfeed.com/<key>.txt holds it (public/), which
proves we own the host. It is not a secret.

Reads the live sitemap. By default sends the pages with their own date (stories, weekly pages, auction days) dated in
the last few days; the pages stamped with the build time are left for the weekly full run, so the engines are not
sent the whole site every day.

    python scripts/indexnow.py            # dated pages from the last 3 days
    python scripts/indexnow.py --all      # every page in the sitemap
    python scripts/indexnow.py --dry      # print what would be sent, send nothing
"""

from __future__ import annotations

import argparse
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timedelta, timezone

import requests

HOST = "www.afronomicsfeed.com"
KEY = "3712e2dd3e7350dab1837058f4a8fa11"
SITEMAP = f"https://{HOST}/sitemap.xml"
ENDPOINT = "https://api.indexnow.org/indexnow"
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
BATCH = 10_000  # IndexNow's limit per request


def parse_sitemap(xml: str) -> list[tuple[str, datetime | None]]:
    """(url, lastmod) for each <url> in a sitemap. Only our own host is kept."""
    out = []
    for node in ET.fromstring(xml).findall("sm:url", NS):
        loc = (node.findtext("sm:loc", default="", namespaces=NS) or "").strip()
        if not loc.startswith(f"https://{HOST}/") and loc != f"https://{HOST}":
            continue
        raw = (node.findtext("sm:lastmod", default="", namespaces=NS) or "").strip()
        try:
            when = datetime.fromisoformat(raw.replace("Z", "+00:00")) if raw else None
        except ValueError:
            when = None
        if when and when.tzinfo is None:
            when = when.replace(tzinfo=timezone.utc)
        out.append((loc, when))
    return out


def pick(entries: list[tuple[str, datetime | None]], days: int, now: datetime) -> list[str]:
    """Pages with their own date in the last `days` days. The most common lastmod is the build time: skip it."""
    stamps = Counter(w for _, w in entries if w)
    build = stamps.most_common(1)[0][0] if stamps else None
    since = now - timedelta(days=days)
    return [u for u, w in entries if w and w != build and since <= w <= now + timedelta(days=1)]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--days", type=int, default=3)
    args = ap.parse_args()

    res = requests.get(SITEMAP, timeout=60, headers={"User-Agent": "afronomics-indexnow"})
    res.raise_for_status()
    entries = parse_sitemap(res.text)
    urls = [u for u, _ in entries] if args.all else pick(entries, args.days, datetime.now(timezone.utc))
    urls = list(dict.fromkeys(urls))
    print(f"sitemap: {len(entries)} pages; sending {len(urls)}")
    for u in urls[:20]:
        print("  ", u)
    if not urls or args.dry:
        return 0
    for i in range(0, len(urls), BATCH):
        body = {"host": HOST, "key": KEY, "keyLocation": f"https://{HOST}/{KEY}.txt", "urlList": urls[i:i + BATCH]}
        r = requests.post(ENDPOINT, json=body, timeout=60, headers={"Content-Type": "application/json; charset=utf-8"})
        print(f"IndexNow {r.status_code} for {len(body['urlList'])} pages")
        if r.status_code not in (200, 202):
            print(r.text[:500])
            return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
