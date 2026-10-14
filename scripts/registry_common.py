"""
Shared parts of the institutions registry readers (docs/rebuild/phase-3-plan.md): SASRA's licensed list and annual
report, CBK's directories and its Bank Supervision Annual Report.

Every reader turns one regulator document into rows. A row is one fact about one institution, with the document's
link and the date the fact is as of. Rows are only ever added: `append_rows` keeps every row already in the file and
adds those whose key is new, so history is never rewritten. A document that fails a reader's checks writes nothing.
"""

from __future__ import annotations

import io
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bills_common import ROOT, UA  # noqa: E402

DATA = ROOT / "data" / "registry"

# The 47 counties, as SASRA spells them in its lists (with the common variants it uses).
COUNTIES = [
    "Baringo", "Bomet", "Elgeyo Marakwet", "West Pokot", "Tharaka Nithi", "Bungoma", "Busia", "Elgeyo Marakwet", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
    "Homabay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui",
    "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
    "Murang'a", "Murang’a", "Muranga", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
    "Samburu", "Siaya", "Taita Taveta", "Taita-Taveta", "Tana River", "Tharaka Nithi", "Tharaka-Nithi", "Trans Nzoia",
    "Trans-Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
]
_COUNTY_RX = re.compile(r"(?:^|\s)(" + "|".join(sorted((re.escape(c) for c in COUNTIES), key=len, reverse=True)) + r")\s*$", re.I)


def county_at_end(line: str) -> str | None:
    """The county a list line ends with, in a standard spelling; None if it ends with no county."""
    m = _COUNTY_RX.search(re.sub(r"\s*[–-]\s*", " ", line.strip()))
    if not m:
        return None
    c = m.group(1).replace("’", "'").replace("-", " ")
    fixes = {"homabay": "Homa Bay", "muranga": "Murang'a", "elgeyo marakwet": "Elgeyo Marakwet"}
    return fixes.get(c.lower(), " ".join(w if w.lower() != "nzoia" else "Nzoia" for w in c.title().split()).replace("Murang'A", "Murang'a"))


_STRIP = re.compile(
    r"\b(sacco|saccos|society|societies|ltd|limited|plc|co-operative savings and credit|cooperative|and|dt|nwdt|bank|kenya|"
    r"microfinance|mfb|the|\(k\)|k)\b",
    re.I,
)


def match_key(name: str) -> str:
    """A loose key for matching one institution's name across documents: 'Mwalimu National Sacco Society Ltd' and
    'MWALIMU NATIONAL DT' both give 'mwalimu national'. Used only to suggest a match; a match is accepted only when
    exactly one institution has the key (see lib/registry.ts and data/registry/aliases.json)."""
    s = name.replace("’", "'").replace("&", " ")
    s = re.sub(r"\(([^)]*)\)", r" \1 ", s)
    s = _STRIP.sub(" ", s.lower())
    s = re.sub(r"[^a-z0-9' ]+", " ", s).replace("'", "")
    return re.sub(r"\s+", " ", s).strip()


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("&", "and")).strip("-")


def number(text: str) -> float | None:
    """'1,497,701' -> 1497701.0; '(41)' -> -41.0; '-' or '' -> None."""
    t = text.strip().replace(",", "")
    neg = t.startswith("(") and t.endswith(")")
    t = t.strip("()%")
    if t in ("", "-", "–"):
        return None
    try:
        v = float(t)
    except ValueError:
        return None
    return -v if neg else v


def fetch_pdf(url: str) -> bytes:
    r = requests.get(url, headers=UA, timeout=(20, 120), verify=False)
    r.raise_for_status()
    if not r.content.startswith(b"%PDF"):
        raise ValueError(f"not a PDF: {url}")
    return r.content


def open_pdf(data: bytes | Path):
    import pdfplumber

    return pdfplumber.open(io.BytesIO(data) if isinstance(data, bytes) else data)


def load(name: str) -> dict:
    path = DATA / name
    if not path.exists():
        return {"rows": []}
    return json.loads(path.read_text())


def append_rows(name: str, rows: list[dict], key_fields: tuple[str, ...], meta: dict) -> int:
    """Add the rows whose key is new; keep every existing row unchanged. Returns how many were added."""
    doc = load(name)
    have = {tuple(r.get(k) for k in key_fields) for r in doc["rows"]}
    new = [r for r in rows if tuple(r.get(k) for k in key_fields) not in have]
    if not new:
        return 0
    doc.update(meta)
    doc["rows"] = doc["rows"] + new
    doc["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / name).write_text(dump(doc))
    return len(new)


def dump(doc: dict) -> str:
    """The file's fields, then its rows one per line: compact, and a new edition shows up as added lines in a diff."""
    head = {k: v for k, v in doc.items() if k != "rows"}
    lines = [json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in doc["rows"]]
    body = ",\n".join(lines)
    meta = json.dumps(head, ensure_ascii=False, indent=1)[1:-1].strip()
    return "{\n" + (meta + ",\n" if meta else "") + '"rows": [\n' + body + "\n]\n}\n"


def close(a: float, b: float, tolerance: float) -> bool:
    """True when two totals agree within a relative tolerance (rounding in the published tables)."""
    return abs(a - b) <= tolerance * max(abs(a), abs(b), 1e-9)
