"""Charts (lib/charts/render.ts): notes on the chart are checked like the rest of a Receipt, and every published chart can be embedded."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))

import receipt_check  # noqa: E402

TBILLS = ROOT / "content" / "receipts" / "2026-10-15-tbill-returns-collapse.md"
EMBED_ROUTE = ROOT / "app" / "embed" / "chart" / "[slug]" / "[n]" / "route.ts"
BUILT = ROOT / ".next" / "server" / "app" / "embed" / "chart"


def load():
    return receipt_check.split(TBILLS.read_text())


def with_notes(notes, chart=0):
    data, body = load()
    charts = [dict(c) for c in data["charts"]]
    charts[chart] = {**charts[chart], "annotations": notes}
    return receipt_check.problems({**data, "charts": charts}, body, TBILLS.name)


def published():
    for path in sorted((ROOT / "content" / "receipts").glob("*.md")):
        data, _ = receipt_check.split(path.read_text())
        if data.get("status") == "published":
            yield path.stem, data


def test_valid_notes_pass():
    assert with_notes([{"x": "Aug 24", "label": "CBK's first cut"}, {"from": "Jan 24", "to": "Apr 24", "label": "A span"}]) == []


@pytest.mark.parametrize(
    "notes, problem",
    [
        ([{"x": "Aug 2025", "label": "Not a bar on this chart"}], ".x: 'Aug 2025' is not one of the chart's labels"),
        ([{"from": "Apr 26", "to": "Jan 24", "label": "Backwards"}], "from must come before to"),
        ([{"from": "Jan 24", "to": "Never", "label": "Unknown end"}], ".to: 'Never' is not one of the chart's labels"),
        ([{"x": "Aug 24"}], "needs a label"),
        ([{"x": "Aug 24", "label": "x" * 49}], "too long to read on a phone"),
        ([{"x": "Aug 24", "from": "Jan 24", "to": "Apr 24", "label": "Both"}], "not both"),
        ([{"label": "Points at nothing"}], "needs x, or from and to"),
        ([{"x": "Aug 24", "label": "Typo", "lable": "?"}], "unknown field(s) lable"),
        ([{"x": "Aug 24", "label": str(i)} for i in range(4)], "at most 3 notes"),
        ("Aug 24", "a list of notes"),
    ],
)
def test_bad_notes_are_refused(notes, problem):
    found = with_notes(notes)
    assert any(problem in p and "annotations" in p for p in found), found


def test_a_highlight_must_name_a_bar():
    data, body = load()
    charts = [{**data["charts"][0], "highlight": ["Oct 2026"]}, *data["charts"][1:]]
    found = receipt_check.problems({**data, "charts": charts}, body, TBILLS.name)
    assert any("charts[0].highlight" in p for p in found)


def test_published_notes_name_their_bars():
    # The fact behind each note is the desk's check; the shape is checked for every published chart here.
    for slug, data in published():
        for i, chart in enumerate(data.get("charts") or []):
            labels = [str(p["label"]) for p in chart["data"]]
            assert receipt_check.annotation_problems(chart.get("annotations"), labels, f"{slug} charts[{i}]") == []


def test_embed_route_exists_for_published_charts():
    src = EMBED_ROUTE.read_text()
    # Every chart of every visible Receipt is generated, numbered from 1, and the page refuses everything else.
    assert "generateStaticParams" in src and "r.charts.map" in src and "i + 1" in src
    assert "dynamicParams = false" in src
    assert '"X-Robots-Tag": "noindex"' in src and '"frame-ancestors *"' in src
    charts = [(slug, len(data.get("charts") or [])) for slug, data in published()]
    assert sum(n for _, n in charts) > 0
    if not BUILT.exists():
        pytest.skip("no production build here; the route source is checked above")
    for slug, n in charts:
        for k in range(1, n + 1):
            body = BUILT / slug / f"{k}.body"
            assert body.exists(), f"no embed built for {slug} chart {k}"
            html = body.read_text()
            assert '<meta name="robots" content="noindex">' in html
            assert f"/receipts/{slug}" in html


def test_embed_pages_may_be_framed_and_the_rest_of_the_site_may_not():
    config = (ROOT / "next.config.ts").read_text()
    assert re.search(r'source: "/\(\(\?!embed/\)\.\*\)", headers: \[\{ key: "X-Frame-Options", value: "SAMEORIGIN" \}\]', config)


def test_percent_sign_only_for_percentage_units():
    """A "%" inside a figure in the unit ("after 15% tax, KES") must not put "%" on every bar (it did on the T-bill chart)."""
    import shutil
    import subprocess

    node = shutil.which("node")
    if not node:
        pytest.skip("node not installed")
    script = (
        'import { isPercentUnit } from "./lib/charts/render.ts";'
        "const cases = %s;"
        "const bad = Object.entries(cases).filter(([u, want]) => isPercentUnit(u) !== want);"
        "if (bad.length) { console.error(JSON.stringify(bad)); process.exit(1); }"
    ) % json.dumps(
        {
            "%": True,
            "% a year": True,
            "Growth in 2025, %": True,
            "Dividend paid as % of the year's profit": True,
            "Interest kept after 15% tax, KES, one 364-day bill": False,
            "KES bn": False,
        }
    )
    run = subprocess.run([node, "--input-type=module", "-e", script], cwd=ROOT, capture_output=True, text=True)
    assert run.returncode == 0, run.stderr
