"""
Every licensed money market fund in Kenya and its size, from the Capital Markets Authority's quarterly
Collective Investment Schemes report (the "Money Market Funds" table: scheme, fund, assets under management in
shillings and share of all money market fund assets).

The report gives sizes, not yields. Yields are read daily from the managers' own pages by kenya_rates.py.

Finds the newest report by trying the CMA's file name for each quarter, newest first. Writes
data/kenya/cma_mmf.json only when a newer quarter is found, and only if the funds add up to the report's own
total (within 0.5%): a table that does not add up is not published.

    python scripts/cma_mmf.py
    python scripts/cma_mmf.py --text report.txt   # parse text already extracted (testing)
"""

from __future__ import annotations

import io
import json
import re
import sys
import warnings
from datetime import date, datetime, timezone

import requests

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

warnings.filterwarnings("ignore")
OUT = ROOT / "data" / "kenya" / "cma_mmf.json"
URL = "https://www.cmarcp.or.ke/images/Docs/cisreports/{y}/CISReportQ{q}-{y}.pdf"
QUARTER_END = {1: "03-31", 2: "06-30", 3: "09-30", 4: "12-31"}

ROW = re.compile(r"^(\d{1,3})\.\s+(.+?)\s+([\d,]{4,})\s+([\d.]+)%\s*$")
# "Sanlam Unit Trust Scheme SanlamAllianz Money Market Fund": the scheme ends at the first of these words
# that is not followed by another of them.
SPLIT = re.compile(r"^(.+?(?:Scheme|Funds|Fund|Bank|Unit Trust))\s+(?!(?:Scheme|Funds?|Trust)\b)(.+)$", re.I)
TOTAL = re.compile(r"Total Money Market Funds AUM\s+([\d,]{6,})")


def parse(text: str) -> dict | None:
    """The Money Market Funds table: rows between the section heading and its total line."""
    start = text.find("Money Market Funds AUM dominated")
    if start < 0:
        start = text.find("i. Money Market Funds")
    total_m = TOTAL.search(text, start if start >= 0 else 0)
    if start < 0 or not total_m:
        return None
    rows = []
    for line in text[start:total_m.start()].splitlines():
        m = ROW.match(line.strip())
        if not m:
            continue
        rank, names, aum, share = int(m.group(1)), m.group(2), int(m.group(3).replace(",", "")), float(m.group(4))
        s = SPLIT.match(names)
        scheme, fund = (s.group(1), s.group(2)) if s else (names, names)
        currency = "USD" if re.search(r"\bUSD\b|Dollar", fund, re.I) else "KES"
        rows.append({"rank": rank, "scheme": scheme.strip(), "fund": fund.strip(), "currency": currency, "aum_kes": aum, "share_pct": share})
    total = int(total_m.group(1).replace(",", ""))
    summed = sum(r["aum_kes"] for r in rows)
    if not rows or abs(summed - total) > 0.005 * total:
        print(f"  table does not add up: {len(rows)} rows sum to {summed:,} against a stated total of {total:,}")
        return None
    return {"total_aum_kes": total, "rows": sorted(rows, key=lambda r: r["rank"])}


def pdf_text(url: str) -> str | None:
    r = requests.get(url, headers=UA, timeout=(15, 60), verify=False)
    if r.status_code != 200 or r.content[:5] != b"%PDF-":
        return None
    import pdfplumber

    with pdfplumber.open(io.BytesIO(r.content)) as pdf:
        return "\n".join(page.extract_text() or "" for page in pdf.pages)


def candidates(today: date):
    y, q = today.year, (today.month - 1) // 3 + 1
    for _ in range(6):
        yield y, q
        y, q = (y, q - 1) if q > 1 else (y - 1, 4)


def write(parsed: dict, y: int, q: int, source: str) -> None:
    OUT.write_text(json.dumps({
        "dataset": "Kenya money market funds by size",
        "publisher": "Capital Markets Authority, Kenya",
        "report": f"Collective Investment Schemes quarterly report, Q{q} {y}",
        "as_of": f"{y}-{QUARTER_END[q]}",
        "source": source,
        "compiled_by": "Afronomics (afronomicsfeed.com)",
        "read_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "note": "Assets under management in Kenyan shillings, as the CMA reports them (dollar funds are shown in shillings too). Sizes, not yields.",
        **parsed,
    }, ensure_ascii=False, indent=1), encoding="utf-8")


def main() -> int:
    if len(sys.argv) == 3 and sys.argv[1] == "--text":
        parsed = parse(open(sys.argv[2], encoding="utf-8").read())
        print(json.dumps(parsed, indent=1)[:2000] if parsed else "nothing parsed")
        return 0 if parsed else 1
    current = json.loads(OUT.read_text(encoding="utf-8")).get("as_of") if OUT.exists() else None
    for y, q in candidates(date.today()):
        as_of = f"{y}-{QUARTER_END[q]}"
        if current and as_of <= current:
            print(f"  no report newer than {current}")
            return 0
        url = URL.format(y=y, q=q)
        try:
            text = pdf_text(url)
        except Exception as error:
            print(f"  Q{q} {y}: {str(error)[:80]}")
            continue
        if not text:
            print(f"  Q{q} {y}: not published")
            continue
        parsed = parse(text)
        if not parsed:
            print(f"  Q{q} {y}: table not read; nothing written")
            return 1
        write(parsed, y, q, url)
        print(f"  Q{q} {y}: {len(parsed['rows'])} funds, KES {parsed['total_aum_kes']:,}")
        return 0
    print("  no report found")
    return 1


if __name__ == "__main__":
    sys.exit(main())
