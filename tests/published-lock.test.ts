import fs from "node:fs";
import { engineBySlug } from "../engines/catalog";

/**
 * Published posts must never change. Every key stored in locks/published.json must still be generated identically.
 * New schema fields are allowed (they are not in the snapshot) but must default to the old behaviour.
 */
const locks: Record<string, Record<string, Record<string, unknown>>> = fs.existsSync("locks/published.json") ? JSON.parse(fs.readFileSync("locks/published.json", "utf8")) : {};

describe.each(Object.entries(locks))("published %s posts are frozen", (slug, posts) => {
  const e = engineBySlug(slug);
  it.each(Object.keys(posts))("post %s is unchanged", (n) => {
    const now = JSON.parse(JSON.stringify(e.forDay(Number(n)))) as Record<string, unknown>;
    const locked = posts[n]!;
    for (const k of Object.keys(locked)) expect({ key: k, value: now[k] }).toEqual({ key: k, value: locked[k] });
  });
});
