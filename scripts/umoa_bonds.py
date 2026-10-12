"""
WAEMU government securities auctions (Benin, Burkina Faso, Cote d'Ivoire, Guinea-Bissau, Mali, Niger, Senegal, Togo)
from UMOA-Titres, the regional agency that runs them.

The issues page (https://www.umoatitres.org/fr/emissions/) lists every security line since 2017: issuer, BAT (bill) or
OAT (bond), operation and value dates, maturity, months and a link to the issue's page. Each issue page has an
"Avis d'appel d'offres" panel (one block per line: duration, coupon) and a "Résultats" panel (one block per line, in
the same order: amount sought, bids, accepted, weighted average rate or price, marginal rate or price, weighted
average yield). Blocks are paired in order and kept only when the instrument types match.

Issue pages already on file are not fetched again; each run reads at most --budget new pages, newest first, so the
history fills over a few runs. Writes data/waemu/auctions.json; writes nothing if no results are read.

    python scripts/umoa_bonds.py                 # read new issues and write
    python scripts/umoa_bonds.py --budget 300    # read up to 300 new issue pages (default 120)
    python scripts/umoa_bonds.py --inspect       # read the 5 newest issues and print them; write nothing
"""

from __future__ import annotations

import json
import re
import sys
import time
import unicodedata
import warnings
from datetime import datetime, timezone
from html import unescape

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "waemu" / "auctions.json"
PAGE = "https://www.umoatitres.org/fr/emissions/"
COUNTRIES = {
    "benin": "benin",
    "burkina": "burkina-faso",
    "cote d'ivoire": "cote-divoire",
    "guinee-bissau": "guinea-bissau",
    "mali": "mali",
    "niger": "niger",
    "senegal": "senegal",
    "togo": "togo",
}


def text(html: str) -> str:
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", html))).strip()


def plain(s: str) -> str:
    return unicodedata.normalize("NFKD", s.replace("’", "'")).encode("ascii", "ignore").decode().lower()


def country_of(issuer: str) -> str | None:
    p = plain(issuer)
    return next((slug for name, slug in COUNTRIES.items() if p.startswith(name)), None)


def fr_num(s: str | None) -> float | None:
    if not s:
        return None
    s = re.sub(r"[\s  ]", "", s).replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def iso(d: str) -> str | None:
    m = re.match(r"(\d{2})/(\d{2})/(\d{4})", d or "")
    return f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else None


def get(url: str) -> str:
    for attempt in range(3):
        try:
            return requests.get(url, headers=UA, timeout=(15, 120), verify=False).text
        except Exception:
            if attempt == 2:
                raise
            time.sleep(4 + attempt * 4)
    return ""


def listing(html: str) -> dict[str, list[dict]]:
    """Security lines grouped by issue page, in the listing's order (Titre 1, 2, ...)."""
    table = re.search(r"<table[^>]*liste-emission.*?</table>", html, re.S | re.I)
    issues: dict[str, list[dict]] = {}
    for row in re.findall(r"<tr.*?</tr>", table.group(0) if table else "", re.S | re.I):
        cells = [text(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.S | re.I)]
        link = re.search(r'href="?(https://www\.umoatitres\.org/fr/emission/[^"\s>]+)', row)
        if len(cells) < 7 or not link:
            continue
        country = country_of(cells[0])
        if not country:
            continue
        titre = re.search(r"Titre\s*(\d+)", cells[0])
        issues.setdefault(link.group(1), []).append({
            "country": country,
            "instrument": cells[1].upper(),
            "line": int(titre.group(1)) if titre else 1,
            "operation_date": iso(cells[3]),
            "value_date": iso(cells[4]),
            "maturity": iso(cells[5]),
            "months": int(cells[6]) if cells[6].isdigit() else None,
            "postponed": "report" in plain(cells[-1]),
        })
    for lines in issues.values():
        lines.sort(key=lambda x: x["line"])
    return issues


def panels(page: str) -> dict[str, str]:
    out = {}
    for title, body in re.findall(
        r'vc_tta-panel-title">.*?<span[^>]*>(.*?)</span>.*?vc_tta-panel-body">(.*?)(?=<div class="vc_tta-panel"|$)', page, re.S
    ):
        out[plain(text(title))] = text(body)
    return out


def blocks(s: str) -> list[tuple[str, str]]:
    """Split a panel's text into (BAT|OAT, block text) in order."""
    parts = re.split(r"\b(BAT|OAT)\b", s)
    return [(parts[i], parts[i + 1]) for i in range(1, len(parts) - 1, 2)]


def field(block: str, label: str) -> str | None:
    m = re.search(label + r"\s*:?\s*(-?\d[\d\s  ]*(?:,\d+)?)", block, re.I)
    return m.group(1) if m else None


