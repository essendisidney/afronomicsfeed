"""
Checks every Receipt in content/receipts/ against the house rules (docs/rebuild/RECEIPTS.md), the same rules
lib/receipts.ts applies at build time, so a bad Receipt fails in CI before it reaches a build.

    python scripts/receipt_check.py            # all Receipts; exit 1 on any problem
"""

from __future__ import annotations

import re
import sys
from datetime import date
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from calls_ledger import call_problems  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "content" / "receipts"
SPLIT = "<!-- full-file -->"
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
URL = re.compile(r"^https?://\S+$")
FILE = re.compile(r"^(\d{4}-\d{2}-\d{2})-[a-z0-9-]+\.md$")
LABELS = {"Facts", "Analysis", "Opinion"}
DESKS = {
    "Afronomics Markets Desk",
    "Afronomics Banking Desk",
    "Afronomics Companies Desk",
    "Afronomics Public Money Desk",
    "Afronomics Cost of Living Desk",
    "Afronomics Africa Desk",
}
SECTORS = {"markets", "banking", "companies", "public-money", "cost-of-living", "africa"}
KEY_NUMBERS = 3
ADVICE = re.compile(r"\b(you should|we recommend|our advice is to)\s+(buy|sell|hold|subscribe|switch|apply)\b", re.I)


def split(text: str) -> tuple[dict, str]:
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if not m:
        return {}, text
    return yaml.safe_load(m.group(1)) or {}, m.group(2)


def iso(v) -> str:
    return v.isoformat() if isinstance(v, date) else str(v or "")


def problems(data: dict, body: str, file: str) -> list[str]:
    out: list[str] = []

    def at(where: str, what: str) -> None:
        out.append(f"{file}: {where}: {what}")

    def need_date(v, where: str) -> None:
        if not DATE.match(iso(v)):
            at(where, "needs a YYYY-MM-DD date")

    m = FILE.match(file)
    if not m:
        at("file", "must be named <YYYY-MM-DD>-<slug>.md")
    for key in ("title", "sector", "summary", "desk"):
        if not str(data.get(key) or "").strip():
            at(key, "missing")
    need_date(data.get("date"), "date")
    need_date(data.get("asOf"), "asOf")
    if m and iso(data.get("date")) != m.group(1):
        at("date", "must match the file name")
    if data.get("type") not in ("data", "verdict"):
        at("type", "must be data or verdict")
    if data.get("status") not in ("draft", "checked", "published"):
        at("status", "must be draft, checked or published")
    if data.get("type") == "verdict" and not str(data.get("verdict") or "").strip():
        at("verdict", "a verdict Receipt needs its verdict line")
    if data.get("desk") and data["desk"] not in DESKS:
        at("desk", "must be one of the six desks")
    if data.get("sector") and data["sector"] not in SECTORS:
        at("sector", "unknown sector")

    labels = data.get("labels") or []
    if not labels or any(label not in LABELS for label in labels):
        at("labels", "a list of Facts, Analysis, Opinion")
    sources = data.get("sources") or []
    names = {s.get("name") for s in sources if isinstance(s, dict)}
    if not sources:
        at("sources", "at least one source")
    for i, s in enumerate(sources):
        if not s.get("name"):
            at(f"sources[{i}]", "needs a name")
        if not URL.match(str(s.get("url") or "")):
            at(f"sources[{i}]", "needs an http(s) link")
        need_date(s.get("date"), f"sources[{i}].date")
    for i, c in enumerate(data.get("calls") or []):
        if not c.get("statement") or not c.get("check_source"):
            at(f"calls[{i}]", "needs a statement and the source that will settle it")
        need_date(c.get("check_date"), f"calls[{i}].check_date")
        # Every call must be checkable by construction (docs/rebuild/receipts-r2-plan.md): measure, comparator, threshold.
        out += [f"{file}: {p}" for p in call_problems(c, f"calls[{i}]")]
    for i, t in enumerate(data.get("tiles") or []):
        if not t.get("label") or not t.get("value") or t.get("source") not in names:
            at(f"tiles[{i}]", "needs a label, a value and one of the Receipt's sources")
    charts = data.get("charts") or []
    if len(charts) > 3:
        at("charts", "at most three charts")
    for i, c in enumerate(charts):
        if c.get("type") not in ("bar", "line"):
            at(f"charts[{i}].type", "bar or line")
        if not c.get("title") or not c.get("unit"):
            at(f"charts[{i}]", "needs a title that states the finding, and a unit")
        if c.get("source") not in names:
            at(f"charts[{i}].source", "must be one of the Receipt's sources")
        points = c.get("data") or []
        if len(points) < 2 or any(not isinstance(p.get("value"), (int, float)) for p in points):
            at(f"charts[{i}].data", "at least two {label, value} points")

    if SPLIT not in body:
        at("body", f"needs the {SPLIT} marker between the free piece and the full file")
    free = body.split(SPLIT)[0]
    out += [f"{file}: {p}" for p in reading_problems(data, free, names)]
    if "Information, not advice." not in free:
        at("body", 'the free piece must say "Information, not advice."')
    for used in set(re.findall(r"\((Facts|Analysis|Opinion)\)", free)):
        if used not in labels:
            at("labels", f"the body uses ({used}) but labels does not list it")
    if ADVICE.search(body):
        at("body", "advice language (buy, sell, hold, subscribe, switch instructions)")

    if data.get("status") == "published":
        if not str(data.get("disclosure") or "").strip() or "[" in str(data.get("disclosure")):
            at("disclosure", "must be confirmed before publishing")
        if data.get("verify"):
            at("verify", "every item must be checked (and removed) before publishing")
    return out


