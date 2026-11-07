/**
 * One command, on YOUR PC, that connects every channel to GitHub Actions.
 * Tokens go straight from Google into GitHub secrets via the `gh` CLI. They are never printed or written to disk.
 *
 *   gh auth login                                   # once, if not already logged in
 *   node scripts/publish/setup-secrets.mjs \
 *     --client  C:/path/client_secret.json         # OAuth client for the puzzle channels (YouTube Data API v3 enabled)
 *     --ebs-dir C:/Users/sagar/Desktop/Project/daily-devotional-shorts   # reuses the existing EpicBharatSaga client_secret.json + token.json
 *     [--ebs-client C:/path/client_secret.json]    # OR: fresh OAuth for EpicBharatSaga (sign in as epicbharat.official)
 *     [--only-ebs]                                 # skip the puzzle channels
 *     [--ebs-silent]                               # let EpicBharatSaga post with captions until IndicF5 narration exists
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

function gh(argv, input) {
  return execFileSync("gh", argv, { input, stdio: [input === undefined ? "inherit" : "pipe", "pipe", "inherit"], shell: process.platform === "win32" }).toString().trim();
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

async function main() {
  gh(["auth", "status"]);
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