def parse_issue(page: str) -> list[dict]:
    p = panels(page)
    res = next((v for k, v in p.items() if k.startswith("resultat")), "")
    avis = next((v for k, v in p.items() if k.startswith("avis")), "")
    terms = blocks(avis)
    out = []
    for i, (kind, b) in enumerate(blocks(res)):
        t = terms[i][1] if i < len(terms) and terms[i][0] == kind else ""
        months = fr_num(field(t, r"Dur[ée]e"))
        n_bids = fr_num(field(b, r"Nombre de soumissions"))
        out.append({
            "instrument": kind,
            "months": int(months) if months else None,
            "coupon": fr_num(field(t, r"Taux d'int[ée]r[êe]t")),
            "sought_m": fr_num(field(b, r"Montant sollicit[ée]")),
            "bids_m": fr_num(field(b, r"Montant global des soumissions")),
            "accepted_m": fr_num(field(b, r"Soumissions retenues")),
            "n_bids": int(n_bids) if n_bids is not None else None,
            "weighted_rate": fr_num(field(b, r"Taux moyen pond[ée]r[ée]")),
            "marginal_rate": fr_num(field(b, r"Taux marginal")),
            "weighted_price": fr_num(field(b, r"Prix moyen pond[ée]r[ée]")),
            "marginal_price": fr_num(field(b, r"Prix marginal")),
            "weighted_yield": fr_num(field(b, r"Rendement moyen pond[ée]r[ée]")),
        })
    return out


def previous() -> tuple[list[dict], set[str]]:
    try:
        raw = json.loads(OUT.read_text())
        return raw["rows"], set(raw.get("issues_read", []))
    except Exception:
        return [], set()


def merge(lines: list[dict], results: list[dict], url: str) -> list[dict]:
    rows = []
    for i, r in enumerate(results):
        line = lines[i] if i < len(lines) else None
        if not line or line["instrument"] != r["instrument"]:
            continue  # cannot pair this result with its security line: leave it out rather than guess
        y = r["weighted_yield"]
        if y is None or not (0 < y < 30):
            continue
        rows.append({
            "country": line["country"],
            "instrument": r["instrument"],
            "operation_date": line["operation_date"],
            "value_date": line["value_date"],
            "maturity": line["maturity"],
            "months": line["months"] or r["months"],
            "coupon": r["coupon"],
            "sought_xof_m": r["sought_m"],
            "bids_xof_m": r["bids_m"],
            "accepted_xof_m": r["accepted_m"],
            "bid_cover": round(r["bids_m"] / r["accepted_m"], 2) if r["bids_m"] and r["accepted_m"] else None,
            "n_bids": r["n_bids"],
            "weighted_rate": r["weighted_rate"],
            "marginal_rate": r["marginal_rate"],
            "weighted_price": r["weighted_price"],
            "marginal_price": r["marginal_price"],
            "weighted_yield": y,
            "source": url,
        })
    return rows


def main() -> int:
    inspect = "--inspect" in sys.argv
    budget = int(sys.argv[sys.argv.index("--budget") + 1]) if "--budget" in sys.argv else 120
    html = get(PAGE)
    issues = listing(html)
    if inspect or not issues:
        table = re.search(r"<table[^>]*liste-emission.*?</table>", html, re.S | re.I)
        rows = re.findall(r"<tr.*?</tr>", table.group(0), re.S | re.I) if table else []
        print(f"page {len(html)} bytes; listing table {'found' if table else 'NOT found'}; {len(rows)} rows")
        for r in rows[1:3]:
            print("   ", [text(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", r, re.S | re.I)], re.findall(r'href="?([^"\s>]+)', r)[:2])
    print(f"{len(issues)} issues listed, {sum(len(v) for v in issues.values())} security lines")
    rows, done = previous()
    today = datetime.now(timezone.utc).date().isoformat()
    todo = [
        (u, lines) for u, lines in issues.items()
        if u not in done and not all(x["postponed"] for x in lines) and (lines[0]["operation_date"] or "9") <= today
    ]
    todo.sort(key=lambda x: x[1][0]["operation_date"], reverse=True)
    todo = todo[: 5 if inspect else budget]
    new = []
    for url, lines in todo:
        try:
            page = get(url)
        except Exception as error:
            print(f"skip {url}: {str(error)[:100]}")
            continue
        got = merge(lines, parse_issue(page), url)
        if inspect:
            print(f"== {url}: {len(lines)} lines, {len(got)} results paired")
            for r in got:
                print("   ", json.dumps(r, ensure_ascii=False))
        new += got
        if got:
            done.add(url)  # only issues with results: one still awaiting its results is read again next run
        time.sleep(0.5)
    if inspect:
        print("inspect only: nothing written")
        return 0
    rows += new
    if not rows:
        print("no WAEMU results read; nothing written")
        return 1
    seen = set()
    uniq = []
    for r in sorted(rows, key=lambda r: (r["operation_date"], r["country"], r["instrument"], r["months"] or 0), reverse=True):
        key = (r["source"], r["instrument"], r["months"], r["maturity"], r["weighted_yield"])
        if key not in seen:
            seen.add(key)
            uniq.append(r)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "WAEMU government securities auctions",
        "publisher": "UMOA-Titres (for the eight WAEMU treasuries)",
        "source_page": PAGE,
        "currency": "XOF",
        "rate_note": "weighted average yield of accepted bids, percent per annum; amounts in XOF millions; "
        "BAT = Treasury bill, OAT = Treasury bond; the amount sought is for the whole issue",
        "updated": uniq[0]["operation_date"],
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "issues_read": sorted(done),
        "rows": uniq,
    }, ensure_ascii=False, indent=0), encoding="utf-8")
    left = sum(1 for u, lines in issues.items() if u not in done and not all(x["postponed"] for x in lines))
    print(f"wrote {len(uniq)} WAEMU results ({len(new)} new); latest {uniq[0]['operation_date']}; {left} issues still to read")
    return 0


if __name__ == "__main__":
    sys.exit(main())
