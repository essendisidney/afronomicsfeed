"""
Every document and data file we hand out meets the house standard (docs/rebuild/phase-7e-r3-plan.md, PR 1, item 4).

Checks the PDFs committed under public/documents. With DOCS_DIR set (site-qa.yml prints the documents from the PR's own
build into it), checks those PDFs too, and the Excel workbooks in DOCS_DIR/data: a broken document fails the build.
"""

from __future__ import annotations

import os
import re
from pathlib import Path

import pytest

pypdf = pytest.importorskip("pypdf")
openpyxl = pytest.importorskip("openpyxl")

ROOT = Path(__file__).resolve().parents[2]
COMMITTED = ROOT / "public" / "documents"
FRESH = Path(os.environ["DOCS_DIR"]) if os.environ.get("DOCS_DIR") else None

MAX_BYTES = 2_000_000


def pdfs() -> list[Path]:
    found = sorted(COMMITTED.rglob("*.pdf")) if COMMITTED.exists() else []
    if FRESH:
        found += sorted(p for p in FRESH.rglob("*.pdf"))
    return found


def workbooks() -> list[Path]:
    return sorted((FRESH / "data").glob("*.xlsx")) if FRESH and (FRESH / "data").exists() else []


def fonts_of(page) -> list:
    res = page.get("/Resources") or {}
    fonts = (res.get("/Font") or {}) if hasattr(res, "get") else {}
    out = []
    for ref in fonts.values():
        font = ref.get_object()
        if font.get("/Subtype") == "/Type0":
            out += [d.get_object() for d in font["/DescendantFonts"]]
        else:
            out.append(font)
    return out


def embedded(font) -> bool:
    # Chromium writes variable fonts (our Archivo and Source Serif) as Type 3: the glyph outlines are in the file.
    if font.get("/Subtype") == "/Type3":
        return "/CharProcs" in font
    desc = font.get("/FontDescriptor")
    if desc is None:
        return False
    desc = desc.get_object()
    return any(k in desc for k in ("/FontFile", "/FontFile2", "/FontFile3"))


@pytest.mark.parametrize("path", pdfs(), ids=lambda p: p.name)
def test_pdf_meets_the_house_standard(path: Path):
    assert path.stat().st_size < MAX_BYTES, f"{path.name} is over 2 MB"
    reader = pypdf.PdfReader(str(path))
    meta = reader.metadata or {}
    assert meta.get("/Author") == "Afronomics"
    assert meta.get("/Title") and meta.get("/Subject"), "title and subject are set"
    assert re.search(r"AF-[A-Z0-9-]+", meta.get("/Keywords", "")), "the document number is in the keywords"

    root = reader.trailer["/Root"]
    assert "/StructTreeRoot" in root, "tagged PDF, for screen readers"
    assert "/Outlines" in root and reader.outline, "bookmarks for each section"

    assert 2 <= len(reader.pages) <= 40
    for page in reader.pages:
        for font in fonts_of(page):
            assert embedded(font), f"{path.name}: font {font.get('/BaseFont')} is not embedded"

    text = [re.sub(r"\s+", " ", p.extract_text() or "") for p in reader.pages]
    for n, t in enumerate(text, 1):
        assert "Information, not advice" in t, f"{path.name} page {n} lacks the footer"
        assert re.search(rf"Page {n} of {len(text)}", t), f"{path.name} page {n} lacks 'Page {n} of {len(text)}'"
    whole = " ".join(text)
    exhibits = len(re.findall(r"Exhibit \d+\.", whole))
    sources = len(re.findall(r"Source: ", whole))
    assert exhibits >= 1, "every document has at least one chart or table"
    assert sources >= exhibits, f"{path.name}: {exhibits} exhibits but {sources} source lines"
    assert "How to cite" in whole and "Afronomics (" in whole, "the closing page says how to cite"


@pytest.mark.parametrize("path", workbooks(), ids=lambda p: p.name)
def test_workbook_has_cover_data_and_notes(path: Path):
    assert re.fullmatch(r"afronomics_[a-z0-9-]+_\d{4}-\d{2}-\d{2}\.xlsx", path.name)
    wb = openpyxl.load_workbook(path)
    assert wb.sheetnames == ["Cover", "Data", "Notes"]
    cover = {row[1].value: row[2].value for row in wb["Cover"].iter_rows(min_row=6) if row[1].value}
    assert cover.get("Source"), "the cover names a source"
    assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(cover.get("Data as of"))), "the cover gives the as-of date"
    assert cover.get("Licence") and "Afronomics (" in str(cover.get("How to cite"))

    data = wb["Data"]
    assert data.freeze_panes == "A2", "the header row is frozen"
    header = [c.value for c in data[1]]
    assert header and all(header) and data.max_row > 1

    notes = {r[0].value: r[1].value for r in wb["Notes"].iter_rows(min_row=2)}
    missing = [h for h in header if not notes.get(h)]
    assert not missing, f"{path.name}: no note for columns {missing} (add them to COLUMN_NOTES in lib/documents/data-files.ts)"


def test_public_documents_are_present():
    # The site links these; scripts/make-documents.mjs refreshes them (documents.yml).
    for name in ("committee-pack-sample.pdf", "index-release.pdf", "watch-pack-sample.pdf"):
        assert (COMMITTED / name).exists(), name
