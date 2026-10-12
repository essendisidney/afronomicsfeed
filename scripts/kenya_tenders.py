"""
Kenya's open government tenders, from the Public Procurement Regulatory Authority's open data.

The Public Procurement Information Portal (tenders.go.ke) publishes every tender as Open Contracting Data
Standard (OCDS) releases, one file per financial year (https://tenders.go.ke/api/ocds/index lists them). This
reads the current year's file and writes data/kenya/tenders.json: every tender still open for bids (closing date
today or later), soonest first, with the buyer, category, procurement method and when we first saw it (a Nairobi timestamp,
or "before" for tenders already open when we started reading), so the site and the alerts can tell what is new. Writes nothing if the file cannot be read or looks wrong.

    python scripts/kenya_tenders.py
"""

from __future__ import annotations

import json
import re
import sys
import time
import warnings
from datetime import datetime, timedelta, timezone

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "kenya" / "tenders.json"
INDEX = "https://tenders.go.ke/api/ocds/index"
FILE = "https://tenders.go.ke/api/ocds/tenders?fy={fy}"
EAT = timezone(timedelta(hours=3))
SMALL_WORDS = {"of", "and", "for", "the", "to", "in", "at", "on", "by", "a", "an", "or", "with", "from"}
KEEP_UPPER = {"ict", "cctv", "ups", "led", "pvc", "hiv", "tb", "ppe", "lpg", "gps", "it", "kcse", "kcpe", "ecde",
              "tvet", "ngo", "ngos", "pa", "ac", "hvac", "kv", "kva", "km", "sme", "smes", "agpo", "ii", "iii", "iv"}


def nice(title: str) -> str:
    """Portal titles are often in capitals: "SUPPLY OF FRESH BEEF" -> "Supply of Fresh Beef"."""
    title = re.sub(r"\s+", " ", title).strip()
    if sum(c.isupper() for c in title) < 0.6 * max(1, sum(c.isalpha() for c in title)):
        return title  # already mixed case: leave it as the buyer wrote it
    words = []
    for i, w in enumerate(title.lower().split(" ")):
        bare = re.sub(r"[^a-z]", "", w)
        if bare in KEEP_UPPER or re.search(r"\d", w) and "/" in w:
            words.append(w.upper())
        elif i and bare in SMALL_WORDS:
            words.append(w)
        else:
            words.append(w[:1].upper() + w[1:])
    return " ".join(words)


def parse_time(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return None


def get(url: str, timeout: int) -> requests.Response:
    """GET with patience: the portal answers 429 (too many requests) to bursts, so wait and try again."""
    for attempt in range(4):
        r = requests.get(url, headers={**UA, "Accept": "application/json"}, timeout=(15, timeout), verify=False)
        if r.status_code not in (429, 502, 503, 504):
            return r
        wait = int(r.headers.get("Retry-After", "0") or 0) or 20 * (attempt + 1)
        print(f"{url}: {r.status_code}, retrying in {wait}s")
        time.sleep(min(wait, 90))
    return r


def current_year() -> tuple[str, str] | None:
    """(file key like "2026-2027", financial year name) for the year today falls in."""
    r = get(INDEX, 60)
    try:
        rows = r.json()
    except ValueError:
        print(f"{INDEX}: not JSON (status {r.status_code}): {r.text[:120]!r}")
        return None
    rows = rows.get("data", rows) if isinstance(rows, dict) else rows
    today = datetime.now(EAT).date().isoformat()
    for r in rows:
        fy = r.get("financial_year") or {}
        if fy.get("start_date", "9") <= today <= fy.get("end_date", "0"):
            return fy["name"].replace("/", "-"), fy["name"]
    return None


def main() -> int:
    found = current_year()
    if not found:
        print("no financial year file found for today")
        return 1
    key, fy_name = found
    r = get(FILE.format(fy=key), 180)
    try:
        package = r.json()
    except ValueError:
        print(f"{r.url}: not JSON (status {r.status_code})")
        return 1
    releases = package.get("releases") or []
    if len(releases) < 100:
        print(f"only {len(releases)} releases in {r.url}; nothing written")
        return 1

    now = datetime.now(EAT)
    previous = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    seen = {t["id"]: t.get("first_seen") for t in previous.get("tenders", [])}
    seen.update(previous.get("seen_closed", {}))
    first_run = not previous

    stamp = now.isoformat(timespec="minutes")  # when this run first saw a tender (Nairobi time)
    tenders, by_id = [], {}
    for rel in releases:
        t = rel.get("tender") or {}
        closes = parse_time((t.get("tenderPeriod") or {}).get("endDate"))
        if not t.get("title") or not closes or closes < now:
            continue
        tid = str(t.get("id") or rel.get("ocid"))
        if tid in by_id:
            continue
        ref = re.sub(r"^ocds-[a-z0-9]+-\d+-", "", rel.get("ocid", "")).replace("\\/", "/")
        value = (t.get("value") or {}).get("amount")
        item = {
            "id": tid,
            "ref": ref,
            "title": nice(t["title"]),
            "buyer": nice((rel.get("buyer") or {}).get("name", "")),
            "category": t.get("mainProcurementCategory") or "",
            "method": t.get("procurementMethod") or "",
            "published": (parse_time(rel.get("date")) or now).astimezone(EAT).date().isoformat(),
            "closes": closes.astimezone(EAT).isoformat(timespec="minutes"),
            "value": value if isinstance(value, (int, float)) and value > 0 else None,
            # The first run marks everything as seen before, so "new" means new since we started reading.
            "first_seen": seen.get(tid) or ("before" if first_run else stamp),
        }
        by_id[tid] = item
        tenders.append(item)
    tenders.sort(key=lambda x: (x["closes"], x["buyer"], x["title"]))

    published = package.get("publishedDate")
    if previous.get("published") == published and [t["id"] for t in previous.get("tenders", [])] == [t["id"] for t in tenders]:
        print(f"{len(tenders)} open tenders; file of {published} unchanged")
        return 0
    # Remember first-seen dates of tenders that just closed for a while, in case the file briefly drops one.
    closed = {k: v for k, v in previous.get("seen_closed", {}).items() if v and v >= (now - timedelta(days=60)).date().isoformat()}
    for t in previous.get("tenders", []):
        if t["id"] not in by_id and t.get("first_seen") not in (None, "before"):
            closed[t["id"]] = t["first_seen"]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Kenya's open government tenders",
        "publisher": "Public Procurement Regulatory Authority, Public Procurement Information Portal (tenders.go.ke), OCDS open data",
        "source": r.url,
        "financial_year": fy_name,
        "published": published,
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "releases_in_file": len(releases),
        "note": "Open means the closing date is today or later. Check the full notice and documents on tenders.go.ke before bidding.",
        "tenders": tenders,
        "seen_closed": dict(sorted(closed.items())),
    }, ensure_ascii=False, indent=0), encoding="utf-8")
    new = sum(1 for t in tenders if t["first_seen"] == stamp)
    print(f"wrote {len(tenders)} open tenders of {len(releases)} in the {fy_name} file (published {published}); {new} new this run")
    return 0


if __name__ == "__main__":
    sys.exit(main())
