"""WAEMU (UMOA-Titres): the issues listing table and an issue page's "Avis" and "Résultats" panels."""

import pytest

import umoa_bonds as um

SN = "https://www.umoatitres.org/fr/emission/emission-simultanee-de-bons-et-dobligations-du-tresor-du-senegal-du-09-10-2026/"
CI = "https://www.umoatitres.org/fr/emission/emission-dobligations-du-tresor-de-cote-divoire-du-10-10-2026/"

LISTING = f"""
<table class="table liste-emission">
<thead><tr><th>Émetteur</th><th>Type</th><th>Opération</th><th>Date opération</th><th>Date valeur</th>
<th>Échéance</th><th>Durée (mois)</th><th>Montant</th><th>Statut</th></tr></thead>
<tbody>
<tr><td>Sénégal - Titre 2</td><td>oat</td><td>Adjudication</td><td>09/10/2026</td><td>12/10/2026</td>
<td>12/10/2031</td><td>60</td><td>80 000</td><td><span>Réalisée</span></td>
<td><a href='{SN}'>Voir</a></td></tr>
<tr><td>Sénégal - Titre 1</td><td>BAT</td><td>Adjudication</td><td>09/10/2026</td><td>12/10/2026</td>
<td>11/10/2027</td><td>12</td><td>80 000</td><td><span>Réalisée</span></td>
<td><a href='{SN}'>Voir</a></td></tr>
<tr><td>Côte d’Ivoire</td><td>OAT</td><td>Adjudication</td><td>10/10/2026</td><td>13/10/2026</td>
<td>13/10/2033</td><td>84</td><td>50 000</td><td>Reportée</td>
<td><a href='{CI}'>Voir</a></td></tr>
<tr><td>Ghana</td><td>OAT</td><td>Adjudication</td><td>10/10/2026</td><td>13/10/2026</td>
<td>13/10/2033</td><td>84</td><td>50 000</td><td>Réalisée</td>
<td><a href='https://www.umoatitres.org/fr/emission/not-waemu/'>Voir</a></td></tr>
</tbody></table>
"""


def panel(title: str, body: str, active: bool = False) -> str:
    cls = "vc_tta-panel vc_active" if active else "vc_tta-panel"
    return (
        f'<div class="{cls}" id="p"><div class="vc_tta-panel-heading"><h4 class="vc_tta-panel-title">'
        f'<a href="#p"><span class="vc_tta-title-text">{title}</span></a></h4></div>'
        f'<div class="vc_tta-panel-body">{body}</div></div>'
    )


AVIS = (
    "<p><strong>BAT</strong></p><p>Durée : 12 mois</p><p>Taux d&#039;intérêt : -</p>"
    "<p><strong>OAT</strong></p><p>Durée : 60 mois</p><p>Taux d&#039;intérêt : 6,45 %</p>"
)
RESULTATS = (
    "<p><strong>BAT</strong></p>"
    "<p>Montant sollicité : 80 000</p><p>Montant global des soumissions : 50 000</p>"
    "<p>Soumissions retenues : 32 800</p><p>Nombre de soumissions : 12</p>"
    "<p>Taux moyen pondéré : 5,7012 %</p><p>Taux marginal : 5,9500 %</p>"
    "<p>Rendement moyen pondéré : 5,8925 %</p>"
    "<p><strong>OAT</strong></p>"
    "<p>Montant sollicité : 80 000</p><p>Montant global des soumissions : 47 200</p>"
    "<p>Soumissions retenues : 47 200</p><p>Nombre de soumissions : 8</p>"
    "<p>Prix moyen pondéré : 9 450,40</p><p>Prix marginal : 9 205,00</p>"
    "<p>Rendement moyen pondéré : 7,82 %</p>"
)
PAGE = "<html><body><div class='vc_tta-panels'>" + panel("Avis d’appel d’offres", AVIS, active=True) + panel("Résultats", RESULTATS) + "</div></body></html>"


@pytest.fixture
def issues():
    return um.listing(LISTING)


def test_listing_groups_lines_by_issue_in_titre_order(issues):
    assert list(issues) == [SN, CI]  # the non-WAEMU issuer is ignored
    sn = issues[SN]
    assert [(x["line"], x["instrument"], x["months"]) for x in sn] == [(1, "BAT", 12), (2, "OAT", 60)]
    assert sn[0]["country"] == "senegal"
    assert (sn[1]["operation_date"], sn[1]["value_date"], sn[1]["maturity"]) == ("2026-10-09", "2026-10-12", "2031-10-12")


def test_listing_status_column(issues):
    assert [x["postponed"] for x in issues[SN]] == [False, False]
    assert issues[CI][0]["postponed"] is True
    assert issues[CI][0]["country"] == "cote-divoire"


def test_parse_issue_reads_blocks_in_order():
    res = um.parse_issue(PAGE)
    assert [r["instrument"] for r in res] == ["BAT", "OAT"]
    bat, oat = res
    assert (bat["months"], bat["coupon"]) == (12, None)
    assert (oat["months"], oat["coupon"]) == (60, 6.45)
    assert (bat["sought_m"], bat["bids_m"], bat["accepted_m"], bat["n_bids"]) == (80000.0, 50000.0, 32800.0, 12)
    assert (bat["weighted_rate"], bat["marginal_rate"], bat["weighted_yield"]) == (5.7012, 5.95, 5.8925)
    assert (oat["weighted_price"], oat["marginal_price"], oat["weighted_yield"]) == (9450.4, 9205.0, 7.82)


def test_merge_pairs_results_with_listing_lines(issues):
    rows = um.merge(issues[SN], um.parse_issue(PAGE), SN)
    assert [(r["instrument"], r["months"]) for r in rows] == [("BAT", 12), ("OAT", 60)]
    oat = rows[1]
    assert oat["country"] == "senegal" and oat["maturity"] == "2031-10-12"
    assert (oat["bids_xof_m"], oat["accepted_xof_m"], oat["bid_cover"]) == (47200.0, 47200.0, 1.0)
    assert rows[0]["bid_cover"] == round(50000 / 32800, 2)
    assert oat["source"] == SN


def test_merge_drops_unpaired_results(issues):
    # listing has only the OAT line first: the BAT result cannot be paired with it, the OAT has no line left
    lines = [dict(issues[SN][1], line=1)]
    assert um.merge(lines, um.parse_issue(PAGE), SN) == []


def test_price_sanity_filter(issues):
    page = PAGE.replace("Prix marginal : 9 205,00", "Prix marginal : 92,05")
    oat = um.merge(issues[SN], um.parse_issue(page), SN)[1]
    assert oat["marginal_price"] is None  # per-100 misread, not per 10,000 XOF
    assert oat["weighted_price"] == 9450.4


def test_implausible_yield_drops_the_row(issues):
    page = PAGE.replace("Rendement moyen pondéré : 7,82 %", "Rendement moyen pondéré : 782 %")
    rows = um.merge(issues[SN], um.parse_issue(page), SN)
    assert [r["instrument"] for r in rows] == ["BAT"]


def test_french_numbers():
    assert um.fr_num("9 450,40") == 9450.4
    assert um.fr_num("1 234,5") == 1234.5
    assert um.fr_num("") is None
    assert um.fr_num("n/a") is None
