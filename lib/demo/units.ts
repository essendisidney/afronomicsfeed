export type ObservationUnit = {
  slug: string;
  label: string;
  status: "vocabulary" | "empty";
  lede: string;
};

/** Unit words the desk already uses. No series is stored here. */
export const observationUnits: ObservationUnit[] = [
  {
    slug: "local-currency",
    label: "Local currency",
    status: "vocabulary",
    lede: "A print, when one exists, stays in the issuing currency. This page stores no rate.",
  },
  {
    slug: "percent",
    label: "Percent",
    status: "vocabulary",
    lede: "Rates and shares. A blank cell is not zero.",
  },
  {
    slug: "index",
    label: "Index",
    status: "vocabulary",
    lede: "Index points need a cited base. None is stored here.",
  },
  {
    slug: "physical",
    label: "Physical unit",
    status: "empty",
    lede: "Tonnes, barrels and megawatts stay unnamed until a primary series names them.",
  },
];

export function vocabularyUnitCount() {
  return observationUnits.filter((item) => item.status === "vocabulary").length;
}
