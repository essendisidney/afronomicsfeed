import type { ShareNetwork } from "@/lib/share-links";

/** Monochrome network marks drawn inline (currentColor), so no icon library, font or image request is needed. */
export type ShareIconName = ShareNetwork | "link" | "check" | "share" | "quote";

const filled: Partial<Record<ShareIconName, string>> = {
  whatsapp:
    "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.3.8 3.1.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.5-.3Z",
  linkedin:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z",
  x: "M18.9 2H22l-7.4 8.5L23.3 22h-6.8l-5.3-6.9L5 22H1.9l7.9-9.1L1.5 2h7l4.8 6.3L18.9 2Zm-1.2 18.2h1.7L7.4 3.7H5.6l12.1 16.5Z",
  facebook:
    "M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14A28 28 0 0 0 14.64 2C11.93 2 10 3.66 10 6.7v2.8H7v4h3V22h4v-8.5Z",
  telegram:
    "M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.6-.6-.2L6.1 13l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6l19-7.3c.9-.3 1.7.2 1.5 1.7Z",
  quote:
    "M9.6 5C5.9 6.3 3.5 9.3 3.5 13.2V19h6.2v-6.2H6.6c0-2.4 1.3-4.3 3.6-5.3L9.6 5Zm10 0c-3.7 1.3-6.1 4.3-6.1 8.2V19h6.2v-6.2h-3.1c0-2.4 1.3-4.3 3.6-5.3L19.6 5Z",
};

const stroked: Partial<Record<ShareIconName, React.ReactNode>> = {
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  share: (
    <>
      <path d="M12 3v12" />
      <path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </>
  ),
};

export function ShareIcon({ name, size = 18, className }: { name: ShareIconName; size?: number; className?: string }) {
  const d = filled[name];
  if (d) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false" className={className}>
        <path d={d} />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {stroked[name]}
    </svg>
  );
}
