"""
SASRA's Quarterly Statistical and Soundness Report: sector totals for deposit-taking (DT) and non-withdrawable-deposit
(NWDT) SACCOs, read into data/registry/sasra_sector.json (docs/rebuild/phase-5-plan.md). Per-SACCO figures are not in
it; the Watch pack uses it for "the sector this quarter".

    python scripts/sasra_quarterly.py                     # find the newest report on sasra.go.ke and add it
    python scripts/sasra_quarterly.py --file x.pdf --url https://...
    python scripts/sasra_quarterly.py --inspect

Read:
  Table 1  total assets, gross loans, total deposits, total income and reserves (KES billions) for DT, NWDT and all,
           for each quarter shown (the previous year's four and this year's so far);
  Table 2  DT-SACCO soundness ratios, with SASRA's prescribed level where it gives one.

Checks before anything is written: Table 1 has five indicators of three rows each; DT plus NWDT equals SASRA's total
(within rounding); the year-on-year change SASRA prints equals the change worked out from its own figures. Figures for
a quarter differ between editions (December is restated once audited), so each row keeps the edition it came from.
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from registry_common import UA, append_rows, fetch_pdf, open_pdf, sasra_file_link  # noqa: E402

OUT = "sasra_sector.json"
INDEX = "https://www.sasra.go.ke/quarterly-statistical-and-soundness-reports/"
MONTHS = {"MARCH": 3, "JUNE": 6, "SEPTEMBER": 9, "SEPT": 9, "DECEMBER": 12}
QUARTER_END = {3: 31, 6: 30, 9: 30, 12: 31}
INDICATORS = ["assets", "gross_loans", "deposits", "income", "reserves"]
SEGMENTS = {"DT-SACCOs": "dt", "NWDT-SACCOs": "nwdt", "TOTALS": "all"}
NUM = r"-?\d[\d,]*\.\d+"
RATIOS = [
    (r"^Core Capital/Total Assets", "core_capital_to_assets"),
    (r"^Core Capital/Total Deposits", "core_capital_to_deposits"),
    (r"^Institutional Capital/Total Assets", "institutional_capital_to_assets"),
    (r"^External Borrowings/Total Assets", "external_borrowing_to_assets"),
    (r"(Regulatory )?Liquidity Ratio", "liquidity_ratio"),
    (r"^Return on Assets", "roa"),
    # Printed over two lines: "Non-Performing Loans (NPLs) to Gross less" / "Loans than 5% 6.71% …".
    (r"^Loans\s+than\s+5%|^Non-Performing Loans \(NPLs\) to Gross Loans", "npl_ratio"),
]


def report_period(text: str) -> date:
    m = re.search(r"Quarter \w+\s*[–-]\s*(March|June|September|December)\s+(\d{4})", text, re.I)
    if not m:
        raise ValueError("no 'Quarter … – Month Year' heading")
    month = MONTHS[m.group(1).upper()]
    return date(int(m.group(2)), month, QUARTER_END[month])


def periods_back(end: date, n: int) -> list[str]:
    """n consecutive quarter ends, oldest first, ending at end."""
    out, y, mth = [], end.year, end.month
    for _ in range(n):
        out.append(date(y, mth, QUARTER_END[mth]).isoformat())
        mth -= 3
        if mth <= 0:
            mth += 12
            y -= 1
    return out[::-1]


def table1(text: str) -> list[tuple[str, list[float], list[float]]]:
    """(segment, values, printed % changes) for each Table 1 row, in order."""
    rows = []
    for line in text.splitlines():
        m = re.search(rf"(DT-SACCOs|NWDT-SACCOs|TOTALS)\s+((?:{NUM}\s+)+?)((?:-?\d+\.\d+%\s*)+)$", line.strip())
        if m:
            values = [float(x.replace(",", "")) for x in m.group(2).split()]
            changes = [float(x.rstrip("%")) for x in m.group(3).split()]
            rows.append((SEGMENTS[m.group(1)], values, changes))
    return rows


def table2(text: str, n: int) -> list[tuple[str, str | None, list[float]]]:
    """(metric, prescribed level or None, n quarterly values) for the DT soundness ratios we keep."""
    out = []
    section = text.split("Table 2", 1)[-1].split("Table 3", 1)[0]
    for line in section.splitlines():
        line = line.strip()
        for rx, metric in RATIOS:
            if re.search(rx, line) and not any(m == metric for m, _, _ in out):
                pcts = re.findall(r"-?\d+\.\d+%", line)
                if len(pcts) >= n:
                    values = [float(p.rstrip("%")) for p in pcts[-n:]]
                    head = line[: line.find(pcts[-n])]
                    level = re.search(r"((?:[<>]=?|≥|≤)?\s?\d+%)\s*$", head.strip())
                    prescribed = level.group(1).strip() if level else None
                    if metric == "npl_ratio" and prescribed:
                        prescribed = f"<{prescribed}"  # "less than 5%"
                    out.append((metric, prescribed, values))
    return out


def read(data: bytes | Path) -> tuple[dict, list[str]]:
    with open_pdf(data) as pdf:
        text = "\n".join(p.extract_text() or "" for p in pdf.pages)
    problems: list[str] = []
    end = report_period(text)
    # Table 1 comes first; later tables (sector lending) also end in a TOTALS row, so take its fifteen rows only.
    rows = table1(text.split("Table 2", 1)[0])
    if len(rows) != 15 or [r[0] for r in rows] != ["dt", "nwdt", "all"] * 5:
        problems.append(f"Table 1: expected 5 indicators of DT, NWDT and totals, read {len(rows)} rows")
        return {}, problems
    n = len(rows[0][1])
    if any(len(r[1]) != n for r in rows):
        problems.append("Table 1: rows have different numbers of quarters")
    quarters = periods_back(end, n)
    for i, metric in enumerate(INDICATORS):
        dt, nw, tot = (rows[3 * i + k][1] for k in range(3))
        for q in range(n):
            if abs(dt[q] + nw[q] - tot[q]) > 0.05:
                problems.append(f"{metric} {quarters[q]}: DT {dt[q]} + NWDT {nw[q]} is not the total {tot[q]}")
        # The printed changes are year on year for this year's quarters (e.g. March and June against a year before).
        for seg, values, changes in rows[3 * i : 3 * i + 3]:
            for k, ch in enumerate(changes):
                now_i = n - len(changes) + k
                if now_i - 4 >= 0 and values[now_i - 4]:
                    worked = (values[now_i] / values[now_i - 4] - 1) * 100
                    # Figures are printed to 0.01 bn; SASRA works the change from unrounded ones, so allow for the
                    # rounding in both figures (it matters for small totals such as NWDT income) plus its own 0.01%.
                    slack = (0.005 / values[now_i] + 0.005 / values[now_i - 4]) * (values[now_i] / values[now_i - 4]) * 100 + 0.01
                    if abs(worked - ch) > slack:
                        problems.append(f"{metric} {seg} {quarters[now_i]}: SASRA prints {ch}%, its figures give {worked:.2f}%")
    ratios = table2(text, n)
    return {"period": end.isoformat(), "quarters": quarters, "table1": rows, "ratios": ratios}, problems


def to_rows(parsed: dict, url: str) -> list[dict]:
    out = []
    report = parsed["period"]
    q = parsed["quarters"]
    for i, metric in enumerate(INDICATORS):
        for seg, values, _ in parsed["table1"][3 * i : 3 * i + 3]:
            for k, v in enumerate(values):
                out.append({"report": report, "period": q[k], "segment": seg, "metric": metric, "value": v, "unit": "KES bn", "as_of": q[k], "source": url})
    for metric, level, values in parsed["ratios"]:
        for k, v in enumerate(values):
            row = {"report": report, "period": q[k], "segment": "dt", "metric": metric, "value": v, "unit": "%", "as_of": q[k], "source": url}
            if level:
                row["prescribed"] = level
            out.append(row)
    return out


def find_latest() -> str:
    import requests

    html = requests.get(INDEX, headers=UA, timeout=(15, 60), verify=False).text
    pages = re.findall(r'href="(https://www\.sasra\.go\.ke/download/[^"]*quarter[^"]*)"', html, re.I)
    if not pages:
        raise SystemExit("no quarterly report found on the SASRA page")
    # The index lists the newest first.
    dl = requests.get(pages[0], headers=UA, timeout=(15, 60), verify=False).text
    link = sasra_file_link(dl)
    if not link:
        raise SystemExit(f"no file link on {pages[0]}")
    return link


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file")
    ap.add_argument("--url")
    ap.add_argument("--inspect", action="store_true")
    a = ap.parse_args()
    if a.file:
        data, url = Path(a.file), a.url or INDEX
    else:
        url = find_latest()
        data = fetch_pdf(url)
    parsed, problems = read(data)
    print(f"SASRA quarterly report {parsed.get('period')}: {len(parsed.get('table1', []))} Table 1 rows, {len(parsed.get('ratios', []))} ratios")
    if problems:
        print("refused:", "; ".join(problems))
        return 1
    rows = to_rows(parsed, url)
    if a.inspect:
        for r in rows[:3] + rows[-3:]:
            print(" ", r)
        return 0
    added = append_rows(OUT, rows, ("report", "period", "segment", "metric"), {"source": "SASRA, Quarterly Statistical and Soundness Report"})
    print(f"added {added} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
