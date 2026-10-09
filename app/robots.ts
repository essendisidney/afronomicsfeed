import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// AI assistants and answer engines are welcome: being quoted with a link is how many readers find a source now.
// They may read the open data API (/api/v1, /api/data) but not the private endpoints or the desk.
const AI_AGENTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot"];
const allow = ["/", "/api/v1/", "/api/data/", "/llms.txt"];
const disallow = ["/api/", "/desk"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow, disallow },
      { userAgent: AI_AGENTS, allow, disallow },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
