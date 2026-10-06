"""
What banks pay and charge in Nigeria and Ghana, from each central bank's own published series, for the
"Is my rate fair?" checks.

- Nigeria: the Central Bank of Nigeria's Money Market Indicators (the JSON its own page loads,
  https://www.cbn.gov.ng/api/GetAllMoneyMarketIndicators): monetary policy rate, Treasury bill rate, savings
  deposit rate, deposit rates by term, prime and maximum lending rates.
- Ghana: the Bank of Ghana's monthly interest rates table (wpDataTables table 21 on
  https://www.bog.gov.gh/economic-data/interest-rates/): average savings deposits rate, 3-month time deposits
  rate, average commercial banks' lending rate, 91-day bill.

Writes data/nigeria/bank_rates.json and data/ghana/bank_rates.json with the latest month that has figures,
and the months before it. A series that cannot be read leaves its file as it was.

    python scripts/west_africa_rates.py
"""

from __future__ import annotations

import json
import re
import sys
import warnings
from datetime import datetime, timezone

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}

CBN_API = "https://www.cbn.gov.ng/api/GetAllMoneyMarketIndicators"
CBN_PAGE = "https://www.cbn.gov.ng/rates/mnymktind.html"
BOG_PAGE = "https://www.bog.gov.gh/economic-data/interest-rates/"
BOG_AJAX = "https://www.bog.gov.gh/wp-admin/admin-ajax.php?action=get_wdtable&table_id=21"


def num(v) -> float | None:
    try:
        f = float(str(v).replace(",", "").strip())
    except (TypeError, ValueError):
        return None
    return f if 0 <= f < 100 else None


def month_key(text: str) -> str | None:
    """'Aug-2026', 'August 2026', '2026-08', '08/2026' -> '2026-08'."""
    s = str(text).strip()
    m = re.search(r"(20\d\d)[-/ ]?(\d{1,2})\b", s)
    if m and 1 <= int(m.group(2)) <= 12:
        return f"{m.group(1)}-{int(m.group(2)):02d}"
    m = re.search(r"([A-Za-z]{3})[A-Za-z]*[-/ ,]*(20\d\d)", s) or re.search(r"(20\d\d)[-/ ,]*([A-Za-z]{3})", s)
    if m:
        a, b = m.groups()
        mon, year = (a, b) if not a.isdigit() else (b, a)
        if mon[:3].lower() in MONTHS:
            return f"{year}-{MONTHS[mon[:3].lower()]:02d}"
    m = re.search(r"(\d{1,2})/(20\d\d)", s)
    if m and 1 <= int(m.group(1)) <= 12:
        return f"{m.group(2)}-{int(m.group(1)):02d}"
    return None


# CBN field names -> ours. Matched on a lower-cased key with spaces and punctuation removed.
CBN_FIELDS = {
    "mpr": ("monetarypolicyrate", "mpr"),
    "tbill": ("treasurybillrate", "tbillrate", "treasurybill"),
    "savings": ("savingsdepositrate", "savingsdeposit", "savings"),
    "deposit_3m": ("3monthsdepositrate", "threemonthsdepositrate", "3monthdepositrate", "3monthsdeposit"),
    "deposit_12m": ("12monthsdepositrate", "twelvemonthsdepositrate", "12monthdepositrate", "12monthsdeposit"),
    "prime_lending": ("primelendingrate", "primelending"),
    "max_lending": ("maximumlendingrate", "maxlendingrate", "maximumlending"),
}


def flat(k: str) -> str:
    return re.sub(r"[^a-z0-9]", "", k.lower())


