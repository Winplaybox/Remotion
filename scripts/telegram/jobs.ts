/**
 * Job progress from the GitHub Actions workers: updates videobot.jobs (Supabase RPC, service role) and edits the
 * job's live status message in Telegram. Works without Supabase too (then only the Telegram message is edited).
 */
import { editMessage } from "./telegram";

export type JobStatus = "VALIDATING" | "SCRIPT_GENERATION" | "NARRATION" | "VISUAL_GENERATION" | "AI_TRANSFORMATION" | "AUDIO_PROCESSING" | "RENDERING" | "UPLOADING" | "COMPLETED" | "FAILED" | "CANCELLED";

const LABEL: Record<JobStatus, string> = {
  VALIDATING: "🔎 Input check", SCRIPT_GENERATION: "✍️ Script ban rahi", NARRATION: "🎙️ Awaaz ban rahi", VISUAL_GENERATION: "🖼️ Visuals",
  AI_TRANSFORMATION: "🤖 AI badlav", AUDIO_PROCESSING: "🔊 Audio", RENDERING: "🎬 Render ho raha", UPLOADING: "📤 Bhej rahe",
  COMPLETED: "✅ Ho gaya", FAILED: "❌ Fail", CANCELLED: "🛑 Cancel"
};

export class JobCancelled extends Error {}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T | null> {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify(args)
  });
  if (!res.ok) { console.warn(`[job] ${fn}: ${res.status} ${(await res.text()).slice(0, 200)}`); return null; }
  return (await res.json()) as T;
}

interface JobRow { status: string; final?: boolean }

export function jobTracker(opts: { code?: string | undefined; chatId?: string | number | undefined; statusMessageId?: number | undefined; title?: string | undefined }) {
  const runId = process.env.GITHUB_RUN_ID ? Number(process.env.GITHUB_RUN_ID) : undefined;
  let last = 0;
  const bar = (p: number) => `${"▓".repeat(Math.round(p / 10))}${"░".repeat(10 - Math.round(p / 10))} ${p}%`;
  return {
    /** Records progress; throws JobCancelled when the user cancelled the job meanwhile. */
    async step(status: JobStatus, progress: number, message = "") {
      if (opts.code) {
        const row = await rpc<JobRow>("videobot_update_job", { p_code: opts.code, p: { status, progress, message, ...(runId ? { run_id: runId } : {}) } });
        if (row?.final && row.status === "CANCELLED" && status !== "CANCELLED") throw new JobCancelled(`${opts.code} cancelled`);
      }
      const now = Date.now();
      const terminal = status === "COMPLETED" || status === "FAILED" || status === "CANCELLED";
      if (opts.chatId && opts.statusMessageId && (terminal || now - last > 2500)) {
        last = now;
        const head = `🎬 ${opts.code ?? "Video"}${opts.title ? ` — ${opts.title}` : ""}`;
        await editMessage(opts.chatId, opts.statusMessageId, `${head}\n${LABEL[status]}${terminal ? "" : `\n${bar(progress)}`}${message && status === "FAILED" ? `\n${message}` : ""}`).catch(() => undefined);
      }
    },
    async done(output: Record<string, unknown>) {
      if (opts.code) await rpc("videobot_update_job", { p_code: opts.code, p: { status: "COMPLETED", progress: 100, output, message: "delivered" } });
      await this.step("COMPLETED", 100).catch(() => undefined);
    },
    async fail(error: string) {
      if (opts.code) await rpc("videobot_update_job", { p_code: opts.code, p: { status: "FAILED", error: error.slice(0, 500), message: error.slice(0, 500) } });
      if (opts.chatId && opts.statusMessageId) await editMessage(opts.chatId, opts.statusMessageId, `🎬 ${opts.code ?? "Video"}\n❌ Fail: ${error.slice(0, 300)}\n/retry ${opts.code ?? ""}`.trim(), opts.code ? [[{ text: "🔁 Retry", callback_data: `job:retry:${opts.code}` }]] : undefined).catch(() => undefined);
    }
  };
}

/** Marks the idea a production job came from as COMPLETED (admin approval flow). */
export async function completeIdea(code: string | undefined, jobCode: string | undefined) {
  if (!code) return;
  await rpc("videobot_update_idea", { p_code: code, p_by: null, p: { status: "COMPLETED", note: `video ${jobCode ?? ""} delivered`.trim() } });
}

/** Stores data on the job without changing its status (e.g. a preview draft awaiting approval). */
export async function saveJobOutput(code: string | undefined, output: Record<string, unknown>) {
  if (!code) return;
  await rpc("videobot_update_job", { p_code: code, p: { output } });
}
