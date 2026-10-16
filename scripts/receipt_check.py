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
ADVICE = re.compile(r"\b(you should|we recommend|our advice is to)\s+(buy|sell|hold|subscribe|switch|apply)\b", re.I)


ANNOTATION_MAX = 3
ANNOTATION_LABEL_MAX = 48


def annotation_problems(notes, labels: list[str], where: str) -> list[str]:
    """
    Notes on a chart (lib/charts/render.ts): {x, label} marks one bar; {from, to, label} shades the span between two
    bars, left to right. Each must name bars the chart has, and the label must be short enough to stay legible on a
    phone. A note states only what the Receipt's own text or sources already say (RECEIPTS.md): this checks the
    shape, the desk checks the fact.
    """
    if notes is None:
        return []
    if not isinstance(notes, list):
        return [f"{where}: a list of notes"]
    out: list[str] = []
    if len(notes) > ANNOTATION_MAX:
        out.append(f"{where}: at most {ANNOTATION_MAX} notes on one chart")
    for k, a in enumerate(notes):
        at = f"{where}[{k}]"
        if not isinstance(a, dict):
            out.append(f"{at}: needs {{x, label}} or {{from, to, label}}")
            continue
        label = a.get("label")
        if not isinstance(label, str) or not label.strip():
            out.append(f"{at}: needs a label")
        elif len(label) > ANNOTATION_LABEL_MAX:
            out.append(f"{at}: label over {ANNOTATION_LABEL_MAX} characters, too long to read on a phone")
        unknown = set(a) - {"x", "from", "to", "label"}
        if unknown:
            out.append(f"{at}: unknown field(s) {', '.join(sorted(unknown))}")
        if "x" in a and ("from" in a or "to" in a):
            out.append(f"{at}: either x, or from and to, not both")
        elif "x" in a:
            if str(a["x"]) not in labels:
                out.append(f"{at}.x: '{a['x']}' is not one of the chart's labels")
        elif "from" in a and "to" in a:
            f, t = str(a["from"]), str(a["to"])
            if f not in labels:
                out.append(f"{at}.from: '{f}' is not one of the chart's labels")
            if t not in labels:
                out.append(f"{at}.to: '{t}' is not one of the chart's labels")
            if f in labels and t in labels and labels.index(f) >= labels.index(t):
                out.append(f"{at}: from must come before to")
        else:
            out.append(f"{at}: needs x, or from and to")
    return out


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
        labels_in_chart = [str(p.get("label")) for p in points if isinstance(p, dict)]
        for h in c.get("highlight") or []:
            if str(h) not in labels_in_chart:
                at(f"charts[{i}].highlight", f"'{h}' is not one of the chart's labels")
        out += [f"{file}: {p}" for p in annotation_problems(c.get("annotations"), labels_in_chart, f"charts[{i}].annotations")]

    if SPLIT not in body:
        at("body", f"needs the {SPLIT} marker between the free piece and the full file")
    free = body.split(SPLIT)[0]
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
