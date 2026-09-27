import { officialSources } from "@/lib/demo/sources";

export type DoorCheck = {
  slug: string;
  label: string;
  href: string;
  httpStatus: number | null;
  reachable: boolean;
};

/** Asks whether an official door responds. Does not read a number from the page. */
export async function checkDoors(): Promise<DoorCheck[]> {
  const linked = officialSources.filter((source) => source.status === "linked");
  return Promise.all(linked.map(async (source) => {
    try {
      const response = await fetch(source.href, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(4000),
        headers: { "User-Agent": "AfronomicsFeed/1.0 (door check)" },
      });
      await response.body?.cancel();
      return {
        slug: source.slug,
        label: source.label,
        href: source.href,
        httpStatus: response.status,
        reachable: response.ok,
      };
    } catch {
      return {
        slug: source.slug,
        label: source.label,
        href: source.href,
        httpStatus: null,
        reachable: false,
      };
    }
  }));
}
