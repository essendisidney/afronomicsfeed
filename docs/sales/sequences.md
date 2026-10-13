# Email sequences and reply templates

Written 13 Oct 2026. For the founder and the sales operator (`sales-operator.md`). Prices and terms come from
`lib/billing/ratecard.ts`; when the rate card changes, these texts change with it. **Status: DRAFT until the founder
approves them** (a decision-log entry naming this file). Until then every message below is a Gmail draft, not a send.

## House rules for every message

- Human, short, plain text. One idea, one ask, at most two links. No images, tracking pixels, attachments on a first
  message, exclamation marks, "revolutionary", "game-changing", "only", "best", or urgency that isn't real.
- Every figure must be on the live site that day. Check the page before sending. Never mention a market, field,
  speed or feature the site does not show (no webhooks, Excel add-in, Python client, SFTP, SLA).
- From the founder's address, signed by the founder (`{{sender_name}}`). Reply-to the same address.
- Send only to people who **asked** (pilot form, enquiry, checkout) or **replied** to us. Never to a new cold contact.
- Every message ends with the opt-out line. "Stop", "unsubscribe" or "not interested" ends the sequence for that
  person at once; log it and close the deal `lost` with the reason.
- English by default; French when the person wrote in French, filled the form from a French page, or is at a
  francophone institution (WAEMU, Morocco) and has not written in English.
- Where money decisions are discussed: "Information, not advice." / « Information, pas un conseil. »
- Links carry `?utm_source=email&utm_campaign=<id>` (recorded in `page_views` as `utm:email/<id>`).

## Merge fields

