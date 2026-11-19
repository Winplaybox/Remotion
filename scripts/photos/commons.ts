/**
 * Real photos for story scenes (AllTrainReels trains, Indian Horror Tapes places), from Wikimedia Commons only.
 *
 * A scene asks for `photos: [{ query: ["Vande Bharat Express", "Vande Bharat train"] }]`. The first query with a freely
 * licensed result (CC0 / public domain / CC BY / CC BY-SA; never NC or ND) wins. The file is saved once as
 * public/photos/<key>.jpg and kept on the render-queue branch (photos/), so a post never changes its photo later.
 * Credits (author, licence, Commons page) go into public/photos/credits.json and into the YouTube description.
 *
 * Fetching needs the network: it runs in GitHub Actions (Prepare Voice, and the publish job as a fallback).
 * Where Commons cannot be reached (Claude's render sandbox) the scene keeps its drawn illustration instead.
 */
import fs from "node:fs";
import path from "node:path";

export interface PhotoCredit { key: string; query: string; title: string; author: string; license: string; page: string }
type PhotoRef = { query: string[]; src?: string | undefined; label?: string | undefined };
type SceneLike = { photos?: PhotoRef[] | undefined };

export const PHOTO_DIR = path.join("public", "photos");
const CREDITS = path.join(PHOTO_DIR, "credits.json");
const UA = "WinPlayBox-Remotion/1.0 (https://github.com/Winplaybox/Remotion; video credits in descriptions)";
const FREE = /^(cc0|public domain|pd\b|pd-|cc[- ]by(-sa)?[- ]?\d|cc[- ]by(-sa)?$|attribution|no restrictions)/i;
const NOT_FREE = /\b(nc|nd|non-?commercial|no ?deriv|fair use)\b/i;

/** Stable file key for a photo request: slug of its first query. */
export const photoKey = (query: string[]) =>
  (query[0] ?? "photo").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "photo";

export function readCredits(dir = PHOTO_DIR): Record<string, PhotoCredit> {
  const f = path.join(dir, "credits.json");
  try { return JSON.parse(fs.readFileSync(f, "utf8")) as Record<string, PhotoCredit>; } catch { return {}; }
}
function writeCredits(c: Record<string, PhotoCredit>) {
  fs.mkdirSync(PHOTO_DIR, { recursive: true });
  fs.writeFileSync(CREDITS, JSON.stringify(c, null, 2));
}

const strip = (html: string) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

/** Pure: pick the best free result from a Commons API response (tested). */
export function pickCommons(pages: { index?: number; title: string; imageinfo?: { mime?: string; width?: number; height?: number; thumburl?: string; url?: string; descriptionurl?: string; extmetadata?: Record<string, { value?: string }> }[] }[]) {
  const ok = pages
    .map((p) => ({ p, i: p.imageinfo?.[0] }))
    .filter(({ i }) => i && /image\/(jpeg|png)/.test(i.mime ?? "") && (i.width ?? 0) >= 1000 && (i.height ?? 0) >= 600)
    .filter(({ i }) => {
      const lic = i!.extmetadata?.LicenseShortName?.value ?? "";
      return FREE.test(lic) && !NOT_FREE.test(lic);
    })
    .sort((a, b) => (a.p.index ?? 99) - (b.p.index ?? 99));
  const best = ok[0];
  if (!best) return null;
  const i = best.i!;
  return {
    title: best.p.title,
    url: i.thumburl || i.url!,
    page: i.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(best.p.title)}`,
    license: i.extmetadata?.LicenseShortName?.value ?? "",
    author: strip(i.extmetadata?.Artist?.value ?? "") || "Unknown author"
  };
}

async function searchCommons(q: string) {
  const u = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({
    action: "query", format: "json", generator: "search", gsrnamespace: "6", gsrlimit: "20",
    gsrsearch: `${q} filetype:bitmap`, prop: "imageinfo", iiprop: "url|size|mime|extmetadata", iiurlwidth: "1600",
    iiextmetadatafilter: "LicenseShortName|Artist"
  }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { headers: { "user-agent": UA } });
  if (!r.ok) throw new Error(`Commons ${r.status}`);
  const j = (await r.json()) as { query?: { pages?: Record<string, Parameters<typeof pickCommons>[0][number]> } };
  return pickCommons(Object.values(j.query?.pages ?? {}));
}

/** Download one photo request if it is not on disk yet. Returns its credit, or null when nothing free was found / offline. */
export async function fetchPhoto(query: string[]): Promise<PhotoCredit | null> {
  const key = photoKey(query);
  const file = path.join(PHOTO_DIR, `${key}.jpg`);
  const credits = readCredits();
  if (fs.existsSync(file) && credits[key]) return credits[key]!;
  for (const q of query) {
    try {
      const hit = await searchCommons(q);
      if (!hit) continue;
      const img = await fetch(hit.url, { headers: { "user-agent": UA } });
      if (!img.ok) continue;
      fs.mkdirSync(PHOTO_DIR, { recursive: true });
      fs.writeFileSync(file, Buffer.from(await img.arrayBuffer()));
      const c: PhotoCredit = { key, query: q, title: hit.title.replace(/^File:/, ""), author: hit.author, license: hit.license, page: hit.page };
      writeCredits({ ...readCredits(), [key]: c });
      console.log(`[photos] ${key} <- ${c.title} (${c.license}, ${c.author})`);
      return c;
    } catch (e) {
      console.warn(`[photos] ${q}: ${(e as Error).message}`);
      return null; // offline / blocked: don't hammer every fallback query
    }
  }
  console.warn(`[photos] no free photo for ${JSON.stringify(query)} — the drawn illustration stays`);
  return null;
}

/**
 * Fill `src` on every photo the props ask for (fetching missing ones when `fetchMissing`).
 * Returns the credits of the photos actually used, for the description.
 */
export async function ensurePhotos(props: { scenes?: SceneLike[] | undefined }, fetchMissing = true): Promise<PhotoCredit[]> {
  const used = new Map<string, PhotoCredit>();
  for (const s of props.scenes ?? []) {
    for (const ph of s.photos ?? []) {
      const key = photoKey(ph.query);
      const file = path.join(PHOTO_DIR, `${key}.jpg`);
      let credit: PhotoCredit | null | undefined = readCredits()[key];
      if ((!fs.existsSync(file) || !credit) && fetchMissing && process.env.PHOTOS_OFFLINE !== "true") credit = await fetchPhoto(ph.query);
      if (fs.existsSync(file) && credit) { ph.src = `photos/${key}.jpg`; used.set(key, credit); }
    }
  }
  return [...used.values()];
}

/** One description block, as CC BY / BY-SA require: author, licence, link. */
export function creditLines(credits: PhotoCredit[]): string {
  if (!credits.length) return "";
  return ["", "📷 Photos (Wikimedia Commons):", ...credits.map((c) => `• ${c.title} — ${c.author}, ${c.license} — ${c.page}`)].join("\n");
}

/** Credits for the photos a post asks for, from a credits map (used when the video was rendered elsewhere). */
export function creditsFor(props: { scenes?: SceneLike[] | undefined }, credits: Record<string, PhotoCredit>): PhotoCredit[] {
  const keys = new Set((props.scenes ?? []).flatMap((s) => (s.photos ?? []).map((ph) => photoKey(ph.query))));
  return [...keys].map((k) => credits[k]).filter((c): c is PhotoCredit => !!c);
}
