export type Correction = {
  date: string;
  pieceTitle: string;
  pieceHref: string;
  whatWasWrong: string;
  whatWasCorrected: string;
  editor: string;
};

/** Public log. Keep empty until a real correction ships; one sample shows the format. */
export const sampleCorrectionFormat: Correction = {
  date: "2026-09-01",
  pieceTitle: "SAMPLE FORMAT — not a live correction",
  pieceHref: "/brief/how-to-read-a-cbk-mpc-statement",
  whatWasWrong:
    "Example: a brief attributed a circular number to the wrong CBK directorate.",
  whatWasCorrected:
    "Example: the citation now points to the Bank Supervision URL and the circular date is restated with an as-of stamp.",
  editor: "Afronomics Desk",
};

export const corrections: Correction[] = [];
