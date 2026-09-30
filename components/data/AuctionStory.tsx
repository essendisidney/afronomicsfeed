import Link from "next/link";

export function AuctionNav({ base, newer, older }: { base: string; newer: string | null; older: string | null }) {
  return (
    <nav className="mt-10 flex flex-wrap justify-between gap-4 border-t border-rule pt-4 font-medium text-[12.5px]">
      {older ? (
        <Link href={`${base}/${older}`} className="text-forest hover:text-gold">
          ← Auction of {older}
        </Link>
      ) : (
        <span />
      )}
      <Link href={base} className="text-forest hover:text-gold">
        All auctions
      </Link>
      {newer ? (
        <Link href={`${base}/${newer}`} className="text-forest hover:text-gold">
          Auction of {newer} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function StoryBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="max-w-2xl space-y-4 font-serif text-lg leading-8 text-ink">
      {paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  );
}
