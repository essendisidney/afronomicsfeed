"""The Watch pack (docs/rebuild/phase-5-plan.md): the soundness page states figures beside SASRA's standards with no
verdict; the sample describes no SACCO; a private pack is served only for a link signed for that SACCO."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HTML = (ROOT / "lib/editions/watch-html.ts").read_text()
WATCH = (ROOT / "lib/watch.ts").read_text()
PRIVATE = (ROOT / "app/watch/[slug]/[token]/route.ts").read_text()
SAMPLE = (ROOT / "app/watch/sample/route.ts").read_text()
LINK = (ROOT / "lib/watch-link.ts").read_text()

VERDICTS = re.compile(r"\b(weak|strong|healthy|unhealthy|risky|at risk|breach|fails?|failing|passes|below the minimum|above the minimum|warning|danger|concern)\b", re.I)


def test_soundness_page_has_no_verdict_words():
    # The soundness section: from its heading to the sector section that follows it (lib/editions/watch-html.ts).
    p2 = HTML.split("meta.sections[1],", 1)[1].split("    sector\n      ? section(", 1)[0]
    assert "Soundness ratios" in p2
    assert not VERDICTS.search(p2), VERDICTS.search(p2)
    standards = WATCH.split("const STANDARDS", 1)[1].split("};", 1)[0]
    assert not VERDICTS.search(standards)


def test_standards_are_sasra_s_printed_levels():
    for level in ("minimum 10%", "minimum 8%", "maximum 25%", "minimum 5%"):
        assert level in WATCH


def test_sample_describes_no_sacco():
    assert "buildWatch(null" in SAMPLE
    assert 'name: inst ? inst.name : "Median large-tier deposit-taking SACCO"' in WATCH
    # In the sample the SACCO column is the tier median, and no per-SACCO source is printed.
    assert "const own = sample ? l.median" in HTML


def test_private_pack_needs_a_signed_link():
    assert "checkWatchToken(slug, token)" in PRIVATE and "status: 404" in PRIVATE
    assert '"Cache-Control": "private, no-store"' in PRIVATE and "noindex" in PRIVATE
    assert "timingSafeEqual" in LINK and "afronomics-watch-pack:v1" in LINK


def test_revocation_file_is_valid():
    data = json.loads((ROOT / "data/watch/revoked.json").read_text())
    for r in data["revoked"]:
        assert set(r) == {"slug", "issued_before"} and re.match(r"^\d{4}-\d{2}-\d{2}$", r["issued_before"])
