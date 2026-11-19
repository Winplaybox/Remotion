/**
 * One command, on YOUR PC, that connects every channel to GitHub Actions.
 * Tokens go straight from Google into GitHub secrets via the `gh` CLI. They are never printed or written to disk.
 *
 *   gh auth login                                   # once, if not already logged in
 *   node scripts/publish/setup-secrets.mjs \
 *     --client  C:/path/client_secret.json         # OAuth client for the puzzle channels (YouTube Data API v3 enabled)
 *     --ebs-dir C:/Users/sagar/Desktop/Project/daily-devotional-shorts   # reuses the existing EpicBharatSaga client_secret.json + token.json
 *     [--ebs-client C:/path/client_secret.json]    # OR: fresh OAuth for EpicBharatSaga (sign in as epicbharat.official)
 *     [--ebs-token C:/path/token.json]             # OR: reuse colab-YT's EpicBharatSaga token.json (google-auth authorized_user)
 *     [--only-ebs]                                 # skip the puzzle channels
 *     [--only-jasoos --client C:/path/client_secret.json]   # connect ONLY Jasoos Bhai Cases -> YT_TOKEN_LIAR_LINEUP (pick @JasoosBhaiCases)
 *     [--ebs-silent]                               # let EpicBharatSaga post with captions until IndicF5 narration exists
 *
 *   Move AllTrainReels / Indian Horror Tapes / MindNest Tales over from colab-YT (no new sign-in needed):
 *   node scripts/publish/setup-secrets.mjs --colab-dir C:/path/to/colab-YT [--start 2026-11-17] [--live] [--disable-old]
 *     reads the tokens colab-YT's authenticate scripts saved on this PC (channels/AllTrainReels/token.json,
 *     channels/IndianHorrorTapes/token.json, channels/MindNestTales/credentials/token_<lang>.json), checks each one
 *     opens the right channel, and stores it as YT_TOKEN_ALLTRAINREELS / YT_TOKEN_INDIAN_HORROR_TAPES / YT_TOKEN_MINDNEST_<LANG>.
 *     --start sets START_<ID>, --live sets LIVE_<ID>=true for every channel that got a token,
 *     --disable-old turns off colab-YT's old schedulers for those channels (no double posting). Use --live and
 *     --disable-old together.
 *
 * For each puzzle channel a browser opens: sign in as dailysnapdose@gmail.com and pick the channel it names.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { exec, execFileSync } from "node:child_process";
import { google } from "googleapis";

const REPO = "Winplaybox/Remotion";
const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const flag = (k) => args.includes(`--${k}`);

const ghBin = process.platform === "win32" && fs.existsSync("C:\\Users\\sagar\\bin\\gh.exe") ? "C:\\Users\\sagar\\bin\\gh.exe" : "gh";
function gh(argv, input) {
  return execFileSync(ghBin, argv, { input, stdio: [input === undefined ? "inherit" : "pipe", "pipe", "inherit"], shell: process.platform === "win32" }).toString().trim();
}
const setSecret = (name, value) => { gh(["secret", "set", name, "--repo", REPO], value); console.log(`  ✔ secret ${name} set`); };
const setVar = (name, value) => { gh(["variable", "set", name, "--repo", REPO, "--body", value]); console.log(`  ✔ variable ${name}=${value}`); };
const clientOf = (json) => { const c = JSON.parse(json); return c.installed ?? c.web ?? c; };

async function channelName(auth) {
  const r = await google.youtube({ version: "v3", auth }).channels.list({ part: ["snippet"], mine: true });
  return r.data.items?.[0]?.snippet?.title ?? "?";
}

function consent(clientJson, expected, port, account = "dailysnapdose@gmail.com") {
  const c = clientOf(clientJson);
  const redirect = `http://localhost:${port}`;
  const auth = new google.auth.OAuth2(c.client_id, c.client_secret, redirect);
  const url = auth.generateAuthUrl({ access_type: "offline", prompt: "consent select_account", scope: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube", "https://www.googleapis.com/auth/yt-analytics.readonly"] });
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const code = new URL(req.url, redirect).searchParams.get("code");
      if (!code) { res.end("waiting…"); return; }
      try {
        const { tokens } = await auth.getToken(code);
        auth.setCredentials(tokens);
        const name = await channelName(auth);
        if (!name.toLowerCase().startsWith(expected.toLowerCase())) { res.end(`You picked "${name}". Close this tab; the script will ask again for "${expected}".`); server.close(); resolve(null); return; }
        if (!tokens.refresh_token) throw new Error("Google returned no refresh_token (remove the app at myaccount.google.com/permissions and retry)");
        res.end(`Connected "${name}". You can close this tab.`);
        server.close();
        resolve(tokens);
      } catch (e) { res.end("Error, see terminal"); server.close(); reject(e); }
    }).listen(port, () => {
      console.log(`\n→ Pick the channel "${expected}" in the browser window (${account}).`);
      exec(process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`);
    });
  });
}

/** colab-YT tokens -> Remotion secrets (see the header). */
async function fromColab(dir) {
  const MINDNEST = { hi: "Hindi", en: "English", es: "Spanish", pt: "Portuguese", fr: "French", de: "German", ar: "Arabic", ja: "Japanese", ko: "Korean", vi: "Vietnamese", fil: "Filipino" };
  const jobs = [
    { id: "ALLTRAINREELS", file: "channels/AllTrainReels/token.json", expect: /train/i, old: "all_train_reels_scheduler.yml" },
    { id: "INDIAN_HORROR_TAPES", file: "channels/IndianHorrorTapes/token.json", expect: /horror/i, old: "indian_horror_tapes_scheduler.yml" },
    ...Object.entries(MINDNEST).map(([l, n]) => ({ id: `MINDNEST_${l.toUpperCase()}`, file: `channels/MindNestTales/credentials/token_${l}.json`, expect: new RegExp(`${n}.*mind ?nest`, "i"), old: "mindnest_tales_scheduler.yml" }))
  ];
  const rootClient = ["youtube_client_secret.json", "channels/MindNestTales/youtube_client_secret.json"].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
  const done = [];
  for (const j of jobs) {
    const f = path.join(dir, j.file);
    if (!fs.existsSync(f)) { console.log(`  · ${j.id}: no ${j.file} on this PC — skipped (run colab-YT's authenticate script for it first)`); continue; }
    const raw = fs.readFileSync(f, "utf8");
    const t = JSON.parse(raw);
    const local = path.join(path.dirname(f), "..", "youtube_client_secret.json");
    const clientFile = [path.join(path.dirname(f), "youtube_client_secret.json"), local, rootClient].find((x) => x && fs.existsSync(x));
    const c = t.client_id && t.client_secret ? { client_id: t.client_id, client_secret: t.client_secret } : clientFile ? clientOf(fs.readFileSync(clientFile, "utf8")) : null;
    if (!c || !t.refresh_token) { console.log(`  ✖ ${j.id}: token has no refresh_token/client — re-run colab-YT's authenticate script`); continue; }
    const auth = new google.auth.OAuth2(c.client_id, c.client_secret, "http://localhost");
    auth.setCredentials({ refresh_token: t.refresh_token });
    let name;
    try { name = await channelName(auth); } catch (e) { console.log(`  ✖ ${j.id}: token rejected by Google (${e.message}) — re-authenticate in colab-YT`); continue; }
    if (!j.expect.test(name)) { console.log(`  ✖ ${j.id}: ${j.file} opens "${name}" — not this channel, skipped`); continue; }
    console.log(`  ✔ ${j.id}: "${name}"`);
    setSecret(`YT_TOKEN_${j.id}`, raw);
    if (!t.client_id && clientFile) setSecret(`YT_TOKEN_${j.id}_CLIENT`, fs.readFileSync(clientFile, "utf8"));
    done.push(j);
  }
  const start = arg("start");
  for (const j of done) {
    if (start) setVar(`START_${j.id}`, start);
    if (flag("live")) setVar(`LIVE_${j.id}`, "true");
  }
  if (flag("disable-old")) {
    if (!flag("live")) throw new Error("--disable-old needs --live (otherwise those channels would post nowhere)");
    for (const wf of [...new Set(done.map((j) => j.old))]) {
      try { gh(["workflow", "disable", wf, "--repo", "Winplaybox/colab-YT"]); console.log(`  ✔ colab-YT ${wf} disabled`); } catch { console.log(`  · colab-YT ${wf}: already disabled or not found`); }
    }
  }
  setVar("AUTO_PUBLISH", "true");
  console.log(`\nDone: ${done.length} channel(s) connected.${flag("live") ? "" : " Next: set LIVE_<ID>=true (or re-run with --live --disable-old)."}`);
}

