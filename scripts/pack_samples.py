#!/usr/bin/env python3
"""Named sample packs for the Treasury Desk targets (founder-strategy-pack.md section M, phase 0b; D-036).

Prints this month's Investment Committee Pack with an institution's name on the cover, one PDF per name, through
scripts/make-documents.mjs (Chromium, the house document design). The founder sends them personally (WhatsApp,
LinkedIn, in person); nothing here sends anything.

    python scripts/pack_samples.py --org "Mwalimu National SACCO" --base http://127.0.0.1:3000 --out packs
    python scripts/pack_samples.py --wave 1 --base http://127.0.0.1:3000 --out packs     # every wave-1 target
    python scripts/pack_samples.py --all --out packs                                       # all 60, from the live site
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
TARGETS = ROOT / "data" / "sales" / "treasury-desk-targets.json"


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def names(args: argparse.Namespace) -> list[str]:
    if args.org:
        return args.org
    rows = json.loads(TARGETS.read_text())["rows"]
    if args.wave is not None:
        rows = [r for r in rows if r.get("wave") == args.wave]
    return [r["name"] for r in rows]


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    who = p.add_mutually_exclusive_group(required=True)
    who.add_argument("--org", action="append", help="institution name (repeatable)")
    who.add_argument("--wave", type=int, help="every target in this wave of the 60-name list")
    who.add_argument("--all", action="store_true", help="all 60 targets")
    p.add_argument("--base", default="https://www.afronomicsfeed.com", help="site to print from")
    p.add_argument("--out", default="packs", help="folder for the PDFs (never commit it: the packs are private)")
    args = p.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    failed = []
    for name in names(args):
        url = f"{args.base.rstrip('/')}/pack/sample?for={quote(name)}"
        run = subprocess.run(
            ["node", str(ROOT / "scripts" / "make-documents.mjs"), "--url", url, "--name", slug(name), "--out", str(out)],
            capture_output=True,
            text=True,
        )
        if run.returncode != 0:
            failed.append(name)
            print(f"FAILED {name}: {run.stderr.strip().splitlines()[-1:]}", file=sys.stderr)
        else:
            print(f"{name}: {run.stdout.strip().splitlines()[-1]}")
    print(f"{len(names(args)) - len(failed)} printed, {len(failed)} failed, in {out}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
