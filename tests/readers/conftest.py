"""Shared setup for the reader tests: put scripts/ on the import path and forbid network access."""

import sys
from pathlib import Path

import pytest

SCRIPTS = Path(__file__).resolve().parents[2] / "scripts"
sys.path.insert(0, str(SCRIPTS))


@pytest.fixture(autouse=True)
def no_network(monkeypatch):
    """Any HTTP call from a reader under test is a bug in the test: fail loudly instead of reaching out."""
    import requests

    def refuse(*args, **kwargs):
        raise AssertionError("network access attempted in a reader test")

    monkeypatch.setattr(requests.Session, "request", refuse)
    monkeypatch.setattr(requests, "get", refuse)
    monkeypatch.setattr(requests, "post", refuse)
