"""
Publication latency: how long after the publisher releases an auction result does Afronomics carry it?

Runs after every reader in the African auctions workflow (.github/workflows/african-auctions.yml) and keeps
data/latency.json. For each bill and bond auction result (one market's auction on one day) it records:

    first_seen_at   when our reader first wrote the result to its dataset: the dataset's own updated_at/read_at
                    stamp, or the time this script ran when there is none. The site and the API carry the result a
                    few minutes later, once the commit has deployed.
    published_at    when the publisher released it, only where the publisher exposes a time:
                      * a time the reader took from the publisher's own listing (latency_hint below): the upload time
                        in the Bank of Ghana's media index, the file's created time in the Bank of Zambia's JSON:API;
                      * otherwise the Last-Modified header of the result's own document (its PDF or notice page), or
                        of a shared document when this result is the only new one in it and the newest it holds.
                    A Last-Modified within two minutes of the server's own Date header is a page generated on request,
                    not a release time, and is ignored; so is one from more than ten days before the auction date.
                    When nothing qualifies it stays null: never estimated.
    delay_h         first_seen_at - published_at, in hours. A publisher time later than our first sight (a file
                    re-uploaded after we read it) is kept on the record but left out of the figures.

Measuring starts with the first run of this script (13 Oct 2026, kept as "since"): results already on file then are
baseline (no first-seen time) and never count.
Only results dated within the last 21 days can be new, so a reader filling in history adds no false delays, and a
market with no record yet starts as baseline too. The summary gives p50/p90 per market from at least five timed
results; below that it gives the count and no figure.

    python scripts/latency.py

Readers that know the publisher's time import latency_hint from this file; it writes data/latency_hints.json, which
this script reads and deletes.
"""

from __future__ import annotations

import json
import statistics
import sys
import warnings
from collections import Counter
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parent.parent
NAIROBI = timezone(timedelta(hours=3))
NEW_WINDOW_DAYS = 21  # a result dated earlier than this when first seen is history being filled in, not news
KEEP_DAYS = 60  # baseline keys are kept this long (past the new-result window), then dropped
MIN_RESULTS = 5  # no figure from fewer timed results than this
GENERATED_SECONDS = 120

sys.path.insert(0, str(Path(__file__).resolve().parent))
from data_health import BILL_MARKETS, BOND_SETS  # noqa: E402


def _hints_path(root: Path) -> Path:
    return root / "data" / "latency_hints.json"


def latency_hint(kind: str, market: str, result_date: str, published_at: str | datetime | None, how: str, root: Path = ROOT) -> None:
    """Called by a reader that read the publisher's own release time for a result (kind 'bills' or 'bonds')."""
    if not published_at or not result_date:
        return
    when = published_at if isinstance(published_at, datetime) else parse_time(str(published_at))
    if when is None:
        return
    p = _hints_path(root)
    try:
        hints = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
    except (ValueError, OSError):
        hints = {}
    key = f"{kind}:{market}:{result_date[:10]}"
    iso = when.astimezone(timezone.utc).isoformat(timespec="seconds")
    if key in hints and hints[key]["published_at"] <= iso:
        return  # keep the earliest time given for the result
    hints[key] = {"published_at": iso, "how": how}
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(hints, indent=0, sort_keys=True), encoding="utf-8")


def parse_time(s: str | None) -> datetime | None:
    """An ISO 8601 or HTTP date as an aware UTC datetime; a time without a zone is not trusted (None)."""
    if not s:
        return None
    s = str(s).strip()
    try:
        t = datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        try:
            t = parsedate_to_datetime(s)
        except (TypeError, ValueError, IndexError):
            return None
    if t.tzinfo is None:
        return None
    return t.astimezone(timezone.utc)


def last_modified(headers: dict) -> tuple[datetime | None, str]:
    """The Last-Modified header as a release time, or None with the reason it does not count."""
    h = {k.lower(): v for k, v in (headers or {}).items()}
    lm = parse_time(h.get("last-modified"))
    if lm is None:
        return None, "no Last-Modified"
    served = parse_time(h.get("date"))
    if served is not None and abs((served - lm).total_seconds()) < GENERATED_SECONDS:
        return None, "generated on request"
    return lm, "ok"


def fetch_headers(url: str) -> dict:
    """Response headers for a document, by HEAD (or a GET that reads nothing when HEAD is refused)."""
    import requests

    warnings.filterwarnings("ignore")
    ua = {"User-Agent": "Mozilla/5.0 (compatible; AfronomicsBot/1.0; +https://www.afronomicsfeed.com/method)"}
    try:
        r = requests.head(url, headers=ua, timeout=(10, 20), allow_redirects=True, verify=False)
        if r.status_code < 400 and r.headers.get("Last-Modified"):
            return dict(r.headers)
        with requests.get(url, headers=ua, timeout=(10, 20), stream=True, verify=False) as g:
            return dict(g.headers) if g.status_code < 400 else {}
    except Exception:
        return {}


