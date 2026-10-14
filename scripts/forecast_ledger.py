"""
The forecast ledger (docs/rebuild/phase-4-plan.md): Kenya Treasury bill ranges written down before each auction and
graded by code after it, in data/forecasts/kenya_tbills.json. The file only grows, and the scheduled job commits it to
the public repository, so each forecast's commit proves it was published before bids closed.

    python scripts/forecast_ledger.py            # log the next auction's ranges if due, then grade what can be graded
    python scripts/forecast_ledger.py --check    # print what would be written, write nothing

Method v1 is the one on the auction page (lib/data/auction-intel.ts): for each tenor, the latest weighted average rate
plus the 10th to 90th percentile of the last 26 weekly moves. tests/readers/test_forecast_ledger.py checks that this
code reproduces the site's backtest exactly.

Rules:
  - a forecast is written only before its auction's bids close (Thursday 14:00 Nairobi, 11:00 UTC); later, it is refused;
  - a forecast is never edited; an outcome is a separate row, added once;
  - the outcome is the first CBK result for that tenor dated between bids closing and three days after the expected
    value date; with none after 21 days, the outcome is "no result published", never dropped.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TBILLS = ROOT / "data" / "kenya" / "tbill_auctions.json"
LEDGER = ROOT / "data" / "forecasts" / "kenya_tbills.json"

TENORS = (91, 182, 364)
WINDOW = 26
METHOD = {
    "v1": "Latest weighted average accepted rate plus the 10th to 90th percentile of the last 26 weekly moves (lib/data/auction-intel.ts). Aims to hold about 80% of results."
}
CURRENT = "v1"
NO_RESULT_AFTER = timedelta(days=21)


def quantile(sorted_values: list[float], q: float) -> float:
    pos = (len(sorted_values) - 1) * q
    lo, hi = math.floor(pos), math.ceil(pos)
    return sorted_values[lo] + (sorted_values[hi] - sorted_values[lo]) * (pos - lo)


def band(rates: list[float], end: int) -> dict:
    """The v1 range for the auction after rates[end - 1], from the 26 rates before it (as auction-intel.ts band())."""
    window = rates[end - WINDOW : end]
    moves = [window[i] - window[i - 1] for i in range(1, len(window))]
    ordered = sorted(moves)
    last = rates[end - 1]
    return {
        "low": last + quantile(ordered, 0.1),
        "high": last + quantile(ordered, 0.9),
        "typical": quantile(sorted(abs(m) for m in moves), 0.5),
    }


def series(rows: list[dict], tenor: int) -> list[dict]:
    return sorted((r for r in rows if r["tenor"] == tenor), key=lambda r: r["value_date"])


def backtest(rows: list[dict]) -> dict[int, tuple[int, int]]:
    """(tested, inside) per tenor, exactly as outlook() in auction-intel.ts counts them."""
    out = {}
    for tenor in TENORS:
        rates = [r["weighted_avg_rate"] for r in series(rows, tenor)]
        tested = inside = 0
        for i in range(WINDOW + 1, len(rates)):
            b = band(rates, i)
            tested += 1
            inside += b["low"] <= rates[i] <= b["high"]
        out[tenor] = (tested, inside)
    return out


def bids_close(value_date: str) -> datetime:
    """CBK auctions close at 14:00 Nairobi on the Thursday before the Monday value date."""
    d = datetime.fromisoformat(value_date).replace(tzinfo=timezone.utc) - timedelta(days=4)
    return d.replace(hour=11)


def load_ledger() -> dict:
    if LEDGER.exists():
        return json.loads(LEDGER.read_text())
    return {"about": "Kenya Treasury bill range forecasts, written before bids close and graded by code. Never edited.", "methods": METHOD, "forecasts": [], "outcomes": []}


def due_forecasts(rows: list[dict], ledger: dict, now: datetime) -> tuple[list[dict], str | None]:
    """The rows to log for the next auction, or [] with the reason."""
    latest = max(r["value_date"] for r in rows)
    value_date = (datetime.fromisoformat(latest) + timedelta(days=7)).date().isoformat()
    close = bids_close(value_date)
    if now >= close:
        return [], f"bids for {value_date} closed at {close.isoformat()}; too late to forecast"
    have = {f["id"] for f in ledger["forecasts"]}
    out = []
    for tenor in TENORS:
        fid = f"KE-TB-{value_date}-{tenor}"
        if fid in have:
            continue
        s = series(rows, tenor)
        if len(s) < WINDOW + 2:
            continue
        rates = [r["weighted_avg_rate"] for r in s]
        b = band(rates, len(rates))
        out.append(
            {
                "id": fid,
                "market": "kenya",
                "tenor": tenor,
                "auction_value_date": value_date,
                "bids_close": close.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "written_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "method": CURRENT,
                "from_value_date": s[-1]["value_date"],
                "from_rate": round(rates[-1], 4),
                "low": round(b["low"], 4),
                "high": round(b["high"], 4),
                "typical_move": round(b["typical"], 4),
            }
        )
    return out, None if out else "already logged"


def grade(rows: list[dict], ledger: dict, now: datetime) -> list[dict]:
    """Outcome rows for forecasts not yet graded whose result is in, or that have waited 21 days."""
    graded = {o["id"] for o in ledger["outcomes"]}
    out = []
    for f in ledger["forecasts"]:
        if f["id"] in graded:
            continue
        close = datetime.fromisoformat(f["bids_close"].replace("Z", "+00:00"))
        last_day = (datetime.fromisoformat(f["auction_value_date"]) + timedelta(days=3)).date().isoformat()
        candidates = [r for r in series(rows, f["tenor"]) if close.date().isoformat() <= r["value_date"] <= last_day]
        stamp = now.strftime("%Y-%m-%dT%H:%M:%SZ")
        if candidates:
            r = candidates[0]
            rate = r["weighted_avg_rate"]
            inside = f["low"] <= rate <= f["high"]
            miss = 0.0 if inside else min(abs(rate - f["low"]), abs(rate - f["high"]))
            out.append(
                {
                    "id": f["id"],
                    "graded_at": stamp,
                    "status": "graded",
                    "result_value_date": r["value_date"],
                    "result_rate": rate,
                    "inside": inside,
                    "miss_bps": round(miss * 100, 1),
                    "side": None if inside else ("above" if rate > f["high"] else "below"),
                    "source": r["source"],
                }
            )
        elif now - close > NO_RESULT_AFTER:
            out.append({"id": f["id"], "graded_at": stamp, "status": "no_result", "inside": None, "note": "No CBK result for this tenor within 21 days of bids closing."})
    return out


def check_ledger(ledger: dict) -> list[str]:
    """Invariants: ids unique, every forecast written before its bids closed, one outcome per forecast at most."""
    problems = []
    ids = [f["id"] for f in ledger["forecasts"]]
    if len(ids) != len(set(ids)):
        problems.append("duplicate forecast ids")
    for f in ledger["forecasts"]:
        if f["written_at"] >= f["bids_close"]:
            problems.append(f"{f['id']}: written after bids closed")
        if not f["low"] <= f["high"]:
            problems.append(f"{f['id']}: low above high")
    outs = [o["id"] for o in ledger["outcomes"]]
    if len(outs) != len(set(outs)):
        problems.append("more than one outcome for a forecast")
    if set(outs) - set(ids):
        problems.append("an outcome without a forecast")
    return problems


def run(now: datetime, write: bool) -> int:
    rows = json.loads(TBILLS.read_text())["rows"]
    ledger = load_ledger()
    new_f, why = due_forecasts(rows, ledger, now)
    ledger_after = {**ledger, "forecasts": ledger["forecasts"] + new_f}
    new_o = grade(rows, ledger_after, now)
    ledger_after["outcomes"] = ledger["outcomes"] + new_o
    ledger_after["methods"] = {**METHOD, **ledger.get("methods", {})}
    problems = check_ledger(ledger_after)
    print(f"forecasts: +{len(new_f)}" + (f" ({why})" if why and not new_f else "") + f"; outcomes: +{len(new_o)}")
    for r in new_f + new_o:
        print(" ", r)
    if problems:
        print("refused:", "; ".join(problems))
        return 1
    if write and (new_f or new_o):
        LEDGER.parent.mkdir(parents=True, exist_ok=True)
        LEDGER.write_text(json.dumps(ledger_after, ensure_ascii=False, indent=1) + "\n")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    return run(datetime.now(timezone.utc), write=not a.check)


if __name__ == "__main__":
    sys.exit(main())
