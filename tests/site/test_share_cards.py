"""Share cards (docs/rebuild/phase-7b-plan.md, 7b-2): every Receipt and every tool page declares its own preview card,
so a link pasted into LinkedIn or WhatsApp shows that page's number, not the site-wide card."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "app"

NO_CARD: dict[str, str] = {}

# The pages people share (docs/rebuild/phase-7b-plan.md, 7b-2): every page under these folders must have a card of its
# own or one from a parent folder, never only the site-wide app/opengraph-image.tsx.
SHAREABLE = ["(home)", "receipts", "record", "tools", "stories", "markets", "rates", "brief", "explainers", "weekly", "registry", "chama", "diaspora"]

CALCULATORS = ["SalaryCalculator", "LoanCalculator", "SavingsGoalPlanner", "InflationCalculator", "MpesaCalculator", "IpoCalculator", "TbillCalculator"]


def tool_hrefs() -> list[str]:
    return re.findall(r'href: "([^"]+)"', (ROOT / "lib" / "tools.ts").read_text())


def tool_questions() -> dict[str, str]:
    src = (ROOT / "lib" / "share-cards.ts").read_text()
    block = src.split("export const toolQuestions", 1)[1].split("};", 1)[0]
    return dict(re.findall(r'"([^"]+)": "([^"]+)"', block))


def test_every_receipt_page_declares_its_own_card():
    card = APP / "receipts" / "[slug]" / "opengraph-image.tsx"
    assert card.exists(), "Receipts would share the site-wide card"
    src = card.read_text()
    # The Receipt card is the cream slip (lib/brand/receipt-card.tsx).
    assert "receiptCard(" in src
    # A draft never gets a card in production: the card reads the Receipt through getReceipt (showDrafts) and 404s.
    assert "getReceipt(" in src and "notFound()" in src
    assert list((ROOT / "content" / "receipts").glob("*.md")), "no Receipts to check"


def test_every_tool_page_declares_its_own_card():
    hrefs = tool_hrefs()
    assert len(hrefs) >= 10
    missing = [h for h in hrefs if h not in NO_CARD and not (APP / h.lstrip("/") / "opengraph-image.tsx").exists()]
    assert not missing, f"tool pages without their own share card: {missing}"
    for h in hrefs:
        if h in NO_CARD:
            continue
        src = (APP / h.lstrip("/") / "opengraph-image.tsx").read_text()
        assert f'toolSignature("{h}")' in src or "sectionSignature(" in src, h


def test_tools_stories_and_home_have_cards():
    for path in ["tools", "stories", "(home)"]:
        assert (APP / path / "opengraph-image.tsx").exists(), path
    # The root card stays the site-wide default; the home card sits in a route group so no other page inherits it.
    assert (APP / "(home)" / "page.tsx").exists() and not (APP / "page.tsx").exists()


def test_tool_card_questions_match_the_page_headings():
    for href, question in tool_questions().items():
        page = (APP / href.lstrip("/") / "page.tsx").read_text()
        assert f'title="{question}"' in page, f"{href}: the card asks {question!r}, the page heading differs"


def test_calculators_open_on_the_shared_defaults():
    # The card's worked example uses lib/tool-defaults.ts; the calculator must open on the same values, not its own.
    for name in CALCULATORS:
        src = (ROOT / "components" / "data" / f"{name}.tsx").read_text()
        assert "toolDefaults." in src, name


def test_number_shares_are_by_reference_only():
    src = (ROOT / "lib" / "share.ts").read_text()
    parse = src.split('if (kind === "number")', 1)[1].split("\n  }\n", 1)[0]
    # Only a tile id from a fixed list, or a Receipt slug and a tile number; never a value, label or source.
    assert set(re.findall(r'q\.get\("(\w+)"\)', parse)) == {"tile", "receipt"}
    assert "todayTileIds" in parse and "RECEIPT_SLUG" in parse


def test_no_shareable_page_falls_back_to_the_site_card():
    bare = []
    for top in SHAREABLE:
        for page in (APP / top).rglob("page.tsx"):
            d = page.parent
            while d != APP and not (d / "opengraph-image.tsx").exists():
                d = d.parent
            if d == APP:
                bare.append(page.parent.relative_to(APP).as_posix())
    assert not bare, f"pages that would share the site-wide card: {sorted(bare)}"


BRAND = ROOT / "lib" / "brand" / "card-style.ts"
# Everything that draws a share card or a chart outside the site's stylesheet: colours come only from BRAND.
DRAWN_FROM_BRAND = [
    "lib/og-signature.tsx",
    "lib/og-tokens.ts",
    "lib/share-cards.ts",
    "lib/og-card.tsx",
    "lib/og-article.tsx",
    "lib/og-builders.tsx",
    "lib/brand/receipt-card.tsx",
    "lib/brand/stamp-badge.tsx",
    "lib/charts/render.ts",
    "lib/charts/embed.ts",
    "lib/charts/export.ts",
    "lib/charts/palette.ts",
    "components/rates/Spark.tsx",
    "components/rates/SeriesChart.tsx",
    "components/rates/KeyRates.tsx",
    "components/rates/SeriesBits.tsx",
    "components/data/Sparkline.tsx",
    "components/data/StatTile.tsx",
]
HEX = re.compile(r"#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])|rgba?\(\s*\d")


def brand_hexes(name: str) -> dict[str, str]:
    """The `name` object of lib/brand/card-style.ts as {key: lowercase hex}."""
    src = BRAND.read_text()
    block = src.split(f"export const {name} = {{", 1)[1].split("} as const;", 1)[0]
    return {k: v.lower() for k, v in re.findall(r'"?([\w-]+)"?: "(#[0-9A-Fa-f]{6})"', block)}


def css_tokens(selector: str) -> dict[str, str]:
    """Every `--name: #hex;` set in app/globals.css blocks that open with exactly `selector {`, later blocks winning."""
    css = (APP / "globals.css").read_text()
    out: dict[str, str] = {}
    for body in re.findall(rf"(?m)^{re.escape(selector)} \{{([^{{}}]*)\}}", css):
        out.update({k: v.lower() for k, v in re.findall(r"--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;", body)})
    return out


def test_card_and_chart_colours_come_from_the_brand_palette():
    # One module knows colours (lib/brand/card-style.ts); the cards and the charts draw with it.
    sig = (ROOT / "lib" / "og-signature.tsx").read_text()
    assert "ogTokens()" in sig
    assert "@/lib/brand/card-style" in (ROOT / "lib" / "og-tokens.ts").read_text()
    for rel in DRAWN_FROM_BRAND:
        src = (ROOT / rel).read_text()
        assert not HEX.search(src), f"hard-coded colour in {rel}: {HEX.search(src).group(0)}"


def test_brand_palette_matches_the_site_tokens():
    # The cards and the site share one palette: the brand module and app/globals.css never drift apart.
    light, dark = css_tokens(":root"), css_tokens(".dark")
    brand, brand_dark, desks = brand_hexes("brand"), brand_hexes("brandDark"), brand_hexes("deskColors")
    pairs_light = {"sig": "laterite", "sig-ink": "lateriteInk", "stamp-paper": "stampPaper", "ink": "ink", "ink-soft": "inkSoft",
                   "muted": "muted", "paper": "paper", "paper-2": "paper2", "rule": "rule", "surface": "surface", "night": "night",
                   "night-2": "night2", "night-ink": "nightInk", "night-soft": "nightSoft", "night-muted": "nightMuted", "up": "up", "down": "down"}
    for css, key in pairs_light.items():
        assert light[css] == brand[key], f"--{css} {light[css]} != brand.{key} {brand[key]}"
    pairs_dark = {"sig": "laterite", "sig-ink": "lateriteInk", "paper": "paper", "surface": "surface", "ink": "ink", "ink-soft": "inkSoft",
                  "muted": "muted", "rule": "rule"}
    for css, key in pairs_dark.items():
        assert dark[css] == brand_dark[key], f".dark --{css} {dark[css]} != brandDark.{key} {brand_dark[key]}"
    assert dark["up"] == brand["upOnNight"] and dark["down"] == brand["downOnNight"]
    for desk, hex_ in desks.items():
        assert light[f"desk-{desk}"] == hex_, desk


def test_chart_colours_match_the_site_tokens():
    # The page draws charts with CSS variables; the PNG export and the embed use the same colours as hex.
    src = BRAND.read_text()
    block = src.split("export const chartColors = {", 1)[1].split("} as const;", 1)[0]
    resolved = {**{f"brand.{k}": v for k, v in brand_hexes("brand").items()}, **{f"brandDark.{k}": v for k, v in brand_hexes("brandDark").items()}}

    def mode(name: str) -> dict[str, str]:
        body = re.search(rf"{name}: \{{([^}}]*)\}}", block).group(1)
        return {k: (resolved[v] if v in resolved else v.strip('"').lower()) for k, v in re.findall(r"(\w+): (\"#[0-9A-Fa-f]{6}\"|brand(?:Dark)?\.\w+)", body)}

    light, dark = css_tokens(":root"), css_tokens(".dark")
    for css_vars, chart in ((light, mode("light")), (dark, mode("dark"))):
        assert css_vars["chart-accent"] == chart["accent"]
        assert css_vars["chart-quiet"] == chart["quiet"]
        assert css_vars["chart-quiet-ink"] == chart["quietInk"]
        assert css_vars["surface"] == chart["surface"] and css_vars["ink"] == chart["ink"] and css_vars["rule"] == chart["rule"]
    render = (ROOT / "lib" / "charts" / "render.ts").read_text()
    assert 'accent: "var(--chart-accent)"' in render
    # The highlight is never the "down" crimson.
    assert mode("light")["accent"] != light["down"] and mode("dark")["accent"] != dark["down"]


# What counts as a visible share control: the share bar (directly, through PageShell or PageShare, or in an article
# or Receipt template), the result share rows of the tools, or the per-figure share buttons.
SHARE_MARKERS = re.compile(r"<PageShell(?![^>]*share=\{false\})|<ShareBar|<PageShare|<ShareRow|<ShareResult|<ShareNumberButton|<ArticleTemplate")
SHARE_PAGES = SHAREABLE + ["casebook", "morning", "data", "numbers"]


def _has_share(path: Path, depth: int = 2) -> bool:
    src = path.read_text()
    if SHARE_MARKERS.search(src):
        return True
    if depth == 0:
        return False
    for mod in re.findall(r'from "@/components/([^"]+)"', src):
        f = ROOT / "components" / f"{mod}.tsx"
        if f.exists() and _has_share(f, depth - 1):
            return True
    return False


def test_every_shareable_page_shows_a_share_bar():
    bare = [p.parent.relative_to(APP).as_posix() for top in SHARE_PAGES for p in (APP / top).rglob("page.tsx") if not _has_share(p)]
    assert not bare, f"shareable pages without a visible share control: {sorted(bare)}"


def test_receipts_share_under_the_verdict_and_at_the_end_and_per_tile():
    src = (ROOT / "components" / "receipts" / "ReceiptView.tsx").read_text()
    verdict = src.index("<VerdictLine r={r} />")
    assert src.index("<ShareBar", verdict) < src.index("<FigureTiles", verdict)
    assert 'variant="block"' in src and "<ShareNumberButton" in src


def test_charts_and_calls_have_share_icons():
    frame = (ROOT / "components" / "charts" / "ChartFrame.tsx").read_text()
    # Exactly one share control per chart: the link icon only where the chart has no ChartTools (whose Share sends the PNG).
    assert "{tools ? null : <ChartShare" in frame
    assert "share()" in (ROOT / "components" / "charts" / "ChartTools.tsx").read_text()
    assert 'campaign="call"' in (ROOT / "components" / "record" / "EditorialCalls.tsx").read_text()
