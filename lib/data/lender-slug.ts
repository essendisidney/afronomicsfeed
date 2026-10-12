/** A lender's page address: its name, lower-case, hyphenated ("zillions-credit-limited"). */
export const lenderSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const LOAN_APPS = "/rates/kenya/loan-apps";
export const lenderHref = (name: string) => `${LOAN_APPS}/${lenderSlug(name)}`;

