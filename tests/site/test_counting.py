"""Who the site counts (lib/bots.ts) and how a share is stored (lib/track.ts eventPath).

The production counts were polluted by our own runs: the site QA's `next start` in CI checks every internal link
(HEAD, user agent "node", no x-vercel-ip-country), which counted /go/fund/* as partner clicks and /api/v1/* as API
usage. These pin the rules that keep such calls out while real readers and outside API callers still count.
Runs the TypeScript directly with node's type stripping (Node 22.6 or later); skipped where that is not available.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]

BROWSER = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36"

# (name, method, headers, counts as a /go click, counts as an API call)
CASES = [
    ("reader on Vercel", "GET", {"user-agent": BROWSER, "x-vercel-ip-country": "KE"}, True, True),
    ("outside script calling the API", "GET", {"user-agent": "curl/8.5.0", "x-vercel-ip-country": "US"}, False, True),
    ("python client calling the API", "GET", {"user-agent": "python-requests/2.32", "x-vercel-ip-country": "GB"}, False, True),
    ("site QA link check, HEAD", "HEAD", {"user-agent": "node"}, False, False),
    ("site QA link check, GET fallback, no country", "GET", {"user-agent": "node"}, False, False),
    ("site QA against production", "GET", {"user-agent": "AfronomicsSiteQA/1.0 (+link check)", "x-afronomics-internal": "site-qa", "x-vercel-ip-country": "US"}, False, False),
    ("internal header alone", "GET", {"user-agent": BROWSER, "x-vercel-ip-country": "KE", "x-afronomics-internal": "1"}, False, False),
    ("HEAD from a real place", "HEAD", {"user-agent": BROWSER, "x-vercel-ip-country": "KE"}, False, False),
    ("browser prefetch (Sec-Purpose)", "GET", {"user-agent": BROWSER, "x-vercel-ip-country": "KE", "sec-purpose": "prefetch"}, False, False),
    ("browser prefetch (Purpose)", "GET", {"user-agent": BROWSER, "x-vercel-ip-country": "KE", "purpose": "prefetch"}, False, False),
    ("Chrome prerender", "GET", {"user-agent": BROWSER, "x-vercel-ip-country": "KE", "sec-purpose": "prefetch;prerender"}, False, False),
    ("Next router prefetch", "GET", {"user-agent": BROWSER, "x-vercel-ip-country": "KE", "next-router-prefetch": "1"}, False, False),
    ("Googlebot", "GET", {"user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1)", "x-vercel-ip-country": "US"}, False, False),
    ("link-preview fetcher", "GET", {"user-agent": "WhatsApp/2.23 LinkPreview", "x-vercel-ip-country": "KE"}, False, False),
    ("our push-alert checker", "GET", {"user-agent": "AfronomicsAlerts/1.0", "x-vercel-ip-country": "IE"}, False, False),
    ("our readers", "GET", {"user-agent": "AfronomicsBot/1.0 (+https://www.afronomicsfeed.com/method)", "x-vercel-ip-country": "US"}, False, False),
    ("browser, no country (not via Vercel)", "GET", {"user-agent": BROWSER}, False, False),
    ("no user agent", "GET", {"x-vercel-ip-country": "KE"}, False, True),
]

SCRIPT = r"""
const [bots, track] = await Promise.all([import(process.argv[1]), import(process.argv[2])]);
const cases = JSON.parse(process.argv[3]);
const headers = (h) => ({ get: (k) => h[k.toLowerCase()] ?? null });
const out = {
  cases: cases.map(([name, method, h]) => [name, bots.countsAsClick(method, headers(h)), bots.countsAsApiCall(method, headers(h))]),
  paths: [
    track.eventPath("share", "/morning", "whatsapp"),
    track.eventPath("share", "/morning", "WhatsApp_Channel"),
    track.eventPath("share", "/morning", "x;drop"),
    track.eventPath("share", "/morning", undefined),
    track.eventPath("pricing_cta_click", "/pricing", "x"),
    track.eventPath("share", "/" + "a".repeat(199), "linkedin"),
  ],
};
console.log(JSON.stringify(out));
"""


@pytest.fixture(scope="module")
def results():
    node = shutil.which("node")
    if not node:
        pytest.skip("node is not installed")
    major, minor = (int(x) for x in subprocess.run([node, "-p", "process.versions.node"], capture_output=True, text=True, check=True).stdout.split(".")[:2])
    if (major, minor) < (22, 6):
        pytest.skip("node cannot run TypeScript directly before 22.6")
    cases = [[name, method, headers] for name, method, headers, _, _ in CASES]
    out = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT,
         (ROOT / "lib/bots.ts").as_uri(), (ROOT / "lib/track.ts").as_uri(), json.dumps(cases)],
        capture_output=True, text=True, check=True, cwd=ROOT,
    )
    return json.loads(out.stdout)


@pytest.mark.parametrize("name,method,headers,click,api", CASES, ids=[c[0] for c in CASES])
def test_who_is_counted(results, name, method, headers, click, api):
    got = {row[0]: (row[1], row[2]) for row in results["cases"]}[name]
    assert got == (click, api), f"{name}: click/api counted {got}, expected {(click, api)}"


def test_share_network_is_kept_with_the_path(results):
    paths = results["paths"]
    assert paths[0] == "/morning,whatsapp"
    assert paths[1] == "/morning,whatsapp_channel"
    assert paths[2] == "/morning"  # anything but a plain network name is dropped, not stored
    assert paths[3] == "/morning"
    assert paths[4] == "/pricing"  # only shares carry a network
    assert len(paths[5]) == 200 and paths[5].endswith(",linkedin")  # still fits af_event's 200-character path check
