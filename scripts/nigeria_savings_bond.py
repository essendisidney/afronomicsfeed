"""
Nigeria's FGN Savings Bond: the monthly offer, read from the Debt Management Office's own offer document.

The DMO publishes an "FGN Savings Bond Offer for Subscription <Month>, <Year>" PDF early each month on
https://www.dmo.gov.ng/fgn-bonds/savings-bond. This reads the newest one and keeps the rate for each tenor,
the offer dates and the unit, minimum and maximum, exactly as printed. A field that cannot be read is left
empty rather than guessed; if no rate can be read, nothing is written.

Output: data/nigeria/savings_bond.json (latest offer, plus every offer seen in "history").

    python scripts/nigeria_savings_bond.py
"""

from __future__ import annotations

import io
import json
import re
import sys
import warnings
from datetime import datetime, timezone
from urllib.parse import urljoin

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
PAGE = "https://www.dmo.gov.ng/fgn-bonds/savings-bond"
HOME = "https://www.dmo.gov.ng/"
OUT = ROOT / "data" / "nigeria" / "savings_bond.json"
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def iso(date_text: str | None) -> str | None:
    """"October 14, 2028" -> "2028-10-14"."""
    if not date_text:
        return None
    m = re.match(r"([A-Z][a-z]+) (\d{1,2}), (\d{4})", date_text.strip())
    if not m or m.group(1) not in MONTHS:
        return None
    return f"{m.group(3)}-{MONTHS.index(m.group(1)) + 1:02d}-{int(m.group(2)):02d}"


def naira(text: str | None) -> int | None:
    return int(text.replace(",", "")) if text else None


def parse_offer(text: str) -> dict:
    t = re.sub(r"\s+", " ", text.replace("­", "-"))
    bonds = []
    for m in re.finditer(r"(\d)\s*-?\s*Year FGN Savings Bond due ([A-Z][a-z]+ \d{1,2}, \d{4})\s*:\s*(\d+(?:\.\d+)?)% per annum", t):
        rate = float(m.group(3))
        if 0 < rate < 60:
            bonds.append({"years": int(m.group(1)), "due": iso(m.group(2)), "rate": rate})
    field = lambda label: (re.search(label + r"\s*:\s*([A-Z][a-z]+ \d{1,2}, \d{4})", t) or [None, None])[1]
    unit = re.search(r"N([\d,]+) per unit", t)
    minimum = re.search(r"Subscription of N([\d,]+)", t)
    maximum = re.search(r"maximum.{0,200}?subscription of N([\d,]+)", t, flags=re.I)
    coupon = re.search(r"Coupon Payment Dates\s*:\s*((?:[A-Z][a-z]+ \d{1,2},? ?){2,4})", t)
    return {
        "bonds": sorted(bonds, key=lambda b: b["years"]),
        "opening": iso(field("Opening Date")),
        "closing": iso(field("Closing Date")),
        "settlement": iso(field("Settlement Date")),
        "coupon_dates": coupon.group(1).strip(" ,") if coupon else None,
        "unit_naira": naira(unit.group(1)) if unit else None,
        "minimum_naira": naira(minimum.group(1)) if minimum else None,
        "maximum_naira": naira(maximum.group(1)) if maximum else None,
    }


def offer_links(html: str, base: str) -> list[tuple[tuple[int, int], str, str]]:
    """Every "Savings Bond Offer for Subscription <Month>, <Year>" link on a page: ((year, month), label, url)."""
    found = []
    for href, label in re.findall(r'<a[^>]+href="([^"#]+)"[^>]*>(.*?)</a>', html, flags=re.S | re.I):
        text = re.sub(r"<[^>]+>|\s+", " ", label).strip()
        m = re.search(r"Savings Bond Offer for Subscription ([A-Z][a-z]+),? (\d{4})", text, flags=re.I) or re.search(
            r"savings-bond-offer-for-subscription-([a-z]+)-(\d{4})", href, flags=re.I
        )
        if not m or m.group(1).title() not in MONTHS:
            continue
        found.append(((int(m.group(2)), MONTHS.index(m.group(1).title())), f"{m.group(1).title()} {m.group(2)}", urljoin(base, href)))
    return found


def latest_offer_link(html: str, base: str) -> tuple[str, str] | None:
    """The newest offer; among its links, the direct download (".../file") first."""
    found = offer_links(html, base)
    if not found:
        return None
    newest = max(k for k, _, _ in found)
    links = [(label, url) for k, label, url in found if k == newest]
    links.sort(key=lambda x: not x[1].rstrip("/").endswith("/file"))
    return links[0]


def fetch_pdf(url: str) -> bytes | None:
    """The offer PDF: the link itself if it is a PDF; else its "/file" download; else a "/file" link on that page."""
    tried = []
    for candidate in [url, url.rstrip("/") + "/file"]:
        if candidate in tried:
            continue
        tried.append(candidate)
        r = requests.get(candidate, headers=UA, timeout=(15, 60), verify=False)
        if r.content[:5] == b"%PDF-":
            return r.content
        if candidate == url:
            for href in re.findall(r'href="([^"#]+/file)"', r.text):
                link = urljoin(r.url, href)
                if "savings-bond-offer" in link and link not in tried:
                    tried.append(link)
                    inner = requests.get(link, headers=UA, timeout=(15, 60), verify=False)
                    if inner.content[:5] == b"%PDF-":
                        return inner.content
    return None


def main() -> int:
    import pdfplumber

    # The Savings Bond page lists every offer; the DMO home page carries the newest one's direct download.
    candidates = []
    for source in (PAGE, HOME):
        try:
            page = requests.get(source, headers=UA, timeout=(15, 40), verify=False)
            candidates += offer_links(page.text, page.url)
        except Exception as error:
            print(f"{source}: {str(error)[:80]}")
    if not candidates:
        raise SystemExit("no offer link found on the DMO pages")
    newest = max(k for k, _, _ in candidates)
    links = sorted({(label, url) for k, label, url in candidates if k == newest}, key=lambda x: not x[1].rstrip("/").endswith("/file"))
    month = links[0][0]
    pdf = None
    for _, url in links:
        pdf = fetch_pdf(url)
        if pdf:
            break
    if not pdf:
        raise SystemExit(f"{month}: no PDF found behind {[u for _, u in links]}; nothing written")
    with pdfplumber.open(io.BytesIO(pdf)) as doc:
        text = " ".join((p.extract_text() or "") for p in doc.pages[:6])
    offer = parse_offer(text)
    print(f"{month}: {offer}")
    if not offer["bonds"]:
        raise SystemExit("no rates read from the offer; nothing written")

    previous = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    # Unchanged offer: keep the file as it is, so a daily run does not commit (and redeploy) for nothing.
    old = previous.get("latest", {})
    if old.get("offer") == month and {k: old.get(k) for k in offer} == offer:
        print("offer unchanged")
        return 0
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    latest = {"offer": month, "source": url, "read_at": now, **offer}
    history = [h for h in previous.get("history", []) if h.get("offer") != month]
    history.append({"offer": month, "source": url, "opening": offer["opening"], "bonds": offer["bonds"]})
    history.sort(key=lambda h: (h.get("opening") or ""), reverse=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "dataset": "FGN Savings Bond offers",
        "publisher": "Debt Management Office, Nigeria",
        "source_page": PAGE,
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "latest": latest,
        "history": history,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
