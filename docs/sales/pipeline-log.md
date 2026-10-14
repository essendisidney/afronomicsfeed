# Pipeline log (pending database write)

Notes for the `deals` table that could not be saved because writes from the agent's database connection timed out (reads work; no locks or triggers on `deals`). Copy each into `deals.notes` once writes work again, then mark it **applied**.

| Date | Deal id | Organisation | Note | Status |
| --- | --- | --- | --- | --- |
| 13 Oct 2026 | 42 | Cytonn Investments | Auto-ack only: helpdesk ticket CST-20261013-145001, marked resolved by their system; no human reply. Follow-up stays 22 Oct. | pending |
| 13 Oct 2026 | 9 | Absa CIB | Auto-ack only: case #11810551; no human reply yet. Follow-up stays 21 Oct. | pending |
| 14 Oct 2026 | 5 | Global Evolution (Conning) | No published sales address (only legal@ for privacy questions). Pilot offer saved as a Gmail draft for the founder to paste into https://globalevolution.com/contact/; stays prospect until sent. | pending |
| 14 Oct 2026 | 8 | Standard Bank CIB | No published research address (contact is a web form). Pilot offer saved as a Gmail draft for the founder to paste into the CIB contact form; stays prospect until sent. | pending |

Applied directly on 14 Oct 2026: deals 3 (William Blair, to soutarsingh@williamblair.com, listed as Sales and Client Service Manager on im.williamblair.com/contact-us) and 4 (Ashmore, to ashmail@ashmoregroup.com, the general inbox on its contact page) moved to contacted, pilot offer emailed (campaign pilot-wave3), follow-up 22 Oct.
