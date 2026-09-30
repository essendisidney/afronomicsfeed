"""Shared output format for the sovereign T-bill extractors (scripts/<country>_tbills.py).

Every market is written as data/<country>/tbill_auctions.json with one row per tenor per auction:
tenor, auction_date, value_date, weighted_avg_rate (the market's headline rate, % p.a.),
offered_<cur>_m / received_<cur>_m / accepted_<cur>_m (local currency, millions, where published) and source.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36 AfronomicsBot/1.0 (+https://www.afronomicsfeed.com/method)"
}


def out_path(country: str) -> Path:
    return ROOT / "data" / country / "tbill_auctions.json"


def load_existing(country: str) -> dict:
    p = out_path(country)
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {"rows": [], "sources": {}}


def write(country: str, *, dataset: str, publisher: str, source_page: str, currency: str, rate_note: str, rows: list[dict], sources: dict | None = None, notes: str | None = None) -> None:
    unique = {}
    for r in rows:
        unique[(r.get("auction_date") or r["value_date"], r["tenor"], r.get("kind", "primary"))] = r
    ordered = sorted(unique.values(), key=lambda r: (r["value_date"], r["tenor"]), reverse=True)
    body = {
        "dataset": dataset,
        "publisher": publisher,
        "source_page": source_page,
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "units": {"amounts": f"{currency} millions", "rates": rate_note},
        "rows": ordered,
    }
    if notes:
        body["notes"] = notes
    if sources is not None:
        body["sources"] = sources
    p = out_path(country)
    if p.exists():
        old = json.loads(p.read_text(encoding="utf-8"))
        if old.get("rows") == ordered and old.get("sources") == body.get("sources"):
            print(f"{country}: unchanged ({len(ordered)} rows)")
            return
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(body, ensure_ascii=False, indent=1), encoding="utf-8")
    first = ordered[-1]["value_date"] if ordered else "-"
    last = ordered[0]["value_date"] if ordered else "-"
    print(f"{country}: {len(ordered)} rows, {first} to {last}")


def num(value) -> float | None:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value).replace(",", "").strip())
    except ValueError:
        return None
