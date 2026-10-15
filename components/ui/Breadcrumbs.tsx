import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/lib/site";

type Crumb = { href?: string; label: string };

/**
 * The trail as search engines read it (schema.org BreadcrumbList), so results show "Afronomics › Markets › Bond
 * auctions" instead of a bare URL. The last crumb is the page itself and carries no link, which schema.org allows.
 */
function breadcrumbJsonLd(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${site.url}${item.href === "/" ? "" : item.href}` } : {}),
    })),
  };
}

/**
 * The home page is "Today" in the navigation, so the first crumb says so on every page (older pages passed "Home").
 * A long last crumb (the page's own title, already the h1 below) is left out on phones, where it wrapped onto a line
 * of its own behind a stray "/".
 */
export function Breadcrumbs({ items: given }: { items: Crumb[] }) {
  const items = given.map((item) => (item.href === "/" ? { ...item, label: "Today" } : item));
  return (
    <nav aria-label="Breadcrumb" className="font-medium text-[12.5px] text-muted">
      {items.length > 1 ? <JsonLd data={breadcrumbJsonLd(items)} /> : null}
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className={`items-center gap-2 ${index > 0 && index === items.length - 1 && !item.href && item.label.length > 28 ? "hidden sm:flex" : "flex"}`}
          >
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-forest">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink-soft">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
