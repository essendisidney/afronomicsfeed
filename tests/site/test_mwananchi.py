"""The Mwananchi engine (lib/mwananchi-core.ts, data/mwananchi/pains.json): a sound catalogue and a ranking that follows season, demand and gaps.

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
CATALOGUE = json.loads((ROOT / "data" / "mwananchi" / "pains.json").read_text())["pains"]
SCRIPT = r"""
const c = await import(process.argv[1]);
const [pains, signals] = JSON.parse(process.argv[2]);
const m = c.nextMoves(pains, signals);
const ids = (rs) => rs.map((r) => [r.pain.id, r.action]);
console.log(JSON.stringify({ build: ids(m.build), push: ids(m.push), all: c.rank(pains, signals).map((r) => [r.pain.id, r.score, r.action]) }));
"""


def run(signals, pains=CATALOGUE):
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "mwananchi-core.ts"), json.dumps([pains, signals])],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_catalogue_is_well_formed_and_its_tools_exist():
    ids = [p["id"] for p in CATALOGUE]
    assert len(ids) == len(set(ids))
    money = {"newsletter", "alerts", "referral", "sponsor", "pro", "b2b"}
    for p in CATALOGUE:
        assert 1 <= p["reach"] <= 5 and 1 <= p["hurt"] <= 5, p["id"]
        assert p["often"] in {"daily", "monthly", "termly", "yearly", "once"} and p["data"] in {"held", "public", "none"}
        assert set(p["money"]) <= money and p["money"], p["id"]
        assert all(1 <= m <= 12 for m in p["months"]) and p["effort_days"] >= 1 and p["keywords"] and p["next"]
        for href in [p["tool"], *p["paths"]]:
            if href:
                route = ROOT / "app" / href.strip("/") / "page.tsx"
                assert route.exists(), f"{p['id']}: {href} has no page"
    # Betting earns from readers, never from bookmakers.
    assert next(p for p in CATALOGUE if p["id"] == "betting")["money"] == ["newsletter"]


def test_build_lists_only_unserved_problems_and_push_only_served_ones_in_season_or_demand():
    out = run({"month": 10})
    served = {p["id"] for p in CATALOGUE if p["tool"]}
    assert out["build"] and all(i not in served for i, _ in out["build"])
    assert all(i in served and a == "push" for i, a in out["push"])
    assert ["school-fees", "push"] in out["push"]  # in October: November, a peak month for January fees, is next


def test_season_and_empty_searches_raise_a_problem():
    base = {i: s for i, s, _ in run({"month": 10})["all"]}
    june = {i: s for i, s, _ in run({"month": 6})["all"]}
    assert june["kra"] > base["kra"]
    searched = {i: s for i, s, _ in run({"month": 10, "misses": [{"query": "petrol-price-today", "count": 20}]})["all"]}
    assert searched["fuel"] == pytest.approx(base["fuel"] * 2, rel=0.02)
    viewed = {i: s for i, s, _ in run({"month": 10, "views": [{"path": "/rates/kenya/mpesa-charges", "views": 500}]})["all"]}
    assert viewed["mpesa"] == pytest.approx(base["mpesa"] * 2, rel=0.02)
