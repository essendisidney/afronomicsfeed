"""The agent desks (docs/desks/, UPGRADE U7; docs/rebuild/upgrade-U7-plan.md): every mandate has its sections and the
standing rules, every run-log line parses, and the named-verdict count (D-028) matches the Receipts in content/."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DESKS = ROOT / "docs" / "desks"
SECTIONS = [
    "## Purpose",
    "## Schedule",
    "## Inputs",
    "## Allowed actions",
    "## Forbidden actions",
    "## Standing rules",
    "## Quiet reply",
    "## Escalation to the founder",
    "## Taking over this desk",
    "## Run log",
]
# One phrase from each standing rule (docs/desks/README.md).
RULES = [
    "database schema without the founder's yes",
    "Never delete data",
    "company_id `110352967`",
    "No outgoing email unless the founder says so",
    "Never cold-email",
    "Never print an email address",
    "Never investment advice",
    "Every figure sourced",
    '"Information, not advice."',
    "quiet line",
    "Never create, edit, enable or disable a scheduled routine",
    "never the founder's approval",
    "named-institutions.md",
]
LINE = re.compile(r"^-\s*\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?\s*·\s*(done|quiet|held|escalated|failed)\s*·\s*\S.*$")
# The desk list in lib/desk/desks.ts.
SLUGS = re.findall(r'slug: "([a-z-]+)"', (ROOT / "lib" / "desk" / "desks.ts").read_text(encoding="utf-8"))


def mandates():
    return sorted(p for p in DESKS.glob("*.md") if p.name != "README.md")


def test_every_desk_in_the_code_has_a_mandate_and_the_index_lists_it():
    assert SLUGS, "no desks found in lib/desk/desks.ts"
    index = (DESKS / "README.md").read_text(encoding="utf-8")
    assert sorted(SLUGS) == [p.stem for p in mandates()]
    for slug in SLUGS:
        assert f"({slug}.md)" in index, f"{slug} missing from docs/desks/README.md"


def test_every_mandate_has_its_sections_and_the_standing_rules():
    for p in mandates():
        text = p.read_text(encoding="utf-8")
        missing = [s for s in SECTIONS if s not in text] + [r for r in RULES if r not in text]
        assert not missing, f"{p.name}: missing {missing}"


def test_quiet_lines_match_the_code():
    code = (ROOT / "lib" / "desk" / "desks.ts").read_text(encoding="utf-8")
    for slug, quiet in re.findall(r'slug: "([a-z-]+)".*?quiet: (?:"([^"]+)"|null)', code):
        if quiet:
            assert f"**\"{quiet}\"**" in (DESKS / f"{slug}.md").read_text(encoding="utf-8"), slug


def test_every_run_log_line_parses():
    bad = []
    for f in (DESKS / "logs").glob("*/*.md"):
        assert re.fullmatch(r"\d{4}-\d{2}\.md", f.name), f"{f}: log files are named <YYYY-MM>.md"
        assert f.parent.name in SLUGS, f"{f}: no desk called {f.parent.name}"
        for n, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if line.startswith("-") and not LINE.match(line):
                bad.append(f"{f.relative_to(ROOT)}:{n}")
    assert not bad, "Run-log lines that do not parse: " + ", ".join(bad)


def frontmatter_status(slug: str) -> str | None:
    f = ROOT / "content" / "receipts" / f"{slug}.md"
    if not f.exists():
        return None
    m = re.search(r"^status:\s*(\w+)", f.read_text(encoding="utf-8"), re.M)
    return m.group(1) if m else None


def test_named_verdicts_match_the_receipts():
    data = json.loads((ROOT / "data" / "desk" / "named-verdicts.json").read_text(encoding="utf-8"))
    assert data["target"] == 30
    slugs = [v["slug"] for v in data["verdicts"]]
    assert len(slugs) == len(set(slugs))
    for v in data["verdicts"]:
        assert frontmatter_status(v["slug"]) == "published", f"{v['slug']} is counted but not a published Receipt"
        assert v["names"] and re.fullmatch(r"D-\d{3}", v["approved"]), v["slug"]
    for h in data["held"]:
        assert frontmatter_status(h["slug"]) == "draft", f"{h['slug']} is listed as held but is not a draft"
    for r in data["replies"]:
        assert r["receipt"] in slugs or frontmatter_status(r["receipt"]) is not None, r
        assert "@" not in json.dumps(r), "no email addresses in the right-of-reply log"


def test_the_count_starts_at_five_of_thirty():
    # D-028: "The count starts at 5"; it only grows (append only).
    data = json.loads((ROOT / "data" / "desk" / "named-verdicts.json").read_text(encoding="utf-8"))
    assert len(data["verdicts"]) >= 5
