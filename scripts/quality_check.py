"""
Data quality gate (founder-strategy-pack.md section G2). Reads every auction file in data/ and checks each row:

  1. a source document link (http or https) on the row;
  2. a date (value, auction or settlement date) that parses;
  3. a rate (weighted average, stop rate, rate or yield) between 0 and 100 per cent;
  4. accepted no more than 2% above bids received, where both are published;
  5. no row repeated (same instrument, tenor and date).

Rows failing any of these are errors. An error already reviewed and listed in data/quality/known.json (with the reason
it stands for now) is reported but does not fail the gate; any new error does. Separately, rate moves
of more than 150 basis points between consecutive auctions of the same tenor in the last 90 days are listed as flags
for a person to look at (a real move, or a misread); they do not fail the gate, because markets do move.

    python scripts/quality_check.py [--write]  # prints a summary (--write: also data/quality/report.json); exits 1 on new errors
"""

from __future__ import annotations

import json
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "quality" / "report.json"
KNOWN = ROOT / "data" / "quality" / "known.json"  # reviewed issues, each with the reason it is accepted for now
RATE_KEYS = ("weighted_avg_rate", "stop_rate", "rate", "yield", "weighted_rate")
DATE_KEYS = ("value_date", "auction_date", "operation_date", "settlement_date", "issue_date")
ID_KEYS = ("isin", "issue", "cbn_id", "auction_no", "tender", "series", "instrument", "kind", "country", "maturity", "months", "coupon")
FLAG_BP = 150
FLAG_DAYS = 90
SKIP = {"policy_rates.json", "policy_rate_history.json"}


def auction_files() -> list[Path]:
    files = []
    for f in sorted(ROOT.glob("data/**/*.json")):
        if f.name in SKIP or "quality" in f.parts:
            continue
        try:
            d = json.loads(f.read_text())
        except (json.JSONDecodeError, UnicodeDecodeError):
            continue
        rows = d.get("rows") if isinstance(d, dict) else None
        if isinstance(rows, list) and rows and isinstance(rows[0], dict) and any(k in rows[0] for k in RATE_KEYS) and "source" in rows[0]:
            files.append(f)
    return files


def first(row: dict, keys: tuple[str, ...]):
    for k in keys:
        if row.get(k) not in (None, ""):
            return k, row[k]
    return None, None


def amount(row: dict, prefixes: tuple[str, ...]):
    for k, v in row.items():
        if k.startswith(prefixes) and k.endswith("_m") and isinstance(v, (int, float)):
            return v
    return None


def parse_date(v) -> date | None:
    try:
        return date.fromisoformat(str(v)[:10])
    except ValueError:
        return None


def error_key(rel: str, row: dict, problem: str) -> str:
    """Stable across reruns and reordering: the file, the row's source document, tenor and rate, and the problem."""
    return f"{rel}|{row.get('source')}|{row.get('tenor', row.get('tenor_years'))}|{first(row, RATE_KEYS)[1]}|{problem}"


def check_file(path: Path, today: date) -> tuple[list[dict], list[str], int]:
    rows = json.loads(path.read_text())["rows"]
    rel = path.relative_to(ROOT).as_posix()
    errors: list[dict] = []
    flags: list[str] = []
    seen: set[tuple] = set()
    series: dict[str, list[tuple[date, float]]] = {}
    for i, r in enumerate(rows):
        where = f"{rel} row {i}"
        src = r.get("source")
        if not (isinstance(src, str) and src.startswith(("http://", "https://"))):
            errors.append({"key": error_key(rel, r, "no source link"), "text": f"{where}: no source link"})
        dk, dv = first(r, DATE_KEYS)
        d = parse_date(dv) if dk else None
        if d is None:
            errors.append({"key": error_key(rel, r, "no valid date"), "text": f"{where}: no valid date"})
        rk, rate = first(r, RATE_KEYS)
        if rk is not None and not (isinstance(rate, (int, float)) and 0 <= rate <= 100):
            errors.append({"key": error_key(rel, r, "rate out of range"), "text": f"{where}: {rk} {rate!r} is not a rate between 0 and 100"})
        received = amount(r, ("received_", "tendered_", "bids_", "bid_face_"))
        accepted = amount(r, ("accepted_", "allocated_face_"))
        if received is not None and accepted is not None and received > 0 and accepted > received * 1.02:
            errors.append({"key": error_key(rel, r, "accepted above received"), "text": f"{where}: accepted {accepted} is more than bids received {received}"})
        tenor = r.get("tenor", r.get("tenor_days", r.get("tenor_years")))
        key = (tenor, dv, *(r.get(k) for k in ID_KEYS), rate, src)
        if key in seen:
            errors.append({"key": error_key(rel, r, "repeated row"), "text": f"{where}: repeats an earlier row"})
        seen.add(key)
        if d and isinstance(rate, (int, float)) and tenor is not None:
            series.setdefault(str(tenor), []).append((d, float(rate)))
    for tenor, pts in series.items():
        pts.sort()
        for (d0, r0), (d1, r1) in zip(pts, pts[1:]):
            if d1 >= today - timedelta(days=FLAG_DAYS) and d1 != d0 and abs(r1 - r0) * 100 > FLAG_BP:
                flags.append(f"{rel} tenor {tenor}: {r0:.3f}% on {d0} to {r1:.3f}% on {d1} ({(r1 - r0) * 100:+.0f} bp)")
    return errors, flags, len(rows)


def known() -> dict[str, str]:
    if not KNOWN.exists():
        return {}
    return {k["key"]: k["reason"] for k in json.loads(KNOWN.read_text())["issues"]}


def run(today: date | None = None) -> dict:
    today = today or date.today()
    accepted = known()
    report = {"checked": today.isoformat(), "files": {}, "errors": [], "known": [], "flags": [], "stale_known": []}
    found: set[str] = set()
    for f in auction_files():
        errors, flags, n = check_file(f, today)
        report["files"][f.relative_to(ROOT).as_posix()] = {"rows": n, "errors": len(errors), "flags": len(flags)}
        for e in errors:
            found.add(e["key"])
            (report["known"] if e["key"] in accepted else report["errors"]).append(e["text"])
        report["flags"] += flags
    report["stale_known"] = sorted(k for k in accepted if k not in found)
    return report


def main() -> int:
    report = run()
    if "--write" in sys.argv:
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(json.dumps(report, indent=1) + "\n")
    rows = sum(v["rows"] for v in report["files"].values())
    print(f"quality: {len(report['files'])} files, {rows} rows, {len(report['errors'])} new errors, {len(report['known'])} known, {len(report['flags'])} flags to look at")
    for e in report["errors"][:40]:
        print("  ERROR", e)
    for fl in report["flags"][:40]:
        print("  flag ", fl)
    return 1 if report["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
