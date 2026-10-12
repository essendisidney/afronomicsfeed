"""
Story finder: which change in our own data touches people's money most this week?

Reads the datasets in data/ (nothing from the network) and writes data/story_leads.json: candidate stories, best
first. Each lead carries every figure a story may use, already worked out and formatted (rates, changes, what
100,000 in local money earns), with the publisher's source for each. The writer uses only these figures, and
scripts/story_check.py rejects a draft that prints any other number.

Kinds of lead:
    bill_move     a T-bill rate moved at the latest auction (every market we track)
    policy_move   a central bank changed its policy rate
    fund_vs_bill  Kenya: the best money market fund, the median one, the 91-day bill and a bank savings account
    send_money    the cheapest way to send money into a country, against the average service

Leads already published (data/story_log.json) are left out, and a market written about in the last week counts
for less, so the same story does not run twice.

    python scripts/story_finder.py
"""

from __future__ import annotations

import json
import statistics
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = DATA / "story_leads.json"
LOG = DATA / "story_log.json"
NAIROBI = timezone(timedelta(hours=3))

MARKETS = {
    # slug: (country, currency code, currency word, weight: how many of our readers it reaches)
    "kenya": ("Kenya", "KES", "shillings", 3.0),
    "nigeria": ("Nigeria", "NGN", "naira", 2.5),
    "ghana": ("Ghana", "GHS", "cedis", 2.0),
    "uganda": ("Uganda", "UGX", "shillings", 1.5),
    "tanzania": ("Tanzania", "TZS", "shillings", 1.5),
    "egypt": ("Egypt", "EGP", "pounds", 1.0),
    "southafrica": ("South Africa", "ZAR", "rand", 1.0),
    "zambia": ("Zambia", "ZMW", "kwacha", 1.0),
    "malawi": ("Malawi", "MWK", "kwacha", 1.0),
    "mozambique": ("Mozambique", "MZN", "meticais", 1.0),
}
# A round sum people in each market recognise, so "what it earns" is in money they hold.
STAKE = {"kenya": 100_000, "nigeria": 1_000_000, "ghana": 10_000, "uganda": 1_000_000, "tanzania": 1_000_000,
         "egypt": 100_000, "southafrica": 10_000, "zambia": 10_000, "malawi": 1_000_000, "mozambique": 100_000}
TENORS = (91, 182, 364)
KENYA_WHT = 15  # withholding tax on Treasury bill and money market fund interest in Kenya, %
TOOLS = {
    "kenya": ("/markets/kenya-tbills", "Kenya T-bill results since 2011"),
}
RATE_KEY = {"nigeria": "stop_rate"}


def load(rel: str):
    f = DATA / rel
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else None


def money(x: float) -> str:
    return f"{x:,.0f}"


def pct(x: float) -> str:
    return f"{x:.2f}%"


def pts(x: float) -> str:
    return f"{abs(x):.2f} points"


def fact(key: str, label: str, display: str, source: str | None = None, when: str | None = None) -> dict:
    return {"key": key, "label": label, "display": display, "source": source, "date": when}


def nice_date(s: str) -> str:
    d = date.fromisoformat(s[:10])
    return f"{d.day} {d:%B %Y}"


def bill_rows(slug: str) -> list[dict]:
    raw = load(f"{slug}/tbill_auctions.json") or {}
    out = []
    for r in raw.get("rows", []):
        if r.get("kind") not in (None, "primary"):
            continue
        rate = r.get(RATE_KEY.get(slug, "weighted_avg_rate"))
        when = str(r.get("value_date") or r.get("auction_date") or "")[:10]
        if r.get("tenor") in TENORS and isinstance(rate, (int, float)) and len(when) == 10:
            out.append({"tenor": r["tenor"], "date": when, "rate": float(rate), "source": r.get("source") or raw.get("source_page")})
    out.sort(key=lambda r: r["date"], reverse=True)
    return out


