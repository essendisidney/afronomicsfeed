"""
The editorial calls ledger (docs/rebuild/receipts-r2-plan.md): every call a published Receipt makes, written once to
data/forecasts/editorial.json and graded against the source it names. The file only grows; the commit that writes a
call is its public time stamp, as for the T-bill ledger (scripts/forecast_ledger.py).

    python scripts/calls_ledger.py            # write the calls of newly published Receipts, then grade what our data settles
    python scripts/calls_ledger.py --check    # validate the ledger and the Receipts' calls; write nothing

Rules:
  - a call is written only once its Receipt is published, and never after its own check date (no credit for hindsight):
    a call already past its date is listed under "not_recorded" with the reason;
  - a call is never edited; a correction is a new call with "corrects" naming the old id;
  - an outcome is a separate row with the published figure, the link to the source actually opened and the quoted words
    or cell; held or missed is worked out by code from the comparator, never typed by hand;
  - "void" (the event cannot happen, e.g. the offer is withdrawn) needs a source too; void calls stay visible and are
    left out of the hit rate.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
LEDGER = ROOT / "data" / "forecasts" / "editorial.json"
RECEIPTS = ROOT / "content" / "receipts"
TBILLS = ROOT / "data" / "kenya" / "tbill_auctions.json"

COMPARATORS = {"<", "<=", ">", ">=", "between", "is"}
URL = re.compile(r"^https?://\S+$")
ABOUT = (
    "Editorial calls from Afronomics Receipts, written when each Receipt is published and graded against the source each "
    "call names. Never edited: a correction is a new call. The outcome is the published figure, with its source and quote."
)


def empty() -> dict:
    return {"about": ABOUT, "calls": [], "outcomes": [], "not_recorded": []}


def load(path: Path = LEDGER) -> dict:
    return json.loads(path.read_text()) if path.exists() else empty()


def save(ledger: dict, path: Path = LEDGER) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(ledger, indent=1, ensure_ascii=False) + "\n")


def iso(v) -> str:
    return v.isoformat() if isinstance(v, date) else str(v or "")


def receipts(directory: Path = RECEIPTS) -> list[tuple[str, dict]]:
    out = []
    for path in sorted(directory.glob("*.md")):
        m = re.match(r"^---\n(.*?)\n---\n?", path.read_text(), re.S)
        out.append((path.stem, (yaml.safe_load(m.group(1)) or {}) if m else {}))
    return out


def call_problems(call: dict, where: str) -> list[str]:
    """What a Receipt's call needs before it can go on the ledger: something measurable, compared one way."""
    out = []
    if not call.get("measure"):
        out.append(f"{where}: needs a measure (what the settling source reports)")
    comp = call.get("comparator")
    if comp not in COMPARATORS:
        out.append(f"{where}: comparator must be one of {sorted(COMPARATORS)}")
    t = call.get("threshold")
    if comp == "between" and not (isinstance(t, list) and len(t) == 2 and all(isinstance(x, (int, float)) for x in t) and t[0] < t[1]):
        out.append(f"{where}: 'between' needs threshold [low, high]")
    elif comp in {"<", "<=", ">", ">="} and not isinstance(t, (int, float)):
        out.append(f"{where}: '{comp}' needs a numeric threshold")
    elif comp == "is" and (t is None or t == ""):
        out.append(f"{where}: 'is' needs the expected value as threshold")
    return out


def held(call: dict, value) -> bool:
    comp, t = call["comparator"], call["threshold"]
    if comp == "is":
        return str(value).strip().lower() == str(t).strip().lower()
    v = float(value)
    if comp == "between":
        return t[0] <= v <= t[1]
    return {"<": v < t, "<=": v <= t, ">": v > t, ">=": v >= t}[comp]


def status(call: dict, outcome: dict | None, today: str) -> str:
    """open, due, held, missed or void: worked out by code, never stored."""
    if outcome:
        if outcome.get("void"):
            return "void"
        return "held" if held(call, outcome["value"]) else "missed"
    return "due" if today > call["check_date"] else "open"


