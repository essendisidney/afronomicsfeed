"""
Kenya's licensed digital credit providers (loan apps), from the Central Bank of Kenya's monthly "Directory of
Digital Credit Providers" PDF.

Finds the newest directory through the CBK site's media search, reads every entry (name, contacts, physical
address, date licensed) and writes data/kenya/dcp_directory.json. Keeps a record of lenders that drop off the
list between directories, so the page can say a company is no longer licensed. Writes nothing if the directory
cannot be read or looks wrong (fewer than 100 entries).

    python scripts/kenya_dcp.py
"""

from __future__ import annotations

import io
import json
import re
import sys
import warnings
from datetime import datetime, timezone

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "kenya" / "dcp_directory.json"
SEARCH = "https://www.centralbank.go.ke/wp-json/wp/v2/media?search=digital%20credit&_fields=source_url,date&per_page=20"
PAGE = "https://www.centralbank.go.ke/"
MONTHS = {m: i for i, m in enumerate(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"], 1)}


def newest_directory() -> tuple[str, str] | None:
    items = requests.get(SEARCH, headers=UA, timeout=(15, 60), verify=False).json()
    pdfs = [i for i in items if re.search(r"Directory-of-Digital-Credit-Providers.*\.pdf$", i.get("source_url", ""), re.I)]
    if not pdfs:
        return None
    best = max(pdfs, key=lambda i: i["date"])
    return best["source_url"], best["date"][:10]


def fix_name(name: str) -> str:
    # The PDF's text layer splits some names after their first letter ("W akanda Credit Limited").
    name = re.sub(r"^([A-Z]) (?=[a-z])", r"\1", name.strip())
    return re.sub(r"\s+", " ", name)


def parse_date(s: str) -> str | None:
    m = re.search(r"([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})", s)
    if not m or m.group(1).lower() not in MONTHS:
        return None
    return f"{m.group(3)}-{MONTHS[m.group(1).lower()]:02d}-{int(m.group(2)):02d}"


def parse(text: str) -> tuple[str | None, list[dict]]:
    updated = None
    m = re.search(r"UPDATED ON ([A-Z]+ \d{1,2}, \d{4})", text, re.I)
    if m:
        updated = parse_date(m.group(1).title())
    lines = [l.strip() for l in text.splitlines()]
    entries, cur, field = [], None, None
    for line in lines:
        if not line or line.startswith(("CENTRAL BANK OF KENYA", "DIRECTORY OF DIGITAL", "UPDATED ON", "C2: CBK")) or re.fullmatch(r"\d{1,3}", line):
            continue
        head = re.match(r"^(\d{1,3})\.\s+(.+)$", line)
        if head and not re.match(r"^(Postal|Telephone|Email|Physical|Date)", head.group(2)):
            if cur:
                entries.append(cur)
            cur = {"no": int(head.group(1)), "name": fix_name(head.group(2)), "postal": "", "phone": "", "email": "", "address": "", "licensed": None}
            field = None
            continue
        if not cur:
            continue
        kv = re.match(r"^(Postal Address|Telephone|Tel|Email|E-mail|Physical Address|Date Licensed)\s*:\s*(.*)$", line, re.I)
        if kv:
            key = kv.group(1).lower()
            val = kv.group(2).strip()
            field = {"postal address": "postal", "telephone": "phone", "tel": "phone", "email": "email", "e-mail": "email", "physical address": "address", "date licensed": "licensed"}[key]
            cur[field] = parse_date(val) if field == "licensed" else val
        elif field in ("address", "postal") and cur[field]:
            cur[field] += " " + line  # an address that runs onto a second line
    if cur:
        entries.append(cur)
    return updated, entries


def main() -> int:
    found = newest_directory()
    if not found:
        print("no directory found")
        return 1
    url, posted = found
    r = requests.get(url, headers=UA, timeout=(15, 120), verify=False)
    if r.content[:4] != b"%PDF":
        print(f"{url}: not a PDF")
        return 1
    import pdfplumber

    with pdfplumber.open(io.BytesIO(r.content)) as pdf:
        text = "\n".join(p.extract_text() or "" for p in pdf.pages)
    updated, entries = parse(text)
    if len(entries) < 100:
        print(f"only {len(entries)} entries read from {url}; nothing written")
        return 1
    numbers = [e["no"] for e in entries]
    if numbers != list(range(1, len(numbers) + 1)):
        print(f"entries are not numbered 1..{len(numbers)} (missing {sorted(set(range(1, max(numbers) + 1)) - set(numbers))[:10]}); nothing written")
        return 1

    current = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    if current.get("source") == url:
        print(f"{len(entries)} lenders; directory unchanged ({url})")
        return 0
    names = {e["name"] for e in entries}
    removed = list(current.get("removed", []))
    for e in current.get("lenders", []):
        if e["name"] not in names:
            removed.append({"name": e["name"], "last_listed": current.get("updated"), "dropped_by": updated})
    removed = [x for x in removed if x["name"] not in names]  # relicensed: no longer "removed"
    added = sorted(names - {e["name"] for e in current.get("lenders", [])}) if current.get("lenders") else []
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "Kenya's licensed digital credit providers",
        "publisher": "Central Bank of Kenya, Directory of Digital Credit Providers",
        "source": url,
        "source_posted": posted,
        "updated": updated,
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "note": "The CBK licenses companies, not apps: a loan app is licensed only if the company behind it is on this list.",
        "lenders": entries,
        "added_last": added,
        "removed": removed,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {len(entries)} lenders (updated {updated}); {len(added)} new, {len(removed)} dropped off since first read")
    return 0


if __name__ == "__main__":
    sys.exit(main())
