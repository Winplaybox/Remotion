/**
 * One-time, on your own PC: get a YouTube OAuth token for ONE channel.
 *   node scripts/publish/auth-youtube.mjs path/to/client_secret.json
 * Pick the brand channel (e.g. Chakra Puzzle) on Google's consent screen.
 * Paste the printed JSON into the GitHub secret for that channel (YT_TOKEN_CHAKRA_PUZZLE, ...).
 */
import fs from "node:fs";
import http from "node:http";
import { exec } from "node:child_process";
import { google } from "googleapis";

const secretPath = process.argv[2] ?? "client_secret.json";
const conf = JSON.parse(fs.readFileSync(secretPath, "utf8"));
const c = conf.installed ?? conf.web;
const PORT = 53682;
const redirect = `http://localhost:${PORT}`;
const auth = new google.auth.OAuth2(c.client_id, c.client_secret, redirect);
const url = auth.generateAuthUrl({
  access_type: "offline",
  prompt: "consent select_account",
  scope: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube", "https://www.googleapis.com/auth/yt-analytics.readonly"]
});

http.createServer(async (req, res) => {
  const code = new URL(req.url, redirect).searchParams.get("code");
  if (!code) { res.end("no code"); return; }
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);
  const me = await google.youtube({ version: "v3", auth }).channels.list({ part: ["snippet"], mine: true });
  const name = me.data.items?.[0]?.snippet?.title ?? "?";
  res.end(`Token created for channel: ${name}. You can close this tab.`);
  console.log(`\nChannel: ${name}\nPaste this into the GitHub secret for that channel:\n`);
  console.log(JSON.stringify(tokens));
  process.exit(0);
}).listen(PORT, () => {
  console.log(`Open this URL (choose the right channel):\n${url}\n`);
  exec(process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`);
});
