"""
Data health: is every figure the site shows as fresh as its publisher's own rhythm says it should be?

Reads the datasets in data/ (nothing from the network) and writes data/health.json, one line per market, fund or
series, each with a status:

    ok       up to date
    late     the publisher's next release is overdue here (a reader, or the publisher, has stalled)
    failed   the last read did not work (page changed, figures conflict, site down)
    gap      a known gap: the publisher does not put the figure anywhere we can read

"Late" is judged against each series' own history where it has one: a market that auctions weekly is late after
about a week and a half, one that auctions monthly after about six weeks. Runs at the end of every data run
(.github/workflows/african-auctions.yml); late and failed lines are printed as warnings on the run, and the site
shows the file at /status and on the desk.

    python scripts/data_health.py
"""

from __future__ import annotations

import json
import statistics
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = DATA / "health.json"
NAIROBI = timezone(timedelta(hours=3))

BILL_MARKETS = {
    "kenya": "Kenya",
    "nigeria": "Nigeria",
    "ghana": "Ghana",
    "uganda": "Uganda",
    "tanzania": "Tanzania",
    "egypt": "Egypt",
    "southafrica": "South Africa",
    "zambia": "Zambia",
    "malawi": "Malawi",
    "mozambique": "Mozambique",
}
POLICY_NAMES = {**BILL_MARKETS}


def load(rel: str):
    f = DATA / rel
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else None


def d(s: str | None) -> date | None:
    try:
        return date.fromisoformat(str(s)[:10]) if s else None
    except ValueError:
        return None


def item(area, name, status, detail, latest=None, due=None, link=None):
    return {"area": area, "name": name, "status": status, "detail": detail,
            "latest": latest.isoformat() if latest else None, "due_by": due.isoformat() if due else None, "link": link}


def rhythm(dates: list[date], default: int) -> int:
    """Typical days between releases: the median gap over the last dozen, at least 1."""
    ds = sorted(set(dates))[-13:]
    gaps = [(b - a).days for a, b in zip(ds, ds[1:]) if (b - a).days > 0]
    return max(1, int(statistics.median(gaps))) if len(gaps) >= 3 else default


