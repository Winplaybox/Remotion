import PHOTOS from "./commons-photos.json";

/**
 * REAL PHOTOS — Wikimedia Commons, free licences only (CC0 / Public domain / CC BY / CC BY-SA).
 *
 * content/commons-photos.json is the register: one entry per photo with the Commons file, its page, author and licence,
 * and the local copy in public/commons/<id>.jpg (1600 px). It is written by scripts/commons/fetch.py — never edit an
 * entry by hand; to change a photo, change its pick and re-run the script. Every video that shows a photo draws its
 * credit on screen and lists it in the description (CC BY / BY-SA require "title, author, source, licence").
 * `representative: true` = not the exact place (e.g. no free photo of it exists): the video says "SANKETIK TASVEER".
 */
export interface CommonsPhoto {
  file: string; src: string; page: string; author: string; license: string; licenseUrl: string; representative: boolean;
}

export const COMMONS: Record<string, CommonsPhoto> = PHOTOS as Record<string, CommonsPhoto>;
export const ALLOWED_LICENSES = /^(CC0|Public domain|CC BY(-SA)? \d\.\d)$/;

const short = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trim()}…` : s);
/** Author cleaned for one on-screen line ("This photo was taken by X" -> "X"; unknown -> "unknown author"). */
export function authorOf(p: CommonsPhoto): string {
  const a = p.author.replace(/^this photo was taken by\s*/i, "").replace(/(unknown author)+/i, "unknown author").replace(/\s+/g, " ").trim();
  return short(a || "unknown author", 42);
}

export function commons(id: string): CommonsPhoto {
  const p = COMMONS[id];
  if (!p) throw new Error(`Commons photo "${id}" is not in content/commons-photos.json (run scripts/commons/fetch.py)`);
  return p;
}

/** Scene `photos[]` entry for a register id. */
export function photo(id: string, focus: [number, number] = [0.5, 0.5]) {
  const p = commons(id);
  return { src: p.src, credit: `${authorOf(p)} / ${p.license} / Wikimedia Commons`, focus, representative: p.representative };
}

/** Description block: one full attribution line per photo (TASL). */
export function creditLines(ids: string[]): string[] {
  const uniq = [...new Set(ids)];
  if (!uniq.length) return [];
  return [
    "📷 Photos (Wikimedia Commons):",
    ...uniq.map((id) => {
      const p = commons(id);
      const name = p.file.replace(/^File:/, "").replace(/\.[a-z]+$/i, "");
      return `• "${name}" by ${authorOf(p)}, ${p.license}${p.licenseUrl ? ` (${p.licenseUrl})` : ""} — ${p.page}${p.representative ? " [representative image]" : ""}`;
    })
  ];
}
