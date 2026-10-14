"""
Per-SACCO figures from SASRA's Sacco Supervision Annual Report, read into data/registry/sasra_figures.json.

    python scripts/sasra_annual.py                          # find the newest report on sasra.go.ke and add it
    python scripts/sasra_annual.py --file x.pdf --year 2025 --url https://...
    python scripts/sasra_annual.py --inspect                # print a summary, write nothing

Four appendices, found by their headings, each giving the report year and the year before:
  III / IV  growth indicators for deposit-taking (DT) / non-withdrawable-deposit (NWDT) SACCOs: total assets, total
            deposits, gross loans and total income, KES billions;
  V / VI    financial stability indices: core capital to assets and to deposits, institutional capital to assets
            (DT) or retained earnings and reserves to core capital (NWDT), external borrowing to assets, and the NPL
            ratio, in per cent.

Checks before anything is written (a report that fails writes nothing):
  - ranks run 1..N without gaps in every table, and every SACCO in a stability table is in its growth table;
  - the units: each growth table's total assets must add up to a total the report itself states in KES billions
    (the 2025 NWDT table is headed "millions", but its rows add up to the stated KES 141.36 billion);
  - a deposits column that repeats total assets exactly, in both years, is withheld for that SACCO with a note
    (the 2025 report does this for every DT-SACCO from rank 57 down; the true deposits are not published there).
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from registry_common import UA, append_rows, sasra_file_link, close, fetch_pdf, open_pdf  # noqa: E402

OUT = "sasra_figures.json"
INDEX = "https://www.sasra.go.ke/sacco-supervision-reports/"

APPENDICES = {
    "III": ("dt", "growth"),
    "IV": ("nwdt", "growth"),
    "V": ("dt", "stability"),
    "VI": ("nwdt", "stability"),
}
GROWTH = ("assets", "deposits", "gross_loans", "total_income")
STABILITY = {
    "dt": ("core_capital_to_assets", "core_capital_to_deposits", "institutional_capital_to_assets", "external_borrowing_to_assets", "npl_ratio"),
    "nwdt": ("core_capital_to_assets", "core_capital_to_deposits", "retained_earnings_to_core_capital", "external_borrowing_to_assets", "npl_ratio"),
}
NUM = r"-?\d[\d,]*\.\d+"
PCT = r"-?\d[\d,]*\.?\d*%"
# A row: rank, name, then both years' values (or the report year's only, for a SACCO new to the table). The rank
# is occasionally not printed; such a row is accepted only where it fills a one-place gap (see read_table).
GROWTH_ROW = re.compile(rf"^(?:(\d{{1,3}}) )?([A-Z0-9].+?) ((?:{NUM} ){{7}}{NUM}|(?:{NUM} ){{3}}{NUM})$")
STAB_ROW = re.compile(rf"^(?:(\d{{1,3}}) )?([A-Z0-9].+?) ((?:{PCT} ){{9}}{PCT}|(?:{PCT} ){{4}}{PCT})$")
# Header and total lines, not SACCOs. (A SACCO can be called "TOTAL": the oil company's; so only total lines.)
NOT_A_NAME = re.compile(r"^TOTAL\s+(ASSETS|DEPOSITS|INCOME|LOANS)|^SUB-?\s?TOTAL|^GRAND\s+TOTAL|KSHS|NAME OF|APPENDIX|PRESCRIBED|STANDARDS|MINIMUM|MAXIMUM", re.I)
TIER = re.compile(r"\b(LARGE|MEDIUM|SMALL) TIERED", re.I)
HEADER_WORDS = re.compile(r"TOTAL|KSHS|BILLIONS|MILLIONS|NAME OF|APPENDIX|THE SACCO SUPERVISION|PRESCRIBED|RATIO|^\W*$|^[A-Z0-9-]{1,3}$")


def appendix_pages(pdf) -> dict[str, list[int]]:
    """Page indexes for each appendix, from its heading to the next appendix heading."""
    starts: list[tuple[int, str]] = []
    for i, page in enumerate(pdf.pages):
        head = "\n".join((page.extract_text() or "").splitlines()[:3])
        m = re.search(r"APPENDIX ([IVX]+)\s*:", head)
        if m:
            starts.append((i, m.group(1)))
    out: dict[str, list[int]] = {}
    for k, (i, name) in enumerate(starts):
        end = starts[k + 1][0] if k + 1 < len(starts) else len(pdf.pages)
        if name in APPENDICES:
            out[name] = list(range(i, end))
    return out


def read_table(pages: list[tuple[int, str]], kind: str) -> list[dict]:
    """Rows from an appendix, given (page number, page text) pairs."""
    rx = GROWTH_ROW if kind == "growth" else STAB_ROW
    rows: list[dict] = []
    tier = None
    for page_no, text in pages:
        last_was_row = False  # a wrapped name continues on the line straight after its row, on the same page
        for line in text.splitlines():
            line = line.strip()
            t = TIER.search(line)
            if t:
                tier = t.group(1).lower()
                continue
            m = rx.match(line)
            row_line = bool(m and not NOT_A_NAME.search(m.group(2)))
            if row_line:
                values = [float(v.replace(",", "").rstrip("%")) for v in m.group(3).split()]
                rank = int(m.group(1)) if m.group(1) else None
                rows.append({"rank": rank, "name": m.group(2).strip(), "tier": tier, "values": values, "page": page_no})
            elif last_was_row and not HEADER_WORDS.search(line) and re.fullmatch(r"[A-Z][A-Z0-9 ()&'’.-]*", line) and len(line) <= 40:
                rows[-1]["name"] = f"{rows[-1]['name']} {line}"  # a name wrapped onto the next line
            last_was_row = row_line
    # An unnumbered row takes the rank between its neighbours only when exactly one rank is missing there.
    for k, r in enumerate(rows):
        if r["rank"] is None:
            before = rows[k - 1]["rank"] if k else 0
            after = rows[k + 1]["rank"] if k + 1 < len(rows) else None
            if before is not None and after == before + 2:
                r["rank"] = before + 1
                r["rank_inferred"] = True
    return [r for r in rows if r["rank"] is not None]


def reconcile(growth: list[dict], stab: list[dict]) -> None:
    """Make each rank's name agree between a growth and a stability table, which list the same SACCOs in the same
    order. A name wrapped over two lines can be read short in one table: the longer reading wins, unless its extra
    words start the next SACCO's name (then they were that SACCO's first line, printed above its row)."""
    g = {r["rank"]: r for r in growth}
    s = {r["rank"]: r for r in stab}
    for rank in sorted(set(g) & set(s)):
        a, b = g[rank]["name"], s[rank]["name"]
        if a == b:
            continue
        short, long_ = sorted((a, b), key=len)
        if long_.endswith(" " + short):
            name = long_  # the first line was printed above the row in one table
        elif long_.startswith(short + " "):
            extra = long_[len(short) + 1 :]
            nxt = [t[rank + 1]["name"] for t in (g, s) if rank + 1 in t]
            name = short if any(n.startswith(extra) for n in nxt) else long_
        else:
            continue  # two different readings: left as printed, and the registry will not join them
        g[rank]["name"] = s[rank]["name"] = name


def stated_billions(pdf) -> list[float]:
    """Every 'Kshs. X' amount with decimals the report states in its text (its totals are given in billions)."""
    text = " ".join((p.extract_text() or "") for p in pdf.pages[:120])
    return [float(x.replace(",", "")) for x in re.findall(r"Kshs\.?\s*([\d,]+\.\d+)", text)]


def check(tables: dict[str, list[dict]], stated: list[float]) -> list[str]:
    problems = []
    for name, rows in tables.items():
        ranks = [r["rank"] for r in rows]
        if ranks != list(range(1, len(rows) + 1)):
            problems.append(f"appendix {name}: ranks are not 1..{len(rows)}")
    for growth, stab in (("III", "V"), ("IV", "VI")):
        g = {r["rank"]: r["name"] for r in tables.get(growth, [])}
        s = {r["rank"]: r["name"] for r in tables.get(stab, [])}
        if not g:
            problems.append(f"appendix {growth}: no rows")
        missing = [n for k, n in s.items() if k not in g]
        if missing:
            problems.append(f"appendix {stab}: {len(missing)} SACCOs not in appendix {growth}")
        total = sum(r["values"][-len(GROWTH) * 2 + 1] if len(r["values"]) == 8 else r["values"][0] for r in tables.get(growth, []))
        if g and not any(close(total, x, 0.01) for x in stated):
            problems.append(f"appendix {growth}: total assets add up to {total:.2f}, which is no total the report states in KES billions")
    return problems


def to_rows(tables: dict[str, list[dict]], year: int, url: str) -> tuple[list[dict], int]:
    out: list[dict] = []
    withheld = 0
    for name, rows in tables.items():
        kind, table = APPENDICES[name]
        metrics = GROWTH if table == "growth" else STABILITY[kind]
        for r in rows:
            v = r["values"]
            if len(v) == len(metrics):  # the report year only: a SACCO new to the table
                v = [x for value in v for x in (None, value)]
            repeats = table == "growth" and v[0] == v[2] and v[1] == v[3]
            withheld += repeats
            for k, metric in enumerate(metrics):
                for j, y in enumerate((year - 1, year)):
                    value = v[2 * k + j]
                    if value is None:
                        continue
                    row = {
                        "report": year,
                        "year": y,
                        "type": kind,
                        "tier": r["tier"],
                        "rank": r["rank"],
                        "name": r["name"],
                        "metric": metric,
                        "value": value,
                        "unit": "KES bn" if table == "growth" else "%",
                        "as_of": f"{y}-12-31",
                        "source": url,
                        "page": r["page"],
                    }
                    if metric == "deposits" and repeats:
                        row["value"] = None
                        row["note"] = "Withheld: the report repeats total assets in the deposits column for this SACCO."
                    out.append(row)
    return out, withheld


def find_latest() -> tuple[str, int]:
    import requests

    html = requests.get(INDEX, headers=UA, timeout=(15, 60), verify=False).text
    pages = re.findall(r'href="(https://www\.sasra\.go\.ke/download/[^"]*?annual[^"]*?(20\d\d)[^"]*)"', html, re.I)
    if not pages:
        raise SystemExit("no annual report found on the SASRA page")
    page, year = max(pages, key=lambda p: int(p[1]))
    dl = requests.get(page, headers=UA, timeout=(15, 60), verify=False).text
    link = sasra_file_link(dl)
    if not link:
        raise SystemExit(f"no file link on {page}")
    return link, int(year)


def read(data: bytes | Path) -> tuple[dict[str, list[dict]], list[str]]:
    with open_pdf(data) as pdf:
        pages = appendix_pages(pdf)
        tables = {name: read_table([(i + 1, pdf.pages[i].extract_text() or "") for i in idx], APPENDICES[name][1]) for name, idx in pages.items()}
        for growth, stab in (("III", "V"), ("IV", "VI")):
            if growth in tables and stab in tables:
                reconcile(tables[growth], tables[stab])
        problems = check(tables, stated_billions(pdf))
    for name in APPENDICES:
        if name not in tables:
            problems.append(f"appendix {name} not found")
    return tables, problems


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
    tables, problems = read(data)
    print(f"SASRA annual report {year}: " + ", ".join(f"appendix {k} {len(v)} rows" for k, v in tables.items()))
    if problems:
        print("refused:", "; ".join(problems))
        return 1
    rows, withheld = to_rows(tables, year, url)
    print(f"  {len(rows)} figures; deposits withheld for {withheld} SACCOs (column repeats total assets)")
    if a.inspect:
        for r in rows[:3]:
            print(" ", r)
        return 0
    added = append_rows(OUT, rows, ("report", "year", "type", "rank", "metric"), {"source": "SASRA, Sacco Supervision Annual Report"})
    print(f"added {added} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