def bill_moves(today: date) -> list[dict]:
    leads = []
    stale = doubted("T-bill auctions")
    for slug, (country, cur, word, weight) in MARKETS.items():
        if country in stale:
            continue
        rows = bill_rows(slug)
        if not rows:
            continue
        latest_date = rows[0]["date"]
        if (today - date.fromisoformat(latest_date)).days > 10:
            continue  # not news any more
        stake = STAKE[slug]
        facts, best = [], None
        for tenor in TENORS:
            series = [r for r in rows if r["tenor"] == tenor]
            if len(series) < 2 or series[0]["date"] != latest_date:
                continue
            now, prev = series[0], series[1]
            change = now["rate"] - prev["rate"]
            year_ago = next((r for r in series if date.fromisoformat(r["date"]) <= date.fromisoformat(now["date"]) - timedelta(days=358)), None)
            t = f"{tenor}-day"
            facts += [
                fact(f"{tenor}_rate", f"{t} bill rate, auction of {nice_date(now['date'])}", pct(now["rate"]), now["source"], now["date"]),
                fact(f"{tenor}_prev", f"{t} bill rate at the auction before, {nice_date(prev['date'])}", pct(prev["rate"]), prev["source"], prev["date"]),
                fact(f"{tenor}_change", f"{t} change since the auction before ({'up' if change > 0 else 'down' if change < 0 else 'unchanged'})", pts(change)),
                fact(f"{tenor}_earns", f"{cur} {money(stake)} at the {t} rate earns in a year, before tax", f"{cur} {money(stake * now['rate'] / 100)}"),
                fact(f"{tenor}_earns_prev", f"…and at the auction before", f"{cur} {money(stake * prev['rate'] / 100)}"),
                fact(f"{tenor}_earns_diff", f"difference in a year on {cur} {money(stake)}", f"{cur} {money(abs(stake * change / 100))}"),
            ]
            if slug == "kenya":
                facts.append(fact(f"{tenor}_after_tax", f"{t}: what KES {money(stake)} earns in a year after the {KENYA_WHT}% withholding tax",
                                  f"KES {money(stake * now['rate'] / 100 * (1 - KENYA_WHT / 100))}"))
            if year_ago:
                facts += [
                    fact(f"{tenor}_year_ago", f"{t} rate a year earlier, {nice_date(year_ago['date'])}", pct(year_ago["rate"]), year_ago["source"], year_ago["date"]),
                    fact(f"{tenor}_year_change", f"{t} change over the year ({'up' if now['rate'] > year_ago['rate'] else 'down'})", pts(now["rate"] - year_ago["rate"])),
                ]
            if best is None or abs(change) > abs(best[1]):
                best = (tenor, change)
        if not best:
            continue
        tenor, change = best
        # Score: size of the move in points, weighted by how many readers the market reaches. A move under five
        # basis points is noise, not a story.
        score = round(abs(change) * 10 * weight, 2) if abs(change) >= 0.05 else 0.0
        direction = "rose" if change > 0 else "fell"
        href, label = TOOLS.get(slug, (f"/markets/tbills/{slug}", f"{country} T-bill results"))
        leads.append({
            "id": f"bill_move:{slug}:{latest_date}",
            "kind": "bill_move", "market": slug, "country": country, "score": score,
            "angle": f"{country}'s {tenor}-day bill rate {direction} {pts(change)}: what that means for {cur} {money(stake)} of savings",
            "facts": facts,
            "tool": {"href": href, "label": label},
            "alert": {"href": "/alerts", "label": "Get the next result by email"},
            "notes": [
                "Earnings are a year at the auction rate before tax, unless a fact says after tax." ,
                "The rate is the weighted average (Nigeria: the stop rate) printed by the central bank.",
            ],
        })
    return leads


def policy_moves(today: date) -> list[dict]:
    hist = (load("policy_rate_history.json") or {}).get("rows", [])
    leads = []
    for slug in {r["market"] for r in hist}:
        rs = sorted((r for r in hist if r["market"] == slug), key=lambda r: r["first_seen"])
        if len(rs) < 2:
            continue
        now, prev = rs[-1], rs[-2]
        if now["rate"] == prev["rate"] or (today - date.fromisoformat(now["first_seen"])).days > 14:
            continue
        country, cur, _, weight = MARKETS.get(slug, (slug.title(), "", "", 1.0))
        change = now["rate"] - prev["rate"]
        leads.append({
            "id": f"policy_move:{slug}:{now['first_seen']}",
            "kind": "policy_move", "market": slug, "country": country, "score": round(20 * weight, 2),
            "angle": f"{country}'s central bank {'raised' if change > 0 else 'cut'} its policy rate to {pct(now['rate'])}: what it changes for savers and borrowers",
            "facts": [
                fact("rate", "policy rate now", pct(now["rate"]), now.get("source"), now["first_seen"]),
                fact("prev", "policy rate before", pct(prev["rate"]), prev.get("source"), prev["first_seen"]),
                fact("change", f"change ({'up' if change > 0 else 'down'})", pts(change)),
            ],
            "tool": {"href": "/rates/policy", "label": "Africa's policy rates"},
            "alert": {"href": "/alerts", "label": "Get rate changes by email"},
            "notes": ["first_seen is when our reader first saw the new rate on the central bank's site, not the decision date."],
        })
    return leads


