/**
 * Channel publishing ledger (Supabase videobot.channel_posts via service-role RPCs).
 * Lets the hourly run catch up slots a skipped GitHub cron missed, without posting a Reel twice.
 * Without SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY everything here is a no-op and no catch-up happens.
 */
export interface SlotKey { channel: string; date: string; slot: number }
export interface LedgerRow extends SlotKey { n: number; status: "DONE" | "META_FAILED"; youtube_id?: string; social?: Record<string, { ok: boolean; id?: string; error?: string; at: string }> }

export const ledgerEnabled = () => !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const url = process.env.SUPABASE_URL!.replace(/\/$/, ""), key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify(args) });
  if (!res.ok) throw new Error(`${fn}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T;
}

export const ledgerStatus = (items: SlotKey[]) => (items.length ? rpc<LedgerRow[]>("videobot_channel_posts_status", { p_items: items }) : Promise.resolve([]));

export function ledgerRecord(k: SlotKey & { n: number; status: LedgerRow["status"]; youtubeId?: string; meta?: string }) {
  return rpc("videobot_channel_post_record", { p_channel: k.channel, p_date: k.date, p_slot: k.slot, p_n: k.n, p_status: k.status, p_youtube_id: k.youtubeId ?? "", p_meta: k.meta ?? "", p_run_id: process.env.GITHUB_RUN_ID ?? "" });
}

export const ledgerSocial = (k: SlotKey, platform: string, result: unknown) =>
  rpc("videobot_channel_post_social", { p_channel: k.channel, p_date: k.date, p_slot: k.slot, p_platform: platform, p_result: result });