def nigeria() -> list[dict] | None:
    r = requests.get(CBN_API, headers={**UA, "Referer": CBN_PAGE, "Accept": "application/json"}, timeout=(15, 60), verify=False)
    data = r.json()
    if isinstance(data, dict):
        data = next((v for v in data.values() if isinstance(v, list)), [])
    print(f"  CBN: {len(data)} records; first: {json.dumps(data[0])[:400] if data else '-'}")
    rows = {}
    for rec in data:
        if not isinstance(rec, dict):
            continue
        keys = {flat(k): v for k, v in rec.items()}
        when = None
        if str(keys.get("tyear", "")).isdigit() and str(keys.get("tmonth", "")).isdigit() and 1 <= int(keys["tmonth"]) <= 12:
            when = f"{int(keys['tyear'])}-{int(keys['tmonth']):02d}"
        when = when or next((month_key(v) for k, v in keys.items() if any(w in k for w in ("date", "period", "month")) and month_key(v)), None)
        if not when:
            continue
        row = {"month": when}
        for ours, names in CBN_FIELDS.items():
            row[ours] = next((num(keys[n]) for n in names if n in keys and num(keys[n]) is not None), None)
        if row["savings"] is not None or row["prime_lending"] is not None:
            rows.setdefault(when, row)
    out = sorted(rows.values(), key=lambda x: x["month"], reverse=True)
    print(f"  CBN: {len(out)} months read; latest {out[0] if out else '-'}")
    return out or None


def ghana() -> list[dict] | None:
    s = requests.Session()
    page = s.get(BOG_PAGE, headers=UA, timeout=(15, 60), verify=False).text
    nonce = re.search(r'id="wdtNonceFrontendServerSide_21"[^>]*value="([^"]+)"', page)
    payload = {"draw": 1, "start": 0, "length": 1000, "order[0][column]": 0, "order[0][dir]": "desc"}
    if nonce:
        payload["wdtNonce"] = nonce.group(1)
    r = s.post(BOG_AJAX, data=payload, headers={**UA, "Referer": BOG_PAGE, "X-Requested-With": "XMLHttpRequest"}, timeout=(15, 60), verify=False)
    recs = r.json().get("data", [])
    print(f"  BoG: {len(recs)} rows; first: {recs[0] if recs else '-'}")
    # Each row: year, variable, Jan..Dec.
    names = {
        "savings": "average savings deposits rate",
        "deposit_3m": "average time deposits rate: 3-month",
        "lending": "average commercial banks lending rate",
        "tbill91": "91-day treasury bill",
    }
    months: dict[str, dict] = {}
    for rec in recs:
        cells = [re.sub(r"<[^>]+>", "", str(c)).strip() for c in (rec.values() if isinstance(rec, dict) else rec)]
        if len(cells) < 14 or not re.fullmatch(r"20\d\d", cells[0]):
            continue
        var = cells[1].lower()
        ours = next((k for k, n in names.items() if n in var), None)
        if not ours:
            continue
        for i, v in enumerate(cells[2:14], 1):
            val = num(v)
            if val is not None:
                months.setdefault(f"{cells[0]}-{i:02d}", {"month": f"{cells[0]}-{i:02d}"})[ours] = val
    out = sorted((m for m in months.values() if m.get("savings") is not None or m.get("lending") is not None), key=lambda x: x["month"], reverse=True)
    print(f"  BoG: {len(out)} months read; latest {out[0] if out else '-'}")
    return out or None


def write(path, rows: list[dict], publisher: str, source: str, note: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({
        "dataset": "Bank interest rates, monthly",
        "publisher": publisher,
        "source": source,
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "note": note,
        "rows": rows[:120],
    }, ensure_ascii=False, indent=1), encoding="utf-8")


def main() -> int:
    ok = 0
    for name, fn, path, publisher, source, note in [
        ("nigeria", nigeria, ROOT / "data" / "nigeria" / "bank_rates.json", "Central Bank of Nigeria", CBN_PAGE,
         "Money Market Indicators as the CBN publishes them, % a year: monetary policy rate, Treasury bill rate, savings deposit rate, deposit rates by term, prime and maximum lending rates."),
        ("ghana", ghana, ROOT / "data" / "ghana" / "bank_rates.json", "Bank of Ghana", BOG_PAGE,
         "Monthly interest rates as the Bank of Ghana publishes them, % a year: average savings deposits rate, average 3-month time deposits rate, average commercial banks' lending rate, 91-day Treasury bill."),
    ]:
        try:
            rows = fn()
        except Exception as error:
            print(f"  {name}: {str(error)[:120]}")
            continue
        if rows:
            write(path, rows, publisher, source, note)
            ok += 1
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
