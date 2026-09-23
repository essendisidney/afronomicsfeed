import Image from "next/image";
import Link from "next/link";

export function Wordmark({ compact = false }: { compact?: boolean }) {
  const size = compact ? "af-logo af-logo-compact" : "af-logo";

  return (
    <Link href="/" className="inline-flex min-w-0 shrink-0 items-center no-underline" aria-label="Afronomics Feed">
      <Image
        src="/brand/logo-light.png"
        alt=""
        width={856}
        height={529}
        className={`${size} af-logo-light`}
        priority
        suppressHydrationWarning
      />
      <Image
        src="/brand/logo-dark.png"
        alt=""
        width={857}
        height={530}
        className={`${size} af-logo-dark`}
        priority
        suppressHydrationWarning
      />
    </Link>
  );
}
