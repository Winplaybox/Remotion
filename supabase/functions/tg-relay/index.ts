// Always-on Telegram webhook relay for the Render free-tier bot (apps/telegram-bot).
//
// Why: Render's free web service sleeps after 15 min idle and needs ~50-60s to boot.
// Telegram's webhook call times out during that boot and Telegram then backs off,
// so users got no reply until someone opened bot.winplaybox.in. This function answers
// Telegram instantly, shows "typing…" to the user, and keeps forwarding the update
// to Render until it is awake. The bot dedupes by update_id, so retries are safe.
//
// Env (supabase secrets): TELEGRAM_BOT_TOKEN (required), BOT_URL (default https://bot.winplaybox.in),
//   TG_WEBHOOK_SECRET (optional; defaults to the same value the bot derives from the token).
// Deploy: supabase functions deploy tg-relay --no-verify-jwt
// Then set TG_WEBHOOK_URL=https://<project>.supabase.co/functions/v1/tg-relay on the Render service.

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void };

const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const BOT_URL = (Deno.env.get("BOT_URL") ?? "https://bot.winplaybox.in").replace(/\/$/, "");
const MAX_WAIT_MS = 140_000; // stays inside the edge function wall-clock limit

async function deriveSecret(): Promise<string> {
  const explicit = Deno.env.get("TG_WEBHOOK_SECRET");
  const raw = explicit
    ? explicit
    : Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`webhook:${TOKEN}`))))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 48);
  return raw.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 200);
}
const SECRET_PROMISE = deriveSecret();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function chatIdOf(update: any): number | undefined {
  return update?.message?.chat?.id ?? update?.callback_query?.message?.chat?.id;
}

async function typing(chatId: number) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendChatAction`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  }).catch(() => {});
}

async function forward(body: string, secret: string) {
  let update: any = null;
  try { update = JSON.parse(body); } catch { /* forward as-is */ }
  const chatId = chatIdOf(update);
  const started = Date.now();
  let delivered = false;

  // Keep "typing…" visible while the bot wakes up (only if the first attempt is slow).
  const typingLoop = (async () => {
    await sleep(2500);
    while (!delivered && chatId && Date.now() - started < MAX_WAIT_MS) {
      await typing(chatId);
      await sleep(4500);
    }
  })();

  while (!delivered && Date.now() - started < MAX_WAIT_MS) {
    try {
      const res = await fetch(`${BOT_URL}/tg/${secret}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": secret },
        body,
        signal: AbortSignal.timeout(Math.max(5_000, Math.min(90_000, MAX_WAIT_MS - (Date.now() - started)))),
      });
      if (res.ok) { delivered = true; break; }
      console.warn(`bot answered ${res.status}, retrying`);
    } catch (e) {
      console.warn(`bot not reachable yet: ${(e as Error).message}`);
    }
    await sleep(4000);
  }
  delivered = true;
  await typingLoop;
  if (Date.now() - started >= MAX_WAIT_MS) console.error("gave up forwarding update", update?.update_id);
}

Deno.serve(async (req) => {
  const secret = await SECRET_PROMISE;
  if (req.method !== "POST" || !TOKEN || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("not found", { status: 404 });
  }
  const body = await req.text();
  EdgeRuntime.waitUntil(forward(body, secret));
  return new Response("ok"); // answer Telegram at once so it never backs off
});
