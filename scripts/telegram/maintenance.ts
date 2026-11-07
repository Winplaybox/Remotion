/**
 * Hourly maintenance for the video bot (.github/workflows/bot-maintenance.yml):
 *  - watchdog: jobs without progress for 120 min -> FAILED (timeout); the user gets a Retry button
 *  - retention (--retention): stored videos older than RETENTION_DAYS (default 30) without an open publication are deleted
 */
import { editMessage, sendKeyboard } from "./telegram";

const DAYS = Number(process.env.RETENTION_DAYS || 30);

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, ""), key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing");
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify(args) });
  if (!res.ok) throw new Error(`${fn}: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()) as T;
}

interface Stuck { code: string; chat_id: number; status_message_id: number | null }
interface Expired { code: string; file: string | null; thumb: string | null; shorts: { file?: string }[] | null }

export function filesOf(e: Expired): string[] {
  return [e.file, e.thumb, ...(e.shorts ?? []).map((s) => s.file)].filter((f): f is string => !!f);
}

async function watchdog() {
  const stuck = await rpc<Stuck[]>("videobot_fail_stuck_jobs", { p_minutes: 120 });
  for (const j of stuck) {
    const text = `⏱️ ${j.code} bahut der se atki thi, isliye band kar di. Dobara try karo:`;
    const kb = [[{ text: "🔁 Retry", callback_data: `job:retry:${j.code}` }]];
    if (j.status_message_id) await editMessage(j.chat_id, j.status_message_id, text, kb).catch(() => undefined);
    else await sendKeyboard(j.chat_id, text, kb).catch(() => undefined);
  }
  console.log(`[watchdog] ${stuck.length} stuck job(s) failed`);
}

async function retention() {
  const url = process.env.SUPABASE_URL!.replace(/\/$/, ""), key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const expired = await rpc<Expired[]>("videobot_expired_files", { p_days: DAYS });
  const files = expired.flatMap(filesOf);
  if (files.length) {
    const res = await fetch(`${url}/storage/v1/object/videobot`, { method: "DELETE", headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ prefixes: files }) });
    if (!res.ok) throw new Error(`storage delete: ${res.status} ${(await res.text()).slice(0, 200)}`);
    await rpc<number>("videobot_mark_files_deleted", { p_codes: expired.map((e) => e.code) });
  }
  console.log(`[retention] ${files.length} file(s) from ${expired.length} job(s) older than ${DAYS} days deleted`);
}

if (require.main === module) {
  (async () => {
    await watchdog();
    if (process.argv.includes("--retention")) await retention();
  })().catch((e) => { console.error(e); process.exit(1); });
}
