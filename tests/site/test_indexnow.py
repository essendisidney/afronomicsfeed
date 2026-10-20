"""IndexNow submission (scripts/indexnow.py): the key file is served, and the daily pick skips build-time pages."""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

import indexnow  # noqa: E402

XML = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://www.afronomicsfeed.com</loc><lastmod>2026-10-20T05:00:00.000Z</lastmod></url>
<url><loc>https://www.afronomicsfeed.com/markets/tbills</loc><lastmod>2026-10-20T05:00:00.000Z</lastmod></url>
<url><loc>https://www.afronomicsfeed.com/tools</loc><lastmod>2026-10-20T05:00:00.000Z</lastmod></url>
<url><loc>https://www.afronomicsfeed.com/brief/new-story</loc><lastmod>2026-10-19T21:00:00.000Z</lastmod></url>
<url><loc>https://www.afronomicsfeed.com/brief/old-story</loc><lastmod>2026-09-01T21:00:00.000Z</lastmod></url>
<url><loc>https://example.com/elsewhere</loc><lastmod>2026-10-19T21:00:00.000Z</lastmod></url>
</urlset>"""


def test_key_file_is_public_and_matches():
    assert (ROOT / "public" / f"{indexnow.KEY}.txt").read_text() == indexnow.KEY


def test_parse_keeps_only_our_host():
    urls = [u for u, _ in indexnow.parse_sitemap(XML)]
    assert len(urls) == 5
    assert "https://example.com/elsewhere" not in urls


def test_daily_pick_sends_recent_dated_pages_only():
    now = datetime(2026, 10, 20, 6, tzinfo=timezone.utc)
    assert indexnow.pick(indexnow.parse_sitemap(XML), 3, now) == ["https://www.afronomicsfeed.com/brief/new-story"]
