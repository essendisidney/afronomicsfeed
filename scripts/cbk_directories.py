"""
CBK's directories of licensed commercial banks (with mortgage finance institutions and non-operating holding
companies) and of licensed microfinance banks, read into data/registry/cbk_directories.json: one row per
institution per directory edition, with its date licensed, CBK peer group (banks) and number of branches.

    python scripts/cbk_directories.py                     # find the newest editions through CBK's site search
    python scripts/cbk_directories.py --file x.pdf --kind bank --edition 2026-07 --url https://...
    python scripts/cbk_directories.py --inspect

The directories' addresses change with each upload, so the newest edition is found through the site's own media
search (wp-json), never guessed. An edition whose entries are not numbered 1..N in each section writes nothing.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from registry_common import UA, append_rows, fetch_pdf, open_pdf  # noqa: E402

OUT = "cbk_directories.json"
SEARCH = "https://www.centralbank.go.ke/wp-json/wp/v2/media?search={q}&_fields=source_url,date&per_page=20"
QUERIES = {"bank": "Directory-of-Licenced-Commercial-Banks", "mfb": "Directory-of-Licenced-Microfinance-Banks"}
SECTIONS = {"A": "bank", "B": "mortgage", "C": "holding"}
ENTRY = re.compile(r"^(\d{1,2})\.\s+(.+)$")
FIELD = re.compile(r"^(Date Licen[cs]ed|Peer Group|Branches|Website)\s*:\s*(.*)$", re.I)


def licensed_on(text: str) -> str | None:
    """'8th January 1985' -> 1985-01-08; '02.06.2015' -> 2015-06-02; '1916' -> 1916; anything else -> None."""
    from datetime import datetime

    t = re.sub(r"(\d+)(st|nd|rd|th)\b", r"\1", text.strip().rstrip("."))
    for fmt, out in (("%d %B %Y", "%Y-%m-%d"), ("%d.%m.%Y", "%Y-%m-%d"), ("%d/%m/%Y", "%Y-%m-%d"), ("%Y", "%Y")):
        try:
            return datetime.strptime(t, fmt).strftime(out)
        except ValueError:
            continue
    return None


def parse(pdf, kind: str) -> list[dict]:
    rows: list[dict] = []
    section = "mfb" if kind == "mfb" else "bank"
    text = "\n".join(p.extract_text() or "" for p in pdf.pages)
    for line in text.splitlines():
        line = line.strip()
        s = re.match(r"^([A-C])\s*:\s*(.+)$", line)
        if s and kind == "bank":
            section = SECTIONS.get(s.group(1), section)
            continue
        m = ENTRY.match(line)
        if m and not re.match(r"^\d", m.group(2)):
            # Numbering restarts at 1 in each section (banks, mortgage finance, holding companies): the order is fixed.
            if kind == "bank" and int(m.group(1)) == 1 and rows:
                order = list(SECTIONS.values())
                section = order[min(order.index(section) + 1, len(order) - 1)]
            rows.append({"section": section, "number": int(m.group(1)), "name": m.group(2).strip()})
            continue
        f = FIELD.match(line)
        if f and rows:
            key = f.group(1).lower()
            value = f.group(2).strip()
            if key.startswith("date"):
                rows[-1]["licensed_on"] = licensed_on(value)
            elif key == "peer group":
                rows[-1]["peer_group"] = value.lower() or None
            elif key == "branches":
                rows[-1]["branches"] = int(value) if value.isdigit() else None
            elif key == "website" and value:
                rows[-1]["website"] = value
    return rows


def check(rows: list[dict]) -> list[str]:
    problems = []
    for section in {r["section"] for r in rows}:
        nums = [r["number"] for r in rows if r["section"] == section]
        if nums != list(range(1, len(nums) + 1)):
            problems.append(f"section {section}: entries are not numbered 1..{len(nums)}")
    if not rows:
        problems.append("no entries read")
    return problems


def find_latest(kind: str) -> tuple[str, str]:
    import requests

    items = requests.get(SEARCH.format(q=QUERIES[kind]), headers=UA, timeout=(15, 60), verify=False).json()
    pdfs = [i for i in items if str(i.get("source_url", "")).lower().endswith(".pdf")]
    if not pdfs:
        raise SystemExit(f"no {kind} directory found through the CBK media search")
    newest = max(pdfs, key=lambda i: i["date"])
    return newest["source_url"], newest["date"][:7]


def run(kind: str, data: bytes | Path, edition: str, url: str, inspect: bool) -> int:
    with open_pdf(data) as pdf:
        parsed = parse(pdf, kind)
    problems = check(parsed)
    print(f"CBK {kind} directory {edition}: {len(parsed)} entries")
    if problems:
        print("refused:", "; ".join(problems))
        return 1
    rows = [{"kind": kind, "edition": edition, "as_of": f"{edition}-01", "source": url, **r} for r in parsed]
    if inspect:
        for r in rows[:3]:
            print(" ", r)
        return 0
    added = append_rows(OUT, rows, ("kind", "edition", "section", "number"), {"source": "CBK, directories of licensed institutions"})
    print(f"added {added} rows")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file")
    ap.add_argument("--kind", choices=sorted(QUERIES))
    ap.add_argument("--edition", help="YYYY-MM")
    ap.add_argument("--url")
    ap.add_argument("--inspect", action="store_true")
    a = ap.parse_args()
    if a.file:
        return run(a.kind, Path(a.file), a.edition, a.url or "https://www.centralbank.go.ke/", a.inspect)
    status = 0
    for kind in QUERIES:
        url, edition = find_latest(kind)
        status |= run(kind, fetch_pdf(url), edition, url, a.inspect)
    return status


if __name__ == "__main__":
    sys.exit(main())
