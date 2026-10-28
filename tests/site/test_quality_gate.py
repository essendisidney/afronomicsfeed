"""The data quality gate (scripts/quality_check.py): no new errors in any auction file, every known issue still real
(a fixed one must come off data/quality/known.json), and the checks catch what they claim to."""

import importlib.util
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("quality_check", ROOT / "scripts" / "quality_check.py")
qc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qc)


def test_no_new_errors_in_the_auction_files():
    report = qc.run()
    assert len(report["files"]) >= 10
    assert report["errors"] == [], "\n".join(report["errors"][:20])


def test_known_issues_are_still_real_and_explained():
    report = qc.run()
    assert report["stale_known"] == [], "fixed issues must come off data/quality/known.json"
    for issue in json.loads((ROOT / "data" / "quality" / "known.json").read_text())["issues"]:
        assert len(issue["reason"]) > 40


def test_the_checks_catch_bad_rows(tmp_path, monkeypatch):
    rows = [
        {"tenor": 91, "value_date": "2026-10-01", "weighted_avg_rate": 9.0, "received_x_m": 100, "accepted_x_m": 90, "source": "https://example.org/a.pdf"},
        {"tenor": 91, "value_date": "2026-10-08", "weighted_avg_rate": 12.0, "received_x_m": 100, "accepted_x_m": 150, "source": "https://example.org/b.pdf"},
        {"tenor": 91, "value_date": "not a date", "weighted_avg_rate": 140, "source": ""},
        {"tenor": 91, "value_date": "2026-10-01", "weighted_avg_rate": 9.0, "received_x_m": 100, "accepted_x_m": 90, "source": "https://example.org/a.pdf"},
    ]
    f = tmp_path / "data" / "x" / "tbill_auctions.json"
    f.parent.mkdir(parents=True)
    f.write_text(json.dumps({"rows": rows}))
    monkeypatch.setattr(qc, "ROOT", tmp_path)
    errors, flags, n = qc.check_file(f, date(2026, 10, 28))
    text = " ".join(e["text"] for e in errors)
    assert n == 4
    for problem in ("accepted 150", "no valid date", "not a rate", "no source link", "repeats an earlier row"):
        assert problem in text
    assert any("+300 bp" in fl for fl in flags)