def doubted(area: str) -> set[str]:
    """Names the data health check marks late or failed in an area: a story never quotes a figure it doubts."""
    return {x["name"] for x in (load("health.json") or {}).get("items", []) if x["area"] == area and x["status"] in ("late", "failed")}


def fund_vs_bill(today: date) -> list[dict]:
    rates = load("kenya/rates.json") or {}
    stale = doubted("Money market funds")
    funds = [f for f in (rates.get("money_market_funds") or {}).get("rows") or [] if f["name"] not in stale]
    if len(funds) < 3:
        return []
    ranked = sorted(funds, key=lambda f: f["effective_annual_yield"], reverse=True)
    best, worst = ranked[0], ranked[-1]
    median = statistics.median(f["effective_annual_yield"] for f in ranked)
    bill = next((r for r in bill_rows("kenya") if r["tenor"] == 91), None)
    bank = ((rates.get("bank_rates") or {}).get("rows") or [None])[0]
    stake = STAKE["kenya"]
    after = lambda y: stake * y / 100 * (1 - KENYA_WHT / 100)
    as_of = str((rates.get("money_market_funds") or {}).get("as_of") or today.isoformat())[:10]
    facts = [
        fact("best", f"highest yield read: {best['name']} ({best['manager']})", pct(best["effective_annual_yield"]), best.get("source"), as_of),
        fact("best_earns", f"KES {money(stake)} in {best['name']} for a year after {KENYA_WHT}% tax", f"KES {money(after(best['effective_annual_yield']))}"),
        fact("lowest", f"lowest yield read: {worst['name']}", pct(worst["effective_annual_yield"]), worst.get("source"), as_of),
        fact("lowest_earns", f"KES {money(stake)} in {worst['name']} for a year after tax", f"KES {money(after(worst['effective_annual_yield']))}"),
        fact("best_vs_lowest", f"difference in a year after tax on KES {money(stake)}, best against lowest", f"KES {money(after(best['effective_annual_yield']) - after(worst['effective_annual_yield']))}"),
        fact("median", f"median of the {len(ranked)} funds read", pct(median)),
        fact("funds_read", "funds whose yield we could read from the manager's own site", str(len(ranked))),
    ]
    if bill:
        facts += [
            fact("bill91", f"91-day Treasury bill, auction of {nice_date(bill['date'])}", pct(bill["rate"]), bill["source"], bill["date"]),
            fact("bill91_earns", f"KES {money(stake)} at the 91-day bill rate for a year after tax", f"KES {money(after(bill['rate']))}"),
            fact("best_vs_bill", f"best fund minus 91-day bill ({'above' if best['effective_annual_yield'] > bill['rate'] else 'below'})", pts(best["effective_annual_yield"] - bill["rate"])),
        ]
    if bank:
        facts += [
            fact("savings", f"average bank savings rate, {date.fromisoformat(bank['month'] + '-01'):%B %Y} (Central Bank of Kenya)", pct(bank["savings"]), rates["bank_rates"].get("source")),
            fact("savings_earns", f"KES {money(stake)} in an average savings account for a year after tax", f"KES {money(after(bank['savings']))}"),
            fact("best_vs_savings", "a year after tax on KES 100,000: best fund minus savings account", f"KES {money(after(best['effective_annual_yield']) - after(bank['savings']))}"),
        ]
    # Who led a week ago, from the daily history.
    hist = (load("kenya/mmf_history.json") or {}).get("rows", [])
    week = (today - timedelta(days=7)).isoformat()
    old = [r for r in hist if r["date"] <= week and r["name"] not in stale]
    if old:
        d = max(r["date"] for r in old)
        top = max((r for r in old if r["date"] == d), key=lambda r: r["effective_annual_yield"])
        facts.append(fact("leader_week_ago", f"highest yield on {nice_date(d)}: {top['name']}", pct(top["effective_annual_yield"]), top.get("source"), d))
        changed = top["name"] != best["name"]
    else:
        changed = False
    gap = best["effective_annual_yield"] - (bank["savings"] if bank else median)
    return [{
        "id": f"fund_vs_bill:kenya:{as_of}:{best['name']}",
        "kind": "fund_vs_bill", "market": "kenya", "country": "Kenya",
        # Fewer than four funds read is too thin a table to call anyone "the best".
        "score": round((gap * 1.5 + (8 if changed else 0)) * (1 if len(ranked) >= 4 else 0.3), 2),
        "angle": ("A new fund leads Kenya's money market table" if changed else "Where KES 100,000 earns most this week")
                 + ": the best fund, the 91-day bill and a bank savings account, after tax",
        "facts": facts,
        "tool": {"href": "/rates/kenya/money-market-funds", "label": "Kenya money market funds compared"},
        "alert": {"href": "/rates/kenya/best-money-market-fund", "label": "This month's money market fund ranking"},
        "notes": [
            "Fund yields are as each manager publishes them (net of fees, before tax). Past yields do not promise future ones.",
            "We read only the funds whose managers publish a yield we can read; the table is not the whole market.",
        ],
    }]


