"""The citation log (docs/rebuild/upgrade-U6-plan.md, item C): data/citations.json, scripts/log_citation.py and
lib/citations-core.ts. The file must stay valid, the script must append and never rewrite, and the TypeScript rules
must agree with the Python ones. The TypeScript runs with node's type stripping; skipped where that is unavailable."""

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import log_citation  # noqa: E402

TODAY = "2026-10-22"
GOOD = [
    "--date", "2026-10-20", "--outlet", "Business Daily", "--title", "T-bill rates ease again",
    "--url", "https://www.businessdailyafrica.com/bd/markets/t-bill-rates-ease", "--kind", "news",
    "--what", "Kenya 364-day T-bill rate", "--our-path", "/markets/kenya-tbills", "--linked", "yes",
]


def fresh(tmp_path):
    f = tmp_path / "citations.json"
    f.write_text(json.dumps({"updated_at": None, "entries": []}), encoding="utf-8")
    return f


def test_the_log_in_the_repo_is_valid():
    doc = json.loads((ROOT / "data/citations.json").read_text(encoding="utf-8"))
    assert log_citation.check(doc, log_citation.nairobi_today()) == []


def test_a_good_entry_is_appended_with_an_id(tmp_path):
    f = fresh(tmp_path)
    assert log_citation.main(GOOD, path=f, today=TODAY) == 0
    doc = json.loads(f.read_text(encoding="utf-8"))
    assert doc["updated_at"] == TODAY
    [e] = doc["entries"]
    assert e["id"] == "2026-10-20-business-daily"
    assert e["linked"] is True and e["logged_on"] == TODAY and e["our_path"] == "/markets/kenya-tbills"


def test_the_same_link_is_refused_and_nothing_is_rewritten(tmp_path):
    f = fresh(tmp_path)
    assert log_citation.main(GOOD, path=f, today=TODAY) == 0
    before = f.read_text(encoding="utf-8")
    assert log_citation.main(GOOD, path=f, today=TODAY) == 1
    assert f.read_text(encoding="utf-8") == before


@pytest.mark.parametrize(
    "change",
    [
        ["--date", "2026-10-30"],  # in the future
        ["--url", "http://example.com/x"],  # not https
        ["--url", "https://www.afronomicsfeed.com/press"],  # our own site
        ["--outlet", "someone@example.com"],  # contact details
        ["--our-path", "markets"],  # not a path
    ],
)
def test_bad_entries_are_refused(tmp_path, change):
    f = fresh(tmp_path)
    args = list(GOOD)
    i = args.index(change[0])
    args[i + 1] = change[1]
    assert log_citation.main(args, path=f, today=TODAY) == 1
    assert json.loads(f.read_text(encoding="utf-8"))["entries"] == []


def test_a_withdrawal_is_a_new_row(tmp_path):
    f = fresh(tmp_path)
    log_citation.main(GOOD, path=f, today=TODAY)
    assert log_citation.main(["--withdraw", "2026-10-20-business-daily"], path=f, today=TODAY) == 1  # needs a reason
    assert log_citation.main(["--withdraw", "2026-10-20-business-daily", "--reason", "quoted another site"], path=f, today=TODAY) == 0
    entries = json.loads(f.read_text(encoding="utf-8"))["entries"]
    assert len(entries) == 2 and entries[0]["id"] == "2026-10-20-business-daily"
    assert entries[1]["corrects"] == "2026-10-20-business-daily"


SCRIPT = r"""
const c = await import(process.argv[1]);
const ok = { id: "2026-10-20-business-daily", date: "2026-10-20", outlet: "Business Daily", title: "T-bill rates ease", url: "https://www.businessdailyafrica.com/x", kind: "news", what: "Kenya 364-day T-bill rate", our_path: "/markets/kenya-tbills", linked: true, logged_on: "2026-10-22", logged_by: "founder" };
const other = { ...ok, id: "2026-09-01-the-star", date: "2026-09-01", outlet: "The Star", url: "https://www.the-star.co.ke/x", linked: false };
const wd = { ...other, id: "withdraw-2026-09-01-the-star", corrects: "2026-09-01-the-star" };
console.log(JSON.stringify({
  ok: c.citationErrors(ok, "2026-10-22"),
  future: c.citationErrors({ ...ok, date: "2026-10-23" }, "2026-10-22"),
  own: c.citationErrors({ ...ok, url: "https://afronomicsfeed.com/press" }, "2026-10-22"),
  email: c.citationErrors({ ...ok, what: "from a@b.co" }, "2026-10-22"),
  standing: c.standing([other, ok, wd]).map((e) => e.id),
  summary: c.citationSummary([other, ok], "2026-10-22"),
}));
"""


def test_the_typescript_rules_agree():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not available")
    proc = subprocess.run(
        [node, "--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", SCRIPT, str(ROOT / "lib" / "citations-core.ts")],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        pytest.skip(f"node could not run the TypeScript: {proc.stderr[:200]}")
    out = json.loads(proc.stdout)
    assert out["ok"] == []
    assert out["future"] == ["date is in the future", "logged before it was published"]
    assert out["own"] == ["url is our own site; log the outside page that cited us"]
    assert out["email"] == ["no email addresses in the log"]
    assert out["standing"] == ["2026-10-20-business-daily"]
    assert out["summary"] == {"total": 2, "last7": 1, "last30": 1, "linked": 1, "outlets": 2}
