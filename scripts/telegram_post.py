"""
Post what is new in our data to the Afronomics Telegram channel: each new T-bill auction result (every market we
track), each central-bank policy-rate change, and each new story from the story engine.

Runs at the end of every data run (.github/workflows/african-auctions.yml), before the commit, so the record of
what was posted (data/telegram_state.json) is committed with the data. The bot token and channel come from the
TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL environment variables when set, otherwise from the database
(af_telegram_config, migration 0025, gated by AF_CRON_SECRET like the other desk functions). Without either it
does nothing. The token never appears in the output: the run logs are public. The first run only records what is already published and posts nothing, so the
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


SUPABASE = "https://ugjpcybhqwvzidcbqpik.supabase.co"
PUBLISHABLE_KEY = "sb_publishable_pytbevd21MRA9Vgasf0TLw_kAugNejO"  # public, as in lib/store.ts


WEBHOOK = "https://www.afronomicsfeed.com/api/telegram"  # www: Telegram does not follow the apex redirect


def config() -> tuple[str, str]:
    token, channel = os.environ.get("TELEGRAM_BOT_TOKEN", ""), os.environ.get("TELEGRAM_CHANNEL", "")
    secret = os.environ.get("AF_CRON_SECRET", "")
    if (token and channel) or not secret:
        return token, channel
    cfg = db_config(secret)
    return cfg.get("token") or "", cfg.get("channel") or ""


def db_config(secret: str) -> dict:
    try:
        r = requests.post(f"{SUPABASE}/rest/v1/rpc/af_telegram_config", json={"p_secret": secret}, timeout=30,
                          headers={"apikey": PUBLISHABLE_KEY, "Authorization": f"Bearer {PUBLISHABLE_KEY}"})
        cfg = r.json() if r.ok else None
    except Exception as error:
        print(f"::warning title=Telegram::could not read the settings: {type(error).__name__}")
        cfg = None
    return cfg or {}


def ensure_bot(token: str) -> None:
    """Point Telegram at the site's webhook (app/api/telegram) and register the command menu, only when they differ."""
    secret = db_config(os.environ.get("AF_CRON_SECRET", "")).get("webhook_secret")
    if not secret:
        return
    try:
        info = api(token, "getWebhookInfo")
        if info.get("url") != WEBHOOK:
            api(token, "setWebhook", url=WEBHOOK, secret_token=secret, allowed_updates='["message"]', drop_pending_updates="true")
            print(f"webhook set to {WEBHOOK}")
        elif info.get("last_error_message"):
            print(f"::warning title=Telegram webhook::{info['last_error_message'][:160]}")
        commands = requests.get(WEBHOOK, timeout=30).json().get("commands") or []
        if commands and api(token, "getMyCommands") != commands:
            api(token, "setMyCommands", commands=json.dumps(commands))
            print(f"bot menu set: {len(commands)} commands")
    except Exception as error:  # the bot's chat side must never stop the channel posts or the data run
        print(f"::warning title=Telegram bot::{str(error).replace(token, '<token>')[:200]}")


def api(token: str, method: str, **data) -> dict:
    """Call the Bot API. Errors are reported without the token, which is part of the URL."""
    try:
        r = requests.post(f"https://api.telegram.org/bot{token}/{method}", timeout=30, data=data)
        body = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
    except Exception as error:
        raise RuntimeError(f"{method}: {type(error).__name__}: {str(error).replace(token, '<token>')[:160]}") from None
    if not body.get("ok"):
        raise RuntimeError(f"{method}: Telegram said {r.status_code} {body.get('description', '')}")
    return body["result"]


INTRO = "\n".join([
    "👋 <b>Welcome to Afronomics</b>",
    "",
    "The price of money in Africa, as the central banks publish it:",
    "📊 every Treasury bill auction result in 10 markets (Kenya, Nigeria, Ghana, Uganda, Tanzania, Egypt, South Africa, Zambia, Malawi, Mozambique)",
    "🏦 every central-bank policy-rate change",
    "📰 our stories on what it means for your money",
    "",
    "Every figure names its source. Nothing here is a tip or a recommendation.",
    f'<a href="{SITE}/?{UTM}&utm_campaign=intro">afronomicsfeed.com</a>',
    "",
    FOOT,
])


def intro_post(state: dict) -> list[tuple[str, str, str]]:
    """The channel's first post, once."""
    return [] if state.get("intro") else [("intro", "posted", INTRO)]


def send(token: str, channel: str, text: str) -> None:
    api(token, "sendMessage", chat_id=channel, text=text, parse_mode="HTML", disable_web_page_preview="false")


def check_access(token: str, channel: str) -> bool:
    """Is the token valid, and may the bot post in the channel? Prints names only."""
    try:
        me = api(token, "getMe")
        member = api(token, "getChatMember", chat_id=channel, user_id=me["id"])
    except RuntimeError as error:
        print(f"::warning title=Telegram::{error}")
        return False
    can_post = member.get("status") == "creator" or (member.get("status") == "administrator" and member.get("can_post_messages", True))
    print(f"bot @{me.get('username')} in {channel}: {member.get('status')}, can post: {can_post}")
    if not can_post:
        print(f"::warning title=Telegram::@{me.get('username')} is not allowed to post in {channel}: make it an admin with Post Messages")
    return can_post


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()
    token, channel = ("", "") if args.dry else config()
    if not args.dry and not (token and channel):
        print("no Telegram bot token or channel set; nothing posted")
        return 0
    if not args.dry:
        ensure_bot(token)
    first_run = not STATE.exists()
    if first_run and not args.dry and not check_access(token, channel):
        return 0  # record nothing until the bot can post, so the first real run still starts clean
    state = {} if first_run else json.loads(STATE.read_text(encoding="utf-8")).get("posted", {})
    before = dict(state)
    posts = intro_post(state) + bill_posts(state) + policy_posts(state) + story_posts(state)
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
