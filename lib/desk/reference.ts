/**
 * Static reference for the desk, kept by hand in step with the documents it names. The desk cannot read live routine
 * status (the scheduled Claude routines and GitHub Actions run outside the site), so these lists say what is meant
 * to run, not what did.
 */

export const REFERENCE_UPDATED = "2026-10-22";

export type DecisionStatus = "open" | "decided" | "standing";
export type FounderDecision = { id: string; ask: string; status: DecisionStatus; note: string; source: string };

/** Founder decisions F1–F11 (master-plan-v2 §7, partners-and-revenue §3.4) and the sales operator approvals A1–A4. */
export const FOUNDER_DECISIONS: FounderDecision[] = [
  { id: "F1", ask: "Licence line: is institutional internal use free?", status: "decided", note: "13 Oct (D-016): a key is needed for any commercial use, including internal use at a fund", source: "decision-log D-016" },
  { id: "F2", ask: "Paystack monthly plans (ANALYST, DATA_TEAM and _KE) and the env codes; ask Paystack for USD?", status: "open", note: "No plan codes set as of 13 Oct, so nothing renews (D-015)", source: "master-plan-v2 §7" },
  { id: "F3", ask: "Legal: standard data licence and pilot terms; Kenya CIS advertising check (LN 173/2023)", status: "open", note: "Blocks the first paid licence, invoices and any fund listing", source: "master-plan-v2 §7" },
  { id: "F4", ask: "Outreach: send or drop the Ninety One draft; name 4+ contacts to reach 25", status: "open", note: "The D-004 test needs 25 qualified contacts by about 26 Oct", source: "master-plan-v2 §7" },
  { id: "F5", ask: "Submit the sitemap in Google Search Console and Bing", status: "open", note: "15 minutes, from the founder's Google account", source: "master-plan-v2 §7" },
  { id: "F6", ask: "Point the money sprint at the build list and the D-004 numbers", status: "decided", note: "13 Oct (D-016)", source: "decision-log D-016" },
  { id: "F7", ask: "Partners: data-licence talks with Tellimer, Stears, Daba, Cbonds; the ADD link-up", status: "open", note: "The founder sends partner notes", source: "partners-and-revenue §3.4" },
  { id: "F8", ask: "Capital and hiring", status: "standing", note: "No raise or seller before the repeatability gate (10 payers)", source: "master-plan-v2 §7" },
  { id: "F9", ask: "Approve the sponsor-and-grant independence clause", status: "open", note: "Before any sponsor conversation", source: "partners-and-revenue §3.4" },
  { id: "F10", ask: "Approve “Afronomics–Strathmore” as the index co-brand, or name another university", status: "open", note: "For the index pitch", source: "partners-and-revenue §3.4" },
  { id: "F11", ask: "Publish subscriber and open-rate figures on /advertise", status: "open", note: "Needed for sponsorship sales", source: "partners-and-revenue §3.4" },
  { id: "A1", ask: "Approve the sequences.md texts (the sales operator may send them)", status: "decided", note: "13 Oct (D-017); sends paused while outgoing email is on hold (D-030, D-033)", source: "decision-log D-017" },
  { id: "A2", ask: "Approve the playbook §6.1 guardrails", status: "open", note: "Until then only the 30-day pilot and rate-card prices; the rest escalates", source: "sales-operator §0" },
  { id: "A3", ask: "Approve the pilot extension rule (one 15 days for keys used on 5+ days)", status: "decided", note: "13 Oct (D-017)", source: "decision-log D-017" },
  { id: "A4", ask: "Let the operator mark checkout purchases “won”", status: "decided", note: "13 Oct (D-017): set automatically on a real payment", source: "decision-log D-017" },
];

export type Routine = { name: string; when: string; does: string; where: string };

/** Times are Nairobi (UTC+3). */
export const ROUTINES: Routine[] = [
  { name: "Sale watch", when: "Every 2 h, 07:07–21:07", does: "Real payments; FIRST SALE alert", where: "Claude routine" },
  { name: "Desk operator and support", when: "Weekdays 08:41, 13:41, 17:41", does: "Inbox, leads, pilots, deals, drafts; report to you", where: "Claude routine · docs/desk-operator.md" },
  { name: "Sales operator", when: "Weekdays 09:23; pipeline report Fri 15:47", does: "Moves each live deal one step; escalates (ESC) to you", where: "Claude routine · docs/sales/sales-operator.md" },
  { name: "Outreach follow-ups", when: "Cancelled (D-030)", does: "Not sent; no follow-up goes to contacts who have not replied", where: "None" },
  { name: "Story engine", when: "Mon, Wed, Fri 07:47", does: "One checked brief and a company post", where: "Claude routine · docs/story-engine.md" },
  { name: "LinkedIn company posts", when: "Daily, Mon–Fri slots", does: "Posts; Thursday T-bill result", where: "Claude routine · editions/social" },
  { name: "Site health check and repair", when: "Daily 07:47", does: "Writes data/health.json", where: "Claude routine" },
  { name: "Weekly growth report", when: "Mon 08:07", does: "Money-first weekly numbers", where: "Claude routine" },
  { name: "Money sprint", when: "Wed 10:13", does: "One shipped move from the build list", where: "Claude routine" },
  { name: "African auctions (data readers)", when: "Weekdays every 2 h 07:17–21:17; weekends 4×", does: "Bill and bond results for every market", where: "GitHub Actions" },
  { name: "Kenya quick check", when: "Thu every 20 min 15:00–19:40", does: "Kenya T-bill result on auction day", where: "GitHub Actions" },
  { name: "Morning note", when: "Weekdays 07:00", does: "The morning email", where: "GitHub Actions" },
  { name: "Weekly edition and index release", when: "Mon 07:00 and 07:30", does: "Weekly snapshot; ASBI index release", where: "GitHub Actions" },
  { name: "Remittance prices", when: "1st and 15th, 09:23", does: "Send-money prices", where: "GitHub Actions" },
  { name: "Institutions registry", when: "3rd of the month, 08:41", does: "SASRA and CBK lists and annual figures for SACCOs, microfinance banks and banks", where: "GitHub Actions" },
  { name: "Archive (FX and wire)", when: "Daily 07:15", does: "FX and headline archive", where: "Vercel cron" },
];
