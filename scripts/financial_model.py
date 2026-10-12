"""
Afronomics financial model: three scenarios (conservative, base, aggressive), month by month for ten years, toward
USD 1 million a month in revenue (docs/strategy/usd-1m-plan.md).

Every number here is an ASSUMPTION, written down so it can be argued with and replaced by evidence as it arrives
(pilot conversions, real churn, real deal sizes from the desk's pipeline). Nothing in this model is revenue.
Starting point (12 Oct 2026): USD 0 collected, no signed contracts, no paying subscribers.

    python scripts/financial_model.py            # writes docs/strategy/afronomics-financial-model.xlsx and prints a summary
"""

from __future__ import annotations

import json
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "strategy" / "afronomics-financial-model.xlsx"
MODEL_JSON = ROOT / "data" / "strategy" / "model.json"  # read by the desk's command centre (model vs reality)
START = "2026-10"  # month 1 of the model
MONTHS = 120
MILESTONES = [10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000]


@dataclass
class Scenario:
    name: str
    # Institutional data and intelligence licences (frontier local debt first, then more datasets and sectors).
    new_logos_start: float  # new paying institutions a month at month 1 after first sale
    new_logos_growth: float  # monthly growth of that rate (compounding), capped below
    new_logos_cap: float  # most new institutions a month the sales team can close
    tam_institutions: float  # institutions that could plausibly buy African market data and intelligence (sales slow toward it)
    first_sale_month: int  # month of the first paid institutional contract
    acv_start: float  # average annual contract value, USD, of a new institution
    acv_growth_yearly: float  # yearly rise in new-contract value (more datasets, enterprise tiers, seats)
    acv_cap: float
    logo_churn_yearly: float  # share of institutions that leave in a year
    expansion_yearly: float  # yearly price/seat growth on retained institutions (net of downgrades)
    # Research, advisory and custom reports (project revenue): a share of licence revenue once relationships exist.
    research_share: float
    # Consumer and SME subscriptions (tender alerts, Pro): driven by audience.
    visitors_start: float  # monthly visitors at month 1
    visitors_growth: float  # monthly growth
    visitors_cap: float
    paid_conversion: float  # paying subscribers as a share of monthly visitors (stock)
    consumer_arpu_usd: float  # a month
    consumer_churn_monthly: float
    # Advertising, sponsorship and referral fees, per 1,000 monthly visitors.
    rpm_usd: float
    # Costs.
    gross_margin_data: float  # after data delivery, hosting, AI inference and payment fees
    team_start: int  # people at month 1 (including the founder, unpaid at first)
    planned_hires_monthly: float  # newsroom, data and engineering hires ahead of revenue
    cost_per_head_usd: float  # fully loaded, a month (blended Nairobi/Lagos/remote)
    heads_per_100k_mrr: float  # hiring as revenue grows
    sales_cost_per_new_logo: float  # CAC: sales salaries, travel, events, per new institution
    marketing_per_visitor_usd: float  # paid and content acquisition, per new monthly visitor
    fixed_opex_usd: float  # software, legal, audit, office, a month
    notes: str = ""


SCENARIOS = [
    Scenario(
        "Conservative", new_logos_start=0.3, new_logos_growth=0.04, new_logos_cap=6, tam_institutions=350, first_sale_month=6,
        acv_start=10_000, acv_growth_yearly=0.10, acv_cap=30_000, logo_churn_yearly=0.20, expansion_yearly=0.03,
        research_share=0.10, visitors_start=1_500, visitors_growth=0.06, visitors_cap=400_000, paid_conversion=0.002,
        consumer_arpu_usd=5, consumer_churn_monthly=0.08, rpm_usd=2.0, gross_margin_data=0.78, team_start=1,
        planned_hires_monthly=0.05, cost_per_head_usd=4_000, heads_per_100k_mrr=9.0, sales_cost_per_new_logo=12_000, marketing_per_visitor_usd=0.15,
        fixed_opex_usd=1_500, notes="Few pilots convert; one founder sells; churn as for an unproven vendor.",
    ),
    Scenario(
        "Base", new_logos_start=0.6, new_logos_growth=0.05, new_logos_cap=15, tam_institutions=900, first_sale_month=4,
        acv_start=15_000, acv_growth_yearly=0.15, acv_cap=50_000, logo_churn_yearly=0.12, expansion_yearly=0.06,
        research_share=0.15, visitors_start=1_500, visitors_growth=0.08, visitors_cap=1_500_000, paid_conversion=0.003,
        consumer_arpu_usd=6, consumer_churn_monthly=0.06, rpm_usd=3.0, gross_margin_data=0.80, team_start=1,
        planned_hires_monthly=0.15, cost_per_head_usd=5_000, heads_per_100k_mrr=8.0, sales_cost_per_new_logo=10_000, marketing_per_visitor_usd=0.12,
        fixed_opex_usd=2_500, notes="The frontier-debt product finds a niche; a first salesperson from month 9; data expands to more sectors.",
    ),
    Scenario(
        "Aggressive", new_logos_start=1.0, new_logos_growth=0.07, new_logos_cap=30, tam_institutions=2_000, first_sale_month=3,
        acv_start=20_000, acv_growth_yearly=0.20, acv_cap=75_000, logo_churn_yearly=0.08, expansion_yearly=0.10,
        research_share=0.20, visitors_start=1_500, visitors_growth=0.11, visitors_cap=4_000_000, paid_conversion=0.004,
        consumer_arpu_usd=7, consumer_churn_monthly=0.05, rpm_usd=4.0, gross_margin_data=0.82, team_start=1,
        planned_hires_monthly=0.6, cost_per_head_usd=6_000, heads_per_100k_mrr=7.0, sales_cost_per_new_logo=9_000, marketing_per_visitor_usd=0.10,
        fixed_opex_usd=4_000, notes="Raises capital early and hires ahead of revenue; index-driven demand is strong; becomes the default African local-debt feed and expands across sectors and countries.",
    ),
]


