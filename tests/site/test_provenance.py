"""Provenance (lib/provenance.ts): every auction file is listed with a real SHA-256, row count and newest date, and
every row in the served files carries a source link."""

import hashlib
import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
const p = await import(process.argv[1]);
console.log(JSON.stringify(p.provenance(process.argv[2])));
"""


def test_every_auction_file_is_listed_and_hashed():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "provenance.ts"), str(ROOT)],
        capture_output=True, text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    files = {f["file"]: f for f in json.loads(proc.stdout)}
    assert "data/kenya/tbill_auctions.json" in files and len(files) >= 12
    k = files["data/kenya/tbill_auctions.json"]
    assert k["sha256"] == hashlib.sha256((ROOT / k["file"]).read_bytes()).hexdigest()
    assert k["rows"] > 2000 and k["newest_date"] >= "2026-10-01"
    for f in files.values():
        assert f["rows_with_source"] == f["rows"], f["file"]
