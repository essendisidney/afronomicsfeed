const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Nairobi",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Nairobi",
  timeZoneName: "short",
});

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(`${iso}T00:00:00+03:00`));
}

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}

export function categoryLabel(category: "brief" | "weekly" | "explainer") {
  if (category === "brief") return "Daily Brief";
  if (category === "weekly") return "Weekly Intelligence";
  return "Explainer";
}

export function categoryPath(category: "brief" | "weekly" | "explainer") {
  if (category === "brief") return "/brief";
  if (category === "weekly") return "/weekly";
  return "/explainers";
}

export function articleHref(category: "brief" | "weekly" | "explainer", slug: string) {
  return `${categoryPath(category)}/${slug}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractHeadings(markdown: string) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const title = line.replace(/^##\s+/, "").trim();
      return { title, id: slugify(title) };
    });
}

export function citationText(input: {
  authors: string[];
  title: string;
  date: string;
  url: string;
}) {
  return `${input.authors.join(", ")}. “${input.title}.” Afronomics Feed, ${formatDate(input.date)}. ${input.url}`;
}