def publish(ledger: dict, today: str, now: str, found: list[tuple[str, dict]]) -> int:
    """Append the calls of published Receipts that are not on the ledger yet. Returns how many were written."""
    have = {c["id"] for c in ledger["calls"]} | {n["id"] for n in ledger["not_recorded"]}
    added = 0
    for slug, data in found:
        if data.get("status") != "published":
            continue
        for i, call in enumerate(data.get("calls") or [], start=1):
            cid = f"RC-{slug}-{i}"
            if cid in have:
                continue
            check_date = iso(call.get("check_date"))
            if check_date < today:
                ledger["not_recorded"].append({"id": cid, "receipt": slug, "statement": call["statement"], "reason": f"published {today}, after the call's date {check_date}"})
                continue
            row = {
                "id": cid,
                "receipt": slug,
                "written_at": now,
                "statement": call["statement"],
                "measure": call["measure"],
                "comparator": call["comparator"],
                "threshold": call["threshold"],
                "unit": call.get("unit"),
                "check_source": call["check_source"],
                "check_date": check_date,
            }
            if call.get("corrects"):
                row["corrects"] = call["corrects"]
            ledger["calls"].append(row)
            added += 1
    return added


TBILL_MEASURE = re.compile(r"^kenya_tbill_rate:(91|182|364)$")


def grade(ledger: dict, now: str, tbills: list[dict] | None = None) -> int:
    """Settle the calls our own data can settle: a Kenya T-bill rate on the first auction on or after the check date."""
    done = {o["call"] for o in ledger["outcomes"]}
    rows = tbills if tbills is not None else (json.loads(TBILLS.read_text()).get("rows", []) if TBILLS.exists() else [])
    added = 0
    for call in ledger["calls"]:
        m = TBILL_MEASURE.match(call["measure"])
        if call["id"] in done or not m:
            continue
        tenor = int(m.group(1))
        after = sorted((r for r in rows if r.get("tenor") == tenor and r.get("value_date", "") >= call["check_date"]), key=lambda r: r["value_date"])
        if not after:
            continue
        r = after[0]
        ledger["outcomes"].append({
            "call": call["id"],
            "value": r["weighted_avg_rate"],
            "source_url": r["source"],
            "quote": f"{tenor}-day weighted average rate of accepted bids {r['weighted_avg_rate']}% for value {r['value_date']}",
            "recorded_at": now,
            "recorded_by": "code",
        })
        added += 1
    return added


def check(ledger: dict, found: list[tuple[str, dict]]) -> list[str]:
    out = []
    ids = [c["id"] for c in ledger["calls"]]
    if len(ids) != len(set(ids)):
        out.append("ledger: duplicate call ids")
    calls = {c["id"]: c for c in ledger["calls"]}
    seen = set()
    for i, o in enumerate(ledger["outcomes"]):
        where = f"outcomes[{i}]"
        if o.get("call") not in calls:
            out.append(f"{where}: names no call on the ledger")
            continue
        if o["call"] in seen:
            out.append(f"{where}: a second outcome for {o['call']} (outcomes are added once)")
        seen.add(o["call"])
        if not URL.match(str(o.get("source_url") or "")):
            out.append(f"{where}: needs the link to the source actually opened")
        if not str(o.get("quote") or "").strip():
            out.append(f"{where}: needs the quoted words or table cell")
        if not o.get("void"):
            try:
                held(calls[o["call"]], o["value"])
            except (KeyError, TypeError, ValueError):
                out.append(f"{where}: value cannot be compared with the call's threshold")
    for slug, data in found:
        for i, call in enumerate(data.get("calls") or [], start=1):
            out += call_problems(call, f"{slug}: calls[{i - 1}]")
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    ledger = load()
    found = receipts()
    problems = check(ledger, found)
    if problems:
        print("refused:\n  " + "\n  ".join(problems))
        return 1
    if a.check:
        print(f"ledger ok: {len(ledger['calls'])} calls, {len(ledger['outcomes'])} outcomes")
        return 0
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    written = publish(ledger, now[:10], now, found)
    graded = grade(ledger, now)
    if written or graded or not LEDGER.exists():
        save(ledger)
    print(f"{written} calls written, {graded} graded by code")
    return 0


if __name__ == "__main__":
    sys.exit(main())
