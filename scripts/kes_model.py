"""
Kenya-first model for the Treasury Desk (Investment Committee Pack) wedge: 36 months from November 2026, three
scenarios, in Kenyan shillings, built customer by customer. Companion to docs/strategy/founder-strategy-pack.md
(section I). The older USD model (scripts/financial_model.py) models the global-fund data ladder; this one models
the Kenyan institutional buyer the strategy pack recommends testing first.

Labels, as in financial_model.py:
    VERIFIED   checked against our own systems or code on 28 Oct 2026
    ESTIMATED  reasoned from cited public sources (regulator registers), not measured
    ASSUMED    a guess written down so it can be replaced by evidence from the 90-day test

Starting point (VERIFIED, 28 Oct 2026): KES 0 collected, 0 paying customers.

    python scripts/kes_model.py   # prints the tables used in the strategy pack and writes data/strategy/kes-model.json
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "strategy" / "kes-model.json"
MONTHS = 36
NAMES = ("Conservative", "Base", "Upside")
TARGETS = (1_000_000, 5_000_000, 10_000_000)

# Tiers (KES a month). Board Pack is the live "Pack with alerts" price (VERIFIED, lib/billing/ratecard.ts);
# Treasury Desk and the data licence are the price points the 90-day test checks (ASSUMED until someone pays).
TIERS = {
    "board": ("Board Pack", 18_000, "VERIFIED: pack_plus in ratecard.ts"),
    "desk": ("Treasury Desk", 65_000, "ASSUMED: pack for several schemes + quarterly benchmarking + data + 10 seats"),
    "data": ("Data licence / API", 194_000, "VERIFIED: Team and API USD 1,500 at KES 129"),
}

# Each input: (label, basis, (conservative, base, upside)).
INPUTS = {
    # New paying logos a month at the start of year 1 and by month 12; linear in between, flat after, plus expansion.
    "board_new_start": ("ASSUMED", "new Board Pack customers a month from month 3", (0.5, 1.5, 3)),
    "board_new_m12": ("ASSUMED", "new Board Pack customers a month by month 12", (2, 5, 8)),
    "desk_new_start": ("ASSUMED", "new Treasury Desk customers a month from month 4", (0.2, 0.5, 1)),
    "desk_new_m12": ("ASSUMED", "new Treasury Desk customers a month by month 12", (0.7, 2, 3.5)),
    "data_new": ("ASSUMED", "new data-licence customers a month from month 6 (global funds, fintechs)", (0.1, 0.25, 0.5)),
    "regional_from": ("ASSUMED", "month Uganda, Tanzania and Rwanda packs go on sale", (99, 19, 13)),
    "regional_uplift": ("ASSUMED", "new-customer multiplier once the regional packs exist", (1.0, 1.6, 2.0)),
    "pool_board": ("ESTIMATED", "Kenyan buyers of a board pack: regulated SACCOs, scheme trustee boards, MFIs, chamas with treasuries", (250, 400, 600)),
    "pool_desk": ("ESTIMATED", "fund managers, pension administrators, insurers, banks' treasury and wealth desks, family offices", (60, 90, 120)),
    "churn_year": ("ASSUMED", "logo churn a year (an unproven vendor; boards renew yearly)", (0.30, 0.20, 0.12)),
    "upgrade_year": ("ASSUMED", "share of Board Pack customers moving to Treasury Desk in a year", (0.03, 0.06, 0.10)),
    "realisation": ("ASSUMED", "share of list price actually paid (annual prepay discount, launch prices)", (0.80, 0.88, 0.95)),
    "services_share": ("ASSUMED", "training, benchmarking add-ons and commissioned research, as a share of MRR", (0.05, 0.10, 0.15)),
    "fees": ("ASSUMED", "payment and FX fees, share of revenue (Paystack / M-Pesa / bank)", (0.035, 0.03, 0.03)),
    # Costs, KES a month.
    "base_opex": ("ASSUMED", "hosting, database, data runs, software, accounting (Supabase invoice alone is about KES 20,000)", (120_000, 150_000, 200_000)),
    "legal_opex": ("ASSUMED", "lawyer on retainer, ODPC registration, insurance from month 3", (25_000, 40_000, 60_000)),
    "founder_salary": ("ASSUMED", "founder draw", (250_000, 350_000, 450_000)),
    "founder_paid_from": ("ASSUMED", "month the founder draws a salary", (13, 7, 4)),
    "cost_of_sale": ("ASSUMED", "events, travel, demo materials per new logo", (15_000, 20_000, 25_000)),
}

# Hires added when MRR first reaches a threshold (KES a month, fully loaded). Same ladder in every scenario: the
# business hires against revenue, not ahead of it.
HIRES = [
    (400_000, "Data analyst (pack production, QA)", 180_000),
    (1_000_000, "Institutional seller", 250_000),
    (2_000_000, "Engineer", 350_000),
    (3_500_000, "Second analyst (regional packs)", 180_000),
    (5_000_000, "Head of research / compliance", 400_000),
    (7_500_000, "Second seller + customer success", 400_000),
]


def g(key: str, i: int):
    return INPUTS[key][2][i]


def ramp(start: float, end: float, m: int, first: int) -> float:
    if m < first:
        return 0.0
    if m >= 12:
        return end
    return start + (end - start) * (m - first) / max(1, 12 - first)


def simulate(i: int) -> list[dict]:
    churn = 1 - (1 - g("churn_year", i)) ** (1 / 12)
    upgrade = 1 - (1 - g("upgrade_year", i)) ** (1 / 12)
    real = g("realisation", i)
    n = {"board": 0.0, "desk": 0.0, "data": 0.0}
    acquired = {"board": 0.0, "desk": 0.0}
    hired: list[tuple] = []
    cash = 0.0
    rows = []
    for m in range(1, MONTHS + 1):
        uplift = g("regional_uplift", i) if m >= g("regional_from", i) else 1.0
        pool_mult = uplift  # the regional packs also widen the pool
        new = {
            "board": ramp(g("board_new_start", i), g("board_new_m12", i), m, 3) * uplift,
            "desk": ramp(g("desk_new_start", i), g("desk_new_m12", i), m, 4) * uplift,
            "data": g("data_new", i) if m >= 6 else 0.0,
        }
        for k in ("board", "desk"):
            room = g(f"pool_{k}", i) * pool_mult - acquired[k]
            new[k] = max(0.0, min(new[k], room))
            acquired[k] += new[k]
        moved = n["board"] * upgrade
        for k in n:
            n[k] = n[k] * (1 - churn) + new[k]
        n["board"] -= moved
        n["desk"] += moved
        mrr_core = sum(n[k] * TIERS[k][1] for k in n) * real
        mrr = mrr_core * (1 + g("services_share", i))
        for threshold, role, cost in HIRES:
            if mrr >= threshold and role not in [h[0] for h in hired]:
                hired.append((role, cost, m))
        costs = (
            g("base_opex", i)
            + (g("legal_opex", i) if m >= 3 else 0)
            + (g("founder_salary", i) if m >= g("founder_paid_from", i) else 0)
            + sum(c for _, c, _ in hired)
            + g("cost_of_sale", i) * sum(new.values())
            + mrr * g("fees", i)
        )
        cash += mrr - costs
        rows.append({
            "month": m,
            "customers": round(sum(n.values()), 1),
            "board": round(n["board"], 1),
            "desk": round(n["desk"], 1),
            "data": round(n["data"], 1),
            "mrr": round(mrr),
            "costs": round(costs),
            "net": round(mrr - costs),
            "cash": round(cash),
            "team": 1 + len(hired),
        })
    return rows


def first_month(rows: list[dict], pred) -> int | None:
    return next((r["month"] for r in rows if pred(r)), None)


def summary(i: int) -> dict:
    rows = simulate(i)
    be = first_month(rows, lambda r: r["net"] >= 0 and r["month"] > 6)
    return {
        "scenario": NAMES[i],
        "rows": rows,
        "mrr_m6": rows[5]["mrr"], "mrr_m12": rows[11]["mrr"], "mrr_m24": rows[23]["mrr"], "mrr_m36": rows[35]["mrr"],
        "customers_m12": rows[11]["customers"], "customers_m36": rows[35]["customers"],
        "targets": {t: first_month(rows, lambda r, t=t: r["mrr"] >= t) for t in TARGETS},
        "break_even_month": be,
        "cash_need": -min(0, min(r["cash"] for r in rows)),
        "team_m36": rows[35]["team"],
    }


def customers_needed(target: int, mix: dict[str, float], real: float = 0.88, services: float = 0.10) -> dict:
    arpa = sum(mix[k] * TIERS[k][1] for k in mix) * real * (1 + services)
    total = target / arpa
    return {"arpa": round(arpa), "total": round(total), **{k: round(total * mix[k]) for k in mix}}


def kes(x: float) -> str:
    return f"{x / 1e6:,.2f}m" if abs(x) >= 1e6 else f"{x / 1e3:,.0f}k"


def main() -> None:
    out = [summary(i) for i in range(3)]
    print("| | " + " | ".join(NAMES) + " |\n|---|---|---|---|")
    for label, key in [("MRR month 6", "mrr_m6"), ("MRR month 12", "mrr_m12"), ("MRR month 24", "mrr_m24"), ("MRR month 36", "mrr_m36")]:
        print(f"| {label} (KES) | " + " | ".join(kes(s[key]) for s in out) + " |")
    print("| Paying customers, month 12 | " + " | ".join(f"{s['customers_m12']:.0f}" for s in out) + " |")
    print("| Paying customers, month 36 | " + " | ".join(f"{s['customers_m36']:.0f}" for s in out) + " |")
    for t in TARGETS:
        print(f"| Month MRR first reaches KES {kes(t)} | " + " | ".join(str(s["targets"][t] or "not in 36 months") for s in out) + " |")
    print("| Break-even month (after month 6) | " + " | ".join(str(s["break_even_month"] or "not in 36 months") for s in out) + " |")
    print("| Cash needed before break-even (KES) | " + " | ".join(kes(s["cash_need"]) for s in out) + " |")
    print("| Team size, month 36 | " + " | ".join(str(s["team_m36"]) for s in out) + " |")
    print()
    mixes = {
        "KES 1m": (1_000_000, {"board": 0.75, "desk": 0.22, "data": 0.03}),
        "KES 5m": (5_000_000, {"board": 0.60, "desk": 0.33, "data": 0.07}),
        "KES 10m": (10_000_000, {"board": 0.55, "desk": 0.35, "data": 0.10}),
    }
    print("| Target MRR | Assumed mix (Board / Desk / Data) | Blended revenue per customer | Customers | Board | Desk | Data |\n|---|---|---|---|---|---|---|")
    needed = {}
    for label, (t, mix) in mixes.items():
        c = customers_needed(t, mix)
        needed[label] = c
        print(f"| {label} | {mix['board']:.0%} / {mix['desk']:.0%} / {mix['data']:.0%} | KES {c['arpa']:,} | {c['total']} | {c['board']} | {c['desk']} | {c['data']} |")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "tiers": {k: {"name": v[0], "kes_month": v[1], "basis": v[2]} for k, v in TIERS.items()},
        "inputs": {k: {"label": v[0], "basis": v[1], "values": dict(zip(NAMES, v[2]))} for k, v in INPUTS.items()},
        "hires": [{"at_mrr": t, "role": r, "kes_month": c} for t, r, c in HIRES],
        "scenarios": out,
        "customers_needed": needed,
    }, indent=1) + "\n")


if __name__ == "__main__":
    main()
