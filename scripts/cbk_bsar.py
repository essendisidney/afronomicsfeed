"""
Per-bank and per-microfinance-bank figures from CBK's Bank Supervision Annual Report, read into
data/registry/cbk_figures.json.

    python scripts/cbk_bsar.py                            # find the newest report on centralbank.go.ke and add it
    python scripts/cbk_bsar.py --file x.pdf --year 2025 --url https://...
    python scripts/cbk_bsar.py --inspect                  # print a summary, write nothing

Appendices, found by their headings:
  V    banks' profitability: profit before tax, total assets, return on assets, shareholders' funds, return on
       equity (KES millions and per cent; the report year only);
  VI   banks' gross loans and gross non-performing loans (KES millions; the report year and the year before);
  VII  banks' capital ratios: core capital and total capital to risk-weighted assets (per cent). Only the ratios
       are read: the 2025 table is headed "Ksh.million" but its amounts are in thousands (they match Appendix IV,
       which says "Figures in Kshs '000'").
  X    microfinance banks' balance sheet: total assets, customer deposits, net advances, shareholders' funds;
  XI   microfinance banks' profit and loss: profit before tax. (KES millions; one column per bank.)

Checks before anything is written: every table's columns add up to its own Total row (within rounding), banks
are numbered 1..N, and the microfinance header names the expected banks. A report that fails writes nothing.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from registry_common import UA, append_rows, close, fetch_pdf, number, open_pdf  # noqa: E402

OUT = "cbk_figures.json"
INDEX = "https://www.centralbank.go.ke/reports/bank-supervision-and-banking-sector-reports/"
TOL = 0.01  # published tables are rounded

TOK = r"\(?-?[\d,]+(?:\.\d+)?\)?"
WANTED = {
    "V": "profitability",
    "VI": "loans",
    "VII": "capital",
    "X": "mfb_balance",
    "XI": "mfb_pl",
}
# The microfinance banks in the order CBK prints their columns, by the start of the header label.
MFB_HEADS = [
    ("KWFT", "Kenya Women Microfinance Bank"),
    ("FAU", "Faulu Microfinance Bank"),
    ("RAFI", "Rafiki Microfinance Bank"),
    ("SMEP", "SMEP Microfinance Bank"),
    ("CARI", "Caritas Microfinance Bank"),
    ("SU", "Sumac Microfinance Bank"),
    ("LOLC", "LOLC Microfinance Bank"),
    ("U & I", "U&I Microfinance Bank"),
    ("SA", "Salaam Microfinance Bank"),
    ("UMBA", "Umba Microfinance Bank"),
    ("ON IT", "On It Microfinance Bank"),
    ("BRA", "Branch Microfinance Bank"),
    ("MU", "Muungano Microfinance Bank"),
    ("CHO", "Choice Microfinance Bank"),
]
MFB_ROWS = {
    "mfb_balance": [
        (r"^TOTAL\s*AS-?\s*SETS$", "assets"),
        (r"Customer\s*deposits", "deposits"),
        (r"Advances to\s*customers", "net_loans"),
        (r"Total Share-?\s*holders", "shareholders_funds"),
    ],
    "mfb_pl": [(r"Profit/\(Loss\) before\s*tax", "profit_before_tax")],
}


def appendix_texts(pdf) -> dict[str, list[tuple[int, str]]]:
    starts: list[tuple[int, str]] = []
    for i, page in enumerate(pdf.pages):
        if len(pdf.pages) > 60 and i < len(pdf.pages) // 2:
            continue  # the appendices are at the back; skip the body for speed
        head = "\n".join((page.extract_text() or "").splitlines()[:3])
        m = re.search(r"APPENDIX ([IVX]+)\s*:", head)
        if m and (not starts or starts[-1][1] != m.group(1)):
            starts.append((i, m.group(1)))
    out: dict[str, list[tuple[int, str]]] = {}
    for k, (i, name) in enumerate(starts):
        end = starts[k + 1][0] if k + 1 < len(starts) else min(i + 3, len(pdf.pages))
        if name in WANTED:
            out[name] = [(j + 1, pdf.pages[j].extract_text() or "") for j in range(i, end)]
    return out


def is_text(line: str) -> bool:
    return bool(line) and not re.search(r"\d{2,}", line)


def bank_rows(pages: list[tuple[int, str]], ncols: int) -> tuple[list[dict], list[float] | None]:
    """Numbered bank rows with ncols figures each, and the Total row. A name printed over the lines above and below
    the numbers ("Commercial International Bank (CIB)" / "18 1,699 ..." / "Kenya Limited") is joined back up."""
    rx = re.compile(rf"^(\d{{1,2}}) ?(.*?) ?((?:{TOK} ){{{ncols - 1}}}{TOK})$")
    total_rx = re.compile(rf"^Total ((?:{TOK} ){{{ncols - 1}}}{TOK})$")
    rows: list[dict] = []
    total = None
    for page_no, text in pages:
        lines = [l.strip() for l in text.splitlines()]
        for k, line in enumerate(lines):
            t = total_rx.match(line)
            if t:
                total = [number(x) for x in t.group(1).split()]
                continue
            m = rx.match(line)
            if not m:
                continue
            name = m.group(2).strip()
            if not name:
                before = lines[k - 1] if k and is_text(lines[k - 1]) else ""
                after = lines[k + 1] if k + 1 < len(lines) and is_text(lines[k + 1]) else ""
                name = f"{before} {after}".strip()
            elif k + 1 < len(lines) and re.fullmatch(r"(Ltd\.?|Limited|PLC|Plc)", lines[k + 1]):
                name = f"{name} {lines[k + 1]}"
            rows.append({"rank": int(m.group(1)), "name": name, "values": [number(x) for x in m.group(3).split()], "page": page_no})
    return rows, total


def mfb_table(pages: list[tuple[int, str]], kind: str) -> tuple[dict[str, list[float | None]], list[str]]:
    """{metric: 14 values + total} from a one-column-per-bank table, and the bank names from its header."""
    text = "\n".join(t for _, t in pages)
    lines = [l.strip() for l in text.splitlines()]
    header = next((l for l in lines if l.startswith("KWFT")), "")
    names, rest = [], header.replace("*", "")
    for head, name in MFB_HEADS:
        if rest.startswith(head):
            names.append(name)
            rest = rest[len(head):].lstrip("- ").lstrip()
            rest = re.sub(r"^[A-Z]{1,4}-?\s*(?=[A-Z])", "", rest) if not any(rest.startswith(h) for h, _ in MFB_HEADS) else rest
    nums = re.compile(rf"((?:(?:{TOK}|-) ){{14}}(?:{TOK}|-))$")
    out: dict[str, list[float | None]] = {}
    for k, line in enumerate(lines):
        m = nums.search(line)
        if not m:
            continue
        label = line[: m.start()].strip()
        before = lines[k - 1] if k and not nums.search(lines[k - 1]) else ""
        after = lines[k + 1] if k + 1 < len(lines) and not nums.search(lines[k + 1]) else ""
        full = re.sub(r"\s+", " ", f"{before} {label} {after}").strip()
        joined = re.sub(r"-\s", "", f"{before}{label}").strip()
        for pattern, metric in MFB_ROWS[kind]:
            if metric not in out and (re.search(pattern, full, re.I) or re.search(pattern, joined, re.I) or re.search(pattern, f"{label} {after}".strip(), re.I)):
                out[metric] = [None if x == "-" else number(x) for x in m.group(1).split()]
    return out, names


def check_sum(label: str, values: list[list[float | None]], total: list[float | None], cols: list[int], problems: list[str]):
    for c in cols:
        s = sum(v[c] or 0 for v in values)
        t = total[c] if total and c < len(total) else None
        # Each published figure is rounded to the unit, so the rows may miss the total by half a unit each.
        if t is None or not (close(s, t, TOL) or abs(s - t) <= 0.5 * len(values) + 1):
            problems.append(f"{label} column {c + 1}: rows add up to {s:,.1f}, the Total row says {t}")


def read(data: bytes | Path, year: int, url: str) -> tuple[list[dict], list[str]]:
    with open_pdf(data) as pdf:
        apps = appendix_texts(pdf)
    problems: list[str] = []
    rows: list[dict] = []
    for name in WANTED:
        if name not in apps:
            problems.append(f"appendix {name} not found")
    if problems:
        return [], problems

    def base(kind: str, rank: int | None, inst: str, metric: str, value, unit: str, y: int, page: int) -> dict:
        return {"report": year, "year": y, "type": kind, "rank": rank, "name": inst, "metric": metric, "value": value, "unit": unit, "as_of": f"{y}-12-31", "source": url, "page": page}

    prof, ptotal = bank_rows(apps["V"], 5)
    check_sum("appendix V", [r["values"] for r in prof], ptotal, [0, 1, 3], problems)
    for r in prof:
        for c, metric, unit in ((0, "profit_before_tax", "KES m"), (1, "assets", "KES m"), (2, "roa", "%"), (3, "shareholders_funds", "KES m"), (4, "roe", "%")):
            rows.append(base("bank", r["rank"], r["name"], metric, r["values"][c], unit, year, r["page"]))

    loans, ltotal = bank_rows(apps["VI"], 4)
    check_sum("appendix VI", [r["values"] for r in loans], ltotal, [0, 1, 2, 3], problems)
    for r in loans:
        for c, metric, y in ((0, "gross_loans", year - 1), (1, "gross_loans", year), (2, "gross_npl", year - 1), (3, "gross_npl", year)):
            rows.append(base("bank", r["rank"], r["name"], metric, r["values"][c], "KES m", y, r["page"]))

    cap, _ = bank_rows(apps["VII"], 7)
    for r in cap:
        for c, metric in ((4, "core_capital_to_rwa"), (5, "total_capital_to_rwa")):
            rows.append(base("bank", r["rank"], r["name"], metric, r["values"][c], "%", year, r["page"]))

    for label, table in (("prof", prof), ("loans", loans)):
        ranks = [r["rank"] for r in table]
        if ranks != list(range(1, len(ranks) + 1)):
            problems.append(f"bank {label} table: banks are not numbered 1..{len(ranks)}")
    if len(prof) != len(loans):
        problems.append(f"{len(prof)} banks in appendix V but {len(loans)} in appendix VI")

    for app, kind in (("X", "mfb_balance"), ("XI", "mfb_pl")):
        table, names = mfb_table(apps[app], kind)
        if len(names) != len(MFB_HEADS):
            problems.append(f"appendix {app}: header names {len(names)} microfinance banks, expected {len(MFB_HEADS)}")
            continue
        for metric, values in table.items():
            if len(values) != 15:
                problems.append(f"appendix {app} {metric}: {len(values)} columns")
                continue
            s, t = sum(v or 0 for v in values[:14]), values[14] or 0
            if not (close(s, t, TOL) or abs(s - t) <= 0.5 * 14 + 1):
                problems.append(f"appendix {app} {metric}: banks add up to {s:,.0f}, the TOTAL column says {t:,.0f}")
            for inst, v in zip(names, values[:14]):
                row = base("mfb", None, inst, metric, v, "KES m", year, apps[app][0][0])
                if inst.startswith("Kenya Women"):
                    row["note"] = "CBK marks these figures as unaudited."
                rows.append(row)
        for _, metric in MFB_ROWS[kind]:
            if metric not in table:
                problems.append(f"appendix {app}: row {metric} not found")
    return rows, problems


def find_latest() -> tuple[str, int]:
    import requests
    from urllib.parse import quote, urljoin

    html = requests.get(INDEX, headers=UA, timeout=(15, 60), verify=False).text
    links = re.findall(r'href="([^"]*banking_sector_annual_reports/[^"]*ANNUAL[^"]*?(20\d\d)[^"]*\.pdf)"', html, re.I)
    if not links:
        raise SystemExit("no annual report found on the CBK page")
    href, year = max(links, key=lambda x: int(x[1]))
    return quote(urljoin(INDEX, href), safe=":/%"), int(year)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file")
    ap.add_argument("--year", type=int)
    ap.add_argument("--url")
    ap.add_argument("--inspect", action="store_true")
    a = ap.parse_args()
    if a.file:
        data, year, url = Path(a.file), a.year, a.url or INDEX
    else:
        url, year = find_latest()
        data = fetch_pdf(url)
    rows, problems = read(data, year, url)
    banks = len({r["name"] for r in rows if r["type"] == "bank"})
    mfbs = len({r["name"] for r in rows if r["type"] == "mfb"})
    print(f"CBK Bank Supervision Annual Report {year}: {len(rows)} figures for {banks} bank names and {mfbs} microfinance banks")
    if problems:
        print("refused:", "; ".join(problems))
        return 1
    if a.inspect:
        for r in rows[:3] + [r for r in rows if r["type"] == "mfb"][:3]:
            print(" ", r)
        return 0
    added = append_rows(OUT, rows, ("report", "year", "type", "name", "metric"), {"source": "CBK, Bank Supervision Annual Report"})
    print(f"added {added} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
