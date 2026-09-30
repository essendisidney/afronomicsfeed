export type Correction = {
  date: string;
  pieceTitle: string;
  pieceHref: string;
  whatWasWrong: string;
  whatWasCorrected: string;
  editor: string;
};

/** Public log of corrections, newest first. */
export const corrections: Correction[] = [];
