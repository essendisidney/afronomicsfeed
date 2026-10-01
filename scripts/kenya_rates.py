"""
Kenya savings and lending rates, from primary publishers, for the "where your money earns most" page.

- Commercial bank weighted average deposit, savings, lending and overdraft rates, monthly, from the
  Central Bank of Kenya's own table (https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/).
- Money market fund yields, each read from the fund manager's own website, where the manager publishes the
  daily and effective annual yield as text. Funds whose sites publish only images or PDFs are not included
  until a text source is found. Add a fund by appending to FUNDS.

Output: data/kenya/rates.json

    python scripts/kenya_rates.py
"""

from __future__ import annotations

import json
import re
import sys
import warnings
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA, num  # noqa: E402

warnings.filterwarnings("ignore")
CBK = "https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/"
OUT = ROOT / "data" / "kenya" / "rates.json"
MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}

# name, manager, page, pattern capturing (daily yield, effective annual yield) in percent
FUNDS = [
    ("Madison Money Market Fund", "Madison Investment Managers", "https://www.madison.co.ke/investmentmanagers/madison-money-market-fund/",
     r"Madison Money Market Fund\s*Daily Yield:\s*([\d.]+)%\s*Effective Annual Yield:\s*([\d.]+)%"),
    ("Etica Money Market Fund (KES)", "Etica Capital", "https://www.eticacap.com/",
     r"Etica Money Market Fund \(KES\)\s*Effective Annual Yield\s*([\d.]+)%()"),
    ("Kasha Money Market Fund", "Orient Asset Managers", "https://www.orientasset.co.ke/",
     r"Kasha MMF\s*Daily Yield\s*([\d.]+)%\s*Effective Annual Yield\s*([\d.]+)%"),
    ("Zimele Fixed Income Fund (Savings Plan)", "Zimele Asset Management", "https://www.zimele.co.ke/",
     r"Fixed Income Fund \(Savings Plan\)\s*[–-]\s*Daily Yield:\s*([\d.]+)%\s*p\.a\.\s*Gross Yield:\s*([\d.]+)%"),
]


def text_of(url: str) -> str:
    html = requests.get(url, headers=UA, timeout=(15, 40), verify=False).text
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    t = t.replace("​", "").replace("&nbsp;", " ")
    return re.sub(r"\s+", " ", t)


def bank_rates() -> list[dict]:
    t = text_of(CBK)
    rows = []
    # rows read: "August 2026 6.91 3.54 14.34 12.5" (month, year, deposit, savings, lending, overdraft)
    for m in re.finditer(r"\b([A-Z][a-z]{2,8})\s+(20\d\d)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\b", t):
        mon = MONTHS.get(m.group(1)[:3].lower())
        if not mon:
            continue
        vals = [num(m.group(i)) for i in range(3, 7)]
        if any(v is None or not (0 <= v < 60) for v in vals):
            continue
        rows.append({"month": f"{m.group(2)}-{mon:02d}", "deposit": vals[0], "savings": vals[1], "lending": vals[2], "overdraft": vals[3]})
    uniq = {r["month"]: r for r in rows}
    return sorted(uniq.values(), key=lambda r: r["month"], reverse=True)


def fund(entry):
    name, manager, url, pattern = entry
    try:
        t = text_of(url)
        m = re.search(pattern, t, flags=re.I)
        if not m:
            return {"name": name, "manager": manager, "source": url, "status": "pattern not found"}
        daily = num(m.group(1))
        effective = num(m.group(2)) if m.group(2) else None
        if effective is None:  # Etica publishes only the effective annual yield
            effective, daily = daily, None
        if effective is None or not (0 < effective < 40):
            return {"name": name, "manager": manager, "source": url, "status": "implausible"}
        return {"name": name, "manager": manager, "source": url, "status": "ok", "daily_yield": daily, "effective_annual_yield": effective}
    except Exception as error:
        return {"name": name, "manager": manager, "source": url, "status": f"error: {str(error)[:80]}"}


def main() -> int:
    banks = bank_rates()
    with ThreadPoolExecutor(max_workers=4) as pool:
        funds = list(pool.map(fund, FUNDS))
    ok = [f for f in funds if f["status"] == "ok"]
    print(f"bank months: {len(banks)} (latest {banks[0]['month'] if banks else '-'}); funds read: {len(ok)}/{len(funds)}")
    for f in funds:
        print(f"  {f['name']}: {f['status']}" + (f" {f.get('effective_annual_yield')}%" if f["status"] == "ok" else ""))
    if not banks and not ok:
        raise SystemExit("nothing read")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    previous = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    body = {
        "dataset": "Kenya savings and lending rates",
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "updated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "bank_rates": {"publisher": "Central Bank of Kenya", "source": CBK, "unit": "percent per annum, weighted average across commercial banks", "rows": banks or previous.get("bank_rates", {}).get("rows", [])},
        "money_market_funds": {
            "note": "Each yield is read from the fund manager's own website at the time shown; funds publishing yields only as images or PDFs are not yet included.",
            "as_of": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "rows": sorted(ok, key=lambda f: -f["effective_annual_yield"]),
            "unread": [{"name": f["name"], "status": f["status"]} for f in funds if f["status"] != "ok"],
        },
    }
    OUT.write_text(json.dumps(body, ensure_ascii=False, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
