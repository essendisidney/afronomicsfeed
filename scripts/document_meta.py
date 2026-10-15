"""
Sets a PDF's title, author, subject and keywords (docs/rebuild/phase-7e-r3-plan.md): Chromium writes only the title.
Called by scripts/make-documents.mjs for every file it prints. The document's tags and bookmarks are kept.

    python scripts/document_meta.py <file.pdf> <title> <subject> <document number>
"""

from __future__ import annotations

import sys

from pypdf import PdfReader, PdfWriter


def stamp(path: str, title: str, subject: str, number: str) -> None:
    writer = PdfWriter(clone_from=PdfReader(path))
    writer.add_metadata(
        {
            "/Title": title,
            "/Author": "Afronomics",
            "/Subject": subject,
            "/Keywords": f"{number}; Afronomics; information, not advice",
            "/Creator": "Afronomics document engine (scripts/make-documents.mjs)",
        }
    )
    with open(path, "wb") as f:
        writer.write(f)


if __name__ == "__main__":
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    stamp(*sys.argv[1:])
