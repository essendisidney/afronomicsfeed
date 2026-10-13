import { site } from "@/lib/site";

export const revalidate = 86400;

/**
 * RFC 9116 security.txt: where to report a vulnerability. Institutional security reviews and scanners look for it.
 * Expires is set 180 days ahead each time the file is regenerated (daily), so it never goes stale while the site runs.
 */
export function GET() {
  const expires = new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
  const body = [
    `Contact: mailto:${site.contactEmail}`,
    `Expires: ${expires}`,
    "Preferred-Languages: en",
    `Canonical: ${site.url}/.well-known/security.txt`,
    `Policy: ${site.url}/trust#security`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
