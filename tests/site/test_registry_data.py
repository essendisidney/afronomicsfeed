"""The committed registry data (data/registry/, docs/rebuild/phase-3-plan.md): every row carries a source link and an
as-of date, withheld figures carry no value, and every manual alias points at an institution that is listed."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from registry_common import match_key  # noqa: E402

DATA = ROOT / "data" / "registry"
FILES = ["sasra_licences.json", "sasra_figures.json", "cbk_figures.json", "cbk_directories.json"]


def rows(name: str) -> list[dict]:
    return json.loads((DATA / name).read_text())["rows"]


def test_every_row_has_a_source_and_a_date():
    for name in FILES:
        for r in rows(name):
            assert re.match(r"^https://www\.(sasra|centralbank)\.go\.ke/", r["source"]), (name, r)
            assert re.match(r"^\d{4}-\d{2}-\d{2}$", r["as_of"]), (name, r)


def test_withheld_figures_have_no_value_and_say_why():
    for name in ("sasra_figures.json", "cbk_figures.json"):
        for r in rows(name):
            if r["value"] is None:
                assert r.get("note"), r
            if "Withheld" in (r.get("note") or ""):
                assert r["value"] is None, r


def test_aliases_point_at_listed_saccos():
    aliases = json.loads((DATA / "aliases.json").read_text())["aliases"]
    listed = {match_key(r["name"]) for r in rows("sasra_licences.json")}
    for key, target in aliases.items():
        group, _, _ = key.partition(":")
        assert group in {"sacco", "mfb", "bank"}, key
        if group == "sacco":
            assert target in listed, f"{key} -> {target}: no listed SACCO has that key"


def test_registry_covers_what_the_regulators_list():
    lic = rows("sasra_licences.json")
    assert sum(1 for r in lic if r["schedule"] == "I") == 176
    dirs = rows("cbk_directories.json")
    assert sum(1 for r in dirs if r["kind"] == "bank" and r["section"] == "bank") == 38
    assert sum(1 for r in dirs if r["kind"] == "mfb") == 14
