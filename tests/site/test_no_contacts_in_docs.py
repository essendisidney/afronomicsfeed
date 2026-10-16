"""The repository is public: people's and organisations' contact details live in the founder's private contacts file
(Google Drive, "Afronomics contacts (private)"), not in docs. Security review 2026-10-16, L-2."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIRS = ["docs/sales", "docs/strategy", "docs/legal", "docs/rebuild", "editions/social"]
# An address not inside a URL path (Kenya Law links contain "eng@2023-12-15").
EMAIL = re.compile(r"(?<![/\w.-])[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}(?![\w/-])")
PHONE = re.compile(r"\+\d{3}[ \d]{7,14}\d")
ALLOWED = {"noreply@anthropic.com"}


def test_no_contact_details_in_public_docs():
    found = []
    for d in DIRS:
        for f in (ROOT / d).rglob("*.md"):
            for n, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
                emails = [e for e in EMAIL.findall(line) if e not in ALLOWED and not e.endswith("@afronomicsfeed.com")]
                if emails or PHONE.search(line):
                    found.append(f"{f.relative_to(ROOT)}:{n}")
    assert not found, "Contact details in public docs (move them to the private contacts file): " + ", ".join(found)