async function main() {
  gh(["auth", "status"]);
  const colabDir = arg("colab-dir");
  if (colabDir) { await fromColab(colabDir); return; }
  if (flag("only-jasoos")) {
    const clientPath = arg("client");
    if (!clientPath) throw new Error("--client path/to/client_secret.json is required");
    const clientJson = fs.readFileSync(clientPath, "utf8");
    clientOf(clientJson);
    let tokens = null;
    for (let attempt = 0; attempt < 3 && !tokens; attempt++) tokens = await consent(clientJson, "Jasoos Bhai", 53682 + attempt);
    if (!tokens) throw new Error("Could not connect Jasoos Bhai Cases");
    setSecret("YT_TOKEN_LIAR_LINEUP", JSON.stringify(tokens));
    // The refresh token only works with the OAuth client that issued it, so store that client next to it.
    setSecret("YT_TOKEN_LIAR_LINEUP_CLIENT", clientJson);
    console.log("\nDone: YT_TOKEN_LIAR_LINEUP and YT_TOKEN_LIAR_LINEUP_CLIENT set. Next: set repo variables START_LIAR_LINEUP and LIVE_LIAR_LINEUP=true.");
    return;
  }
  if (!flag("only-ebs")) {
    const clientPath = arg("client");
    if (!clientPath) throw new Error("--client path/to/client_secret.json is required");
    const clientJson = fs.readFileSync(clientPath, "utf8");
    clientOf(clientJson);
    setSecret("YT_CLIENT_SECRET_JSON", clientJson);

    for (const [secret, expected] of [["YT_TOKEN_CHAKRA_PUZZLE", "Chakra Puzzle"], ["YT_TOKEN_KAALI_PEELI_CHASE", "Kaali Peeli Chase"]]) {
      let tokens = null;
      for (let attempt = 0; attempt < 3 && !tokens; attempt++) tokens = await consent(clientJson, expected, 53682 + attempt);
      if (!tokens) throw new Error(`Could not connect ${expected}`);
      setSecret(secret, JSON.stringify(tokens));
    }
  }

  const ebsTokenPath = arg("ebs-token");
  if (ebsTokenPath) {
    const raw = fs.readFileSync(ebsTokenPath, "utf8");
    const t = JSON.parse(raw);
    if (!t.client_id || !t.client_secret || !t.refresh_token) throw new Error("token.json must contain client_id, client_secret and refresh_token");
    const auth = new google.auth.OAuth2(t.client_id, t.client_secret, "http://localhost");
    auth.setCredentials({ refresh_token: t.refresh_token });
    const name = await channelName(auth);
    console.log(`\nToken ${ebsTokenPath} opens: "${name}"`);
    if (!/epic bharat/i.test(name)) throw new Error(`That token is for "${name}", not Epic Bharat`);
    setSecret("YT_TOKEN_EPICBHARATSAGA", raw);
  }

  const ebsClientPath = arg("ebs-client");
  if (ebsClientPath) {
    const ebsClient = fs.readFileSync(ebsClientPath, "utf8");
    clientOf(ebsClient);
    let tokens = null;
    for (let attempt = 0; attempt < 3 && !tokens; attempt++) tokens = await consent(ebsClient, "Epic Bharat", 53692 + attempt, "epicbharat.official@gmail.com");
    if (!tokens) throw new Error("Could not connect Epic Bharat");
    setSecret("YT_TOKEN_EPICBHARATSAGA", JSON.stringify(tokens));
    setSecret("YT_TOKEN_EPICBHARATSAGA_CLIENT", ebsClient);
  }

  const ebsDir = arg("ebs-dir");
  if (ebsDir) {
    const ebsClient = fs.readFileSync(path.join(ebsDir, "client_secret.json"), "utf8");
    const ebsToken = JSON.parse(fs.readFileSync(path.join(ebsDir, "token.json"), "utf8"));
    const c = clientOf(ebsClient);
    const auth = new google.auth.OAuth2(c.client_id, c.client_secret, (c.redirect_uris ?? ["http://localhost"])[0]);
    auth.setCredentials(ebsToken);
    const name = await channelName(auth);
    console.log(`\nExisting token in ${ebsDir} belongs to: "${name}"`);
    if (!/epic bharat/i.test(name)) throw new Error(`That token is for "${name}", not Epic Bharat. Re-auth it with: node scripts/publish/auth-youtube.mjs <client>`);
    setSecret("YT_TOKEN_EPICBHARATSAGA", JSON.stringify(ebsToken));
    setSecret("YT_TOKEN_EPICBHARATSAGA_CLIENT", ebsClient);
  }

  if (flag("ebs-silent")) setVar("EBS_ALLOW_SILENT", "true");
  setVar("AUTO_PUBLISH", "true");
  console.log("\nDone. Publishing starts on the start dates in channels/channels.ts. Meta (Instagram/Facebook) secrets are separate — see docs/CHANNELS.md.");
}

main().catch((e) => { console.error(`\n✖ ${e.message}`); process.exit(1); });
