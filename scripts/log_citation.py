"""
Log one outside citation of Afronomics in data/citations.json (docs/rebuild/upgrade-U6-plan.md, item C).

    python scripts/log_citation.py --date 2026-10-24 --outlet "Business Daily" \
        --title "T-bill rates ease for a third week" --url https://www.businessdailyafrica.com/... \
        --kind news --what "Kenya 364-day T-bill rate" --our-path /markets/kenya-tbills --linked yes

    python scripts/log_citation.py --withdraw <id> --reason "not a citation of ours"   # a wrong entry
    python scripts/log_citation.py --check                                          # validate the file only

Appends; never edits or deletes a row (data/ is append-only). A wrong entry is withdrawn by a new entry whose
`corrects` names it. The rules are the ones in lib/citations-core.ts; the site refuses nothing, so this script is the
gate. Commit the change on a branch and open a pull request as for any data change. No people's names or contact
details: log the outlet, the piece and its link.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILE = ROOT / "data" / "citations.json"

KINDS = ("news", "research", "government", "industry", "blog", "social", "other")
ISO = re.compile(r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$")
ID = re.compile(r"^[a-z0-9][a-z0-9-]{2,80}$")
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}")
OWN_HOST = re.compile(r"^https?://(www\.)?afronomicsfeed\.com(/|$)", re.I)


def nairobi_today() -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=3)).date().isoformat()


def errors_for(c: dict, today: str) -> list[str]:
    """Same rules as citationErrors in lib/citations-core.ts."""
    errs: list[str] = []

    def text(v) -> bool:
        return isinstance(v, str) and v.strip() != ""

    if not text(c.get("id")) or not ID.match(c["id"]):
        errs.append("id must be lower-case letters, digits and hyphens")
    d = c.get("date")
    if not text(d) or not ISO.match(d):
        errs.append("date must be YYYY-MM-DD")
    elif d > today:
        errs.append("date is in the future")
    lo = c.get("logged_on")
    if not text(lo) or not ISO.match(lo):
        errs.append("logged_on must be YYYY-MM-DD")
    elif text(d) and lo < d:
        errs.append("logged before it was published")
    for f in ("outlet", "title", "what", "logged_by"):
        if not text(c.get(f)):
            errs.append(f"{f} is required")
        elif len(c[f]) > 200:
            errs.append(f"{f} is longer than 200 characters")
    u = c.get("url")
    if not text(u) or not re.match(r"^https://\S+$", u):
        errs.append("url must be an https link")
    elif OWN_HOST.match(u):
        errs.append("url is our own site; log the outside page that cited us")
    if c.get("kind") not in KINDS:
        errs.append(f"kind must be one of {', '.join(KINDS)}")
    p = c.get("our_path")
    if p is not None and not (isinstance(p, str) and re.match(r"^/\S*$", p)):
        errs.append("our_path must be a path on the site, starting with /")
    if not isinstance(c.get("linked"), bool):
        errs.append("linked must be true or false")
    if any(isinstance(c.get(f), str) and EMAIL.search(c[f]) for f in ("outlet", "title", "what", "logged_by")):
        errs.append("no email addresses in the log")
    return errs


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def check(doc: dict, today: str) -> list[str]:
    problems: list[str] = []
    entries = doc.get("entries")
    if not isinstance(entries, list):
        return ["entries must be a list"]
    ids = [e.get("id") for e in entries]
    for e in entries:
        for err in errors_for(e, today):
            problems.append(f"{e.get('id', '?')}: {err}")
        corr = e.get("corrects")
        if corr is not None and corr not in ids:
            problems.append(f"{e.get('id', '?')}: corrects an id that is not in the log ({corr})")
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        problems.append(f"duplicate ids: {', '.join(map(str, dupes))}")
    return problems


def slug(s: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")[:40].strip("-")


def write(path: Path, doc: dict, today: str) -> None:
    doc["updated_at"] = today
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main(argv: list[str] | None = None, path: Path = FILE, today: str | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--withdraw")
    ap.add_argument("--reason")
    ap.add_argument("--date")
    ap.add_argument("--outlet")
    ap.add_argument("--title")
    ap.add_argument("--url")
    ap.add_argument("--kind", choices=KINDS)
    ap.add_argument("--what")
    ap.add_argument("--our-path")
    ap.add_argument("--linked", choices=("yes", "no"))
    ap.add_argument("--by", default="founder")
    args = ap.parse_args(argv)
    today = today or nairobi_today()
    doc = load(path)

    problems = check(doc, today)
    if problems:
        print("data/citations.json has problems:\n  " + "\n  ".join(problems), file=sys.stderr)
        return 1
    if args.check:
        print(f"OK: {len(doc['entries'])} entries")
        return 0

    ids = {e["id"] for e in doc["entries"]}
    if args.withdraw:
        target = next((e for e in doc["entries"] if e["id"] == args.withdraw), None)
        if not target:
            print(f"No entry {args.withdraw}", file=sys.stderr)
            return 1
        if not args.reason:
            print("--reason is required to withdraw an entry", file=sys.stderr)
            return 1
        entry = {**target, "id": f"withdraw-{target['id']}"[:81], "what": f"Withdrawn: {args.reason}", "logged_on": today, "logged_by": args.by, "corrects": target["id"]}
    else:
        entry = {
            "id": "",
            "date": args.date,
            "outlet": (args.outlet or "").strip(),
            "title": (args.title or "").strip(),
            "url": (args.url or "").strip(),
            "kind": args.kind,
            "what": (args.what or "").strip(),
            "our_path": args.our_path or None,
            "linked": {"yes": True, "no": False}.get(args.linked or ""),
            "logged_on": today,
            "logged_by": args.by,
        }
        base = f"{args.date or 'undated'}-{slug(entry['outlet'])}" if entry["outlet"] else ""
        entry["id"] = base
        n = 2
        while entry["id"] in ids:
            entry["id"] = f"{base}-{n}"
            n += 1
        if any(e["url"] == entry["url"] and not e.get("corrects") for e in doc["entries"]):
            print(f"Already logged: {entry['url']}", file=sys.stderr)
            return 1
    if entry["id"] in ids:
        print(f"Already logged: {entry['id']}", file=sys.stderr)
        return 1
    errs = errors_for(entry, today)
    if errs:
        print("Not logged:\n  " + "\n  ".join(errs), file=sys.stderr)
        return 1
    doc["entries"].append(entry)
    write(path, doc, today)
    print(f"Logged {entry['id']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
