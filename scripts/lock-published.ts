/**
 * Freeze published posts. Stores each post's generated props in locks/published.json; tests/published-lock.test.ts
 * then fails if code changes alter any of them. Existing snapshots are never overwritten.
 *
 *   npx ts-node scripts/lock-published.ts --engine odd-orbit --upto 6
 */
import fs from "node:fs";
import { engineBySlug } from "../engines/catalog";

const args = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const e = engineBySlug(arg("engine") ?? "");
const upto = Number(arg("upto"));
if (!Number.isFinite(upto) || upto < 1) throw new Error("--upto <last published post number> required");
const file = "locks/published.json";
const locks: Record<string, Record<string, unknown>> = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
const mine = (locks[e.slug] ??= {});
let added = 0;
for (let n = 1; n <= upto; n++) {
  if (mine[n] !== undefined) continue;
  mine[n] = JSON.parse(JSON.stringify(e.forDay(n)));
  added++;
}
fs.writeFileSync(file, JSON.stringify(locks, null, 1) + "\n");
console.log(`${e.slug}: locked ${added} new post(s), ${Object.keys(mine).length} total`);
