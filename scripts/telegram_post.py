"""
Post what is new in our data to the Afronomics Telegram channel: each new T-bill auction result (every market we
track), each central-bank policy-rate change, and each new story from the story engine.

Runs at the end of every data run (.github/workflows/african-auctions.yml), before the commit, so the record of
what was posted (data/telegram_state.json) is committed with the data. Needs two repository secrets:

    TELEGRAM_BOT_TOKEN   the token @BotFather gives the bot
    TELEGRAM_CHANNEL     the channel, e.g. @afronomics (the bot must be an admin of it)

Without them it does nothing. The first run only records what is already published and posts nothing, so the
channel is not flooded with history. A market the data health check marks late or failed is not posted.

    python scripts/telegram_post.py            # post what is new
    python scripts/telegram_post.py --dry      # print what would be posted, post and record nothing
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))
from story_finder import MARKETS, TENORS, bill_rows, doubted, load, nice_date  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
STATE = ROOT / "data" / "telegram_state.json"
SITE = "https://afronomicsfeed.com"
UTM = "utm_source=telegram&utm_medium=social"
FOOT = "<i>Information, not advice.</i>"
PUBLISHER = {
    "kenya": "Central Bank of Kenya", "nigeria": "Central Bank of Nigeria", "ghana": "Bank of Ghana",
    "uganda": "Bank of Uganda", "tanzania": "Bank of Tanzania", "egypt": "Central Bank of Egypt",
    "southafrica": "South African Reserve Bank", "zambia": "Bank of Zambia", "malawi": "Reserve Bank of Malawi",
    "mozambique": "Banco de Moçambique",
}


def link(path: str, campaign: str) -> str:
    return f"{SITE}{path}{'&' if '?' in path else '?'}{UTM}&utm_campaign={campaign}"


def bill_posts(state: dict) -> list[tuple[str, str, str]]:
    """(state key, value, message) for each market whose latest auction is newer than the one last posted."""
    out = []
    stale = doubted("T-bill auctions")
    for slug, (country, *_rest) in MARKETS.items():
        rows = bill_rows(slug)
        if not rows or country in stale:
            continue
        latest = rows[0]["date"]
        if state.get(f"bills:{slug}", "") >= latest:
            continue
        lines = []
        for tenor in TENORS:
            series = [r for r in rows if r["tenor"] == tenor]
            if not series or series[0]["date"] != latest:
                continue
            now = series[0]["rate"]
            if len(series) > 1:
                ch = now - series[1]["rate"]
                move = "unchanged" if abs(ch) < 0.005 else f"{'up' if ch > 0 else 'down'} {abs(ch):.2f} points"
                lines.append(f"{tenor}-day: <b>{now:.2f}%</b> ({move})")
            else:
                lines.append(f"{tenor}-day: <b>{now:.2f}%</b>")
        if not lines:
            continue
        page = "/markets/kenya-tbills" if slug == "kenya" else f"/markets/tbills/{slug}"
        msg = "\n".join([
            f"📊 <b>{html.escape(country)} T-bill auction, {nice_date(latest)}</b>",
            "",
            *lines,
            "",
            f"Change is against the auction before. Source: {PUBLISHER[slug]}.",
            f'<a href="{link(page, "tbills-" + slug)}">Full results and history</a>',
            "",
            FOOT,
        ])
        out.append((f"bills:{slug}", latest, msg))
    return out


def policy_posts(state: dict) -> list[tuple[str, str, str]]:
    hist = (load("policy_rate_history.json") or {}).get("rows", [])
    out = []
    for slug in sorted({r["market"] for r in hist}):
        rs = sorted((r for r in hist if r["market"] == slug), key=lambda r: r["first_seen"])
        if len(rs) < 2 or rs[-1]["rate"] == rs[-2]["rate"]:
            continue
        now, prev = rs[-1], rs[-2]
        if state.get(f"policy:{slug}", "") >= now["first_seen"]:
            continue
        country = MARKETS.get(slug, (slug.title(),))[0]
        verb = "raised" if now["rate"] > prev["rate"] else "cut"
        msg = "\n".join([
            f"🏦 <b>{html.escape(country)}'s central bank {verb} its policy rate to {now['rate']:.2f}%</b>",
            "",
            f"From {prev['rate']:.2f}%. Seen on {html.escape(PUBLISHER.get(slug, 'the central bank'))}'s website on {nice_date(now['first_seen'])}.",
            f'<a href="{link("/rates/policy", "policy-" + slug)}">Every African policy rate on one page</a>',
            "",
            FOOT,
        ])
        out.append((f"policy:{slug}", now["first_seen"], msg))
    return out


def story_posts(state: dict) -> list[tuple[str, str, str]]:
    out = []
    for s in (load("story_log.json") or {}).get("stories", []):
        key = f"story:{s['slug']}"
        if state.get(key):
            continue
        md = ROOT / "content" / "briefs" / f"{s['slug']}.md"
        if not md.exists():
            continue  # logged but not merged yet
        front = md.read_text(encoding="utf-8").split("---")[1]
        field = lambda name: (re.search(rf'^{name}:\s*"(.*)"\s*$', front, re.M) or [None, ""])[1]
        msg = "\n".join([
            f"📰 <b>{html.escape(field('title'))}</b>",
            "",
            html.escape(field("summary")),
            "",
            f'<a href="{link("/brief/" + s["slug"], "story-" + s["slug"][:40])}">Read it on Afronomics</a>',
            "",
            FOOT,
        ])
        out.append((key, s["date"], msg))
    return out


def send(token: str, channel: str, text: str) -> None:
    r = requests.post(f"https://api.telegram.org/bot{token}/sendMessage", timeout=30, data={
        "chat_id": channel, "text": text, "parse_mode": "HTML", "disable_web_page_preview": "false",
    })
    body = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
    if not body.get("ok"):
        raise RuntimeError(f"Telegram refused the post: {r.status_code} {body.get('description', r.text[:200])}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()
    token, channel = os.environ.get("TELEGRAM_BOT_TOKEN", ""), os.environ.get("TELEGRAM_CHANNEL", "")
    if not args.dry and not (token and channel):
        print("TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL not set; nothing posted")
        return 0
    first_run = not STATE.exists()
    state = {} if first_run else json.loads(STATE.read_text(encoding="utf-8")).get("posted", {})
    before = dict(state)
    posts = bill_posts(state) + policy_posts(state) + story_posts(state)
    if first_run and not args.dry:
        # Start from what is already out: record it, post nothing.
        for key, value, _ in posts:
            state[key] = value
        print(f"first run: recorded {len(posts)} items as already published; nothing posted")
    for key, value, msg in ([] if first_run and not args.dry else posts):
        if args.dry:
            print(f"--- {key} = {value}\n{msg}\n")
            continue
        try:
            send(token, channel, msg)
            state[key] = value
            print(f"posted {key} ({value})")
        except Exception as error:  # one failure must not stop the data run or the other posts
            print(f"::warning title=Telegram::{key}: {str(error)[:200]}")
    if not args.dry and (first_run or state != before):  # unchanged: leave the file alone so it does not cause a commit
        STATE.write_text(json.dumps({
            "note": "What scripts/telegram_post.py has already posted to the Telegram channel, by item.",
            "posted": dict(sorted(state.items())),
        }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
