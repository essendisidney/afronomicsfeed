"""'Call it' (lib/call-it-core.ts): which auction is open, what an entry must hold, and how calls are scored.

Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
const c = await import(process.argv[1]);
const ledger = [
  { auction_value_date: "2026-10-19", bids_close: "2026-10-15T11:00:00Z" },
  { auction_value_date: "2026-10-26", bids_close: "2026-10-22T11:00:00Z" },
];
const ok = (b) => { const r = c.parseEntry(b); return r.ok ? { ok: true, ...r.value } : r; };
console.log(JSON.stringify({
  fromLedger: c.nextRound("2026-10-20T09:00:00Z", ledger),
  justClosed: c.nextRound("2026-10-22T11:00:00Z", ledger),
  noLedgerTue: c.nextRound("2026-10-20T09:00:00Z", []),
  noLedgerThuAfter: c.nextRound("2026-10-22T12:00:00Z", []),
  entries: [
    ok({ email: "A@Example.com", g91: "8.75", g182: "", g364: "9.04%", handle: "Wanjiku K", show: true }),
    ok({ email: "a@example.com", g91: 8.7, show: true }),
    ok({ email: "bad", g91: 8.7 }),
    ok({ email: "a@example.com" }),
    ok({ email: "a@example.com", g91: "45" }),
    ok({ email: "a@example.com", g91: "8,8", handle: "<script>" }),
  ],
  board: c.scoreBoard(
    [
      { handle: "far", g91: 9.0, g182: null, g364: null },
      { handle: "close", g91: 8.76, g182: 8.86, g364: 9.10 },
      { handle: "none", g91: null, g182: null, g364: null },
    ],
    { 91: 8.75, 182: 8.86, 364: 9.04 },
  ),
  ...(() => {
    const actual = { 91: 8.75, 182: 8.86, 364: 9.04 };
    const range = { 91: { low: 8.74, high: 8.90 }, 182: { low: 8.85, high: 9.01 }, 364: { low: 9.03, high: 9.14 } };
    const entries = [
      { id: "a", g91: 8.76, g182: 8.86, g364: 9.10 },
      { id: "b", g91: 9.0, g182: null, g364: null },
      { id: "c", g91: 8.76, g182: 8.86, g364: 9.10 },
      { id: "d", g91: null, g182: null, g364: 9.0 },
    ];
    const placed = c.placeAll(entries, actual);
    const next = { valueDate: "2026-11-02", closesAt: "2026-10-29T11:00:00.000Z" };
    const note = (id, atPlace) => c.scoreNote({
      entry: entries.find((e) => e.id === id), placed: placed.find((p) => p.id === id), players: 4, atPlace,
      actual, range, leaders: [{ handle: "Wanjiku", missBps: placed.find((p) => p.id === "c").missBps, place: 1 }], valueDate: "2026-10-26", next,
    });
    return { placed, joint: note("a", 2), last: note("b", 1) };
  })(),
}));
"""


def run():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "call-it-core.ts")],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_the_open_round_follows_the_forecast_ledger_then_thursdays():
    out = run()
    assert out["fromLedger"] == {"valueDate": "2026-10-26", "closesAt": "2026-10-22T11:00:00.000Z"}
    # At the close itself the round is shut; with nothing later in the ledger, next Thursday's opens.
    assert out["justClosed"] == {"valueDate": "2026-11-02", "closesAt": "2026-10-29T11:00:00.000Z"}
    assert out["noLedgerTue"] == {"valueDate": "2026-10-26", "closesAt": "2026-10-22T11:00:00.000Z"}
    assert out["noLedgerThuAfter"]["closesAt"] == "2026-10-29T11:00:00.000Z"


def test_entries_are_checked():
    e = run()["entries"]
    assert e[0] == {"ok": True, "email": "a@example.com", "g91": 8.75, "g182": None, "g364": 9.04, "handle": "Wanjiku K", "show": True}
    assert e[1]["ok"] and e[1]["show"] is False  # no name, so nothing to show
    assert e[2]["ok"] is False and "email" in e[2]["reason"]
    assert e[3]["ok"] is False and "at least one" in e[3]["reason"]
    assert e[4]["ok"] is False
    assert e[5]["ok"] is False and "board" in e[5]["reason"]  # the rate "8,8" is fine; the name is not


def test_board_ranks_by_mean_miss_in_basis_points():
    board = run()["board"]
    assert [b["handle"] for b in board] == ["close", "far"]
    assert board[0]["perTenor"] == {"91": 1, "182": 0, "364": 6} and board[0]["missBps"] == pytest.approx(7 / 3)
    assert board[1]["missBps"] == 25


def test_migration_keeps_emails_private():
    sql = (ROOT / "supabase" / "migrations" / "0044_call_it.sql").read_text()
    board_fn = sql.split("create or replace function public.af_call_it_board", 1)[1].split("$$;", 1)[0]
    assert "email" not in board_fn.split("as $$", 1)[1]
    assert "enable row level security" in sql and "now() >= p_closes" in sql


def test_every_entry_gets_a_place_and_ties_share_it():
    placed = {p["id"]: p for p in run()["placed"]}
    assert placed["a"]["place"] == placed["c"]["place"] == 1
    assert placed["d"]["place"] == 3 and placed["d"]["missBps"] == 4
    assert placed["b"]["place"] == 4 and placed["b"]["missBps"] == 25


def test_score_email_says_the_miss_the_place_and_how_we_did():
    out = run()
    joint, last = out["joint"], out["last"]
    assert joint["subject"] == "Call it: you shared this week's round"
    assert "level first of 4 callers" in joint["lead"][1]
    # Our midpoints (8.82, 8.93, 9.085) miss by 7, 7 and 5 bps: 6.3 on average over the same three bills.
    assert any("You beat us" in line and "6.3 bps" in line for line in joint["after"])
    assert [r["tenor"] for r in joint["rows"]] == [91, 182, 364] and joint["rows"][0]["miss"] == "1 bp"
    assert last["subject"] == "Call it: 25 bps off, 4th of 4"
    assert any("we were closer" in line for line in last["after"])  # our 91-day midpoint missed by 7
    assert any("1st Wanjiku" in line for line in last["after"])
    assert "Thursday 29 October at 2 p.m. Nairobi time" in last["after"][-1] and "Monday 2 November" in last["after"][-1]


def test_score_migration_keeps_the_board_private_and_claims_before_sending():
    sql = (ROOT / "supabase" / "migrations" / "0045_call_it_scores.sql").read_text()
    assert "af_call_it_board" not in sql.split("--", 1)[0]  # the public board is untouched
    assert sql.count("k.name = 'cron' and k.value = p_secret") == 2
    assert "scored_at is null" in sql
    route = (ROOT / "app" / "api" / "send" / "call-it" / "route.ts").read_text()
    assert route.index("af_call_it_mark_scored") < route.index("sendEmail(")
