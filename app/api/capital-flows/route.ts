export function GET() {
  return Response.json({
    status: "empty",
    message: "No sourced capital transactions are stored. Demo table rows are UI-only and are not served here.",
    data: [],
  });
}
