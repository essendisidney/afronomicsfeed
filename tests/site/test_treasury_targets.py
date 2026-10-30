"""The D-036 target list (docs/sales/treasury-desk-targets.md): 60 unique institutions, names only, every SACCO on
SASRA's 2026 list with a deposit-taking licence."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TARGETS = json.loads((ROOT / "data" / "sales" / "treasury-desk-targets.json").read_text())["rows"]
REGISTER = json.loads((ROOT / "data" / "registry" / "sasra_licences.json").read_text())["rows"]


def test_sixty_unique_institutions():
    names = [r["name"].lower() for r in TARGETS]
    assert len(names) == 60
    assert len(set(names)) == 60
    assert {r["group"] for r in TARGETS} == {"sacco", "pension", "fund_manager"}


def test_names_only_no_contact_details():
    text = json.dumps(TARGETS)
    assert not re.search(r"[\w.+-]+@[\w-]+\.[\w.]+", text), "no email addresses in the target list"
    assert not re.search(r"\+?254\s?\d{3}", text), "no phone numbers in the target list"


def test_every_sacco_holds_a_2026_deposit_taking_licence():
    licensed = {r["name"] for r in REGISTER if r["year"] == 2026 and r["type"] == "dt" and r["status"] == "licensed"}
    saccos = [r for r in TARGETS if r["group"] == "sacco"]
    assert len(saccos) == 30
    for r in saccos:
        assert r.get("register_name") in licensed, f"{r['name']} is not a licensed deposit-taking SACCO on the 2026 list"
