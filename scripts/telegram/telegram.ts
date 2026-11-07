/** Minimal Telegram Bot API client (Node 20 fetch/FormData). Token from TELEGRAM_BOT_TOKEN. */
import fs from "node:fs";
import path from "node:path";

const api = (method: string) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return `https://api.telegram.org/bot${token}/${method}`;
};

async function call(method: string, body: FormData | Record<string, unknown>) {
  const isForm = body instanceof FormData;
  const res = await fetch(api(method), { method: "POST", ...(isForm ? { body } : { headers: { "content-type": "application/json" }, body: JSON.stringify(body) }) });
  const json = (await res.json()) as { ok: boolean; description?: string };
  if (!json.ok) throw new Error(`Telegram ${method}: ${json.description ?? res.status}`);
  return json;
}

export const sendMessage = (chatId: string | number, text: string, replyTo?: number) =>
  call("sendMessage", { chat_id: chatId, text, ...(replyTo ? { reply_parameters: { message_id: replyTo, allow_sending_without_reply: true } } : {}) });

export async function sendVideo(chatId: string | number, file: string, caption: string, replyTo?: number) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("caption", caption.slice(0, 1000));
  form.append("supports_streaming", "true");
  form.append("width", "1080");
  form.append("height", "1920");
  if (replyTo) form.append("reply_parameters", JSON.stringify({ message_id: replyTo, allow_sending_without_reply: true }));
  form.append("video", new Blob([fs.readFileSync(file)], { type: "video/mp4" }), path.basename(file));
  return call("sendVideo", form);
}
