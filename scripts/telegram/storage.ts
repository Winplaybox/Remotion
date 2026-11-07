/** Private Supabase Storage bucket `videobot` (service role): finished videos kept for publishing. */
import fs from "node:fs";

const cfg = () => {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, ""), key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
};
const objPath = (p: string) => p.split("/").map(encodeURIComponent).join("/");

/** Upload; returns the object path, or "" when storage is not configured / fails (never fatal for delivery). */
export async function storeFile(local: string, remote: string, type = "video/mp4"): Promise<string> {
  const c = cfg();
  if (!c) return "";
  const res = await fetch(`${c.url}/storage/v1/object/videobot/${objPath(remote)}`, {
    method: "POST", headers: { apikey: c.key, authorization: `Bearer ${c.key}`, "content-type": type, "x-upsert": "true" }, body: fs.readFileSync(local)
  });
  if (!res.ok) { console.warn(`[storage] ${remote}: ${res.status} ${(await res.text()).slice(0, 200)}`); return ""; }
  return remote;
}

export async function fetchFile(remote: string, local: string): Promise<void> {
  const c = cfg();
  if (!c) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
  const res = await fetch(`${c.url}/storage/v1/object/videobot/${objPath(remote)}`, { headers: { apikey: c.key, authorization: `Bearer ${c.key}` } });
  if (!res.ok) throw new Error(`storage ${remote}: ${res.status}`);
  fs.writeFileSync(local, Buffer.from(await res.arrayBuffer()));
}