| Field | Source |
|---|---|
| `{{first_name}}` | `leads.name` (first word) or the reply's signature |
| `{{organisation}}` | `leads.organisation` / `deals.organisation` |
| `{{markets}}` | Markets from the pilot form (`leads.message`) |
| `{{market_example}}` | First of `{{markets}}` that has bond data, as the API slug (`egypt`, `nigeria`, `kenya`, `uganda`, `zambia`, `morocco`, `waemu`) |
| `{{pilot_end_date}}` | `data_keys.expires_at`, written "12 November 2026" |
| `{{key_prefix}}` | `data_keys.prefix` (first 10 characters only; never the full key) |
| `{{days_used}}` | `count(distinct day)` in `data_key_usage` for the key |
| `{{calls_total}}` | `sum(calls)` in `data_key_usage` for the key |
| `{{markets_called}}` | Markets from `data_key_usage.path` (FunnelPanel `marketsOf`) |
| `{{last_call_day}}` | `max(day)` in `data_key_usage` |
| `{{plan_name}}`, `{{plan_price}}`, `{{plan_charge}}` | From the rate card: e.g. "Team and API", "USD 1,500 a month", "KES 193,500 at checkout" |
| `{{plan_link}}` | The plan's checkout page (`/pricing#institutions`, `/licensing#local`, `/pack`) |
| `{{period_end}}` | Paid period end (payment date + 1 month, or the key's `expires_at` minus 3 days) |
| `{{sender_name}}` | The founder's name |

Opt-out line, English: *If you'd rather I didn't follow up, just reply "stop".*
Opt-out line, French: *Si vous préférez que je ne relance pas, répondez simplement « stop ».*

---

## 1. Pilot welcome (day 0)

**Trigger:** a trial key issued (`data_keys.plan = 'trial'`, `created_at` today) from the pilot form. The system has
already emailed the key itself (`app/api/pilot/route.ts`); this is the human note, sent separately, **without the key**.
For a webmail request still waiting for a key, send reply template R12 instead.

**Subject:** Your pilot: where to start with {{markets}}

> Hello {{first_name}},
>
> Thank you for starting a pilot. Your key ({{key_prefix}}…) is in a separate email and works until
> {{pilot_end_date}}.
>
> The quickest first look at {{market_example}}: the full auction history in one call,
> `https://www.afronomicsfeed.com/api/v1/bonds/{{market_example}}?limit=5000` with your key as a Bearer header. Every row has the issuer's
> notice as `source`. You'll also get an email whenever a new bond result lands.
>
> What will you use it for first? If you tell me the model or paper it feeds, I'll point you to the right fields.
>
> {{sender_name}}, Afronomics
>
> *If you'd rather I didn't follow up, just reply "stop".*

**FR — Objet :** Votre essai : par où commencer avec {{markets}}

> Bonjour {{first_name}},
>
> Merci d'avoir lancé un essai. Votre clé ({{key_prefix}}…) vous a été envoyée dans un e-mail séparé et reste
> valable jusqu'au {{pilot_end_date}}.
>
> Le plus rapide pour {{market_example}} : tout l'historique des adjudications en un appel,
> `https://www.afronomicsfeed.com/api/v1/bonds/{{market_example}}?limit=5000`, avec votre clé en en-tête Bearer. Chaque ligne renvoie à
> l'avis de l'émetteur (`source`). Vous recevrez aussi un e-mail à chaque nouveau résultat obligataire.
>
> À quoi allez-vous l'utiliser en premier ? Dites-moi quel modèle ou quelle note cela alimente, et je vous indique
> les bons champs.
>
> {{sender_name}}, Afronomics
>
> *Si vous préférez que je ne relance pas, répondez simplement « stop ».*

## 2. Day 3 check-in, with a usage tip

**Trigger:** key age 3 days. Two versions by `{{calls_total}}`.

**2a. No calls yet. Subject:** One line to try

> Hello {{first_name}},
>
> In case the key got buried: this one line returns every {{market_example}} auction we hold as CSV, ready for
> Excel:
>
> `curl -H "Authorization: Bearer YOUR_KEY" "https://www.afronomicsfeed.com/api/data/bonds/{{market_example}}"`
>
> If the key didn't arrive, reply and I'll send a new one.
>
> {{sender_name}}
>
> *If you'd rather I didn't follow up, just reply "stop".*

**2b. Some calls. Subject:** A tip for {{markets_called}}

> Hello {{first_name}},
>
> I can see the key is working ({{calls_total}} calls so far). One thing people miss: `from` and `to` take dates
> (YYYY-MM-DD), so you can pull a single month across markets and compare bid-to-cover side by side. The newest result in every market
> is also on one page: https://www.afronomicsfeed.com/data/frontier-local-debt/monitor?utm_source=email&utm_campaign=pilot_d3
>
> Anything missing for your work?
>
> {{sender_name}}
>
> *If you'd rather I didn't follow up, just reply "stop".*

**FR 2a — Objet :** Une ligne à essayer

> Bonjour {{first_name}},
>
> Au cas où la clé se serait perdue : cette ligne renvoie toutes les adjudications {{market_example}} que nous
> détenons, en CSV, prêtes pour Excel :
>
> `curl -H "Authorization: Bearer VOTRE_CLE" "https://www.afronomicsfeed.com/api/data/bonds/{{market_example}}"`
>
> Si la clé n'est pas arrivée, répondez et je vous en envoie une nouvelle.
>
> {{sender_name}}
>
> *Si vous préférez que je ne relance pas, répondez simplement « stop ».*

**FR 2b — Objet :** Une astuce pour {{markets_called}}

> Bonjour {{first_name}},
>
> Je vois que la clé fonctionne ({{calls_total}} appels jusqu'ici). Un point souvent manqué : `from` et `to`
> acceptent des dates, pour extraire un mois sur plusieurs marchés et comparer les taux de couverture. Le dernier
> résultat de chaque marché est aussi sur une seule page :
> https://www.afronomicsfeed.com/data/frontier-local-debt/monitor?utm_source=email&utm_campaign=pilot_d3
>
> Manque-t-il quelque chose pour votre travail ?
>
> {{sender_name}}
>
> *Si vous préférez que je ne relance pas, répondez simplement « stop ».*

*The CSV route is `/api/data/bonds/<market>` (`app/api/data/bonds/[market]/route.ts`): with a key, full history; it
takes `from`, `to` and `limit`. JSON is `/api/v1/bonds/<market>` (default 500 rows with a key, up to 5,000 with
`limit`). Bills: `/api/data/tbills/<country>` and `/api/v1/tbills/<country>`.*

## 3. Day 7: what to try

**Trigger:** key age 7 days. If `{{calls_total}} = 0` and 2a got no reply, send only this short version: "Is the pilot
still useful to you? If now isn't the time, say so and I'll stop." (FR: « L'essai vous est-il toujours utile ? Si ce
n'est pas le moment, dites-le-moi et j'arrête. »)

**Subject:** Three things to try this week

> Hello {{first_name}},
>
> A week into the pilot. Three things worth ten minutes each:
>
> 1. **History:** the full record for {{market_example}} (no 12-month limit with your key), to check our numbers
>    against your own.
> 2. **Source check:** pick any row and open its `source` link; it goes to the issuer's notice.
> 3. **Speed:** how long after publication we had each result, by market:
>    https://www.afronomicsfeed.com/status?utm_source=email&utm_campaign=pilot_d7#latency
>
> If a market you need is missing, tell me which: the pilot answers decide what we build next.
>
> {{sender_name}}
>
> *If you'd rather I didn't follow up, just reply "stop".*

**FR — Objet :** Trois choses à essayer cette semaine

> Bonjour {{first_name}},
>
> Une semaine d'essai. Trois choses qui valent dix minutes chacune :
>
> 1. **L'historique :** tout l'historique de {{market_example}} (sans la limite de 12 mois avec votre clé), pour
>    comparer nos chiffres aux vôtres.
> 2. **La source :** choisissez une ligne et ouvrez son lien `source` ; il mène à l'avis de l'émetteur.
> 3. **La rapidité :** le délai entre la publication et notre enregistrement, par marché :
>    https://www.afronomicsfeed.com/status?utm_source=email&utm_campaign=pilot_d7#latency
>
> S'il vous manque un marché, dites-moi lequel : les retours des essais décident de ce que nous construisons ensuite.
>
> {{sender_name}}
>
> *Si vous préférez que je ne relance pas, répondez simplement « stop ».*

## 4. Day 20: "your pilot ends in 10 days, here's your usage"

**Trigger:** key age 20 days (10 days before `expires_at`). Send to every pilot, used or not; for 0 calls use the last
paragraph only.

**Subject:** Your pilot ends on {{pilot_end_date}}: your usage so far

> Hello {{first_name}},
>
> Your pilot key ends on {{pilot_end_date}}. So far: {{calls_total}} calls on {{days_used}} days, mostly
> {{markets_called}}; last used {{last_call_day}}.
>
> If you'd like to keep it running, the plans are:
> - **Analyst**, USD 250 a month per user: web tables and full-history downloads, no API.
> - **Team and API**, USD 1,500 a month: this key's access for your systems, alerts, usage reporting and a named
>   contact.
>
> Card or M-Pesa at https://www.afronomicsfeed.com/pricing?utm_source=email&utm_campaign=pilot_d20#institutions
> (charged in shillings at KES 129 to the dollar), or I can arrange an invoice. Which would suit {{organisation}}?
>
> If it hasn't been useful, I'd value one line on why.
>
> {{sender_name}}
>
> *If you'd rather I didn't follow up, just reply "stop".*

**Kenyan eligible institution variant** (eligibility confirmed in writing, `playbook.md` §6.1.5): replace the plan
lines with "Analyst KES 16,000 a month; Team and API KES 95,000 a month, the Kenyan-institution prices" and the link
with `/licensing#local`.

**FR — Objet :** Votre essai se termine le {{pilot_end_date}} : votre utilisation

> Bonjour {{first_name}},
>
> Votre clé d'essai expire le {{pilot_end_date}}. Jusqu'ici : {{calls_total}} appels sur {{days_used}} jours,
> surtout {{markets_called}} ; dernière utilisation le {{last_call_day}}.
>
> Pour continuer, deux formules :
> - **Analyst**, 250 USD par mois et par utilisateur : tableaux web et téléchargements de tout l'historique, sans API.
> - **Team and API**, 1 500 USD par mois : l'accès de cette clé pour vos systèmes, les alertes, le suivi
>   d'utilisation et un contact dédié.
>
> Paiement par carte sur https://www.afronomicsfeed.com/pricing?utm_source=email&utm_campaign=pilot_d20#institutions
> (débité en shillings kényans à 129 KES pour un dollar), ou sur facture. Qu'est-ce qui conviendrait à
> {{organisation}} ?
>
> Si l'essai ne vous a pas servi, une ligne pour me dire pourquoi me serait précieuse.
>
> {{sender_name}}
>
> *Si vous préférez que je ne relance pas, répondez simplement « stop ».*

## 5. Day 30: close

**Trigger:** `expires_at` today, no payment from this email or domain. Two versions.

**5a. Used on 5 or more days (extension-eligible — only once the founder has approved the extension rule).**
**Subject:** Your pilot ended today

> Hello {{first_name}},
>
> Your pilot key stopped working today. You used it on {{days_used}} days, so if your team needs a little longer to
> decide, I can give you 15 more days, once. Just reply "extend".
>
> To continue properly: Team and API is USD 1,500 a month, Analyst USD 250 a user
> (https://www.afronomicsfeed.com/pricing?utm_source=email&utm_campaign=pilot_d30#institutions), or reply for an
> invoice.
>
> {{sender_name}}
>
> *If you'd rather I didn't follow up, just reply "stop".*

**5b. Used on fewer than 5 days. Subject:** Your pilot ended today

> Hello {{first_name}},
>
> Your pilot key stopped working today. If you'd like to continue, Analyst is USD 250 a month per user and Team and API
> USD 1,500 a month (https://www.afronomicsfeed.com/pricing?utm_source=email&utm_campaign=pilot_d30#institutions), or
> reply for an invoice.
>
> If the timing was wrong, tell me when would suit and I'll write then. If something was missing, I'd like to know
> what.
>
> {{sender_name}}
>
> *If you'd rather I didn't follow up, just reply "stop".*

**FR 5a — Objet :** Votre essai s'est terminé aujourd'hui

> Bonjour {{first_name}},
>
> Votre clé d'essai a expiré aujourd'hui. Vous l'avez utilisée {{days_used}} jours ; si votre équipe a besoin d'un
> peu plus de temps pour décider, je peux vous accorder 15 jours de plus, une seule fois. Répondez simplement
> « prolonger ».
>
> Pour continuer : Team and API à 1 500 USD par mois, Analyst à 250 USD par utilisateur
> (https://www.afronomicsfeed.com/pricing?utm_source=email&utm_campaign=pilot_d30#institutions), ou sur facture.
>
> {{sender_name}}
>
> *Si vous préférez que je ne relance pas, répondez simplement « stop ».*

**FR 5b — Objet :** Votre essai s'est terminé aujourd'hui

> Bonjour {{first_name}},
>
> Votre clé d'essai a expiré aujourd'hui. Pour continuer : Analyst à 250 USD par mois et par utilisateur, Team and
> API à 1 500 USD par mois
> (https://www.afronomicsfeed.com/pricing?utm_source=email&utm_campaign=pilot_d30#institutions), ou sur facture.
>
> Si le moment n'était pas le bon, dites-moi quand vous recontacter. S'il manquait quelque chose, j'aimerais savoir
> quoi.
>
> {{sender_name}}
>
> *Si vous préférez que je ne relance pas, répondez simplement « stop ».*

After 5a or 5b: one more message only if they reply. Otherwise the next contact is the win-back (§8) 30 days later.

## 6. Post-purchase onboarding

**Trigger:** `payments.status = 'success'` and access delivered (`access_sent_at` set, or the Team key outcome
`issued`). Same day. Never repeat the key.

**6a. Team and API. Subject:** Welcome: your Team and API month

> Hello {{first_name}},
>
> Thank you — your Team and API access is live. The key ({{key_prefix}}…) was shown once on the confirmation page and
> sent with your receipt; it works until {{period_end}} plus three days, and a renewal payment extends the same key.
>
> I'm your named contact. Two things would help me help you: which markets and fields matter most, and who else on
> the team should get the bond-result emails?
>
> Nothing renews automatically; I'll write ten days before {{period_end}}.
>
> {{sender_name}}

**6b. Analyst.** As 6a, with: "Your Analyst seat is confirmed for this address. The full-history downloads for every
covered market come to you within one working day; tell me the markets you want first."

**6c. Investment Committee Pack.** "Thank you. Please reply with the institution's name for the cover and up to five
addresses to receive it; the first pack arrives within two working days."

**FR 6a — Objet :** Bienvenue : votre mois Team and API

> Bonjour {{first_name}},
>
> Merci — votre accès Team and API est actif. La clé ({{key_prefix}}…) a été affichée une fois sur la page de
> confirmation et envoyée avec votre reçu ; elle fonctionne jusqu'au {{period_end}} plus trois jours, et un paiement de
> renouvellement prolonge la même clé.
>
> Je suis votre contact dédié. Deux choses m'aideraient : quels marchés et champs comptent le plus, et qui d'autre dans
> l'équipe doit recevoir les e-mails de résultats obligataires ?
>
> Rien ne se renouvelle automatiquement ; je vous écrirai dix jours avant le {{period_end}}.
>
> {{sender_name}}

## 7. Renewal, 10 days before

**Trigger:** `{{period_end}}` in 10 days for a one-off payment (no `paid_subscriptions` row). Include usage for keyed plans.

**Subject:** Your {{plan_name}} renews on {{period_end}}

> Hello {{first_name}},
>
> Your {{plan_name}} runs to {{period_end}}. This month: {{calls_total}} calls on {{days_used}} days, mostly
> {{markets_called}}.
>
> To continue for another month: {{plan_price}} ({{plan_charge}}) at {{plan_link}}, or reply and I'll send an invoice.
> For Team and API, paying from the same email extends your current key, so nothing changes in your systems.
>
> Anything you'd like changed before then?
>
> {{sender_name}}

**FR — Objet :** Votre {{plan_name}} arrive à échéance le {{period_end}}

> Bonjour {{first_name}},
>
> Votre {{plan_name}} court jusqu'au {{period_end}}. Ce mois-ci : {{calls_total}} appels sur {{days_used}} jours,
> surtout {{markets_called}}.
>
> Pour un mois de plus : {{plan_price}} ({{plan_charge}}) sur {{plan_link}}, ou répondez et je vous envoie une
> facture. Pour Team and API, un paiement depuis la même adresse prolonge votre clé actuelle : rien à changer dans vos
> systèmes.
>
> Souhaitez-vous changer quelque chose d'ici là ?
>
> {{sender_name}}

## 8. Win-back (one message, then stop)

**Trigger:** 30 days after a pilot ended with no payment, or 30 days after a paid period ended without renewal. Send
only if there is something new and true to say (a market added, latency published, a field added). If nothing is new,
don't send.

**Subject:** {{news}} — and your pilot

> Hello {{first_name}},
>
> When you tried Afronomics you used {{markets_called}}. Since then: {{news}} (for example, "Ghana bonds are now
> covered from 2019" — only what the site shows today).
>
> If that changes anything, reply and I'll reopen your access for a look. If not, I won't write again about it.
>
> {{sender_name}}

**FR — Objet :** {{news}} — et votre essai

> Bonjour {{first_name}},
>
> Lors de votre essai, vous avez utilisé {{markets_called}}. Depuis : {{news}}.
>
> Si cela change quelque chose, répondez et je rouvre votre accès pour un coup d'œil. Sinon, je ne vous relancerai pas.
>
> {{sender_name}}

*"Reopen access" = a new trial key only within the system limit (3 per domain in 90 days) and only once the founder has
approved re-trials; otherwise a founder decision.*

## 9. Partner introduction

**Trigger:** the founder has approved this partner by name (F7 and `docs/strategy/partners-and-revenue.md` §2.9) and
the address has been checked on the partner's own site. **The founder sends it.** The operator only drafts.

**Subject:** {{partner_org}} and African auction data

> Dear {{first_name}},
>
> I run Afronomics, which reads every government bill and bond auction result from African central banks and
> treasuries and publishes them in one format within hours, with the issuer's notice linked on every row: bonds for
> Nigeria, Egypt, Kenya, Uganda, Zambia, Morocco and seven WAEMU issuers, and bills in ten markets.
>
> {{why_them}} (one sentence, specific: e.g. "Your Markets Talk audience asks about WAEMU yields, which nobody
> publishes auction by auction in English.")
>
> Would {{proposal}} be worth a 20-minute call? (one concrete offer from the partners doc: a 30-day pilot key and a
> side-by-side for three markets; a citation swap; a co-branded weekly.)
>
> {{sender_name}}, Afronomics · https://www.afronomicsfeed.com/data/frontier-local-debt

**FR — Objet :** {{partner_org}} et les données d'adjudication africaines

> Madame, Monsieur {{last_name}},
>
> Je dirige Afronomics, qui relève chaque résultat d'adjudication de bons et d'obligations d'État publié par les
> banques centrales et trésors africains, et le publie dans un format unique en quelques heures, avec l'avis de
> l'émetteur lié à chaque ligne : obligations du Nigeria, d'Égypte, du Kenya, d'Ouganda, de Zambie, du Maroc et de sept
> émetteurs de l'UEMOA, et bons du Trésor sur dix marchés.
>
> {{why_them}}
>
> {{proposal}} mériterait-il un échange de 20 minutes ?
>
> {{sender_name}}, Afronomics · https://www.afronomicsfeed.com/data/frontier-local-debt

---

## Reply templates for common questions

Short. Answer, one fact, one question or next step. French versions follow the same wording; translate at send time
with the house rules above, and keep prices exactly as written.

**R1. "How much is it?"**
> Analyst is USD 250 a month per user (web tables and full-history downloads); Team and API is USD 1,500 a month (API
> key, alerts, usage reporting, a named contact); Enterprise, for redistribution or several teams, starts at USD
> 5,000 a month. Checkout charges the shilling equivalent at KES 129 to the dollar, by card or M-Pesa, or we invoice.
> The pilot is 30 days, free. Which markets matter to you?

**R2. "Can we pay by invoice / we need a PO."**
> Yes. Please send the billing entity's legal name and address, tax ID, the PO number if you have one, and where to
> send the invoice. The founder issues it within one working day.
*(Escalate: founder issues every invoice.)*

**R3. "Can we use the free API at our fund?"**
> For research, journalism or teaching, yes. Internal use at a fund, bank or firm counts as commercial use and needs
> a pilot key or a licence; the terms are at https://www.afronomicsfeed.com/developers#terms. The pilot is free for 30
> days if you'd like to try it with full history.

**R4. "Do you cover <market>?"** (check `/data/frontier-local-debt` first)
> Yes: <market> bonds from <first date>, <n> results, each linked to the <issuer> notice. — or —
> Not yet. I've noted it with your name; what you'd use it for helps decide what we build next. I can't promise a
> date. Meanwhile we cover <closest covered markets>.

**R5. "How accurate is it / where does it come from?"**
> Each row is read from the issuer's own published notice and links to it, so any figure can be checked in one click.
> Where a field isn't published or can't be read reliably we leave it empty. Late or missing markets show on
> https://www.afronomicsfeed.com/status. If you see an error, send me the row and we correct it.

**R6. "Do you have SOC 2 / a DPA / can you fill in our security questionnaire?"**
> We don't have SOC 2. I've passed your questionnaire to the founder, who will reply by <date + 2 working days>.
*(Escalate.)*

**R7. "Do we qualify for the local price?"**
> The local-institution price is for firms incorporated, headquartered, licensed and ultimately owned in <country>,
> with all users there, using it for the domestic book with no redistribution, and invoiced to and paid from the local
> entity. If that's {{organisation}}, please confirm those four points in a reply and I'll send the <country> prices.
*(Kenya: send `/licensing#local` after confirmation. Anything unclear or another country: escalate.)*

**R8. "Can we share the data with our clients?"**
> Passing the data, or files and feeds built from it, to clients or other third parties is covered only by an
> Enterprise licence, priced by scope from USD 5,000 a month. I'll put you in touch with the founder; what would your
> clients receive, and how many?
*(Escalate.)*

**R9. "I lost my key / it leaked."**
> Thanks for telling me. I'll revoke it and send a new one to this address today.
*(Trial key: escalate the revoke; issue a new one only within the system limits. Paid key: escalate.)*

**R10. "Can we have longer to test?"**
> (≥5 days used, extension rule approved:) Yes, once: 15 more days. I'll send a new key when the current one ends on
> {{pilot_end_date}}. — (otherwise:) I've asked the founder; you'll hear by <date>.

**R11. "Not now."**
> Understood. When would be a better time to ask again? I'll write then and not before.
*(Set `next_date`; stage stays; no other message until then.)*

**R12. Pilot request from a personal email address.**
> Thank you. Pilot keys go to work addresses; could you send the request from your {{organisation}} address, or tell
> me your role there? Meanwhile the open API needs no key for the latest 12 months:
> https://www.afronomicsfeed.com/developers

**R13. "There's a mistake in your data."**
> Thank you — could you send the market, date and field? We check it against the issuer's notice today and correct
> it, and I'll tell you when it's fixed.
*(Log as a correction on the desk; escalate.)*

**R14. "Can you send a sample?"**
> Here are the last 12 months for <markets> as CSV (free, with credit "Source: Afronomics"). For full history, the
> 30-day pilot gives you a key: https://www.afronomicsfeed.com/data/frontier-local-debt#pilot
*(Generate the CSV from `/api/data/bonds/<market>` without a key, so it is exactly the free 12 months; attach only on reply, never cold.)*

**R15. "Who else uses you?"**
> We're early: we started offering pilots in October 2026 and have no paying institutions to name yet. That's why the
> pilot is free and monthly plans can stop at any time.
*(Never invent or imply customers. Update this answer only from `payments` and with the customer's permission.)*
