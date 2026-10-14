"""The end-of-story pilot offer (components/article/PilotCta.tsx) must land on the pilot form and be attributable.

Pins: the link goes to the form's anchor with ?from=story-<slug>; PilotForm reads that `from` parameter into the
lead's source; the click is counted under an allowed event name; and the offer is limited to debt and policy-rate
stories, never the saver guides.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CTA = (ROOT / "components/article/PilotCta.tsx").read_text()
FORM = (ROOT / "components/billing/PilotForm.tsx").read_text()
PAGE = (ROOT / "app/data/frontier-local-debt/page.tsx").read_text()
TRACK = (ROOT / "lib/track.ts").read_text()


def test_link_lands_on_the_form_with_story_attribution():
    assert "/data/frontier-local-debt?from=story-${slug}#pilot" in CTA
    assert 'id="pilot"' in PAGE
    assert 'get("from")' in FORM and "source: pilotSource()" in FORM
    assert ".slice(0, 150)" in FORM  # /api/pilot keeps 150 characters of source


def test_click_is_counted_under_an_allowed_event():
    event = re.search(r'data-track="([a-z_]+)"', CTA).group(1)
    assert f'"{event}"' in TRACK


def test_offer_only_on_debt_and_rate_stories_not_saver_guides():
    assert 'new Set(["treasury-bills", "mpc"])' in CTA
    assert 'slug.startsWith("learn-")' in CTA
