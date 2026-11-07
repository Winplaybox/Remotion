/** Checks every publishing secret without printing any value: YouTube tokens -> which channel they open. */
import { google } from "googleapis";

const client = (json) => { const c = JSON.parse(json); return c.installed ?? c.web ?? c; };
const checks = [
  ["YT_TOKEN_CHAKRA_PUZZLE", "YT_CLIENT_SECRET_JSON", "Chakra Puzzle"],
  ["YT_TOKEN_KAALI_PEELI_CHASE", "YT_CLIENT_SECRET_JSON", "Kaali Peeli Chase"],
  ["YT_TOKEN_EPICBHARATSAGA", "YT_TOKEN_EPICBHARATSAGA_CLIENT", "Epic Bharat"]
];
let bad = 0;
for (const [tokenVar, clientVar, expected] of checks) {
  const tok = process.env[tokenVar];
  const cj = process.env[clientVar] || process.env.YT_CLIENT_SECRET_JSON;
  if (!tok || !cj) { console.log(`✖ ${tokenVar}: missing${!cj ? " (client JSON missing too)" : ""}`); bad++; continue; }
  try {
    const c = client(cj);
    const auth = new google.auth.OAuth2(c.client_id, c.client_secret, (c.redirect_uris ?? ["http://localhost"])[0]);
    auth.setCredentials(JSON.parse(tok));
    const r = await google.youtube({ version: "v3", auth }).channels.list({ part: ["snippet", "statistics"], mine: true });
    const ch = r.data.items?.[0];
    const name = ch?.snippet?.title ?? "?";
    const ok = name.toLowerCase().startsWith(expected.toLowerCase());
    if (!ok) bad++;
    console.log(`${ok ? "✔" : "✖"} ${tokenVar}: opens "${name}" (${ch?.statistics?.subscriberCount ?? "?"} subs)${ok ? "" : ` — expected "${expected}"`}`);
  } catch (e) { bad++; console.log(`✖ ${tokenVar}: ${e.message}`); }
}
for (const v of ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "META_CHAKRA_PAGE_TOKEN", "META_KPC_PAGE_TOKEN", "META_EBS_PAGE_TOKEN"]) console.log(`${process.env[v] ? "✔" : "·"} ${v}: ${process.env[v] ? "set" : "not set"}`);
console.log(`AUTO_PUBLISH=${process.env.AUTO_PUBLISH || "(not set)"}  EBS_ALLOW_SILENT=${process.env.EBS_ALLOW_SILENT || "(not set)"}`);
if (bad) process.exitCode = 1;