def _date(v) -> date | None:
    try:
        return date.fromisoformat(str(v)[:10]) if v else None
    except ValueError:
        return None


def datasets(root: Path) -> list[dict]:
    """Every bill and bond dataset: kind, market, name, file, date fields, and whether results split by country."""
    out = [{"kind": "bills", "market": slug, "name": name, "file": f"{slug}/tbill_auctions.json", "fields": ("auction_date", "value_date"), "by": None}
           for slug, name in BILL_MARKETS.items()]
    for rel, name, fields, _link in BOND_SETS:
        out.append({"kind": "bonds", "market": rel.split("/")[0], "name": name, "file": rel, "fields": fields,
                    "by": "country" if rel.startswith("waemu/") else None})
    return out


def results_of(ds: dict, raw: dict, today: date) -> dict[str, dict]:
    """The dataset's auction results by key: date, documents, and whether it is new enough to measure."""
    page = raw.get("source_page")
    found: dict[str, dict] = {}
    for r in raw.get("rows") or []:
        d = next((_date(r.get(f)) for f in ds["fields"] if r.get(f)), None)
        if not d or d > today + timedelta(days=7):
            continue
        key = f"{ds['kind']}:{ds['market']}:{d.isoformat()}"
        if ds["by"] and r.get(ds["by"]):
            key += f":{r[ds['by']]}"
        res = found.setdefault(key, {"key": key, "date": d.isoformat(), "docs": set()})
        doc = r.get("notice") or r.get("source")
        if doc and doc != page:
            res["docs"].add(doc)
    return found


def dataset_time(raw: dict, now: datetime) -> datetime:
    """When a reader last wrote the dataset (its updated_at/read_at stamp), else now. A result new to this record is in
    the file, so the file was written when the result arrived or later: never earlier than our true first sight."""
    t = parse_time(raw.get("updated_at") or raw.get("read_at"))
    return t if t and t <= now else now


def percentile(values: list[float], q: float) -> float:
    """Linear interpolation between closest ranks (statistics.quantiles 'inclusive')."""
    if len(values) == 1:
        return values[0]
    return statistics.quantiles(sorted(values), n=100, method="inclusive")[int(q * 100) - 1]


def summarise(results: list[dict], names: dict[str, str]) -> tuple[list[dict], dict]:
    measured = [r for r in results if not r.get("baseline")]
    timed_all = [r for r in measured if r.get("delay_h") is not None and not r.get("excluded")]
    out = []
    for key, name in names.items():
        kind, market = key.split(":", 1)
        mine = [r for r in measured if r["kind"] == kind and r["market"] == market]
        timed = [r for r in mine if r.get("delay_h") is not None and not r.get("excluded")]
        delays = [r["delay_h"] for r in timed]
        hows = Counter(r["published_how"] for r in timed if r.get("published_how"))
        enough = len(delays) >= MIN_RESULTS
        if not mine:
            status = "no new result since measuring began"
        elif not timed:
            status = "publisher time unknown"
        elif not enough:
            status = f"{len(timed)} timed result{'s' if len(timed) != 1 else ''} so far; figures from {MIN_RESULTS}"
        else:
            status = "measured"
        out.append({
            "kind": kind, "market": market, "name": name, "results": len(mine), "timed": len(timed),
            "p50_h": round(percentile(delays, 0.5), 1) if enough else None,
            "p90_h": round(percentile(delays, 0.9), 1) if enough else None,
            "publisher_time": hows.most_common(1)[0][0] if hows else None,
            "status": status,
        })
    delays = [r["delay_h"] for r in timed_all]
    overall = {
        "timed": len(delays), "results": len(measured),
        "p50_h": round(percentile(delays, 0.5), 1) if len(delays) >= MIN_RESULTS else None,
        "p90_h": round(percentile(delays, 0.9), 1) if len(delays) >= MIN_RESULTS else None,
    }
    return out, overall


