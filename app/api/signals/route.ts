import { signals } from "@/lib/demo/signals";

export function GET() {
  return Response.json({
    status: "methodology",
    message: "Signal objects are desks, not production scores. API keys are not live.",
    data: signals,
  });
}