def figures(text: str) -> list[str]:
    """The numbers in a line ("KES 33,702", "9.04%", "2026" give 33,702, 9.04 and 2026)."""
    return re.findall(r"\d+(?:[.,]\d+)*", text)


def prints(free: str, fig: str) -> bool:
    """True when the text prints this figure whole: 21 is not found inside 2021 or 21.5, nor KES 20 in KES 20.5."""
    return re.search(rf"(?<![\d.,]){re.escape(fig)}(?![\d]|[.,]\d)", free) is not None


def reading_problems(data: dict, free: str, names: set) -> list[str]:
    """
    The reading boxes at the top of a Receipt (keyNumbers, "The 3 numbers"; forYou, "What it means for you").
    Both are optional. A key number is quoted, never worked out: its value must appear verbatim in the free piece,
    so it carries the same unit and period as the text, and every figure in its label must appear there too. The
    "for you" lines restate the Receipt's own Analysis: no figure the free piece does not print, and no advice.
    """
    out: list[str] = []
    if "keyNumbers" in data:
        nums = data.get("keyNumbers")
        if not isinstance(nums, list) or len(nums) != KEY_NUMBERS:
            out.append(f"keyNumbers: exactly {KEY_NUMBERS} items when present")
            nums = nums if isinstance(nums, list) else []
        for i, k in enumerate(nums):
            if not isinstance(k, dict) or not all(str(k.get(f) or "").strip() for f in ("value", "label", "source")):
                out.append(f"keyNumbers[{i}]: needs a value, a label and a source")
                continue
            value, label = str(k["value"]), str(k["label"])
            if not prints(free, value):
                out.append(f"keyNumbers[{i}]: value {value!r} does not appear verbatim in the Receipt's text")
            if k["source"] not in names:
                out.append(f"keyNumbers[{i}].source: must be one of the Receipt's sources")
            for fig in figures(label):
                if not prints(free, fig):
                    out.append(f"keyNumbers[{i}].label: the figure {fig} does not appear in the Receipt's text")
            if len(label) > 140:
                out.append(f"keyNumbers[{i}].label: at most 140 characters")
    if "forYou" in data:
        lines = data.get("forYou")
        if not isinstance(lines, list) or not 2 <= len(lines) <= 3:
            out.append("forYou: 2 or 3 lines when present")
            lines = lines if isinstance(lines, list) else []
        if lines and "Analysis" not in (data.get("labels") or []):
            out.append("forYou: these lines are Analysis, so labels must list Analysis")
        for i, line in enumerate(lines):
            text = str(line or "").strip()
            if not text:
                out.append(f"forYou[{i}]: empty")
                continue
            if len(text) > 220:
                out.append(f"forYou[{i}]: at most 220 characters")
            if ADVICE.search(text):
                out.append(f"forYou[{i}]: advice language")
            for fig in figures(text):
                if not prints(free, fig):
                    out.append(f"forYou[{i}]: the figure {fig} does not appear in the Receipt's text")
    return out


def check_all(directory: Path = DIR) -> list[str]:
    out: list[str] = []
    for path in sorted(directory.glob("*.md")):
        data, body = split(path.read_text())
        out += problems(data, body, path.name)
    return out


def main() -> int:
    found = check_all()
    for p in found:
        print(p)
    print(f"{len(list(DIR.glob('*.md')))} Receipts checked, {len(found)} problems")
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main())
