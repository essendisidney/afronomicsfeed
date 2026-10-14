"""
SASRA's yearly list of licensed and authorised SACCO societies (the Gazette notice under section 28 of the Sacco
Societies Act), read into data/registry/sasra_licences.json: one row per SACCO per schedule per year.

    python scripts/sasra_list.py                 # find the newest list on sasra.go.ke and add it
    python scripts/sasra_list.py --file x.pdf --year 2026 --url https://...   # read a saved copy
    python scripts/sasra_list.py --inspect       # print what would be added, write nothing

The list is laid out as two copies of a table side by side on each page, so each page is read in two halves. A
schedule's rows must number exactly what the notice says ("the 176 Sacco Societies listed in SCHEDULE I"); a list
that does not add up writes nothing.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from registry_common import UA, append_rows, sasra_file_link, county_at_end, fetch_pdf, open_pdf  # noqa: E402

OUT = "sasra_licences.json"
INDEX = "https://www.sasra.go.ke/licensed-dt-saccos/"

SCHEDULES = {
    "I": ("dt", "licensed"),
    "II": ("nwdt", "authorised"),
    "III": ("dt", "restricted"),
    "IV": ("any", "revoked"),
    "V": ("any", "expired"),
}
ROW = re.compile(r"^(\d{1,3})\.?\s+(.+)$")
POSTAL = re.compile(r"\bP\.?\s?O\.?\s?Box|\bPrivate Bag\b", re.I)
ENDS_LTD = re.compile(r"^(.*?\b(?:Ltd\.?|Limited))(?=\s|$)", re.I)
# "… Regulated Non-WDT-Sacco": SASRA's tag on non-deposit-taking SACCOs, sometimes printed without spaces
# ("MajaneesRegulated Non-WDTSacco").
NWDT_TAG = re.compile(r"\s*Regulated(?:\s*Non.*)?\s*$", re.I)


def halves(pdf):
    """Each page's left half, then its right half: the reading order of the list."""
    for page in pdf.pages:
        w, h = page.width, page.height
        for box in ((0, 0, w / 2, h), (w / 2, 0, w, h)):
            yield page.crop(box).extract_text() or ""


def parse(pdf) -> tuple[list[dict], dict[str, int], str | None]:
    """Rows, the counts the notice states for each schedule, and the date the notice is signed."""
    # Read in halves: the full page interleaves the notice's two columns.
    full = "\n".join(halves(pdf))
    stated: dict[str, int] = {}
    prose = re.sub(r"(\w)- (\w)", r"\1\2", re.sub(r"\s+", " ", full))
    for num, sched in re.findall(r"the (?:[A-Z]+ )?\(?(\d+)\)? Sacco Societ\w*\s+(?:\S+\s+){0,6}?listed in SCHEDULE ([IV]+)", prose):
        stated[sched] = int(num)
    signed = None
    m = re.search(r"Dated at Nairobi this (\d+)\w* day of (\w+) (\d{4})", full)
    if m:
        from datetime import datetime

        signed = datetime.strptime(f"{m.group(1)} {m.group(2)} {m.group(3)}", "%d %B %Y").strftime("%Y-%m-%d")

    rows: list[dict] = []
    schedule = None
    for text in halves(pdf):
        for line in text.splitlines():
            line = line.strip()
            s = re.search(r"SCHEDULE ([IV]+)\s*:", line)
            if s:
                schedule = s.group(1)
                continue
            if schedule is None:
                continue
            m = ROW.match(line)
            name = None
            if m:
                rest = m.group(2)
                cut = POSTAL.search(rest)
                head = rest[: cut.start()] if cut else rest
                ltd = ENDS_LTD.match(head)
                if ltd:
                    name = ltd.group(1)
                elif cut:
                    name = head.strip(" ,")
                elif re.search(r"\bSacco\b", rest, re.I):
                    name = rest.strip()
            if m and name:
                rows.append({"schedule": schedule, "number": int(m.group(1)), "name": name, "county": county_at_end(line), "line": line})
                continue
            # A wrapped name: "Trans – National Times Sacco Soci-" / "ety Ltd", or a trailing "Ltd." on its own.
            if rows and rows[-1]["schedule"] == schedule:
                last = rows[-1]
                if last["name"].endswith("-") and line:
                    # The rest of a broken word, up to "Ltd" when the line also carries the end of the address
                    # ("Sacco Soci-" / "ety Ltd weini Mukurweini Town").
                    ltd = ENDS_LTD.match(line)
                    tail = ltd.group(1) if ltd else line.split(" P.O")[0].split(" ")[0]
                    last["name"] = last["name"][:-1] + tail.strip()
                elif re.fullmatch(r"(Ltd\.?|Limited)", line.split(" ")[0]) and not last["name"].lower().endswith(("ltd", "ltd.", "limited")):
                    last["name"] = f"{last['name']} {line.split(' ')[0]}"
                if not last["county"]:
                    # A county split over two lines ("Elgeyo –" / "Marakwet"): try the two lines joined.
                    last["county"] = county_at_end(line) or county_at_end(f"{last['line']} {line}")
                    last["line"] = f"{last['line']} {line}"
    for r in rows:
        r["nwdt"] = bool(re.search(r"Non-?\s?WDT|Regulated Non-", r["name"], re.I))
        r["name"] = re.sub(r"\s+", " ", NWDT_TAG.sub("", r["name"])).strip(" ,-")
    # The same SACCO can be printed twice when a table straddles the halves; keep the first of each number.
    seen, unique = set(), []
    for r in rows:
        k = (r["schedule"], r["number"])
        if k not in seen:
            seen.add(k)
            unique.append(r)
    return unique, stated, signed


