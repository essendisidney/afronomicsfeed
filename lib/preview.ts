/** Free preview: the lede before the first H2. Full method stays gated. */
export function previewBody(body: string) {
  const match = body.split(/\n##\s+/);
  return match[0]?.trim() ?? "";
}