def record(root: Path = ROOT, now: datetime | None = None, fetch: Callable[[str], dict] = fetch_headers) -> dict:
    """Update data/latency.json under root from the datasets and the readers' hints. Returns the new file body."""
    now = (now or datetime.now(timezone.utc)).astimezone(timezone.utc).replace(microsecond=0)
    today = now.astimezone(NAIROBI).date()
    out_path = root / "data" / "latency.json"
    old = json.loads(out_path.read_text(encoding="utf-8")) if out_path.exists() else {}
    results: list[dict] = list(old.get("results") or [])
    known = {r["key"] for r in results}
    started: dict[str, str] = dict(old.get("markets") or {})
    hints_file = _hints_path(root)
    try:
        hints = json.loads(hints_file.read_text(encoding="utf-8")) if hints_file.exists() else {}
    except (ValueError, OSError):
        hints = {}

    names: dict[str, str] = {}
    for ds in datasets(root):
        mkey = f"{ds['kind']}:{ds['market']}"
        names[mkey] = ds["name"]
        f = root / "data" / ds["file"]
        if not f.exists():
            continue
        try:
            raw = json.loads(f.read_text(encoding="utf-8"))
        except ValueError:
            continue
        found = results_of(ds, raw, today)
        if not found:
            continue
        first_market_run = mkey not in started
        started.setdefault(mkey, today.isoformat())
        seen_at = dataset_time(raw, now)
        newest = max(r["date"] for r in found.values())
        doc_users = Counter(doc for r in found.values() for doc in r["docs"])
        fresh = [r for k, r in found.items() if k not in known and _date(r["date"]) >= today - timedelta(days=NEW_WINDOW_DAYS)]
        fresh_docs = Counter(doc for r in fresh for doc in r["docs"])
        for r in fresh:
            entry = {"key": r["key"], "kind": ds["kind"], "market": ds["market"], "date": r["date"]}
            if first_market_run:
                entry.update(baseline=True, first_seen_at=None)
                results.append(entry)
                continue
            entry["first_seen_at"] = seen_at.isoformat()
            published, how = None, None
            hint = hints.get(f"{ds['kind']}:{ds['market']}:{r['date']}")
            if hint and parse_time(hint.get("published_at")):
                published, how = parse_time(hint["published_at"]), hint.get("how") or "publisher's listing"
            else:
                times = []
                for doc in sorted(r["docs"]):
                    own = doc_users[doc] == 1
                    if not own and not (fresh_docs[doc] == 1 and r["date"] == newest):
                        continue  # a document shared with other results says nothing about this one
                    lm, _why = last_modified(fetch(doc))
                    if lm:
                        times.append((lm, "Last-Modified of the result's own document" if own else "Last-Modified of the publisher's file (this result is the newest in it)"))
                if times:
                    published, how = min(times)
            if published is not None and published < datetime.combine(_date(r["date"]), datetime.min.time(), timezone.utc) - timedelta(days=10):
                published, how = None, None  # older than the auction itself: not this result's release
            entry["published_at"] = published.isoformat() if published else None
            entry["published_how"] = how
            if published is not None:
                entry["delay_h"] = round((seen_at - published).total_seconds() / 3600, 2)
                if entry["delay_h"] < 0:
                    entry["excluded"] = "publisher time is after our first sight (the document was changed later)"
            results.append(entry)
            known.add(r["key"])

    # Baseline keys only matter while their dates could still look new.
    cutoff = (today - timedelta(days=KEEP_DAYS)).isoformat()
    results = [r for r in results if not (r.get("baseline") and r["date"] < cutoff)]
    results.sort(key=lambda r: (r["date"], r["key"]), reverse=True)
    summary, overall = summarise(results, names)
    body = {
        "dataset": "Afronomics publication latency",
        "note": ("Per auction result: when our reader first wrote it (first_seen_at) and, where the publisher exposes "
                 "it, when the publisher released it (published_at; null when unknown, never estimated). Written by "
                 "scripts/latency.py after each data run; see that file for the method."),
        "since": old.get("since") or today.isoformat(),
        "min_results": MIN_RESULTS,
        "markets": dict(sorted(started.items())),
        "overall": overall,
        "summary": summary,
        "results": results,
    }
    for h in summary:
        if h["results"]:
            print(f"latency {h['kind']} {h['name']}: {h['results']} new, {h['timed']} timed, p50 {h['p50_h']} h, p90 {h['p90_h']} h ({h['status']})")
    changed = {k: v for k, v in old.items() if k != "updated_at"} != body
    if changed:
        body["updated_at"] = now.isoformat()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(body, ensure_ascii=False, indent=1), encoding="utf-8")
    else:
        body["updated_at"] = old.get("updated_at")
    if hints_file.exists():
        hints_file.unlink()
    return body


if __name__ == "__main__":
    b = record()
    o = b["overall"]
    print(f"latency: {o['results']} results measured since {b['since']}, {o['timed']} with a publisher time; p50 {o['p50_h']} h, p90 {o['p90_h']} h")
