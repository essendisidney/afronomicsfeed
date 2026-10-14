"""Live check of the institutional pilot path, end to end, against the production site.

Run by .github/workflows/pilot-smoke.yml (manual). It proves what a prospect who answers our outreach will meet:

1. The pilot page loads and carries the form.
2. Without a key, the API gives the free slice (truncated, X-Afronomics-Free-Tier).
3. The self-serve form (POST /api/pilot) issues a trial key and emails it. The address is Resend's test inbox
   (delivered+<tag>@resend.dev), which accepts mail without delivering it to anyone, and is not free webmail, so the
   real issuing path runs.
4. A trial key (issued with af_trial_key_issue, the same function the form uses) unlocks the full history on the JSON
   API and the CSV download.

The key is masked in the log and never printed. Every row it creates (lead, pilot deal, two trial keys) is tagged
"Afronomics smoke test" and @resend.dev, so the desk can remove them afterwards; see docs/qa.md.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

import requests

SITE = os.environ.get("SITE_URL", "https://www.afronomicsfeed.com").rstrip("/")
SECRET = os.environ.get("AF_CRON_SECRET", "")
TAG = os.environ.get("SMOKE_TAG", "local")
UA = {"User-Agent": "AfronomicsPilotSmoke/1.0", "x-afronomics-internal": "1"}

store = Path(__file__).resolve().parent.parent / "lib" / "store.ts"
src = store.read_text()
PROJECT_URL = re.search(r'PROJECT_URL = "([^"]+)"', src).group(1)
PUBLISHABLE = re.search(r'PUBLISHABLE_KEY = "([^"]+)"', src).group(1)

results: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str = "") -> bool:
    results.append((name, ok, detail))
    print(f"{'PASS' if ok else 'FAIL'}  {name}{f' :: {detail}' if detail else ''}", flush=True)
    return ok


def main() -> int:
    # 1. Pilot page
    r = requests.get(f"{SITE}/data/frontier-local-debt", headers=UA, timeout=30)
    check("pilot page loads", r.status_code == 200, f"HTTP {r.status_code}")
    check("pilot page has the form", 'id="pilot"' in r.text, "anchor #pilot")

    # 2. Keyless API: free slice
    r = requests.get(f"{SITE}/api/v1/bonds/kenya", params={"from": "2010-01-01", "limit": 5000}, headers=UA, timeout=30)
    body = r.json() if r.ok else {}
    check(
        "keyless API is the free tier",
        r.ok and r.headers.get("X-Afronomics-Free-Tier") == "true" and body.get("truncated") is True,
        f"HTTP {r.status_code}, rows {body.get('count')}, truncated {body.get('truncated')}",
    )
    free_rows = body.get("count") or 0

    # 3. The form
    email = f"delivered+pilot-{TAG}@resend.dev"
    r = requests.post(
        f"{SITE}/api/pilot",
        json={
            "name": "Afronomics smoke test",
            "email": email,
            "organisation": "Afronomics smoke test (QA)",
            "markets": ["kenya", "nigeria"],
            "next": "fx",
            "source": "smoke-test",
        },
        headers=UA,
        timeout=60,
    )
    form = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
    status = form.get("status")
    check("pilot form answers", r.ok and form.get("ok") is True, f"HTTP {r.status_code}, status {status}")
    check(
        "pilot form issues a key at once",
        status == "issued",
        {"pending": "no key: AF_CRON_SECRET missing on Vercel or migration 0035 not applied",
         "limited": "domain or daily cap reached: clean up old smoke keys",
         "exists": "a live smoke key already exists for this address"}.get(status or "", f"status {status}"),
    )
    if status == "issued":
        check("key email accepted by Resend", form.get("emailed") is not False, "emailed" if form.get("emailed") is not False else "RESEND failed")
        check("form never returns the key", "key" not in form and form.get("prefix", "").startswith("afk_"), f"prefix only ({len(form.get('prefix', ''))} chars)")

    # 4. A key unlocks the full history
    if not SECRET:
        check("trial key unlocks full history", False, "AF_CRON_SECRET not available to this run")
    else:
        r = requests.post(
            f"{PROJECT_URL}/rest/v1/rpc/af_trial_key_issue",
            json={"p_secret": SECRET, "p_email": f"delivered+key-{TAG}@resend.dev", "p_label": f"Pilot: Afronomics smoke test ({TAG})", "p_days": 1},
            headers={"apikey": PUBLISHABLE, "Authorization": f"Bearer {PUBLISHABLE}", "Content-Type": "application/json"},
            timeout=30,
        )
        issued = r.json() if r.ok else None
        key = issued.get("key") if isinstance(issued, dict) else None
        if key:
            print(f"::add-mask::{key}", flush=True)
        if check("trial key issued by af_trial_key_issue", bool(key), f"status {issued.get('status') if isinstance(issued, dict) else r.status_code}"):
            auth = {**UA, "Authorization": f"Bearer {key}"}
            r = requests.get(f"{SITE}/api/v1/bonds/kenya", params={"from": "2010-01-01", "limit": 5000}, headers=auth, timeout=30)
            body = r.json() if r.ok else {}
            rows = body.get("rows") or []
            first = min((str(x.get("value_date") or x.get("date") or "") for x in rows), default="")
            check(
                "JSON API with key: full history",
                r.ok and "free_tier" not in body and (body.get("count") or 0) > free_rows and first.startswith("2010"),
                f"HTTP {r.status_code}, rows {body.get('count')} (free: {free_rows}), first {first}, plan {r.headers.get('X-Afronomics-Plan')}",
            )
            r = requests.get(f"{SITE}/api/data/kenya-bonds", headers=auth, timeout=30)
            lines = r.text.splitlines()
            check(
                "CSV with key: full file, no free-tier notice",
                r.ok and not any(l.startswith("#") for l in lines[:3]) and len(lines) > 100,
                f"HTTP {r.status_code}, {len(lines)} lines",
            )

    failed = [n for n, ok, _ in results if not ok]
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as f:
            f.write("## Pilot path smoke test\n\n| Check | Result | Detail |\n|---|---|---|\n")
            for n, ok, d in results:
                f.write(f"| {n} | {'pass' if ok else '**FAIL**'} | {d} |\n")
            f.write(f"\nTest rows to remove: tag `{TAG}`, emails `delivered+*-{TAG}@resend.dev`.\n")
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed. Tag: {TAG}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
