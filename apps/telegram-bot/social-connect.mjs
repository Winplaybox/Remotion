// Connect each channel's own Instagram/Facebook (Meta) and Pinterest accounts from the admin dashboard.
// The admin only logs in and approves; tokens are encrypted (AES-256-GCM) and stored in Supabase
// (videobot.social_accounts). Publishing jobs read them from there — nothing to paste into GitHub secrets.
import crypto from "node:crypto";

const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || "v25.0"}`;
export const META_SCOPES = ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "pages_manage_engagement", "pages_read_user_content", "instagram_basic", "instagram_content_publish", "instagram_manage_comments", "business_management"];
export const PINTEREST_SCOPES = ["boards:read", "boards:write", "pins:read", "pins:write", "user_accounts:read"];

// ---------- crypto ----------
/** Same derivation in the server and in the GitHub workers (scripts/social-accounts.ts). */
export const tokenKey = (serviceRoleKey) => crypto.createHash("sha256").update(`social-tokens:${serviceRoleKey}`).digest();
export function seal(text, key) {
  if (!text) return "";
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(String(text), "utf8"), c.final()]);
  return `v1:${Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64")}`;
}
export function unseal(sealed, key) {
  if (!sealed) return "";
  if (!sealed.startsWith("v1:")) throw new Error("unknown token format");
  const b = Buffer.from(sealed.slice(3), "base64");
  const d = crypto.createDecipheriv("aes-256-gcm", key, b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8");
}

// ---------- OAuth state (signed, 15 min) ----------
export function signState(data, key, now = Date.now()) {
  const body = Buffer.from(JSON.stringify({ ...data, t: now })).toString("base64url");
  return `${body}.${crypto.createHmac("sha256", key).update(body).digest("base64url")}`;
}
export function readState(state, key, now = Date.now()) {
  const [body, sig] = String(state || "").split(".");
  if (!body || !sig) return null;
  const want = crypto.createHmac("sha256", key).update(body).digest("base64url");
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  const d = JSON.parse(Buffer.from(body, "base64url").toString());
  return now - d.t < 15 * 60_000 ? d : null;
}

// ---------- HTTP ----------
async function call(url, init = {}) {
  const r = await fetch(url, init);
  const raw = await r.text();
  let d = {};
  try { d = raw ? JSON.parse(raw) : {}; } catch { /* keep raw */ }
  if (!r.ok || d.error) throw new Error(`${r.status}: ${d.error?.message ?? d.message ?? d.error_description ?? raw.slice(0, 200)}`);
  return d;
}

// ---------- Meta ----------
/** Facebook Login for Business: with a login configuration (config_id) the permissions come from the configuration. */
export const metaAuthUrl = ({ appId, redirect, state, configId }) =>
  `https://www.facebook.com/${process.env.META_GRAPH_API_VERSION || "v25.0"}/dialog/oauth?${new URLSearchParams({ client_id: appId, redirect_uri: redirect, state, response_type: "code",
    ...(configId ? { config_id: configId, override_default_response_type: "true" } : { scope: META_SCOPES.join(",") }) })}`;

/** code -> long-lived user token -> Pages (each with its own long-lived Page token) + linked Instagram account. */
export async function metaConnect({ appId, appSecret, redirect, code }) {
  const short = await call(`${GRAPH}/oauth/access_token?${new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirect, code })}`);
  const long = await call(`${GRAPH}/oauth/access_token?${new URLSearchParams({ grant_type: "fb_exchange_token", client_id: appId, client_secret: appSecret, fb_exchange_token: short.access_token })}`);
  const me = await call(`${GRAPH}/me?${new URLSearchParams({ fields: "name", access_token: long.access_token })}`);
  const pages = [];
  let next = `${GRAPH}/me/accounts?${new URLSearchParams({ fields: "id,name,access_token,instagram_business_account{id,username}", limit: "100", access_token: long.access_token })}`;
  while (next && pages.length < 300) {
    const d = await call(next);
    for (const p of d.data ?? []) pages.push({ id: p.id, name: p.name, token: p.access_token, ig_id: p.instagram_business_account?.id ?? "", ig_username: p.instagram_business_account?.username ?? "" });
    next = d.paging?.next ?? null;
  }
  return { user: me.name ?? "", pages };
}
export const metaCheck = (pageId, token) => call(`${GRAPH}/${pageId}?${new URLSearchParams({ fields: "name,instagram_business_account{id,username}", access_token: token })}`);

// ---------- Pinterest ----------
const PIN = "https://api.pinterest.com/v5";
export const pinterestAuthUrl = ({ appId, redirect, state }) =>
  `https://www.pinterest.com/oauth/?${new URLSearchParams({ client_id: appId, redirect_uri: redirect, response_type: "code", scope: PINTEREST_SCOPES.join(","), state })}`;
const basic = (id, secret) => `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`;
export async function pinterestToken({ appId, appSecret, params }) {
  const d = await call(`${PIN}/oauth/token`, { method: "POST", headers: { authorization: basic(appId, appSecret), "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(params) });
  return { access: d.access_token, refresh: d.refresh_token ?? "", expiresAt: new Date(Date.now() + (Number(d.expires_in) || 30 * 86400) * 1000).toISOString() };
}
export const pinterestAccount = (token) => call(`${PIN}/user_account`, { headers: { authorization: `Bearer ${token}` } });
export async function pinterestBoards(token) {
  const out = [];
  let bookmark = "";
  do {
    const d = await call(`${PIN}/boards?${new URLSearchParams({ page_size: "100", ...(bookmark ? { bookmark } : {}) })}`, { headers: { authorization: `Bearer ${token}` } });
    for (const b of d.items ?? []) out.push({ id: b.id, name: b.name });
    bookmark = d.bookmark ?? "";
  } while (bookmark && out.length < 500);
  return out;
}
export const pinterestCreateBoard = (token, name, description) =>
  call(`${PIN}/boards`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ name, description, privacy: "PUBLIC" }) });

/** "Chakra Puzzle" matches a Page/board called "Chakra Puzzle", "chakrapuzzle", "Chakra Puzzle Official"... */
export const looksLike = (a, b) => {
  const n = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return !!n(a) && !!n(b) && (n(a).includes(n(b)) || n(b).includes(n(a)));
};

/** Worker -> server request to refresh a channel's Pinterest token (the app secret lives only on the server). */
export const workerSig = (serviceRoleKey, channel, ts) => crypto.createHmac("sha256", `worker:${serviceRoleKey}`).update(`${channel}.${ts}`).digest("hex");

/** Channels that can connect social accounts (kept in sync with channels/publish-targets.json by a test). */
export const SOCIAL_CHANNELS = [
  { id: "chakra-puzzle", name: "Chakra Puzzle", handle: "@ChakraPuzzle" },
  { id: "kaali-peeli-chase", name: "Kaali Peeli Chase", handle: "@KaaliPeeliChase" },
  { id: "epicbharatsaga", name: "Epic Bharat Saga", handle: "@EpicBharatSaga" },
  { id: "kaun-hoon-main", name: "Digital Immortals", handle: "@DigitalImmortals" },
  { id: "dimaag-lock", name: "Dimaag Lock", handle: "@DimaagLock" }
];
