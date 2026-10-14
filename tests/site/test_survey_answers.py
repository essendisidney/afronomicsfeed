"""The survey's answer ids must be the ones af_survey accepts, or answers are silently dropped.

Reads the options in components/ui/MicroSurvey.tsx and the allow-list in the latest af_survey migration (0041), and
checks they match question by question.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COMPONENT = (ROOT / "components/ui/MicroSurvey.tsx").read_text()
MIGRATION = (ROOT / "supabase/migrations/0041_survey_kenya_prices.sql").read_text()


def component_answers() -> dict[str, set[str]]:
    out = {}
    for q, block in re.findall(r"\n  (\w+): \{\n(.*?)\n  \},", COMPONENT, re.S):
        out[q] = set(re.findall(r'\["(\w+)", "', block))
    return out


def migration_answers() -> dict[str, set[str]]:
    return {q: set(re.findall(r"'(\w+)'", ids)) for q, ids in re.findall(r"p_question = '(\w+)' and p_answer in \(([^)]*)\)", MIGRATION)}


def test_every_question_and_answer_is_accepted_by_af_survey():
    assert component_answers() == migration_answers()


def test_question_allowed_by_the_table_check():
    allowed = set(re.findall(r"'(\w+)'", re.search(r"check \(question in \(([^)]*)\)\)", MIGRATION).group(1)))
    assert set(component_answers()) == allowed


def test_kenya_question_names_prices_in_shillings_and_says_nothing_to_pay_now():
    block = re.search(r"  pay_ke: \{\n(.*?)\n  \},", COMPONENT, re.S).group(1)
    assert block.count("KES ") == 3
    assert "Nothing to pay now" in block
