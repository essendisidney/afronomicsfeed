# Source checks: Diaspora Desk (/diaspora, preview)

Page: `app/diaspora/page.tsx` (picker: `components/data/DiasporaSendPicker.tsx`). Checked 16 October 2026.

The drafting machine cannot reach the publishers, so every external page below was read through the Probe workflow
(`.github/workflows/probe.yml`) on 16 October 2026. Run ids are GitHub Actions run ids in `essendisidney/afronomicsfeed`
(job ids in brackets); each run was matched to its request by the URLs printed in its log.

## Probe runs used

| Run (job) | What it read |
| --- | --- |
| 38879449275 (116902365840) | CBK DhowCSD FAQ PDF (Dec 2025) and CBK "Requirements for Opening an Individual DhowCSD Account" PDF, full text |
| 38879452799 (116902378501) | CBK Treasury bills and Treasury bonds pages |
| 38879456347 (116902390268) | KRA withholding-tax FAQ page: 403, nothing read |
| 38879460065 (116902402826) | CMA home page (links), ardhisasa.lands.go.ke, lands.go.ke |
| 38879592868 (116902847492) | KRA "Withholding Income Tax" leaflet and KRA "Withholding Tax Overview" (2009), full text |
| 38879596901 (116902861963) | CBK/CMA/IRA/RBA/SASRA joint public notice of 25 Aug 2020, full text; licensees.cma.or.ke (links) |
| 38879690104 (116903186016) | CIC Asset Management Dollar Fund individual application form, full text |
| 38879779616 (116903457724) | lands.go.ke services page (404); cma.or.ke search for "whatsapp" and "unrealistic" (nothing found) |
| 38880018091 (116904224245) | lands.go.ke raw HTML for "ardhisasa" |

## Figures (computed from the repo's data at build time; no figure is typed into the page)

