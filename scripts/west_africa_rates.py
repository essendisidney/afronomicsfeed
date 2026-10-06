"""
What banks pay and charge in Nigeria and Ghana, from each central bank's own published series, for the
"Is my rate fair?" checks.

- Nigeria: the Central Bank of Nigeria's Money Market Indicators (the JSON its own page loads,
  https://www.cbn.gov.ng/api/GetAllMoneyMarketIndicators): monetary policy rate, Treasury bill rate, savings
  deposit rate, deposit rates by term, prime and maximum lending rates.
- Ghana: table 3a of the Bank of Ghana's monthly Summary of Economic and Financial Data (PDF): policy rate,
  bills, savings and 3-month deposits, average lending rate. (Its interest-rates web table stops at April 2023.)

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
    "deposit_3m": ("threemonthsdeposit", "3monthsdepositrate", "threemonthsdepositrate", "3monthdepositrate", "3monthsdeposit"),
    "deposit_12m": ("twelvemonthsdeposit", "12monthsdepositrate", "twelvemonthsdepositrate", "12monthdepositrate", "12monthsdeposit"),
    "prime_lending": ("primelendingrate", "primelending"),
    "max_lending": ("maxlending", "maximumlendingrate", "maxlendingrate", "maximumlending"),
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


SUMMARY_PAGE = "https://www.bog.gov.gh/monetary-policy/summary-of-economic-and-financial-data/"
# Rows of table 3a ("Interest Rates (Percent Per Annum)") in the Bank of Ghana's monthly Summary of Economic and
# Financial Data, and our names for them.
GH_ROWS = {
    "Monetary Policy Rate": "mpr",
    "91-Day Bill (interest equivalent)": "tbill91",
    "364-Day Bill (interest equivalent)": "tbill364",
    "Savings Deposits": "savings",
    "3-months": "deposit_3m",
    "Average Lending Rate": "lending",
}


def parse_ghana_summary(text: str) -> list[dict]:
    """Table 3a: a header of months ('2025:08 2025:09 ... 2026:08') then one row per rate. The PDF carries a
    watermark whose stray letters land on their own lines; a row whose values do not line up with the months
    is skipped rather than guessed."""
    start = text.find("3a. Interest Rates")
    if start < 0:
        return []
    end = text.find("3b.", start)
    block = text[start:end if end > 0 else None]
    head = re.search(r"((?:20\d\d:\d\d\s+)+20\d\d:\d\d)", block)
    if not head:
        return []
    months = [m.replace(":", "-") for m in head.group(1).split()]
    out: dict[str, dict] = {m: {"month": m} for m in months}
    for line in block[head.end():].splitlines():
        line = line.strip()
        for label, ours in GH_ROWS.items():
            if line.startswith(label + " "):
                vals = line[len(label):].split()
                nums = [num(v) if re.fullmatch(r"\d+(?:\.\d+)?", v) else None for v in vals]
                if len(nums) != len(months) or any(v is None for v in nums):
                    print(f"  BoG summary: row {label!r} does not line up ({len(vals)} values, {len(months)} months); skipped")
                    continue
                for m, v in zip(months, nums):
                    out[m][ours] = v
    rows = [r for r in out.values() if r.get("savings") is not None or r.get("lending") is not None]
    return sorted(rows, key=lambda r: r["month"], reverse=True)


def ghana() -> list[dict] | None:
    """The newest monthly Summary of Economic and Financial Data linked from the Bank of Ghana's page."""
    import io

    import pdfplumber

    page = requests.get(SUMMARY_PAGE, headers=UA, timeout=(15, 60), verify=False).text
    links = re.findall(r'href="([^"]*Summary-of-Economic-and-Financial-Data-[^"]*\.pdf)"', page)
    if not links:
        print("  BoG: no summary PDF linked")
        return None
    url = links[0]
    r = requests.get(url, headers=UA, timeout=(15, 90), verify=False)
    if r.content[:5] != b"%PDF-":
        print(f"  BoG: {url} is not a PDF")
        return None
    with pdfplumber.open(io.BytesIO(r.content)) as pdf:
        text = "\n".join(pg.extract_text() or "" for pg in pdf.pages[:8])
    rows = parse_ghana_summary(text)
    print(f"  BoG summary {url}: {len(rows)} months; latest {rows[0] if rows else '-'}")
    return rows or None


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
        ("ghana", ghana, ROOT / "data" / "ghana" / "bank_rates.json", "Bank of Ghana", SUMMARY_PAGE,
         "Table 3a of the Bank of Ghana's monthly Summary of Economic and Financial Data, % a year: monetary policy rate, 91- and 364-day bills (interest equivalent), savings deposits, 3-month time deposits, average lending rate."),
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