def bills(today: date) -> list[dict]:
    out = []
    for slug, country in BILL_MARKETS.items():
        raw = load(f"{slug}/tbill_auctions.json")
        link = f"/markets/tbills/{slug}" if slug != "kenya" else "/markets/kenya-tbills"
        if not raw or not raw.get("rows"):
            out.append(item("T-bill auctions", country, "failed", "no auction results on file", link=link))
            continue
        dates = [x for x in (d(r.get("auction_date") or r.get("value_date")) for r in raw["rows"]) if x and x <= today + timedelta(days=7)]
        latest = max(dates)
        gap = rhythm(dates, 14)
        # A release is late once a full extra cycle has passed, with a few days' grace for slow postings.
        due = latest + timedelta(days=gap + max(4, gap // 2))
        every = "weekly" if gap <= 8 else "every two weeks" if gap <= 16 else "monthly" if gap <= 35 else f"every {gap} days"
        if today > due:
            out.append(item("T-bill auctions", country, "late", f"latest auction {latest:%d %b}; it usually auctions {every}", latest, due, link))
        else:
            out.append(item("T-bill auctions", country, "ok", f"latest auction {latest:%d %b} (auctions {every})", latest, due, link))
    return out


def funds(today: date) -> list[dict]:
    out = []
    rates = load("kenya/rates.json") or {}
    mmf = rates.get("money_market_funds", {})
    for u in mmf.get("unread", []):
        status = u.get("status", "")
        why = "the manager's page shows two different yields" if status.startswith("conflicting") else status
        out.append(item("Money market funds", u["name"], "failed", f"not read on the last run: {why}", link="/rates/kenya/money-market-funds"))
    current = {r["name"] for r in mmf.get("rows", [])}
    hist = (load("kenya/mmf_history.json") or {}).get("rows", [])
    for name in sorted(current):
        rs = sorted((r for r in hist if r["name"] == name), key=lambda r: r["date"])
        if not rs:
            continue
        last = rs[-1]
        latest = d(last["date"])
        if last.get("period_end"):  # a monthly fact sheet: next one due about five weeks after the month it covers
            end = d(last["period_end"])
            due = end + timedelta(days=40)
            status = "late" if today > due else "ok"
            out.append(item("Money market funds", name, status, f"monthly fact sheet for {end:%B %Y}", end, due, "/rates/kenya/money-market-funds"))
            continue
        # Unchanged for a week or more: the manager's page has probably stopped updating.
        same = [r for r in rs if r["effective_annual_yield"] == last["effective_annual_yield"]]
        run_start = latest
        for r in reversed(rs):
            if r["effective_annual_yield"] != last["effective_annual_yield"]:
                break
            run_start = d(r["date"])
        if (latest - run_start).days >= 7 and len(same) >= 4:
            out.append(item("Money market funds", name, "late",
                            f"published yield unchanged at {last['effective_annual_yield']}% since {run_start:%d %b}: the page may not be current",
                            run_start, None, "/rates/kenya/money-market-funds"))
        else:
            out.append(item("Money market funds", name, "ok", f"{last['effective_annual_yield']}% read {latest:%d %b}", latest, None, "/rates/kenya/money-market-funds"))
    bank = (rates.get("bank_rates") or {}).get("rows") or []
    if bank:
        month = d(bank[0]["month"] + "-01")
        # The CBK publishes a month's bank averages about six weeks after it ends.
        due = (month + timedelta(days=32)).replace(day=1) + timedelta(days=75)
        out.append(item("Bank rates", "Kenya bank averages (CBK)", "late" if today > due else "ok", f"latest month {month:%B %Y}", month, due, "/rates/kenya"))
    return out


def policy(today: date) -> list[dict]:
    out = []
    raw = load("policy_rates.json") or {}
    for r in raw.get("rows", []):
        read = d(r.get("read_at"))
        name = POLICY_NAMES.get(r["market"], r["market"])
        # Read on every weekday run: more than four days without a successful read means the reader is failing.
        status = "late" if read and (today - read).days > 4 else "ok"
        out.append(item("Policy rates", name, status, f"{r['rate']}% read {read:%d %b}" if read else f"{r['rate']}%", read, None, "/rates/policy"))
    for u in raw.get("unread", []):
        name = POLICY_NAMES.get(u["market"], u["market"])
        if u["status"] == "not yet readable as text":
            out.append(item("Policy rates", name, "gap", "the central bank does not publish the rate anywhere it can be read automatically", link="/rates/policy"))
        elif not any(x["name"] == name for x in out):
            out.append(item("Policy rates", name, "failed", f"not read on the last run: {u['status']}", link="/rates/policy"))
    return out


def others(today: date) -> list[dict]:
    out = []
    euro = load("eurobonds.json") or {}
    for key, c in (euro.get("countries") or {}).items():
        latest = d((c.get("latest") or {}).get("date"))
        if not latest:
            continue
        gap = 4 if key == "nigeria" else 9  # DMO prices daily; the CBK bulletin is weekly
        due = latest + timedelta(days=gap)
        out.append(item("Eurobond yields", c.get("country", key.title()), "late" if today > due else "ok", f"latest prices {latest:%d %b}", latest, due, "/markets/eurobonds"))
    bond = (load("nigeria/savings_bond.json") or {}).get("latest") or {}
    if bond.get("opening"):
        opening = d(bond["opening"])
        due = (opening + timedelta(days=32)).replace(day=1) + timedelta(days=10)  # the next month's offer opens early in the month
        out.append(item("Savings bonds", "Nigeria FGN Savings Bond", "late" if today > due else "ok", f"{bond['offer']} offer", opening, due, "/rates/nigeria/savings-bond"))
    for country in ("nigeria", "ghana"):
        rows = (load(f"{country}/bank_rates.json") or {}).get("rows") or []
        if rows:
            month = max(d(r["month"] + "-01") for r in rows)
            due = (month + timedelta(days=32)).replace(day=1) + timedelta(days=90)
            out.append(item("Bank rates", f"{country.title()} bank rates", "late" if today > due else "ok", f"latest month {month:%B %Y}", month, due, f"/rates/{country}/check"))
    return out


def main() -> int:
    today = datetime.now(NAIROBI).date()
    items = bills(today) + funds(today) + policy(today) + others(today)
    order = {"failed": 0, "late": 1, "gap": 2, "ok": 3}
    items.sort(key=lambda x: (order[x["status"]], x["area"], x["name"]))
    summary = {s: sum(1 for x in items if x["status"] == s) for s in order}
    for x in items:
        if x["status"] in ("late", "failed"):
            print(f"::warning title=Data {x['status']}::{x['area']}: {x['name']}: {x['detail']}")
    print(f"data health: {summary}")
    previous = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    if previous.get("items") == items:
        return 0  # unchanged: leave the file (and its date) alone so it does not trigger a commit on its own
    OUT.write_text(json.dumps({
        "dataset": "Afronomics data health",
        "note": "Whether each figure on the site is as fresh as its publisher's own release rhythm says it should be. Written by scripts/data_health.py at the end of each data run.",
        "checked_on": today.isoformat(),
        "summary": summary,
        "items": items,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
