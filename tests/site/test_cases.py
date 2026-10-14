"""The casebook validator (scripts/case_check.py), and every case in content/cases/ passing it."""

from __future__ import annotations

import copy
import importlib.util
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("case_check", ROOT / "scripts" / "case_check.py")
case_check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(case_check)

SRC = {"name": "Central Bank of Kenya press release", "url": "https://www.centralbank.go.ke/example"}
GOOD = {
    "id": "AF-KE-2099-01",
    "title": "Test case",
    "status": "draft",
    "country": "KE",
    "sector": "banking",
    "institutions": ["Test Bank"],
    "start": "2099-01-02",
    "end": None,
    "summary": "A test.",
    "conditions_before": [{"metric": "Capital ratio", "value": "10%", "as_of": "2098-12-31", "source": SRC}],
    "trigger": {"text": "Receivership", "date": "2099-01-02", "source": SRC},
    "timeline": [{"date": "2099-01-02", "title": "Receivership", "source": SRC}],
    "who_lost": [{"group": "Depositors", "amount": "KES 1", "as_of": "2099-01-02", "source": SRC}],
    "signals_visible_before": [{"metric": "Deposits", "value": "KES 1", "as_of": "2098-12-31", "source": SRC}],
    "response": [{"date": "2099-01-03", "text": "Payout", "source": SRC}],
    "lessons": ["Ask about related-party lending."],
    "labels": ["Facts", "Analysis"],
    "sources": [{**SRC, "date": "2099-01-02"}],
    "todo": [],
}


def run(data: dict, tmp_path: Path, name: str | None = None) -> list[str]:
    p = tmp_path / f"{name or data.get('id', 'x')}.md"
    p.write_text("---\n" + yaml.safe_dump(data, sort_keys=False) + "---\n")
    return case_check.check([p])


def test_good_case_passes(tmp_path):
    assert run(GOOD, tmp_path) == []


def test_bad_id_and_file_name(tmp_path):
    assert any("id" in p for p in run({**GOOD, "id": "KE-2099-1"}, tmp_path, "KE-2099-1"))
    assert any("file name" in p for p in run(GOOD, tmp_path, "AF-KE-2099-02"))


def test_figure_without_source_or_date_is_refused(tmp_path):
    bad = copy.deepcopy(GOOD)
    bad["conditions_before"][0]["source"] = {"name": "Somewhere"}
    del bad["signals_visible_before"][0]["as_of"]
    bad["who_lost"][0]["as_of"] = None
    found = run(bad, tmp_path)
    assert any("conditions_before[0]" in p and "link" in p for p in found)
    assert any("signals_visible_before[0].as_of" in p for p in found)
    assert any("who_lost[0].as_of" in p for p in found)


def test_timeline_event_needs_date_and_source(tmp_path):
    bad = copy.deepcopy(GOOD)
    bad["timeline"][0] = {"title": "Something happened"}
    found = run(bad, tmp_path)
    assert any("timeline[0].date" in p for p in found)
    assert any("timeline[0]" in p and "source" in p for p in found)


def test_opinion_label_is_refused(tmp_path):
    assert any("Opinion" in p for p in run({**GOOD, "labels": ["Facts", "Opinion"]}, tmp_path))


def test_published_needs_sign_off_and_no_todos(tmp_path):
    found = run({**GOOD, "status": "published", "todo": ["TODO(source): x"]}, tmp_path)
    assert any("signed_off" in p for p in found)
    assert any("open TODOs" in p for p in found)
    signed = {**GOOD, "status": "published", "signed_off": {"by": "Founder", "date": "2099-02-01"}}
    assert run(signed, tmp_path) == []


def test_draft_may_leave_sections_empty_with_todos(tmp_path):
    draft = {**GOOD, "who_lost": [], "todo": ["TODO(source): published losses"]}
    assert run(draft, tmp_path) == []
    assert any("who_lost" in p for p in run({**draft, "status": "published", "signed_off": {"by": "F", "date": "2099-02-01"}}, tmp_path))


def test_duplicate_ids(tmp_path):
    a = tmp_path / "a"
    b = tmp_path / "b"
    a.mkdir()
    b.mkdir()
    for d in (a, b):
        (d / "AF-KE-2099-01.md").write_text("---\n" + yaml.safe_dump(GOOD) + "---\n")
    assert any("duplicate" in p for p in case_check.check([a / "AF-KE-2099-01.md", b / "AF-KE-2099-01.md"]))


def test_every_case_in_the_repo_passes():
    paths = sorted((ROOT / "content" / "cases").glob("*.md"))
    assert case_check.check(paths) == []
