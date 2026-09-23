import { countries } from "@/lib/demo/countries";

export function GET() {
  return Response.json({
    status: "demo",
    message: "Afronomics Data API keys are not issued. This returns country metadata only — no economic prints.",
    data: countries.map(({ slug, name, iso, region, currency }) => ({
      slug,
      name,
      iso,
      region,
      currency,
    })),
  });
}
