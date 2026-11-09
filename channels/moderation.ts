/**
 * Comment moderation for YouTube / Instagram / Facebook (scripts/publish/engage.ts).
 * - blocked(): abuse (Hindi / Hinglish / English, incl. spellings like "b.c", "ch*tiya", "f**k") and spam -> comment is HIDDEN, never replied to.
 * - tone(): only clearly positive / neutral comments get a friendly reply; negative ones get none.
 * Extra words per channel: dashboard → Social → Blocked words.
 * Same list is meant for YouTube Studio "Blocked words", Instagram "Hidden words" and Facebook Page moderation.
 */

/** Matched as whole words (after normalising). */
export const BLOCKED_WORDS = [
  // Hindi / Hinglish abuse
  "mc", "bc", "bkl", "mkc", "bsdk", "bsdke", "bhosdi", "bhosdike", "bhosdika", "bhosda", "bhosde", "madarchod", "maderchod", "madarchot", "behenchod", "bhenchod", "bhanchod", "benchod",
  "chutiya", "chutiye", "chutia", "chutiyapa", "chut", "choot", "chodu", "chudai", "gandu", "gaandu", "gand", "gaand", "lauda", "lavda", "lawda", "loda", "lund", "lodu",
  "randi", "randwa", "raand", "harami", "haramkhor", "haramzada", "haramzade", "kutta", "kutte", "kutti", "kamina", "kamine", "kaminey", "suar", "jhaat", "jhatu", "tatte", "tatti",
  "betichod", "bhadwa", "bhadwe", "bhadve", "chinal", "lulli", "muth", "mutth",
  // English abuse / adult
  "fuck", "fucking", "fucker", "fck", "fuk", "wtf", "shit", "bitch", "bastard", "asshole", "dick", "cock", "pussy", "slut", "whore", "cunt", "motherfucker", "porn", "sex", "sexy", "nude", "nudes", "xxx", "boobs", "horny",
  // hate
  "nigga", "nigger", "retard", "faggot"
];
/** Matched anywhere in the text (after normalising): long or distinctive. */
export const BLOCKED_PHRASES = [
  "teri maa", "teri ma ki", "tera baap", "maa ki", "behen ki", "maa chod", "bhen ki", "madar chod", "behen chod", "bhen chod", "teri behen",
  "free followers", "free subscribers", "sub4sub", "sub 4 sub", "follow back", "followback", "check my channel", "visit my channel", "my channel pe", "mere channel", "promote your", "promotion ke liye",
  "earn money", "paise kamao", "work from home", "investment plan", "crypto", "bitcoin", "forex", "trading signal", "loan", "betting", "satta", "casino", "rummy", "aviator", "dream11",
  "whatsapp", "telegram", "t.me/", "wa.me", "http", "www.", ".com", "dm me", "dm karo", "inbox me", "link in bio"
];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };

/** Lowercase, leetspeak -> letters, "f**k" / "b.c" / "c h u t" collapsed, repeats squeezed ("fuuuck" -> "fuck"). */
export function normalise(text: string): string {
  let t = text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  t = t.replace(/[013457@$!]/g, (c) => LEET[c] ?? c);
  t = t.replace(/(\w)[.\-_]+(?=\w)/g, "$1"); // b.c, ch-utiya (masked * handled in blocked())
  t = t.replace(/\b(\w)( \w\b)+/g, (m) => m.replace(/ /g, "")); // c h u t i y a
  t = t.replace(/(\w)\1{2,}/g, "$1$1"); // fuuuuck -> fuuck
  return t;
}

const squeeze = (w: string) => w.replace(/(\w)\1+/g, "$1");

export function blocked(text: string, extra: readonly string[] = []): string | null {
  const t = normalise(text);
  const raw = text.toLowerCase();
  for (const p of [...BLOCKED_PHRASES, ...extra.filter((w) => w.includes(" ") || w.length > 5)]) if (t.includes(p) || raw.includes(p)) return p;
  const words = new Set(t.split(/[^a-zऀ-ॿ]+/).filter(Boolean).flatMap((w) => [w, squeeze(w)]));
  const list = [...BLOCKED_WORDS, ...extra.map((x) => x.toLowerCase().trim()).filter(Boolean)];
  for (const w of list) if (words.has(w) || words.has(squeeze(w))) return w;
  // Masked spellings: "ch*tiya", "f**k" -> each * stands for 0-3 letters.
  for (const tok of raw.split(/\s+/)) {
    if (!tok.includes("*") || tok.replace(/[^a-z]/g, "").length < 2) continue;
    const re = new RegExp(`^${tok.replace(/[^a-z*]/g, "").replace(/\*+/g, "[a-z]{0,3}")}$`);
    const hit = list.find((w) => w.length >= 4 && re.test(w));
    if (hit) return hit;
  }
  return null;
}

const POSITIVE = /(nice|wow|great|awesome|amazing|super|mast|mazaa|maza|badhiya|badiya|accha|achha|acha|sahi|\bop\b|\blit\b|cool|love|good|best|fantastic|mil gaya|milgaya|found|easy|mushkil|tough|hard|difficult|interesting|waah|wah|kamaal|kamal|zabardast|jabardast|thanks|thank|shukriya|dhanyavad|\bjai\b|\bram\b|krishna|har har|🔥|❤|😍|👍|👏|🙌|😂|🤣|😎|🧠|💯|✨|🙏|👌|😁|😄)/i;
const NEGATIVE = /(bakwas|bekar|bekaar|boring|fake|worst|ghatiya|faltu|time waste|waste|dislike|unsubscribe|unsub|scam|hate|stupid|useless|cringe|copy|chori|clickbait|galat video|kya bakchodi|👎|🤮|😡|🖕)/i;

/** "positive" -> may get a friendly reply; "negative" / "unclear" -> no reply. */
export function tone(text: string): "positive" | "negative" | "unclear" {
  if (NEGATIVE.test(text)) return "negative";
  return POSITIVE.test(text) ? "positive" : "unclear";
}
