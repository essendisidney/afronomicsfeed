"""
Central-bank policy rates, read from each central bank's own website.

Each market's rate is read where the bank prints it as text on its home page; a market whose page loads the
figure by script is left out until a text or data source is found (see MISSING). Every reading keeps the
bank's own wording for the rate and the date the bank attaches to it, where it shows one.

Output: data/policy_rates.json (latest per market) and data/policy_rate_history.json (one row per market per
change, appended so the history builds from the first read).

    python scripts/policy_rates.py
"""

from __future__ import annotations

import html
import json
import re
import sys
import warnings
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "policy_rates.json"
HISTORY = ROOT / "data" / "policy_rate_history.json"
NAIROBI = timezone(timedelta(hours=3))

# market slug (as in lib/data/sovereign-bills.ts), central bank, page, the bank's name for the rate,
# pattern with named groups: rate (required), date (optional, as printed), corridor (optional upper rate)
BANKS = [
    ("kenya", "Central Bank of Kenya", "https://www.centralbank.go.ke/", "Central Bank Rate",
     r"Central Bank Rate (?P<rate>\d+(?:\.\d+)?)% (?P<date>\d{2}/\d{2}/\d{4})"),
    ("ghana", "Bank of Ghana", "https://www.bog.gov.gh/", "Monetary Policy Rate",
     r"(?P<rate>\d+(?:\.\d+)?) Current Monetary Policy Rate"),
    ("egypt", "Central Bank of Egypt", "https://www.cbe.org.eg/en", "Overnight deposit rate",
     r"Overnight Deposit Rate (?P<rate>\d+(?:\.\d+)?)% Overnight Lending Rate (?P<corridor>\d+(?:\.\d+)?)%"),
    ("malawi", "Reserve Bank of Malawi", "https://www.rbm.mw/", "Policy Rate",
     r"Policy Rate (?P<rate>\d+(?:\.\d+)?) (?P<date>[A-Z][a-z]{2} \d{4})"),
    ("mozambique", "Banco de Moçambique", "https://www.bancomoc.mz/", "Taxa MIMO",
     r"(?P<date>\d{2}-\d{2}-\d{4}) TAXA MIMO [A-Z ]*?(?P<rate>\d+(?:,\d+)?) ?%"),
    # The Reserve Bank's own home-page data feed (JSON), the same one its site draws its rates panel from.
    ("southafrica", "South African Reserve Bank", "https://custom.resbank.co.za/SarbWebApi/WebIndicators/HomePageRates", "SARB Policy Rate",
     r'"Name":"SARB Policy Rate"[^}]*?"Date":"(?P<date>\d{4}-\d{2}-\d{2})","Value":(?P<rate>\d+(?:\.\d+)?)'),
    # The Bank of Zambia's own content feed (JSON:API), newest entry first.
    ("zambia", "Bank of Zambia", "https://www.boz.zm/jsonapi/node/monetary_policy_rate?sort=-created&page[limit]=1", "Monetary Policy Rate",
     r'"field_monetary_policy_rate":"(?P<rate>\d+(?:\.\d+)?)","field_monetary_policy_rate_dat":"(?P<date>\d{4}-\d{2}-\d{2})"'),
    # The Central Bank of Nigeria's Money Market Indicators feed (the JSON its own page loads), newest month first.
    ("nigeria", "Central Bank of Nigeria", "https://www.cbn.gov.ng/api/GetAllMoneyMarketIndicators", "Monetary Policy Rate",
     r'"period":"(?P<date>[A-Za-z]+ \d{4})","interBankCallRate":"[^"]*","mrr":"[^"]*","mpr":"(?P<rate>\d+(?:\.\d+)?)"'),
    ("tanzania", "Bank of Tanzania", "https://www.bot.go.tz/?lang=en", "Central Bank Rate",
     r"Central Bank Rate (?P<rate>\d+(?:\.\d+)?)% (?P<date>\d(?:st|nd|rd|th) Quarter \d{4})"),
]

# Where a rate is read from a data feed, readers are sent to the bank's human-readable page instead.
SOURCE_PAGE = {
    "southafrica": "https://www.resbank.co.za/en/home/what-we-do/statistics/key-statistics/current-market-rates",
    "zambia": "https://www.boz.zm/",
    "nigeria": "https://www.cbn.gov.ng/rates/mnymktind.html",
}

# Read on the central bank's page but loaded by script, so not yet readable as text.
MISSING = {
    "uganda": "Bank of Uganda",
}


def text_of(url: str) -> str:
    raw = requests.get(url, headers=UA, timeout=(15, 40), verify=False).text
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", raw, flags=re.S | re.I)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t)).replace("​", "")
    return re.sub(r"\s+", " ", t)


def read(bank) -> dict:
    slug, publisher, url, label, pattern = bank
    base = {"market": slug, "publisher": publisher, "source": SOURCE_PAGE.get(slug, url), "label": label}
    try:
        m = re.search(pattern, text_of(url))
    except Exception as error:
        return {**base, "status": f"error: {str(error)[:80]}"}
    if not m:
        return {**base, "status": "pattern not found"}
    rate = float(m.group("rate").replace(",", "."))
    if not 0 < rate < 60:
        return {**base, "status": f"implausible: {rate}"}
    groups = m.groupdict()
    corridor = float(groups["corridor"]) if groups.get("corridor") else None
    return {**base, "status": "ok", "rate": rate, "upper": corridor, "date_as_printed": groups.get("date")}


def main() -> int:
    with ThreadPoolExecutor(max_workers=5) as pool:
        results = list(pool.map(read, BANKS))
    ok = [r for r in results if r["status"] == "ok"]
    for r in results:
        print(f"  {r['market']}: {r['status']}" + (f" {r['rate']}%" if r["status"] == "ok" else ""))
    if not ok:
        raise SystemExit("nothing read")
    now = datetime.now(timezone.utc)
    previous = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {"rows": []}
    kept = {r["market"]: r for r in previous.get("rows", [])}
    for r in ok:
        kept[r["market"]] = {k: r[k] for k in ("market", "publisher", "source", "label", "rate", "upper", "date_as_printed")} | {"read_at": now.isoformat(timespec="seconds")}
    OUT.write_text(json.dumps({
        "dataset": "African central-bank policy rates",
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "updated_at": now.isoformat(timespec="seconds"),
        "note": "Each rate as printed on the central bank's own website at read_at; date_as_printed is the bank's own date for it where shown.",
        "rows": sorted(kept.values(), key=lambda r: r["market"]),
        "unread": [{"market": r["market"], "status": r["status"]} for r in results if r["status"] != "ok"]
        + [{"market": k, "status": "not yet readable as text"} for k in MISSING],
    }, ensure_ascii=False, indent=1), encoding="utf-8")

    # History: a new row only when a market's rate (or its printed date) changes.
    hist = json.loads(HISTORY.read_text(encoding="utf-8")).get("rows", []) if HISTORY.exists() else []
    day = now.astimezone(NAIROBI).date().isoformat()
    for r in ok:
        last = next((h for h in reversed(hist) if h["market"] == r["market"]), None)
        if last and last["rate"] == r["rate"] and last.get("upper") == r["upper"] and last.get("date_as_printed") == r["date_as_printed"]:
            continue
        hist.append({"first_seen": day, "market": r["market"], "rate": r["rate"], "upper": r["upper"], "date_as_printed": r["date_as_printed"], "source": r["source"]})
    HISTORY.write_text(json.dumps({
        "dataset": "African central-bank policy rates, changes as first seen",
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "rows": hist,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