def check(rows: list[dict], stated: dict[str, int]) -> list[str]:
    problems = []
    for sched, n in stated.items():
        got = sum(1 for r in rows if r["schedule"] == sched)
        if got != n:
            problems.append(f"schedule {sched}: notice says {n}, read {got}")
    if not rows:
        problems.append("no rows read")
    return problems


def to_rows(parsed: list[dict], year: int, url: str, signed: str | None) -> list[dict]:
    out = []
    for r in parsed:
        kind, status = SCHEDULES.get(r["schedule"], ("any", "listed"))
        if kind != "nwdt" and r.get("nwdt"):
            kind = "nwdt"
        out.append(
            {
                "year": year,
                "schedule": r["schedule"],
                "number": r["number"],
                "name": r["name"],
                "type": kind,
                "status": status,
                "county": r["county"],
                "as_of": signed or f"{year}-01-01",
                "source": url,
            }
        )
    return out


def find_latest() -> tuple[str, int]:
    """The newest list's file link and year, from SASRA's list page and its download page."""
    import requests

    html = requests.get(INDEX, headers=UA, timeout=(15, 60), verify=False).text
    pages = re.findall(r'href="(https://www\.sasra\.go\.ke/download/list-of-licensed[^"]+?(\d{4})[^"]*)"', html)
    if not pages:
        raise SystemExit("no list found on the SASRA page")
    page, year = max(pages, key=lambda p: int(p[1]))
    dl = requests.get(page, headers=UA, timeout=(15, 60), verify=False).text
    link = sasra_file_link(dl)
    if not link:
        raise SystemExit(f"no file link on {page}")
    return link, int(year)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file")
    ap.add_argument("--year", type=int)
    ap.add_argument("--url")
    ap.add_argument("--inspect", action="store_true")
    a = ap.parse_args()
    if a.file:
        data, year, url = Path(a.file).read_bytes(), a.year, a.url or "https://www.sasra.go.ke/licensed-dt-saccos/"
    else:
        url, year = find_latest()
        data = fetch_pdf(url)
    with open_pdf(data) as pdf:
        parsed, stated, signed = parse(pdf)
    problems = check(parsed, stated)
    print(f"SASRA list {year}: {len(parsed)} rows; notice counts {stated}; signed {signed}")
    if problems:
        print("refused:", "; ".join(problems))
        return 1
    rows = to_rows(parsed, year, url, signed)
    if a.inspect:
        for r in rows[:5] + rows[-5:]:
            print(" ", r)
        missing = [r["name"] for r in rows if not r["county"]]
        print(f"  {len(missing)} without a county: {missing[:10]}")
        return 0
    added = append_rows(OUT, rows, ("year", "schedule", "number"), {"source": "SASRA, list of licensed and authorised SACCO societies"})
    print(f"added {added} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
