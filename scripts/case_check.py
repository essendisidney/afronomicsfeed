"""
Check the casebook before anything is published (rebuild brief, section 5; docs/rebuild/phase-2-plan.md).

    python scripts/case_check.py                 # every case in content/cases/
    python scripts/case_check.py path/to/case.md # one file

Fails (exit 1, with every problem listed) when a case:
  - has an ID not of the form AF-<country>-<year>-<nn>, a duplicate ID, or an ID that does not match its file name;
  - is missing a required field;
  - gives a figure (conditions_before, signals_visible_before, who_lost with an amount) without a source link or an
    as-of date, or a timeline event or response without a date or a source;
  - uses a label other than Facts or Analysis;
  - is marked published without the founder's sign-off, or with open TODO(source) notes or empty sections.

The same rules are enforced by lib/cases.ts when the site is built, so a refused case cannot reach a page.
"""

from __future__ import annotations

import re
import sys
from datetime import date, datetime
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CASES = ROOT / "content" / "cases"

ID = re.compile(r"^AF-[A-Z]{2}-\d{4}-\d{2}$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
URL = re.compile(r"^https?://\S+$")
LABELS = {"Facts", "Analysis"}
LISTS = ("conditions_before", "signals_visible_before", "who_lost", "timeline", "response", "lessons", "sources")


def as_text(v) -> str:
    if isinstance(v, (date, datetime)):
        return v.isoformat()[:10]
    return v.strip() if isinstance(v, str) else ""


def frontmatter(text: str) -> dict:
    m = re.match(r"^---\n(.*?)\n---\n?", text, re.S)
    if not m:
        raise ValueError("no frontmatter")
    data = yaml.safe_load(m.group(1))
    if not isinstance(data, dict):
        raise ValueError("frontmatter is not a mapping")
    return data


def problems(data: dict, name: str) -> list[str]:
    out: list[str] = []

    def at(where: str, what: str):
        out.append(f"{name}: {where}: {what}")

    def need_date(v, where: str):
        if not DATE.match(as_text(v)):
            at(where, "needs a YYYY-MM-DD date")

    def need_source(v, where: str):
        s = v if isinstance(v, dict) else {}
        if not as_text(s.get("name")):
            at(where, "source needs a name")
        if not URL.match(as_text(s.get("url"))):
            at(where, "source needs an http(s) link")

    cid = as_text(data.get("id"))
    if not ID.match(cid):
        at("id", "must look like AF-KE-2016-01")
    elif Path(name).stem != cid:
        at("id", "must match the file name")
    for key in ("title", "country", "sector", "summary"):
        if not as_text(data.get(key)):
            at(key, "missing")
    if data.get("status") not in ("draft", "published"):
        at("status", "must be draft or published")
    need_date(data.get("start"), "start")
    if data.get("end") is not None:
        need_date(data.get("end"), "end")
    if not isinstance(data.get("institutions"), list):
        at("institutions", "must be a list")

    lists = {}
    for key in LISTS:
        v = data.get(key)
        if not isinstance(v, list):
            at(key, "missing (use [] with a TODO(source) note when nothing is sourced yet)")
            v = []
        lists[key] = v

    for key in ("conditions_before", "signals_visible_before"):
        for i, f in enumerate(lists[key]):
            f = f if isinstance(f, dict) else {}
            if not as_text(f.get("metric")) or not as_text(str(f.get("value") or "")):
                at(f"{key}[{i}]", "needs metric and value")
            need_date(f.get("as_of"), f"{key}[{i}].as_of")
            need_source(f.get("source"), f"{key}[{i}]")
    for i, l in enumerate(lists["who_lost"]):
        l = l if isinstance(l, dict) else {}
        if not as_text(l.get("group")):
            at(f"who_lost[{i}]", "needs a group")
        if l.get("amount") is not None:
            need_date(l.get("as_of"), f"who_lost[{i}].as_of")
        need_source(l.get("source"), f"who_lost[{i}]")
    for i, e in enumerate(lists["timeline"]):
        e = e if isinstance(e, dict) else {}
        need_date(e.get("date"), f"timeline[{i}].date")
        if not as_text(e.get("title")):
            at(f"timeline[{i}]", "needs a title")
        need_source(e.get("source"), f"timeline[{i}]")
    for i, r in enumerate(lists["response"]):
        r = r if isinstance(r, dict) else {}
        need_date(r.get("date"), f"response[{i}].date")
        if not as_text(r.get("text")):
            at(f"response[{i}]", "needs text")
        need_source(r.get("source"), f"response[{i}]")
    trigger = data.get("trigger")
    if not isinstance(trigger, dict) or not as_text(trigger.get("text")):
        at("trigger", "needs text")
    else:
        need_date(trigger.get("date"), "trigger.date")
        need_source(trigger.get("source"), "trigger")
    for i, l in enumerate(lists["lessons"]):
        if not as_text(l):
            at(f"lessons[{i}]", "must be text")

    labels = data.get("labels")
    if not isinstance(labels, list) or not labels:
        at("labels", "missing")
    else:
        for label in labels:
            if label not in LABELS:
                at("labels", f"{label} is not Facts or Analysis")

    if not lists["sources"]:
        at("sources", "at least one source")
    for i, s in enumerate(lists["sources"]):
        s = s if isinstance(s, dict) else {}
        if not as_text(s.get("name")) or not URL.match(as_text(s.get("url"))):
            at(f"sources[{i}]", "needs a name and an http(s) link")
        need_date(s.get("date"), f"sources[{i}].date")

    todo = data.get("todo") or []
    if not isinstance(todo, list):
        at("todo", "must be a list")
        todo = []

    if data.get("status") == "published":
        signed = data.get("signed_off")
        if not isinstance(signed, dict) or not as_text(signed.get("by")):
            at("signed_off", "a published case needs the founder's sign-off (by and date)")
        else:
            need_date(signed.get("date"), "signed_off.date")
        if todo:
            at("todo", "a published case cannot have open TODOs")
        for key in ("conditions_before", "timeline", "who_lost", "signals_visible_before", "response", "lessons"):
            if not lists[key]:
                at(key, "a published case needs at least one entry")
    return out


def check(paths: list[Path]) -> list[str]:
    out: list[str] = []
    seen: dict[str, str] = {}
    for p in paths:
        try:
            data = frontmatter(p.read_text())
        except (ValueError, yaml.YAMLError) as e:
            out.append(f"{p.name}: {e}")
            continue
        out += problems(data, p.name)
        cid = as_text(data.get("id"))
        if cid in seen:
            out.append(f"{p.name}: id: duplicate of {seen[cid]}")
        seen[cid] = p.name
    return out


def main(argv: list[str]) -> int:
    paths = [Path(a) for a in argv] if argv else sorted(CASES.glob("*.md"))
    found = check(paths)
    for line in found:
        print(line)
    print(f"{len(paths)} case(s) checked, {len(found)} problem(s).")
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
