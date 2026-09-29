export type SurveySlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited survey file. No reading is stored. */
export const surveySlots: SurveySlot[] = [
  {
    slug: "frame",
    label: "Frame",
    status: "empty",
    lede: "A frame needs a named publisher and a date. None is stored.",
    href: "/releases",
  },
  {
    slug: "reading",
    label: "Reading",
    status: "empty",
    lede: "A reading needs a cited instrument. None is attached.",
    href: "/observations",
  },
  {
    slug: "file",
    label: "File",
    status: "empty",
    lede: "A file needs a cited note. None is stored.",
    href: "/footnotes",
  },
];

export function storedSurveyCount() {
  return 0;
}
