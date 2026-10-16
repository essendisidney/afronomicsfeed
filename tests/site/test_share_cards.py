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
SHAREABLE = ["(home)", "receipts", "record", "tools", "stories", "markets", "rates", "brief", "explainers", "weekly", "registry", "chama"]

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
    assert "receiptSignature" in src
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


def test_card_colours_come_from_the_design_tokens():
    # One module knows colours (lib/og-tokens.ts, read from app/globals.css); the signature card draws with it.
    sig = (ROOT / "lib" / "og-signature.tsx").read_text()
    cards = (ROOT / "lib" / "share-cards.ts").read_text()
    assert "ogTokens()" in sig
    assert not re.search(r"#[0-9a-fA-F]{6}", sig + cards), "hard-coded colour in the share cards"
    tokens = (ROOT / "lib" / "og-tokens.ts").read_text()
    assert "globals.css" in tokens


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
    assert "<ChartShare" in (ROOT / "components" / "charts" / "ChartFrame.tsx").read_text()
    assert 'campaign="call"' in (ROOT / "components" / "record" / "EditorialCalls.tsx").read_text()
