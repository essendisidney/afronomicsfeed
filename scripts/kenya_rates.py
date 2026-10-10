"""
Kenya savings and lending rates, from primary publishers, for the "where your money earns most" page.

- Commercial bank weighted average deposit, savings, lending and overdraft rates, monthly, from the
  Central Bank of Kenya's own table (https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/).
- Money market fund yields, each read from the fund manager's own website, where the manager publishes the
  daily and effective annual yield as text, or (Etica) from the manager's own monthly fact sheet, labelled as
  that month's average. Add a fund by appending to FUNDS.

Output: data/kenya/rates.json, plus data/kenya/mmf_history.json: every fund yield read, one row per fund per
Nairobi day, appended on each run so the history builds from the first read.

    python scripts/kenya_rates.py
"""

from __future__ import annotations

import html as htmllib
import json
import re
import sys
import warnings
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA, num  # noqa: E402

warnings.filterwarnings("ignore")
CBK = "https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/"
OUT = ROOT / "data" / "kenya" / "rates.json"
HISTORY = ROOT / "data" / "kenya" / "mmf_history.json"
NAIROBI = timezone(timedelta(hours=3))
MONTHS = {m: i for i, m in enumerate(["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}

# name, manager, page, pattern capturing (daily yield, effective annual yield) in percent
FUNDS = [
    ("Madison Money Market Fund", "Madison Investment Managers", "https://www.madison.co.ke/investmentmanagers/madison-money-market-fund/",
     r"Madison Money Market Fund\s*Daily Yield:\s*([\d.]+)%\s*Effective Annual Yield:\s*([\d.]+)%"),
    ("Kasha Money Market Fund", "Orient Asset Managers", "https://www.orientasset.co.ke/",
     r"Kasha MMF\s*Daily Yield\s*([\d.]+)%\s*Effective Annual Yield\s*([\d.]+)%"),
    # The page prints "Current Daily Rate - x% Current Effective Annual Rate - y%" for both the shilling and the
    # dollar money market fund; the shilling block follows its "... in times of market volatility." description.
    # The fixed income fund on the same page uses a colon, so it never matches.
    ("CIC Money Market Fund", "CIC Asset Management", "https://ke.cicinsurancegroup.com/individual-solutions/investment-solutions/?tab=money-market",
     r"market volatility\.\s*Investments Returns\s*Current Daily Rate\s*[-–—]\s*([\d.]+)%\s*Current Effective Annual Rate\s*[-–—]\s*([\d.]+)%"),
    ("Zimele Fixed Income Fund (Savings Plan)", "Zimele Asset Management", "https://www.zimele.co.ke/",
     r"Fixed Income Fund \(Savings Plan\)\s*[–-]\s*Daily Yield:\s*([\d.]+)%\s*p\.a\.\s*Gross Yield:\s*([\d.]+)%"),
]


def text_of(url: str) -> str:
    # Some managers' sites are slow to answer: one retry with a longer wait before calling it a failed read.
    try:
        html = requests.get(url, headers=UA, timeout=(15, 40), verify=False).text
    # A body that arrives too slowly surfaces as a ConnectionError wrapping urllib3's ReadTimeoutError, not as Timeout.
    except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
        html = requests.get(url, headers=UA, timeout=(20, 90), verify=False).text
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", t)
    t = htmllib.unescape(t).replace("\u200b", "").replace("\xa0", " ")
    t = re.sub(r"\s+", " ", t)
    # some sites split a figure across tags ("10 .22%"); join digits either side of the decimal point
    return re.sub(r"(\d) ?\. ?(\d)", r"\1.\2", t)


ETICA_SHEET = "https://eticacap.com/wp-content/uploads/{up:%Y}/{up:%m}/Etica-Unit-Trust-Funds-Fact-Sheet-{end:%B}-{end.day}-{end:%Y}.pdf"


def etica() -> dict:
    """Etica's home page carries two sets of yields for the same funds (a heading and a ticker that disagree), so
    the shilling money market fund is read from Etica's own monthly fact sheet instead: "Average Return – <month>
    x% p.a.", an effective annual yield net of fees. Newest month-end first; a sheet is uploaded in the month after."""
    base = {"name": "Etica Money Market Fund (KES)", "manager": "Etica Capital"}
    first = datetime.now(NAIROBI).date().replace(day=1)
    for _ in range(3):
        end = first - timedelta(days=1)  # last day of the previous month
        first = end.replace(day=1)
        for up in (end + timedelta(days=1), end):  # uploaded the next month, occasionally the same one
            url = ETICA_SHEET.format(up=up, end=end)
            try:
                r = requests.get(url, headers=UA, timeout=(15, 60), verify=False)
                if r.status_code != 200 or not r.content.startswith(b"%PDF"):
                    continue
                import io
                import pdfplumber

                with pdfplumber.open(io.BytesIO(r.content)) as pdf:
                    t = re.sub(r"\s+", " ", " ".join(p.extract_text() or "" for p in pdf.pages))
            except Exception as error:
                print(f"etica {end:%B %Y}: {str(error)[:80]}")
                continue
            # The KES fund's block runs from its heading to the dollar fund's (the first such block with a return:
            # a contents list naming both funds has none).
            blocks = re.finditer(r"Money Market Fund\s*[–—-]\s*KES(.*?)(?=Money Market Fund\s*[–—-]\s*USD|$)", t)
            found = (re.search(r"Average Return\s*[–—-]\s*([A-Z][a-z]+ \d{4})\s*([\d.]+)%\s*p\.a\.", b.group(1)) for b in blocks)
            m = next((x for x in found if x), None)
            if not m or m.group(1) != f"{end:%B %Y}":
                return {**base, "source": url, "status": "fact sheet found but its yield not read"}
            effective = num(m.group(2))
            if effective is None or not (0 < effective < 40):
                return {**base, "source": url, "status": "implausible"}
            return {**base, "source": url, "status": "ok", "daily_yield": None, "effective_annual_yield": effective,
                    "basis": f"average for {end:%B %Y}, net of fees, from the monthly fact sheet", "period_end": end.isoformat()}
    return {**base, "source": "https://eticacap.com/", "status": "no fact sheet for the last three months"}


NCBA = "https://ncbagroup.com/investment-banking/money-market-fund/"


def ncba(max_age_days: int = 10) -> dict:
    """NCBA prints a dated block per fund ("NCBA Money Market Fund (KES) August 18, 2026 Daily Yield x% Effective
    Annual Rate y%"); a banner above it carries a different, unlabelled figure, so only the named KES block is
    read. The page is not updated daily: a figure older than `max_age_days` is not published as current."""
    base = {"name": "NCBA Money Market Fund (KES)", "manager": "NCBA Investment Bank", "source": NCBA}
    try:
        t = text_of(NCBA)
    except Exception as error:
        return {**base, "status": f"error: {str(error)[:80]}"}
    m = re.search(r"NCBA Money Market Fund \(KES\)\s*([A-Z][a-z]+ \d{1,2},? \d{4})\s*Daily Yield\s*([\d.]+)%\s*Effective Annual Rate\s*([\d.]+)%", t)
    if not m:
        return {**base, "status": "pattern not found"}
    try:
        dated = datetime.strptime(m.group(1).replace(",", ""), "%B %d %Y").date()
    except ValueError:
        return {**base, "status": f"unreadable date: {m.group(1)}"}
    age = (datetime.now(NAIROBI).date() - dated).days
    if age > max_age_days:
        return {**base, "status": f"stale: the manager's page was last updated {dated:%d %b %Y}"}
    daily, effective = num(m.group(2)), num(m.group(3))
    if effective is None or not (0 < effective < 40):
        return {**base, "status": "implausible"}
    return {**base, "status": "ok", "daily_yield": daily, "effective_annual_yield": effective}


def bank_rates() -> list[dict]:
    """The CBK page is a wpDataTables table served through admin-ajax (table_id 17): ask for every row at once;
    fall back to the ten rows rendered in the page when that fails."""
    rows = []
    try:
        r = requests.post(
            "https://www.centralbank.go.ke/wp-admin/admin-ajax.php?action=get_wdtable&table_id=17",
            data={"draw": 1, "start": 0, "length": 2000, "order[0][column]": 0, "order[0][dir]": "desc"},
            headers={**UA, "Referer": CBK, "X-Requested-With": "XMLHttpRequest"},
            timeout=(15, 60),
            verify=False,
        )
        for rec in r.json().get("data", []):
            cells = [re.sub(r"<[^>]+>", "", str(c)).strip() for c in rec]
            year = next((c for c in cells if re.fullmatch(r"20\d\d", c)), None)
            mon = next((MONTHS.get(c[:3].lower()) for c in cells if c[:3].lower() in MONTHS), None)
            nums = [num(c) for c in cells if re.fullmatch(r"\d+(?:\.\d+)?", c) and not re.fullmatch(r"20\d\d", c)]
            if year and mon and len(nums) >= 4 and all(v is not None and 0 <= v < 60 for v in nums[:4]):
                rows.append({"month": f"{year}-{mon:02d}", "deposit": nums[0], "savings": nums[1], "lending": nums[2], "overdraft": nums[3]})
    except Exception as error:
        print(f"wpdatatables: {str(error)[:80]}")
    if not rows:
        t = text_of(CBK)
        for m in re.finditer(r"\b(20\d\d)\s+([A-Z][a-z]{2,8})\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\b", t):
            mon = MONTHS.get(m.group(2)[:3].lower())
            vals = [num(m.group(i)) for i in range(3, 7)]
            if mon and all(v is not None and 0 <= v < 60 for v in vals):
                rows.append({"month": f"{m.group(1)}-{mon:02d}", "deposit": vals[0], "savings": vals[1], "lending": vals[2], "overdraft": vals[3]})
    uniq = {}
    for r in rows:  # the CBK lists a revised row first for a month it restated; keep the first seen
        uniq.setdefault(r["month"], r)
    return sorted(uniq.values(), key=lambda r: r["month"], reverse=True)


def fund(entry):
    name, manager, url, pattern = entry
    try:
        t = text_of(url)
        matches = list(re.finditer(pattern, t, flags=re.I))
        if not matches:
            return {"name": name, "manager": manager, "source": url, "status": "pattern not found"}
        # A page that shows the same fund twice with different figures (an old ticker left beside the current
        # one) cannot tell us which is current: publish neither until it shows one.
        figures = sorted({m.group(0) for m in matches})
        if len(figures) > 1:
            return {"name": name, "manager": manager, "source": url, "status": "conflicting figures on the page: " + " / ".join(figures)[:160]}
        m = matches[0]
        daily = num(m.group(1))
        effective = num(m.group(2)) if m.group(2) else None
        if effective is None:  # a fund publishing only the effective annual yield
            effective, daily = daily, None
        if effective is None or not (0 < effective < 40):
            return {"name": name, "manager": manager, "source": url, "status": "implausible"}
        return {"name": name, "manager": manager, "source": url, "status": "ok", "daily_yield": daily, "effective_annual_yield": effective}
    except Exception as error:
        return {"name": name, "manager": manager, "source": url, "status": f"error: {type(error).__name__}: {str(error)[-160:]}"}


def append_history(ok: list[dict], read_at: datetime) -> None:
    """One row per fund per Nairobi day; a later read the same day replaces the earlier one."""
    day = read_at.astimezone(NAIROBI).date().isoformat()
    rows = json.loads(HISTORY.read_text(encoding="utf-8")).get("rows", []) if HISTORY.exists() else []
    names = {f["name"] for f in ok}
    rows = [r for r in rows if not (r["date"] == day and r["name"] in names)]
    for f in ok:
        rows.append({"date": day, "name": f["name"], "manager": f["manager"], "source": f["source"],
                     "daily_yield": f.get("daily_yield"), "effective_annual_yield": f["effective_annual_yield"]}
                    | ({"basis": f["basis"], "period_end": f["period_end"]} if f.get("basis") else {}))
    rows.sort(key=lambda r: (r["date"], r["name"]), reverse=True)
    HISTORY.write_text(json.dumps({
        "dataset": "Kenya money market fund yields, daily",
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "note": "Each row is the yield the fund manager published on its own website when Afronomics read it that day (Nairobi time). Effective annual yield, before fees and withholding tax.",
        "rows": rows,
    }, ensure_ascii=False, indent=0), encoding="utf-8")


def main() -> int:
    banks = bank_rates()
    with ThreadPoolExecutor(max_workers=4) as pool:
        funds = list(pool.map(fund, FUNDS))
    funds.append(etica())
    funds.append(ncba())
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
    if ok:
        append_history(ok, datetime.now(timezone.utc))
    return 0


if __name__ == "__main__":
    sys.exit(main())
