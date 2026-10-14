"""Offline checks on the site QA's own configuration and copy rules (the browser run lives in scripts/site-qa.mjs).

Keeps tests/site/pages.json covering every template the gate promises, keeps every allowlist entry explained, and
pins the overclaim rules so a regex edit cannot silently stop catching (or start over-catching) a phrase.
"""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
PAGES = json.loads((ROOT / "tests/site/pages.json").read_text(encoding="utf-8"))["pages"]
ALLOWLIST = json.loads((ROOT / "tests/site/allowlist.json").read_text(encoding="utf-8"))["entries"]
CHECKS = {"status", "error", "overflow", "console", "link", "axe", "img-alt", "meta", "h1", "tap-target", "layout", "copy"}

REQUIRED = [
    "/", "/pricing", "/licensing", "/buying", "/trust", "/about", "/editorial-standards",
    "/data/frontier-local-debt", "/data/frontier-local-debt/monitor", "/markets", "/markets/tbills",
    "/markets/bonds", "/markets/kenya-tbills", "/markets/kenya-bonds", "/east-africa", "/rates/kenya",
    "/rates/kenya/money-market-funds", "/rates/kenya/loan-apps", "/brief", "/weekly", "/morning", "/developers",
    "/data-api", "/downloads", "/status", "/corrections", "/countries/kenya", "/thank-you",
    "/numbers", "/compare", "/stories", "/sw", "/casebook", "/registry",
]


def fixed_paths():
    for entry in PAGES:
        if isinstance(entry, str):
            yield entry
        elif "path" in entry:
            yield entry["path"]


def test_required_pages_are_listed():
    missing = sorted(set(REQUIRED) - set(fixed_paths()))
    assert not missing, f"pages.json lost {missing}"


def test_discovered_templates_are_listed():
    discovered = {(e["discover"], e["match"]) for e in PAGES if isinstance(e, dict) and "discover" in e}
    froms = {d for d, _ in discovered}
    assert {"/markets/tbills", "/markets/bonds", "/brief"} <= froms
    bond_each = [e for e in PAGES if isinstance(e, dict) and e.get("discover") == "/markets/bonds" and "each" in e]
    assert bond_each, "one dated auction per bond market must be discovered"


def test_a_404_page_is_checked():
    assert any(isinstance(e, dict) and e.get("status") == 404 for e in PAGES)


def test_discover_patterns_compile():
    import re

    for entry in PAGES:
        if isinstance(entry, dict) and "discover" in entry:
            re.compile(entry["match"])
            if "each" in entry:
                re.compile(entry["each"]["match"].replace("{parent}", "/x"))


@pytest.mark.parametrize("entry", ALLOWLIST, ids=lambda e: f"{e.get('check')}:{e.get('page')}:{e.get('match')}")
def test_allowlist_entries_are_explained(entry):
    assert entry.get("check") in CHECKS, f"unknown check {entry.get('check')!r}"
    assert entry.get("page"), "page is required ('*' for every page)"
    assert entry.get("match"), "match is required"
    assert len(str(entry.get("reason", "")).strip()) >= 15, "say why this use is correct"


COPY_CASES = [
    ("Rates for every African currency.", ["every-african"]),
    ("Our data is cited by institutions across the region.", ["cited-by-institutions"]),
    ("Results the minute they publish.", ["the-minute-they-publish"]),
    ("Returns are guaranteed.", ["guaranteed"]),
    ("A fund yield moves daily and is not guaranteed.", []),
    ("The best money market fund this month.", ["best-fund"]),
    ("Best money market fund in Kenya by yield, October 2026.", []),
    ("Best fund by yield, after tax: 11.40%", []),
    ("African currencies against the dollar.", []),
]


@pytest.fixture(scope="module")
def copy_findings():
    node = shutil.which("node")
    if not node:
        pytest.skip("node is not installed")
    script = (
        "import(process.argv[1]).then(m => {"
        " const cases = JSON.parse(process.argv[2]);"
        " console.log(JSON.stringify(cases.map(t => m.copyFindings(t).map(f => f.rule)))); })"
    )
    texts = [text for text, _ in COPY_CASES]
    module = (ROOT / "scripts/site-qa.mjs").as_uri()
    out = subprocess.run([node, "-e", script, module, json.dumps(texts)], capture_output=True, text=True, check=True, cwd=ROOT)
    return dict(zip(texts, json.loads(out.stdout)))


@pytest.mark.parametrize("text,rules", COPY_CASES)
def test_copy_rules(copy_findings, text, rules):
    assert copy_findings[text] == rules
