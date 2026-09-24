export type CookieRow = {
  slug: string;
  label: string;
  category: "essential" | "analytics" | "marketing";
  status: "used" | "not-used" | "planned";
  lede: string;
};

/** Cookie posture. Not-used stays honest — no invented consent banner. */
export const cookieRows: CookieRow[] = [
  {
    slug: "session",
    label: "Session / auth",
    category: "essential",
    status: "not-used",
    lede: "Auth is a stub. No signed-in session cookie is set.",
  },
  {
    slug: "theme",
    label: "Theme preference",
    category: "essential",
    status: "planned",
    lede: "May store light/dark locally when the theme control persists.",
  },
  {
    slug: "analytics",
    label: "Product analytics",
    category: "analytics",
    status: "not-used",
    lede: "Event names are typed only. No collector ships cookies yet.",
  },
  {
    slug: "marketing",
    label: "Marketing tags",
    category: "marketing",
    status: "not-used",
    lede: "No ad or retargeting pixels are installed.",
  },
];

export function cookieRowsByStatus(status: CookieRow["status"]) {
  return cookieRows.filter((item) => item.status === status);
}