def send_money(today: date) -> list[dict]:
    raw = load("remittances/corridors.json") or {}
    leads = []
    usd = lambda pct_: f"${200 * pct_ / 100:.2f}"
    for dst, slug in (("KEN", "kenya"), ("NGA", "nigeria"), ("GHA", "ghana"), ("UGA", "uganda"), ("ZAF", "south-africa")):
        cs = sorted((c for c in raw.get("corridors", []) if c["dst"] == dst and c.get("firms")), key=lambda c: -c["services"])
        if not cs:
            continue
        country = cs[0]["dst_name"]
        facts = [fact("period", "World Bank survey period", raw.get("period", ""), raw.get("source_page"), raw.get("period"))]
        best_save = None
        for c in cs:
            k, src = c["src"].lower(), c["src_name"]
            cheap, avg = c["cheapest"], c["avg_cost_pct"]
            save = 200 * (avg - cheap["cost_pct"]) / 100
            facts += [
                fact(f"{k}_cheapest", f"from {src}: cheapest of {c['services']} services surveyed, {cheap['firm']}, cost of sending $200", usd(cheap["cost_pct"])),
                fact(f"{k}_cheapest_pct", f"from {src}: …as a share of the amount", pct(cheap["cost_pct"])),
                fact(f"{k}_average", f"from {src}: average service, cost of sending $200", usd(avg)),
                fact(f"{k}_average_pct", f"from {src}: …as a share", pct(avg)),
                fact(f"{k}_dearest", f"from {src}: dearest service surveyed", usd(c["dearest_pct"])),
                fact(f"{k}_saving", f"from {src}: cheapest against average, on each $200", f"${save:.2f}"),
                fact(f"{k}_saving_year", f"from {src}: …over a year of monthly $200 transfers", f"${save * 12:.2f}"),
            ]
            # Lead only with a corridor well surveyed and not skewed by a few extreme quotes.
            if c["services"] >= 10 and avg <= 20 and (best_save is None or save > best_save[0]):
                best_save = (save, c)
        if not best_save:
            continue
        save, c = best_save
        leads.append({
            "id": f"send_money:{dst}:{raw.get('period')}",
            "kind": "send_money", "market": slug, "country": country, # Capped: the survey's dearest quotes are outliers, and a story should not chase them.
            "score": round(min(save * 0.6, 12), 2),
            "angle": f"Sending money to {country}: from {c['src_name']} the cheapest service costs {usd(c['cheapest']['cost_pct'])} on $200, the average {usd(c['avg_cost_pct'])}",
            "facts": facts,
            "tool": {"href": f"/send-money/{slug}", "label": f"Cheapest way to send money to {country}"},
            "alert": None,
            "notes": [
                "Costs are the World Bank's survey (fee plus exchange-rate margin, as a share of $200); live prices differ.",
                "We may earn a referral fee from some providers listed on the tool page: say so in the story.",
                "Corridors with fewer than 10 services surveyed are thin: do not lead with them.",
                "The dearest quote in a corridor is often an outlier: mention it only beside the average.",
            ],
        })
    return leads


def main() -> int:
    today = datetime.now(NAIROBI).date()
    published = load("story_log.json") or {"stories": []}
    done = {s["lead"] for s in published["stories"]}
    recent = {s["market"] for s in published["stories"] if (today - date.fromisoformat(s["date"])).days < 7}
    leads = bill_moves(today) + policy_moves(today) + fund_vs_bill(today) + send_money(today)
    for l in leads:
        l["published"] = l["id"] in done  # kept, last, so a published story can still be checked against its lead
        if l["published"]:
            l["score"] = 0.0
        elif l["market"] in recent:
            l["score"] = round(l["score"] / 2, 2)
    leads.sort(key=lambda l: (not l["published"], l["score"]), reverse=True)
    OUT.write_text(json.dumps({"made_on": today.isoformat(), "note": "Candidate stories, best first. Written by scripts/story_finder.py.", "leads": leads},
                              ensure_ascii=False, indent=1), encoding="utf-8")
    for l in [l for l in leads if not l["published"]][:8]:
        print(f"{l['score']:6.2f}  {l['id']}\n        {l['angle']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
