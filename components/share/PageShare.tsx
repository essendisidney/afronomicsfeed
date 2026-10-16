"use client";

import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { ShareBar } from "./ShareBar";
import { ShareNumberButton } from "./ShareNumberButton";

/**
 * The share bar for a page that does not pass its own address (PageShell's default): the address is the page's own
 * path, known on the server render too, so the bar is in place from first paint and never shifts the layout.
 */
export function PageShare({ title, campaign = "page", className = "" }: { title: string; campaign?: string; className?: string }) {
  const path = usePathname() ?? "/";
  return (
    <ShareBar
      url={`${site.url}${path}`}
      title={title}
      campaign={campaign}
      label="Share this page"
      networks={["whatsapp", "linkedin", "x", "facebook", "email"]}
      className={className}
    />
  );
}

/** A chart's share icon: a link to the chart on this page (#id), tagged share-chart. */
export function ChartShare({ id, title }: { id: string; title: string }) {
  const path = usePathname() ?? "/";
  return <ShareNumberButton url={`${site.url}${path}#${id}`} text={title} label={title} campaign="chart" what="this chart" placement="inline" />;
}
