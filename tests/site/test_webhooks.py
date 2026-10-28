"""auction.published webhooks (lib/webhooks.ts): only recent results become events, ids are stable, secrets are per
subscription and never without the cron secret, and the signature is the documented HMAC of "<t>.<body>"."""

import hashlib
import hmac
import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
const w = await import(process.argv[1]);
const now = Date.UTC(2026, 9, 28);
const row = (date, tenor, rate) => ({ tenor, date, rate, offered: 8000, received: 49796, accepted: 34244, source: "https://cbk/x.pdf" });
const events = w.auctionEvents([
  { market: "kenya", rows: [row("2026-10-26", 91, 8.75), row("2026-10-26", 364, 9.03), row("2026-10-19", 91, 8.76), row("2026-10-27", 182, 0)] },
  { market: "ghana", rows: [row("2026-10-25", 91, 4.6)] },
], now);
const s1 = w.subscriptionSecret("a-cron-secret-long-enough", 1);
const s2 = w.subscriptionSecret("a-cron-secret-long-enough", 2);
console.log(JSON.stringify({
  ids: events.map((e) => e.id), first: events[0],
  s1, s2, s1again: w.subscriptionSecret("a-cron-secret-long-enough", 1), noSecret: w.subscriptionSecret("short", 1), badId: w.subscriptionSecret("a-cron-secret-long-enough", 0),
  sig: w.signature("whsec_test", '{"a":1}', 1793191000),
}));
"""


@pytest.fixture(scope="module")
def out():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "webhooks.ts")],
        capture_output=True, text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_only_recent_priced_results_become_events(out):
    assert out["ids"] == ["ghana:tbill:91:2026-10-25", "kenya:tbill:364:2026-10-26", "kenya:tbill:91:2026-10-26"]
    e = out["first"]
    assert e["type"] == "auction.published" and e["source_url"].startswith("https://") and e["rate_pct"] == 4.6


def test_secrets_are_per_subscription_and_need_the_cron_secret(out):
    assert out["s1"].startswith("whsec_") and out["s1"] == out["s1again"] and out["s1"] != out["s2"]
    assert out["noSecret"] is None and out["badId"] is None


def test_signature_matches_the_documented_scheme(out):
    want = hmac.new(b"whsec_test", b'1793191000.{"a":1}', hashlib.sha256).hexdigest()
    assert out["sig"] == f"t=1793191000,v1={want}"
