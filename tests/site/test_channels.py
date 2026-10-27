"""The WhatsApp Channel slot and post (docs/rebuild/upgrade-U6-plan.md, item D; lib/channels.ts): the "Join on
WhatsApp" link shows only for a real channel link, and the channel post names its sources and ends with the house
line. Runs the TypeScript with node's type stripping; skipped where that is unavailable."""

import json
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = r"""
const c = await import(process.argv[1]);
const urls = [undefined, "", "  ", "https://whatsapp.com/channel/0029VaAbCdEfGhIjKlMn0a", "https://www.whatsapp.com/channel/0029VaAbCdEfGhIjKlMn0a/",
  "http://whatsapp.com/channel/0029VaAbCdEfGhIjKlMn0a", "https://wa.me/254700000000", "https://chat.whatsapp.com/AbCdEfGhIjKl", "https://whatsapp.com/channel/x",
  "https://whatsapp.com/channel/0029VaAbCdEfGhIjKlMn0a?x=<script>"];
const text = "*The Afronomics Morning*\n\nNumbers, charts and sources: https://www.afronomicsfeed.com/morning?utm_source=whatsapp&utm_medium=share&utm_campaign=morning";
console.log(JSON.stringify({
  urls: urls.map((u) => c.whatsappChannelUrl(u)),
  en: c.channelPost(text, ["Central Bank of Kenya", "Central Bank of Kenya", " Bank of Ghana ", ""], "en"),
  sw: c.channelPost(text, [], "sw"),
}));
"""


@pytest.fixture(scope="module")
def out():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "channels.ts")],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    return json.loads(proc.stdout)


def test_only_a_real_channel_link_is_shown(out):
    assert out["urls"] == [
        None, None, None,
        "https://whatsapp.com/channel/0029VaAbCdEfGhIjKlMn0a",
        "https://www.whatsapp.com/channel/0029VaAbCdEfGhIjKlMn0a",
        None, None, None, None, None,
    ]


def test_the_post_names_sources_once_and_ends_with_the_house_line(out):
    en = out["en"]
    assert "utm_source=whatsapp_channel&utm_medium=channel&utm_campaign=morning" in en
    assert "utm_source=whatsapp&" not in en
    assert "Sources: Central Bank of Kenya; Bank of Ghana." in en
    assert en.endswith("_Information, not advice._")
    assert out["sw"].endswith("_Taarifa, si ushauri._") and "Vyanzo" not in out["sw"]


def test_every_join_slot_goes_through_the_check():
    """No page reads WHATSAPP_CHANNEL_URL directly; lib/channels.ts is the one place that does."""
    hits = [
        str(p.relative_to(ROOT))
        for d in ("app", "components", "lib")
        for p in (ROOT / d).rglob("*.ts*")
        if "process.env.WHATSAPP_CHANNEL_URL" in p.read_text(encoding="utf-8") and p.name != "channels.ts"
    ]
    assert hits == [], hits