| Figure on the page | Where it comes from |
| --- | --- |
| Cheapest and average cost of sending $200 to Kenya, per sending country (6: South Africa, UK, US, Canada, Tanzania, Rwanda), survey January to March 2025 | `data/remittances/corridors.json` via `lib/data/remittances.ts` (`corridorsTo("kenya")`); World Bank Remittance Prices Worldwide, https://remittanceprices.worldbank.org/data-download. Germany, UAE and Saudi Arabia have no Kenya corridor in our file, so they are not offered. |
| 364-day bill: KES 100,000 earns KES 7,662 after tax (9.0383%, auction value-dated 19 Oct 2026) | `data/kenya/tbill_auctions.json` latest 364-day row, through `quoteBill()` in `lib/tbill-calc.ts` (the T-bill calculator's arithmetic); source PDF is the row's `source` URL (CBK results dated 19-10-2026) |
| Highest-yielding fund we track and the middle fund (on 16 Oct: Zimele Fixed Income Fund (Savings Plan) 13.41%, KES 11,399; Kasha MMF 10.35%, KES 8,798) | `rateOptions()` in `lib/data/kenya-rates.ts`, the same selection the savings goal planner uses; each manager's page as stored in `data/kenya/rates.json` |
| Bank savings average 3.54% (August 2026), KES 3,009 | `data/kenya/rates.json` `bank_rates`, CBK https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/ |
| KES per $1, £1, €1 and the $/£/€ equivalents | `loadFxQuote()` in `lib/data/fx.ts` (open.er-api.com, mid-market), with its own date. When the quote does not load (as on the drafting machine, which cannot reach it) the page says so and shows shillings only. |
| KES 50,000 minimum | `TBILL_MIN_FACE` in `lib/tbill-calc.ts`; matches CBK FAQ below |

## Claims

| Claim on the page | Source and text seen | Status |
| --- | --- | --- |
| Individuals and companies can buy bills and bonds without an intermediary through a CSD account on DhowCSD, CBK's web portal and app; or through a Kenyan commercial or investment bank | CBK Treasury bills page, run 38879452799: "Through the Dhow CSD portal and mobile application, Individuals and Corporate bodies can invest in Treasury bills without going through an intermediary by accessing https://dhowcsd.centralbank.go.ke/ and registering for CSD accounts. Investors inter alia individuals and corporates can equally invest via their respective Kenyan commercial banks and investment banks as custodials." Same text on the bonds page | Matches |
| Documents: ID or passport, photo, KRA PIN "mandatory for residents" | DhowCSD FAQ p3, run 38879449275: "Required documents: ID/ passport, KRA PIN (Mandatory for Residents), and a photo." Note: the 2023 requirements sheet says "KRA pin – which is mandatory" without the residents qualifier; the page quotes the newer FAQ | Matches (FAQ) |
| Valid email address and mobile number required | Requirements sheet, run 38879449275: "A valid email address is required…", "III. Valid mobile number" | Matches |
| A commercial bank account (settlement account) in the name on your ID; that bank approves the account within 48 working hours | FAQ p3: "Input your Bank Account Number, Your Name as per your identification document, and select your bank … Your account will be approved by your bank within 48 working hours." Sheet: "Settlement bank (commercial bank)" | Matches |
| Minimum investment KES 50,000 | FAQ p2: "8. What is the minimum investment for Government Securities? KES. 50,000" | Matches |
| Bills sold at a discount, repay face value; 91, 182, 364 days | CBK bills page: "Treasury bills are sold at a discount… investors choose the amount that they will receive when the bill matures, or the face value…"; "91-Day, 182-Day and 364-Day Treasury bills are auctioned each week" | Matches |
| Most bonds pay interest every six months; some infrastructure bonds are tax-exempt | CBK bonds page: "Most Treasury bonds carry semi-annual interest payments"; "The National Treasury also occasionally issues tax-exempt infrastructure bonds" | Matches |
| KRA lists 15% on bank interest and on two-year government bond interest for residents and non-residents | KRA "Withholding Income Tax" leaflet (undated), run 38879592868: "Interest (Bank) 15% 15%", "Interest on two year government bearer bonds 15% 15%" (Resident, Non Resident columns) | Matches; the leaflet is undated, so the page states only the rate it lists |
| CBK's US toll-free line for DhowCSD (number shown on the page) | FAQ footer lists a "Toll-free (USA)" number; the requirements sheet: "US Based Investors can contact us Toll-free on" the same number (not repeated here: no contact details in docs) | Matches |
| CMA keeps separate lists of licensed fund managers and approved collective investment schemes (licensees.cma.or.ke/licenses/8 and /15) | Run 38879596901: "FUND MANAGERS -> https://licensees.cma.or.ke/licenses/8/", "APPROVED COLLECTIVE INVESTMENT SCHEMES -> https://licensees.cma.or.ke/licenses/15/"; CMA home "List of Licensees -> https://licensees.cma.or.ke/" (run 38879460065) | Matches |
| CIC Asset Management's form asks for ID or passport, KRA PIN, passport photo and proof of bank details | CIC Dollar Fund individual application form (V.09/2020), run 38879690104: "REQUIREMENTS Copy of I.D or Passport / Copy of KRA PIN / Passport picture / Copy of USD bank details (cancelled cheque, ATM card copy or bank statement)" | Matches; given as one manager's example, not as a rule for all |
| Regulators: a business permit is not enough, a regulated firm also needs a licence from a financial-sector regulator | Joint notice 25 Aug 2020, run 38879596901: "in addition to a business permit, regulated financial institutions are required to have a valid license issued by a financial sector regulator" | Matches |
| Warning signs: promises of huge returns; being asked to recruit members to earn more, "a characteristic of a pyramid scheme" | Joint notice: "These entities promise customers huge returns…"; "The encouragement to recruit new members in order to receive more benefits is a characteristic of a fraudulent pyramid scheme." Signed CMA, CBK, IRA, Ministry of Agriculture, Livestock, Fisheries and Cooperatives, RBA, SASRA | Matches |
| Ardhisasa is the State Department for Lands' online platform, at ardhisasa.lands.go.ke | ardhisasa.lands.go.ke answers 200 with title "Ardhisasa" (run 38879460065); lands.go.ke features "ARDHISASA" with a banner `/sites/default/files/Ardhi/1-Ardhisasa banner.png` (run 38880018091) | Matches (existence only) |
| Afronomics registry covers SACCOs (SASRA) and banks (CBK); loan app checker for digital lenders | `lib/registry.ts` (`kindPlural`, `regulatorOf`), `/rates/kenya/loan-apps` | Our own pages |
| Referral-fee disclosure | Same wording as `content/briefs/sending-200-dollars-to-nigeria-what-it-costs.md` and `app/editorial-standards/page.tsx` | Kept |

## Cut (could not be confirmed from a primary source read here)

- "Guaranteed returns" as a regulator-named red flag: the 2020 notice says "huge returns"; the page uses that.
- Pressure to decide quickly, and payment to a personal M-PESA number, as red flags; and "CMA never asks for payments via
  WhatsApp or SMS": reported by news sites, but the CMA site search found nothing (run 38879779616) and no CMA notice was read.
- What an Ardhisasa search shows, its fee, owner consent, and county coverage: the portal is a JavaScript app (11 characters
  of text) and the Lands page linking it has no text; third-party guides only.
- Withholding tax being final for non-residents: the 2009 KRA overview's text on this is garbled in extraction.
- Fund managers' diaspora onboarding in general (foreign bank accounts, online onboarding, minimums): manager-specific, not
  read; the page gives one manager's form as an example.
- Whether non-residents need a KRA PIN for DhowCSD: the FAQ marks it "mandatory for residents" and the 2023 sheet says
  "mandatory"; the page quotes the FAQ and does not say non-residents are exempt.
