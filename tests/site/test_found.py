"""Shillings found (lib/found.ts, docs/rebuild/upgrade-U2-plan.md, D-029): the yearly difference between a reader's
option and the best or cheapest option we hold, the wording, the caps, and what /api/found accepts.

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
TARIFFS = ROOT / "data" / "kenya" / "mpesa_tariffs.json"

SCRIPT = r"""
const f = await import(process.argv[1]);
const m = await import(process.argv[2]);
const t = JSON.parse(process.argv[3]);
const fuliza = { access_fee_pct: t.fuliza.access_fee_pct, daily: t.fuliza.daily, url: "https://safaricom.example/fuliza", date: t.checked };
const products = [
  { product: "M-Shwari loan", provider: "NCBA Bank with Safaricom", url: "https://x/m", date: "2026-10-05", basis: "flat", pct: 9, days: 30, from: false },
  { product: "Tala loan", provider: "Tala Kenya", url: "https://x/t", date: "2026-10-05", basis: "per_day", pct: 0.3, days: 30, from: true },
  { product: "Fuliza M-PESA overdraft", provider: "Safaricom with NCBA and KCB", url: "https://x/f", date: "2026-10-05", basis: "access_plus_daily", pct: 1, days: 30, from: false },
];
const fund = (name, net) => ({ name, manager: name + " Managers", url: "https://x/" + name, date: "2026-10-21", net });
const funds = [fund("Alpha Fund", 13.05), fund("Beta Fund", 11.2), fund("Gamma Fund", 9.5)];
const saveOpts = [
  { name: "Alpha Fund", rate: 11.4, publisher: "Alpha Managers", url: "https://x/a", date: "2026-10-21" },
  { name: "364-day Treasury bill", rate: 7.68, publisher: "Central Bank of Kenya", url: "https://x/b", date: "2026-10-20" },
];
const corridor = { src: "GBR", srcName: "United Kingdom", dst: "KEN", dstName: "Kenya", market: "kenya",
  firms: [{ firm: "Skrill", type: "MTO", pct: 1.57 }, { firm: "Wise", type: "MTO", pct: 2.17 }, { firm: "Western Union", type: "MTO", pct: 4.01 }] };
