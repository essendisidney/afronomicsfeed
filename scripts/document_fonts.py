"""
Fixed-weight copies of the site's two variable fonts, for the PDF documents only (lib/documents/design.ts).

Chromium writes a variable font into a PDF as drawn glyphs (Type 3), about 600 KB a document; a fixed-weight font is
embedded as a compact subset instead. Run once after changing a font in public/fonts:

    pip install fonttools brotli && python scripts/document_fonts.py
"""

from __future__ import annotations

from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "fonts"
OUT = SRC / "doc"

INSTANCES = [
    ("archivo-latin-wdth-normal.woff2", "archivo-{w}.woff2", {"wdth": 100}, (400, 600, 700, 800)),
    ("source-serif-4-latin-wght-normal.woff2", "source-serif-4-{w}.woff2", {}, (600,)),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for src, name, axes, weights in INSTANCES:
        for w in weights:
            font = instantiateVariableFont(TTFont(SRC / src), {**axes, "wght": w}, updateFontNames=False)
            font.flavor = "woff2"
            font.save(OUT / name.format(w=w))
            print(OUT / name.format(w=w))


if __name__ == "__main__":
    main()