def simulate(s: Scenario) -> list[dict]:
    rows = []
    logos = 0.0
    licence_mrr = 0.0
    subs = 0.0
    visitors = s.visitors_start
    cash = 0.0
    rate = s.new_logos_start
    acv = s.acv_start
    for m in range(1, MONTHS + 1):
        year_frac = (m - 1) / 12
        # Institutions.
        new = 0.0
        if m >= s.first_sale_month:
            new = min(rate, s.new_logos_cap) * max(0.0, 1 - logos / s.tam_institutions)
            rate *= 1 + s.new_logos_growth
        acv = min(s.acv_start * (1 + s.acv_growth_yearly) ** year_frac, s.acv_cap)
        churn_m = 1 - (1 - s.logo_churn_yearly) ** (1 / 12)
        expand_m = (1 + s.expansion_yearly) ** (1 / 12) - 1
        lost = logos * churn_m
        licence_mrr = licence_mrr * (1 - churn_m) * (1 + expand_m) + new * acv / 12
        logos = logos - lost + new
        research = licence_mrr * s.research_share
        # Audience and subscribers.
        prev_visitors = visitors
        visitors = min(visitors * (1 + s.visitors_growth), s.visitors_cap)
        target_subs = visitors * s.paid_conversion
        subs = subs * (1 - s.consumer_churn_monthly) + max(0.0, target_subs - subs * (1 - s.consumer_churn_monthly))
        consumer = subs * s.consumer_arpu_usd
        ads = visitors / 1000 * s.rpm_usd
        revenue = licence_mrr + research + consumer + ads
        recurring = licence_mrr + consumer
        # Costs.
        cogs = revenue * (1 - s.gross_margin_data)
        heads = s.team_start + s.planned_hires_monthly * m + revenue / 100_000 * s.heads_per_100k_mrr
        paid_heads = max(0.0, heads - 1) if m <= 6 else heads  # the founder is unpaid for the first six months
        team = paid_heads * s.cost_per_head_usd
        sales = new * s.sales_cost_per_new_logo
        marketing = max(0.0, visitors - prev_visitors) * s.marketing_per_visitor_usd
        ai = 300 + revenue * 0.02  # model inference for the newsroom, extraction and analytics
        opex = team + sales + marketing + ai + s.fixed_opex_usd
        profit = revenue - cogs - opex
        cash += profit
        rows.append({
            "month": m, "institutions": round(logos, 1), "new_institutions": round(new, 2), "acv_new": round(acv),
            "licence_mrr": round(licence_mrr), "research": round(research), "subscribers": round(subs),
            "consumer": round(consumer), "visitors": round(visitors), "ads_referrals": round(ads), "revenue": round(revenue),
            "recurring": round(recurring), "gross_profit": round(revenue - cogs), "team_heads": round(heads, 1),
            "team_cost": round(team), "sales_cost": round(sales), "marketing": round(marketing), "ai_infra": round(ai),
            "opex": round(opex), "profit": round(profit), "cash_cumulative": round(cash),
        })
    return rows


def summarise(s: Scenario, rows: list[dict]) -> dict:
    hit = {m: next((r["month"] for r in rows if r["revenue"] >= m), None) for m in MILESTONES}
    trough = min(rows, key=lambda r: r["cash_cumulative"])
    breakeven = next((r["month"] for r in rows if r["profit"] > 0 and r["month"] > 6), None)
    y = lambda k, yr: sum(r[k] for r in rows[(yr - 1) * 12 : yr * 12])
    last = rows[-1]
    churn_m = 1 - (1 - s.logo_churn_yearly) ** (1 / 12)
    acv5 = rows[59]["acv_new"]
    ltv = (acv5 / 12) * s.gross_margin_data / churn_m if churn_m else None
    biggest_share = None
    if last["revenue"]:
        biggest_share = round(max(last["licence_mrr"], last["consumer"], last["ads_referrals"], last["research"]) / last["revenue"], 2)
    return {
        "scenario": s.name,
        "months_to_milestone": hit,
        "revenue_year": {yr: y("revenue", yr) for yr in range(1, 11)},
        "monthly_revenue_end_year": {yr: rows[yr * 12 - 1]["revenue"] for yr in range(1, 11)},
        "institutions_end_year": {yr: rows[yr * 12 - 1]["institutions"] for yr in range(1, 11)},
        "capital_required_usd": -trough["cash_cumulative"] if trough["cash_cumulative"] < 0 else 0,
        "cash_trough_month": trough["month"],
        "first_profitable_month": breakeven,
        "cac_per_institution_usd": s.sales_cost_per_new_logo,
        "ltv_per_institution_usd": round(ltv) if ltv else None,
        "ltv_to_cac": round(ltv / s.sales_cost_per_new_logo, 1) if ltv else None,
        "gross_margin": s.gross_margin_data,
        "largest_stream_share_month_120": biggest_share,
        "notes": s.notes,
    }