const survey = { period: "January to March 2025", url: "https://remittanceprices.worldbank.org", publisher: "World Bank, Remittance Prices Worldwide", date: "2026-10-12" };
const fx = { kesPerUsd: 129.2, source: "ExchangeRate-API", url: "https://open.er-api.com/v6/latest/USD", date: "2026-10-22" };
const out = {
  save: f.foundSave({ market: "kenya", currency: "KES", rate: 7, amount: 100000, tax: 0.15, options: saveOpts }),
  saveSw: f.foundSave({ market: "kenya", currency: "KES", rate: 7, amount: 100000, tax: 0.15, options: saveOpts }, "sw"),
  saveEqual: f.foundSave({ market: "kenya", currency: "KES", rate: 11.4 / 0.85, amount: 100000, tax: 0.15, options: saveOpts }),
  saveAbove: f.foundSave({ market: "kenya", currency: "KES", rate: 16, amount: 100000, tax: 0.15, options: saveOpts }),
  saveNone: f.foundSave({ market: "kenya", currency: "KES", rate: 7, amount: 100000, tax: 0.15, options: [] }),
  saveGhana: f.foundSave({ market: "ghana", currency: "GHS", rate: 10, amount: 10000, tax: 0, options: [{ name: "91-day Treasury bill", rate: 15.2, publisher: "Bank of Ghana, auction", url: "https://x/g", date: "2026-10-13" }] }),
  saveBad: f.foundSave({ market: "kenya", currency: "KES", rate: -1, amount: 100000, tax: 0.15, options: saveOpts }),
  fuliza5000: f.foundLoan({ tool: "fuliza", product: "Fuliza M-PESA overdraft", amount: 5000, days: 30, times: 6, products, fuliza }),
  fuliza1000: f.foundLoan({ tool: "fuliza", product: "Fuliza M-PESA overdraft", amount: 1000, days: 7, times: 12, products, fuliza }),
  tala: f.foundLoan({ tool: "mobile_loans", product: "Tala loan", amount: 5000, days: 30, times: 6, products, fuliza }),
  talaShort: f.foundLoan({ tool: "mobile_loans", product: "Tala loan", amount: 5000, days: 10, times: 6, products, fuliza }),
  onlyFrom: f.foundLoan({ tool: "fuliza", product: "Fuliza M-PESA overdraft", amount: 5000, days: 30, times: 6, products: products.filter((p) => p.product !== "M-Shwari loan"), fuliza }),
  tooLong: f.foundLoan({ tool: "mobile_loans", product: "M-Shwari loan", amount: 5000, days: 45, times: 2, products, fuliza }),
  tooOften: f.foundLoan({ tool: "mobile_loans", product: "Fuliza M-PESA overdraft", amount: 5000, days: 30, times: 13, products, fuliza }),
  unknown: f.foundLoan({ tool: "mobile_loans", product: "Nope", amount: 5000, days: 30, times: 1, products, fuliza }),
  charges: [100, 101, 500, 750, 1000, 1200, 2000, 5000, 70000].flatMap((a) => [1, 7, 30].map((d) => ({ a, d, ours: f.loanCharge(products[2], a, d, fuliza), theirs: m.fulizaCost(t, a, d).total }))),
  mmf: f.foundMmf({ fund: "Gamma Fund", amount: 100000, funds }),
  mmfSw: f.foundMmf({ fund: "Gamma Fund", amount: 100000, funds }, "sw"),
  mmfBest: f.foundMmf({ fund: "Alpha Fund", amount: 100000, funds }),
  mmfMissing: f.foundMmf({ fund: "Delta Fund", amount: 100000, funds }),
  remit: f.foundRemit({ corridor, firm: "Western Union", sends: 12, survey, fx }),
  remitNoFx: f.foundRemit({ corridor, firm: "Western Union", sends: 12, survey, fx: null }),
  remitBest: f.foundRemit({ corridor, firm: "Skrill", sends: 12, survey, fx }),
  remitMissing: f.foundRemit({ corridor, firm: "Unlisted", sends: 12, survey, fx }),
  remitNoCorridor: f.foundRemit({ corridor: null, firm: "Wise", sends: 12, survey, fx }),
  caps: {
    kes: f.capFor("KES", null), usd: f.capFor("USD", null),
    ghs: f.capFor("GHS", { USD: 1, KES: 129.2, GHS: 12.9 }), ngn: f.capFor("NGN", { USD: 1, KES: 129.2 }), ghsNone: f.capFor("GHS", null),
  },
  parse: [
    f.parseFoundInput({ tool: "save_check", market: "kenya", rate: 7, amount: 100000, view: "abc" }),
    f.parseFoundInput({ tool: "save_check", market: "uganda", rate: 7, amount: 100000 }),
    f.parseFoundInput({ tool: "save_check", market: "kenya", rate: "7", amount: 100000 }),
    f.parseFoundInput({ tool: "mobile_loans", product: "Tala loan", amount: 5000, days: 7.5, times: 2 }),
    f.parseFoundInput({ tool: "fuliza", product: "Fuliza M-PESA overdraft", amount: 500, days: 5, times: 24 }),
    f.parseFoundInput({ tool: "mmf", fund: "<script>", amount: 10 }),
    f.parseFoundInput({ tool: "remit", src: "GBR", dst: "KEN", firm: "Wise", sends: 12 }),
    f.parseFoundInput({ tool: "remit", src: "gbr", dst: "KEN", firm: "Wise", sends: 12 }),
    f.parseFoundInput({ tool: "loan_cost", amount: 1 }),
    f.parseFoundInput(null),
  ],
  dates: [f.foundDate("2026-10-21"), f.foundDate("2026-08"), f.foundDate("2026-10-21", "sw"), f.foundDate("not a date")],
};
out.count = {
  save: f.countable(out.save, f.capFor("KES", null)),
  saveBest: f.countable(out.saveAbove, f.capFor("KES", null)),
  saveNone: f.countable(out.saveNone, f.capFor("KES", null)),
  huge: f.countable(f.foundSave({ market: "kenya", currency: "KES", rate: 0, amount: 10000000, tax: 0.15, options: saveOpts }), f.capFor("KES", null)),
  atCap: f.countable({ ...out.save, yearly: 500000 }, f.capFor("KES", null)),
  remit: f.countable(out.remit, f.capFor("USD", null)),
  remit365: f.countable(f.foundRemit({ corridor, firm: "Western Union", sends: 365, survey, fx }), f.capFor("USD", null)),
  remitOver: f.countable({ ...out.remit, yearly: 2000.01 }, f.capFor("USD", null)),
  ghsNoRate: f.countable(out.saveGhana, f.capFor("GHS", null)),
  ghs: f.countable(out.saveGhana, f.capFor("GHS", { USD: 1, KES: 129.2, GHS: 12.9 })),
};
console.log(JSON.stringify(out));
"""


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "found.ts"), str(ROOT / "lib" / "mpesa-calc.ts"), TARIFFS.read_text()],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:300]}")
    return json.loads(proc.stdout)


@pytest.fixture(scope="module")
def out():
    return run()


BANNED = re.compile(r"\b(switch|move your|you should|should you|buy|sell)\b", re.I)


def all_lines(out):
    for k, v in out.items():
        if isinstance(v, dict) and "lines" in v:
            yield k, v["lines"]


def test_save_positive_zero_negative_and_missing(out):
    s = out["save"]
    # 7% keeps 5.95% after tax; the best fund keeps 11.40%: KES 100,000 x 5.45 points = KES 5,450 a year.
    assert s["status"] == "found" and s["yearly"] == 5450 and s["currency"] == "KES"
    assert s["other"]["name"] == "Alpha Fund" and s["other"]["date"] == "2026-10-21"
    assert "KES 5,450 a year more" in " ".join(s["lines"]) and "21 Oct 2026" in " ".join(s["lines"])
    assert s["lines"][-1].endswith("Information, not advice.")
    assert out["saveEqual"]["status"] == "best" and out["saveEqual"]["yearly"] == 0
    assert out["saveAbove"]["status"] == "best" and "no option we track earns more" in out["saveAbove"]["lines"][1]
    assert out["saveNone"] == {**out["saveNone"], "status": "none", "lines": [], "yearly": 0}
    assert out["saveBad"]["status"] == "none"
    g = out["saveGhana"]
    assert g["status"] == "found" and g["currency"] == "GHS" and g["yearly"] == 520 and "before tax" in " ".join(g["lines"])


def test_kiswahili_lines(out):
    sw = " ".join(out["saveSw"]["lines"])
    assert "KES 5,450 zaidi kwa mwaka" in sw and "Ni taarifa, si ushauri." in sw and "Oktoba" in sw
    mm = " ".join(out["mmfSw"]["lines"])
    assert "Mfuko wako, Gamma Fund" in mm and "KES 3,550 zaidi kwa mwaka" in mm


def test_loans_against_the_cheapest_fixed_charge(out):
    f5 = out["fuliza5000"]
    # Fuliza on KES 5,000 for 30 days: KES 50 access + KES 30 a day = KES 950; M-Shwari: 9% flat = KES 450.
    assert f5["status"] == "found" and f5["yearly"] == (950 - 450) * 6
    assert f5["other"]["name"] == "M-Shwari loan" and "a year less" in " ".join(f5["lines"])
    # A week of Fuliza on KES 1,000 (KES 52) is cheaper than M-Shwari's month (KES 90): nothing found.
    assert out["fuliza1000"]["status"] == "best"
    # Tala's "from" rate is the reader's floor ("at least"), never the comparable; equal to M-Shwari at 30 days.
    assert out["tala"]["status"] == "best" and out["tala"]["mine"]["figure"].startswith("at least")
    assert out["talaShort"]["status"] == "best"
    # With only a "from" product left besides Fuliza, Fuliza is the cheapest fixed charge: nothing found.
    assert out["onlyFrom"]["status"] == "best" and out["onlyFrom"]["other"]["name"] == "Fuliza M-PESA overdraft"
    for k in ("tooLong", "tooOften", "unknown"):
        assert out[k]["status"] == "none" and out[k]["lines"] == []


def test_fuliza_charge_matches_the_mpesa_calculator(out):
    for c in out["charges"]:
        assert c["ours"] == pytest.approx(c["theirs"]), c


def test_money_market_funds(out):
    m = out["mmf"]
    assert m["status"] == "found" and m["yearly"] == 3550
    assert "The best-earning fund we track, Alpha Fund, keeps 13.05%" in " ".join(m["lines"])
    assert out["mmfBest"]["status"] == "best" and out["mmfMissing"]["status"] == "none"


def test_sending_money_home(out):
    r = out["remit"]
    # Western Union USD 8.02 per USD 200 against Skrill's USD 3.14: USD 4.88 a send, 12 sends = USD 58.56.
    assert r["status"] == "found" and r["currency"] == "USD" and r["yearly"] == pytest.approx(58.56)
    text = " ".join(r["lines"])
    assert "USD 58.56 a year less" in text and "about KES 7,566 at KES 129.20 per dollar, ExchangeRate-API, 22 Oct 2026" in text
    assert "survey of January to March 2025" in text
    assert "KES" not in " ".join(out["remitNoFx"]["lines"])
    assert out["remitBest"]["status"] == "best"
    assert out["remitMissing"]["status"] == "none" and out["remitNoCorridor"]["status"] == "none"


def test_caps(out):
    c = out["caps"]
    assert c["kes"] == 500000 and c["usd"] == 2000
    assert c["ghs"] == pytest.approx(500000 / 129.2 * 12.9)
    assert c["ngn"] is None and c["ghsNone"] is None
    n = out["count"]
    assert n["save"] == 545000  # cents
    assert n["saveBest"] is None and n["saveNone"] is None
    assert n["huge"] is None  # KES 1,140,000 a year is above the cap: refused, not trimmed
    assert n["atCap"] == 50000000
    assert n["remit"] == 5856
    assert n["remit365"] == 178120  # 365 sends of USD 200: USD 1,781.20, under the USD 2,000 cap
    assert n["remitOver"] is None
    assert n["ghsNoRate"] is None and n["ghs"] == 52000


def test_what_the_route_accepts(out):
    p = out["parse"]
    assert p[0] == {"tool": "save_check", "market": "kenya", "rate": 7, "amount": 100000}  # the view id is not an input
    assert p[1] is None and p[2] is None and p[3] is None
    assert p[4]["tool"] == "fuliza" and p[4]["times"] == 24
    assert p[5] is None
    assert p[6] == {"tool": "remit", "src": "GBR", "dst": "KEN", "firm": "Wise", "sends": 12}
    assert p[7] is None and p[8] is None and p[9] is None


def test_dates(out):
    assert out["dates"] == ["21 Oct 2026", "Aug 2026", "21 Oktoba 2026", "not a date"]


def test_wording_is_information_not_advice(out):
    for key, lines in all_lines(out):
        for line in lines:
            assert not BANNED.search(line), (key, line)


def test_route_and_migration_guard_the_count():
    route = (ROOT / "app" / "api" / "found" / "route.ts").read_text()
    for needed in ("parseFoundInput", "recomputeFound", "isAutomated", "isInternalCall", "AF_CRON_SECRET", "af_found_add"):
        assert needed in route, needed
    sql = (ROOT / "supabase" / "migrations" / "0046_shillings_found.sql").read_text()
    assert sql.startswith("-- NOT YET APPLIED")
    assert "enable row level security" in sql and "create policy" not in sql.lower()
    assert sql.count("security definer") == 2 and "k.name = 'cron'" in sql
    # Nothing that could identify a reader is a column.
    table = sql.split("create table if not exists public.found_daily", 1)[1].split(");", 1)[0]
    for col in ("amount", "rate", "ip", "device", "view", "path", "product", "fund", "firm"):
        assert not re.search(rf"^\s*{col}\b", table, re.M), col
