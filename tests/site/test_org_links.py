"""Private institution links (lib/org-links.ts): signed, purpose-bound, expiring, tamper-proof, and off without a secret."""

import json
import os
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
const l = await import(process.argv[1]);
const now = Date.UTC(2026, 9, 28);
const pack = l.orgLinkToken(7, "pack", now);
const [v, body, sig] = pack.split(".");
const forged = Buffer.from(JSON.stringify({ o: 8, p: "pack", e: 9999999999 })).toString("base64url");
console.log(JSON.stringify({
  ok: l.verifyOrgLink(pack, "pack", now),
  wrongPurpose: l.verifyOrgLink(pack, "benchmark", now),
  expired: l.verifyOrgLink(pack, "pack", now + 46 * 86400000),
  tampered: l.verifyOrgLink(`${v}.${forged}.${sig}`, "pack", now),
  junk: [l.verifyOrgLink("", "pack", now), l.verifyOrgLink("o1.x.y", "pack", now), l.verifyOrgLink(null, "pack", now)],
  badOrg: l.orgLinkToken(0, "pack", now),
  path: l.orgLinkPath("benchmark", "t"),
}));
"""


def run(secret):
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    env = {**os.environ, "AF_CRON_SECRET": secret}
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "org-links.ts")],
        capture_output=True, text=True, env=env,
    )
    if proc.returncode != 0:
        return {"error": proc.stderr[:300]}
    return json.loads(proc.stdout)


def test_links_open_only_what_they_were_signed_for():
    out = run("a-test-secret-of-enough-length")
    assert "error" not in out, out
    assert out["ok"]["org"] == 7 and out["ok"]["purpose"] == "pack"
    assert out["wrongPurpose"] is None and out["expired"] is None and out["tampered"] is None
    assert out["junk"] == [None, None, None] and out["badOrg"] is None
    assert out["path"] == "/benchmarking/client/t"


def test_no_links_without_a_secret():
    out = run("short")
    assert "error" in out  # orgLinkToken returns null, so splitting it throws: no link can be made
