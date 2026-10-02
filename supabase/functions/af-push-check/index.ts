// af-push-check: sends a web-push alert when any market on the Afronomics T-bill monitor publishes a new result.
// Safe to call by anyone: it takes no message input. It reads the public API, compares each market's newest
// result with the last one it alerted on (af_push_state), and notifies subscribers of the markets that moved.
// Called on a schedule by pg_cron. The first run for a market only records its state.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const API = "https://www.afronomicsfeed.com/api/v1/tbills";

type Latest = { date: string; rate: number; previous_rate: number | null };
type Market = { market: string; country: string; latest: Record<string, Latest> };

function headline(m: Market) {
  const one = m.latest["364"] ?? m.latest["182"] ?? m.latest["91"];
  const tenor = m.latest["364"] ? "364-day" : m.latest["182"] ? "182-day" : "91-day";
  if (!one) return null;
  const bps = one.previous_rate == null ? null : Math.round((one.rate - one.previous_rate) * 100);
  const move = bps == null ? "" : bps === 0 ? ", unchanged" : `, ${bps > 0 ? "up" : "down"} ${Math.abs(bps)} bp`;
  return { date: one.date, rate: one.rate, text: `${m.country} ${tenor} bill ${one.rate.toFixed(2)}%${move}` };
}

Deno.serve(async () => {
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: keys } = await db.from("af_push_keys").select("*").eq("id", 1).single();
  if (!keys) return new Response("no keys", { status: 500 });
  webpush.setVapidDetails(keys.subject, keys.public_key, keys.private_key);

  const res = await fetch(API, { headers: { "User-Agent": "AfronomicsAlerts/1.0" } });
  if (!res.ok) return new Response(`api ${res.status}`, { status: 502 });
  const { markets } = (await res.json()) as { markets: Market[] };
  const { data: state } = await db.from("af_push_state").select("*");
  const seen = new Map((state ?? []).map((s: { market: string; last_date: string }) => [s.market, s.last_date]));

  const moved: { market: string; text: string }[] = [];
  for (const m of markets) {
    const h = headline(m);
    if (!h) continue;
    const last = seen.get(m.market);
    if (last !== h.date) {
      await db.from("af_push_state").upsert({ market: m.market, last_date: h.date, last_rate: h.rate, updated_at: new Date().toISOString() });
      // Timeliness record: the first time this result was seen on the site (public at /reference).
      await db.from("af_seen").upsert({ market: m.market, result_date: h.date, rate: h.rate, first_seen_at: new Date().toISOString(), kind: "live" }, { onConflict: "market,result_date", ignoreDuplicates: true });
      if (last && h.date > last) moved.push({ market: m.market, text: h.text });
    }
  }
  if (!moved.length) return Response.json({ checked: markets.length, sent: 0 });

  const { data: subs } = await db.from("af_push_subs").select("*");
  let sent = 0;
  for (const s of subs ?? []) {
    const mine = moved.filter((x) => !s.markets || s.markets.includes(x.market));
    if (!mine.length) continue;
    const payload = JSON.stringify({
      title: mine.length === 1 ? "New auction result" : `${mine.length} new auction results`,
      body: mine.map((x) => x.text).join("\n"),
      url: mine.length === 1 ? `/markets/tbills/${mine[0].market}` : "/markets/tbills",
      tag: `auction-${mine.map((x) => x.market).join("-")}`,
    });
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 60 * 60 * 12 });
      sent++;
      await db.from("af_push_subs").update({ last_sent_at: new Date().toISOString() }).eq("endpoint", s.endpoint);
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await db.from("af_push_subs").delete().eq("endpoint", s.endpoint);
    }
  }
  return Response.json({ checked: markets.length, moved: moved.map((m) => m.market), sent });
});