def write_xlsx(results: list[tuple[Scenario, list[dict], dict]]) -> None:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill

    wb = Workbook()
    ws = wb.active
    ws.title = "Read me"
    lines = [
        "Afronomics financial model: three scenarios toward USD 1 million a month",
        "Generated by scripts/financial_model.py. Every figure is an assumption, not revenue. Starting point 12 Oct 2026: USD 0 collected, no signed contracts.",
        "Replace assumptions with evidence as it arrives (pilot conversion, deal sizes and churn from the desk's command centre), then re-run.",
        "Sheets: Summary (milestones, capital, unit economics), Assumptions, one monthly sheet per scenario.",
    ]
    for i, t in enumerate(lines, 1):
        ws.cell(i, 1, t).font = Font(bold=i == 1, size=13 if i == 1 else 11)
    ws.column_dimensions["A"].width = 140

    sm = wb.create_sheet("Summary")
    bold = Font(bold=True)
    head = PatternFill("solid", fgColor="E8ECE6")
    sm.append(["Measure"] + [r[0].name for r in results])
    for c in sm[1]:
        c.font, c.fill = bold, head
    for m in MILESTONES:
        sm.append([f"Month first reaching ${m:,} a month"] + [r[2]["months_to_milestone"][m] or "not within 10 years" for r in results])
    for yr in (1, 2, 3, 5, 7, 10):
        sm.append([f"Revenue in year {yr}, USD"] + [r[2]["revenue_year"][yr] for r in results])
    for yr in (1, 3, 5, 10):
        sm.append([f"Monthly revenue at end of year {yr}, USD"] + [r[2]["monthly_revenue_end_year"][yr] for r in results])
    for yr in (1, 3, 5, 10):
        sm.append([f"Paying institutions at end of year {yr}"] + [r[2]["institutions_end_year"][yr] for r in results])
    for k, label in [
        ("capital_required_usd", "Capital required (deepest cumulative loss), USD"),
        ("cash_trough_month", "Month of the cash trough"),
        ("first_profitable_month", "First profitable month (after month 6)"),
        ("cac_per_institution_usd", "CAC per institution, USD"),
        ("ltv_per_institution_usd", "LTV per institution (year-5 contract), USD"),
        ("ltv_to_cac", "LTV / CAC"),
        ("gross_margin", "Gross margin, data"),
        ("largest_stream_share_month_120", "Largest revenue stream's share at month 120 (concentration)"),
        ("notes", "Story"),
    ]:
        sm.append([label] + [r[2][k] if r[2][k] is not None else "never" for r in results])
    sm.column_dimensions["A"].width = 58
    for col in "BCD":
        sm.column_dimensions[col].width = 26

    a = wb.create_sheet("Assumptions")
    keys = [k for k in asdict(SCENARIOS[0]) if k != "name"]
    a.append(["Assumption"] + [s.name for s in SCENARIOS])
    for c in a[1]:
        c.font, c.fill = bold, head
    for k in keys:
        a.append([k] + [getattr(s, k) for s in SCENARIOS])
    a.column_dimensions["A"].width = 32
    for col in "BCD":
        a.column_dimensions[col].width = 40

    for s, rows, _ in results:
        w = wb.create_sheet(s.name)
        w.append(list(rows[0].keys()))
        for c in w[1]:
            c.font, c.fill = bold, head
        for r in rows:
            w.append(list(r.values()))
        w.freeze_panes = "B2"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)


def main() -> int:
    results = []
    for s in SCENARIOS:
        rows = simulate(s)
        results.append((s, rows, summarise(s, rows)))
    write_xlsx(results)
    MODEL_JSON.parent.mkdir(parents=True, exist_ok=True)
    MODEL_JSON.write_text(json.dumps({
        "note": "Monthly revenue (USD) per scenario from scripts/financial_model.py. ASSUMPTIONS, not revenue. Month 1 = start.",
        "start": START,
        "scenarios": {s.name: [r["revenue"] for r in rows[:36]] for s, rows, _ in results},
        "institutions": {s.name: [r["institutions"] for r in rows[:36]] for s, rows, _ in results},
    }, indent=1), encoding="utf-8")
    print(json.dumps([r[2] for r in results], indent=1, default=str))
    print(f"wrote {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
