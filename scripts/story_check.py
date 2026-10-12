"""
Fact check a drafted story against the lead it was written from, before anyone is asked to approve it.

    python scripts/story_check.py content/briefs/<slug>.md <lead id>

Fails (exit 1, with every problem listed) if the draft:
  - prints a number that is not one of the lead's figures (data/story_leads.json), or a plain count, year or date;
  - tells the reader to buy, sell or invest, or promises a return;
  - leaves out "Information, not advice", the lead's tool link, or a source;
  - runs past 600 words, or is not a brief.

Every figure a story may print is worked out by scripts/story_finder.py from the publishers' own data, so a number
that is not there is either a typo or an invention, and neither is published.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEADS = ROOT / "data" / "story_leads.json"

NUMBER = re.compile(r"(?<![\w/.-])\$?\d[\d,]*(?:\.\d+)?%?")
ADVICE = re.compile(
    r"\b(you should|we recommend|consider) (buy|sell|invest|switch|move)\w*|\b(buy|sell) now\b|\bguarantee\w*\b|\brisk[- ]free\b|\bsure bet\b|\bcan(?:not|'t) lose\b",
    re.I,
)
MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"
DATE = re.compile(rf"\b\d{{1,2}} (?:{MONTHS})(?: \d{{4}})?\b|\b(?:{MONTHS}) \d{{4}}\b|\b\d{{4}}-\d{{2}}-\d{{2}}\b|\b\d{{4}}_\dQ\b")


def norm(n: str) -> str:
    return n.replace(",", "").lstrip("$").rstrip("%")


def allowed_numbers(lead: dict) -> set[str]:
    ok = set()
    for f in lead["facts"]:
        for text in (f["display"], f["label"]):
            ok |= {norm(n) for n in NUMBER.findall(text)}
    for text in [lead["angle"], *lead.get("notes", [])]:
        ok |= {norm(n) for n in NUMBER.findall(text)}
    return ok


def split(md: str) -> tuple[str, str]:
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", md, re.S)
    if not m:
        raise SystemExit("no frontmatter")
    return m.group(1), m.group(2)


def check(path: Path, lead: dict) -> list[str]:
    md = path.read_text(encoding="utf-8")
    front, body = split(md)
    problems = []
    if not re.search(r"^category: brief$", front, re.M):
        problems.append("category must be brief")
    if "sources:" not in front or "url:" not in front:
        problems.append("no sources with links in the frontmatter")
    if "Information, not advice" not in body:
        problems.append('the body must end with "Information, not advice"')
    if lead["tool"]["href"] not in body:
        problems.append(f"the body must link to {lead['tool']['href']}")
    words = len(re.findall(r"\w+", body))
    if words > 600:
        problems.append(f"{words} words; keep it under 600")
    readable = re.sub(r"\]\([^)]*\)", "]", body)  # link targets are not printed figures
    readable = re.sub(r'^\s*(?:url|date|asOf|minutes):.*$', "", front, flags=re.M) + "\n" + readable
    for m in ADVICE.finditer(readable):
        problems.append(f"advice or a promise: “{m.group(0)}”")
    ok = allowed_numbers(lead)
    text = DATE.sub(" ", readable)
    for raw in NUMBER.findall(text):
        n = norm(raw)
        if n in ok:
            continue
        if re.fullmatch(r"\d{1,2}", n) and not raw.endswith("%") and not raw.startswith("$"):
            continue  # a small count ("three funds", "12 transfers") or a list number
        if re.fullmatch(r"20\d\d", n):
            continue  # a year
        problems.append(f"number not in the lead's figures: {raw}")
    return problems


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 2
    path, lead_id = Path(sys.argv[1]), sys.argv[2]
    leads = json.loads(LEADS.read_text(encoding="utf-8"))["leads"]
    lead = next((l for l in leads if l["id"] == lead_id), None)
    if not lead:
        print(f"no lead {lead_id!r} in {LEADS.name}; run scripts/story_finder.py first")
        return 1
    problems = check(path, lead)
    for p in problems:
        print(f"  ✗ {p}")
    print("story check: " + ("passed" if not problems else f"{len(problems)} problem(s)"))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
