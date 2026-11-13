/**
 * Credentials for a channel's Instagram/Facebook/Pinterest.
 * 1. GitHub secrets (META_<X>_*, PINTEREST_<X>_*) if set — manual override (an expired Meta secret is skipped).
 * 2. Otherwise the accounts connected in the admin dashboard (videobot.social_accounts), decrypted with the key
 *    derived from SUPABASE_SERVICE_ROLE_KEY (same as apps/telegram-bot/social-connect.mjs).
 * Pinterest access tokens expire (~30 days): when one is close to expiry the bot server refreshes it
 * (only the server holds the Pinterest app secret).
 */
import crypto from "node:crypto";
import type { ChannelConfig } from "../../channels/channels";

export interface MetaCreds { pageId?: string | undefined; igUserId?: string | undefined; pageToken?: string | undefined; source: string }
export interface PinterestCreds { accessToken?: string | undefined; boardId?: string | undefined; source: string }

const key = () => crypto.createHash("sha256").update(`social-tokens:${process.env.SUPABASE_SERVICE_ROLE_KEY}`).digest();
export function unseal(sealed: string, k: Buffer = key()): string {
  if (!sealed) return "";
  if (!sealed.startsWith("v1:")) throw new Error("unknown token format");
  const b = Buffer.from(sealed.slice(3), "base64");
  const d = crypto.createDecipheriv("aes-256-gcm", k, b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8");
}

interface Row { page_id: string; ig_user_id: string; board_id: string; token_enc: string; refresh_enc: string; expires_at: string | null }
async function row(channel: string, platform: "meta" | "pinterest"): Promise<Row | null> {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, ""), sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !sk) return null;
  const r = await fetch(`${url}/rest/v1/rpc/videobot_social_get`, { method: "POST", headers: { apikey: sk, authorization: `Bearer ${sk}`, "content-type": "application/json" }, body: JSON.stringify({ p_channel: channel, p_platform: platform }) });
  if (!r.ok) throw new Error(`social accounts: ${r.status}`);
  return (await r.json()) as Row | null;
}

/**
 * True unless Meta says the token itself is dead (expired / revoked: OAuthException 190 or 102). A network or Graph
 * outage counts as alive, so a hiccup never hides a working account.
 */
export async function metaTokenAlive(token: string): Promise<boolean> {
  const v = process.env.META_GRAPH_API_VERSION ?? "v25.0";
  try {
    const r = await fetch(`https://graph.facebook.com/${v}/me?fields=id&access_token=${encodeURIComponent(token)}`, { signal: AbortSignal.timeout(20_000) });
    if (r.ok) return true;
    const d = (await r.json().catch(() => ({}))) as { error?: { code?: number; type?: string } };
    return !(d.error?.code === 190 || d.error?.code === 102);
  } catch { return true; }
}

/**
 * Secrets first (manual override), then the dashboard connection — but a secret token Meta has expired is skipped,
 * so an old secret can never shadow a fresh dashboard connection. If no live token is left, nothing is posted and
 * the log says why (instead of waiting for the slot and then failing).
 */
export async function metaCreds(channel: string, cfg: Pick<ChannelConfig, "metaSecretPrefix">): Promise<MetaCreds> {
  const p = cfg.metaSecretPrefix;
  const dead: string[] = [];
  const secret = process.env[`${p}_PAGE_TOKEN`];
  if (secret) {
    if (await metaTokenAlive(secret)) return { pageId: process.env[`${p}_PAGE_ID`], igUserId: process.env[`${p}_IG_USER_ID`], pageToken: secret, source: "secrets" };
    console.warn(`[social] ${p}_PAGE_TOKEN secret has expired — trying the dashboard connection`);
    dead.push("secret");
  }
  const r = await row(channel, "meta").catch((e: Error) => { console.warn(`[social] ${e.message}`); return null; });
  if (r?.token_enc) {
    const token = unseal(r.token_enc);
    if (await metaTokenAlive(token)) return { pageId: r.page_id || undefined, igUserId: r.ig_user_id || undefined, pageToken: token, source: "dashboard" };
    console.warn(`[social] dashboard Meta connection for ${channel} has expired — reconnect it (dashboard → Social)`);
    dead.push("dashboard");
  }
  return { source: dead.length ? `none (${dead.join(" + ")} token expired)` : "none" };
}

const botUrl = () => (process.env.BOT_PUBLIC_URL || "https://telegram-video-bot-quth.onrender.com").replace(/\/$/, "");
export const workerSig = (sk: string, channel: string, ts: number) => crypto.createHmac("sha256", `worker:${sk}`).update(`${channel}.${ts}`).digest("hex");

export async function pinterestCreds(channel: string, cfg: Pick<ChannelConfig, "pinterestSecretPrefix">, refreshAccess?: (prefix: string) => Promise<string | null>): Promise<PinterestCreds> {
  const p = cfg.pinterestSecretPrefix;
  if (process.env[`${p}_REFRESH_TOKEN`] && refreshAccess) return { accessToken: (await refreshAccess(p)) ?? undefined, boardId: process.env[`${p}_BOARD_ID`], source: "secrets" };
  let r = await row(channel, "pinterest").catch((e: Error) => { console.warn(`[social] ${e.message}`); return null; });
  if (!r?.token_enc) return { source: "none" };
  if (!r.expires_at || Date.parse(r.expires_at) < Date.now() + 3 * 86_400_000) {
    // Server refreshes and stores the new token (Render may need ~1 min to wake up).
    const ts = Date.now(), sk = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const res = await fetch(`${botUrl()}/internal/pinterest-refresh`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ channel, ts, sig: workerSig(sk, channel, ts) }), signal: AbortSignal.timeout(120_000) }).catch((e: Error) => ({ ok: false, status: 0, text: async () => e.message }));
    if (!res.ok) console.warn(`[pinterest] token refresh failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
    else r = (await row(channel, "pinterest")) ?? r;
  }
  return { accessToken: unseal(r.token_enc), boardId: r.board_id || undefined, source: "dashboard" };
}
