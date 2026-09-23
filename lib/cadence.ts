export type CadenceItem = {
  when: string;
  open: string;
  href: string;
  confirm: string;
};

/** Standing reasons to open the site. Cadence, not a live calendar. Confirm on the official page. */
export const cadence: CadenceItem[] = [
  {
    when: "T-bill week",
    open: "Once when the announcement posts, again when the result notice posts. A chat yield is not a print.",
    href: "https://www.centralbank.go.ke/bills-bonds/treasury-bills/",
    confirm: "CBK Treasury bills",
  },
  {
    when: "MPC statement day",
    open: "When the Bank publishes the statement. File the rate line, then the operational paragraphs.",
    href: "https://www.centralbank.go.ke/monetary-policy/",
    confirm: "CBK monetary policy",
  },
  {
    when: "Listed-bank results window",
    open: "When the NSE notice and the issuer pack are both up. The first headline is not the file.",
    href: "https://www.nse.co.ke/",
    confirm: "NSE announcements",
  },
  {
    when: "CMA or SASRA public notice",
    open: "When the regulator publishes. Keep the Authority’s verbs. Do not upgrade a process into an outcome.",
    href: "https://www.cma.or.ke/",
    confirm: "CMA",
  },
];

export const habit = {
  promise: "Eight minutes when a primary drops. Two minutes when the file is quiet.",
  whoPays:
    "Treasury, ALCO, research, and compliance desks that will be asked what the document said — today.",
  whoDoesNot:
    "Anyone looking for a tip, a price target, or a personalized portfolio view.",
};
