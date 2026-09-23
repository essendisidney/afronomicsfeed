import Link from "next/link";
import { DemoMark } from "./DemoMark";

export function SectionHead({
  kicker,
  title,
  href,
  demo = true,
  methodology = false,
}: {
  kicker: string;
  title: string;
  href?: string;
  demo?: boolean;
  methodology?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-rule pb-2">
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">{kicker}</p>
        <h2 className="mt-1 font-serif text-xl text-ink sm:text-2xl">{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {demo ? <DemoMark kind={methodology ? "methodology" : "demo"} /> : null}
        {href ? (
          <Link href={href} className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-forest hover:text-gold">
            Open →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
