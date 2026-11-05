// Leaderboard store. The Eventyr plugin POSTs the whole board here (header X-Eventyr-Key = env STATS_KEY);
// the wiki's Leaderboard, player pages and World map GET it. Nothing else is stored.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("eventyr-stats");
  if (req.method === "POST") {
    const key = Netlify.env.get("STATS_KEY");
    if (!key || req.headers.get("x-eventyr-key") !== key) return new Response("unauthorized", { status: 401 });
    const body = await req.text();
    if (body.length > 1500000) return new Response("too big", { status: 413 });
    try { JSON.parse(body); } catch { return new Response("bad json", { status: 400 }); }
    await store.set("board", body);
    return new Response("ok");
  }
  const board = await store.get("board");
  if (!board) return new Response("{}", { status: 404, headers: { "content-type": "application/json" } });
  return new Response(board, { headers: { "content-type": "application/json", "cache-control": "public, max-age=20" } });
};

export const config = { path: "/api/stats" };
