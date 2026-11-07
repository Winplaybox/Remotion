// Pure command handling for the Telegram bot (no network) — tested by commands.test.mjs.
// handle(update, ctx) -> { replies: string[], dispatch?: { event, payload } }

/** Keep in sync with engines/narrator-video/src/model.ts NARRATORS (test checks the ids). */
export const NARRATORS = {
  dadi: "Dadi Ki Kahani — kahaniyan, tyohaar, seekh",
  jasoos: "Jasoos Bhai — rahasya, crime, mystery",
  saga: "Epic Bharat Saga — Sanatan, itihaas, devi-devta",
  dost: "Dost Se Suno — science, tech, facts",
  teacher: "Madam Ji — padhai, GK, how-to"
};
export const DEFAULT_NARRATOR = "dost";
export const DAILY_VIDEO_LIMIT = 5;

const narratorList = () => Object.entries(NARRATORS).map(([id, about]) => `• ${id} — ${about}`).join("\n");

export const HELP = `🙏 Namaste! Main video bot hoon.

💡 Idea bhejo — koi bhi message, link ya sample video bhejo (ya /idea <text>). Admin review karega.

🎬 Video banwao (invited users):
/topic <narrator> <topic>
   e.g. /topic dadi Holi kyun manate hain
/script <narrator>
<apni script, nayi line se>

🎙️ Narrators:
${narratorList()}

/narrators — list · /myid — aapka Telegram ID`;

const IDEA_OK = "✅ Got it! Aapka idea future pipeline list mein add ho gaya hai. Admin isko review karega. 🙏";

/** "/topic@MyBot dadi rest" -> { cmd: "topic", args: "dadi rest" } */
export function parseCommand(text) {
  const m = /^\/([a-z_]+)(?:@\w+)?(?:\s+([\s\S]*))?$/i.exec((text || "").trim());
  return m ? { cmd: m[1].toLowerCase(), args: (m[2] || "").trim() } : null;
}

/** First word is a narrator id? -> { narrator, rest } else default narrator. */
export function splitNarrator(args) {
  const m = /^(\S+)\s*([\s\S]*)$/.exec(args || "");
  if (m && Object.hasOwn(NARRATORS, m[1].toLowerCase())) return { narrator: m[1].toLowerCase(), rest: m[2].trim() };
  return { narrator: DEFAULT_NARRATOR, rest: (args || "").trim() };
}

/**
 * ctx: { allow: Set<string>, admin: string, usage: Map<string, {day, n}>, today: string }
 */
export function handle(update, ctx) {
  const msg = update.message || update.edited_message;
  if (!msg || !msg.chat || update.edited_message) return { replies: [] };
  const from = msg.from || {};
  const uid = String(from.id ?? msg.chat.id);
  const user = { id: from.id, name: [from.first_name, from.last_name].filter(Boolean).join(" ") || from.username || uid, username: from.username || "" };
  const base = { chatId: msg.chat.id, messageId: msg.message_id, user };
  const text = msg.text || msg.caption || "";
  const c = parseCommand(msg.text || "");
  const isAdmin = ctx.admin && uid === String(ctx.admin);
  const allowed = isAdmin || ctx.allow.has(uid);

  const idea = (body) => ({
    replies: [IDEA_OK],
    dispatch: { event: "tg-idea", payload: { ...base, text: body.slice(0, 3500), video: msg.video?.file_id || msg.document?.file_id || "", link: (body.match(/https?:\/\/\S+/) || [""])[0] } }
  });

  if (!c) {
    // Any plain message, link, photo or sample video = an idea.
    if (!text && !msg.video && !msg.document && !msg.photo) return { replies: [HELP] };
    return idea(text || "(sample video)");
  }
  switch (c.cmd) {
    case "start":
    case "help":
      return { replies: [HELP] };
    case "narrators":
      return { replies: [`🎙️ Narrators:\n${narratorList()}\n\nUse: /topic dadi <topic>`] };
    case "myid":
      return { replies: [`Aapka Telegram ID: ${uid}`] };
    case "idea":
      return c.args ? idea(c.args) : { replies: ["💡 Idea likho: /idea <aapka video idea>"] };
    case "topic":
    case "script": {
      const { narrator, rest } = splitNarrator(c.args);
      if (!rest) return { replies: [c.cmd === "topic" ? "Topic likho: /topic dadi Holi kyun manate hain" : "Script likho: /script jasoos\n<apni script>"] };
      if (!allowed) {
        const r = idea(`[${c.cmd}] ${rest}`);
        return { ...r, replies: ["🔒 Video banana abhi sirf invited users ke liye hai. Aapka topic idea ke roop mein save kar liya ✅ Admin review karega."] };
      }
      if (c.cmd === "script" && rest.length < 40) return { replies: ["Script thodi lambi chahiye (kam se kam 2–3 lines)."] };
      if (!isAdmin) {
        const u = ctx.usage.get(uid);
        const n = u && u.day === ctx.today ? u.n : 0;
        if (n >= DAILY_VIDEO_LIMIT) return { replies: [`⏳ Aaj ki limit (${DAILY_VIDEO_LIMIT} videos) poori ho gayi. Kal phir bhejo!`] };
        ctx.usage.set(uid, { day: ctx.today, n: n + 1 });
      }
      return {
        replies: [`🎬 Video ban raha hai (${narrator})… lagbhag 5–8 minute. Yahin bhej denge!`],
        dispatch: { event: "tg-video", payload: { ...base, kind: c.cmd, narrator, text: rest.slice(0, 3500) } }
      };
    }
    case "ideas":
      return isAdmin ? { replies: [], listIdeas: true } : { replies: [HELP] };
    default:
      return { replies: [HELP] };
  }
}
