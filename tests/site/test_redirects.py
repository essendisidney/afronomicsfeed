"""The rebuild's redirect map (docs/rebuild/BRIEF.md section 4, docs/rebuild/phase-1-plan.md) and the new links.

- Every parked route in the brief has a permanent redirect, except /chama, which stays live until the end of
  October 2026 by the founder's decision.
- Every redirect destination is a page that exists in app/ and is not itself redirected (no chains).
- Every link in the navigation, the footer and the hub pages resolves to a page in app/ and is not redirected.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG = (ROOT / "next.config.ts").read_text()
SITE = (ROOT / "lib/site.ts").read_text()
HUBS = (ROOT / "lib/hubs.ts").read_text()

PARKED_IN_BRIEF = [
    "/tenders", "/radio", "/rent-check", "/pay-check", "/diaspora", "/send-money", "/trade", "/technology",
    "/climate", "/capital", "/economy", "/jobs", "/ask",
]
KEPT_FOR_NOW = {"/chama"}


def pairs(block: str) -> list[tuple[str, str]]:
    body = CONFIG.split(f"{block}: Array<[string, string]> = [", 1)[1].split("];", 1)[0]
    return re.findall(r'\["([^"]+)", "([^"]+)"\]', body)


PARKED = pairs("parked")
LEGACY = pairs("legacy")
SOURCES = {s for s, _ in PARKED + LEGACY} | {"/pay"}


def route_patterns() -> list[re.Pattern[str]]:
    """Every page (and document route) in app/ as a regex: [slug] matches one segment."""
    out = []
    # Pages, and route handlers that serve a document (e.g. the print-ready /pack/sample and /watch/sample).
    files = list((ROOT / "app").rglob("page.tsx")) + [p for p in (ROOT / "app").rglob("route.ts") if "/api/" not in p.as_posix()]
    for page in files:
        # Route groups, "(home)", are folders only: they are not part of the address.
        rel = "/".join(s for s in page.parent.relative_to(ROOT / "app").parts if not (s.startswith("(") and s.endswith(")")))
        path = "/" + rel
        out.append(re.compile("^" + re.sub(r"\\\[[^\]]+\\\]", "[^/]+", re.escape(path)) + "$"))
    return out


ROUTES = route_patterns()


def is_page(path: str) -> bool:
    bare = path.split("#", 1)[0].split("?", 1)[0] or "/"
    return any(p.match(bare) for p in ROUTES)


def redirected(path: str) -> bool:
    bare = path.split("#", 1)[0].split("?", 1)[0]
    for src in SOURCES:
        rx = "^" + re.sub(r":[a-z]+[+*]", ".*", re.sub(r":[a-z]+(?![+*])", "[^/]+", src)) + "$"
        if re.match(rx, bare):
            return True
    return False


def test_every_parked_route_is_redirected():
    sources = {s for s, _ in PARKED}
    missing = [r for r in PARKED_IN_BRIEF if r not in sources]
    assert not missing, f"parked but not redirected: {missing}"
    assert not (KEPT_FOR_NOW & sources), "/chama stays live until the end of October 2026"


def test_parked_pages_are_out_of_the_build():
    # Phase 6: a parked route keeps its redirect but has no page in app/; the code stays in git history.
    left = [s for s, _ in PARKED if ":" not in s and (ROOT / "app" / s.lstrip("/")).exists()]
    assert not left, f"parked routes still in app/: {left}"


def test_parked_subpaths_are_covered():
    sources = {s for s, _ in PARKED}
    for base in ("/tenders", "/jobs", "/send-money"):
        assert f"{base}/:path*" in sources, f"{base}/... would 404"


def test_destinations_exist_and_do_not_chain():
    for src, dest in PARKED + LEGACY:
        if ":" in dest:
            continue  # parameterised destinations resolve to dynamic pages, checked by site QA
        assert is_page(dest), f"{src} -> {dest}: no such page"
        assert not redirected(dest), f"{src} -> {dest} is itself redirected (chain)"


def test_nav_footer_and_hub_links_resolve():
    hrefs = set(re.findall(r'href: "([^"]+)"', SITE)) | set(re.findall(r'href: "([^"]+)"', HUBS))
    bad = sorted(h for h in hrefs if h.startswith("/") and (not is_page(h) or redirected(h)))
    assert not bad, f"links that 404 or redirect: {bad}"
