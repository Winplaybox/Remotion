import fs from "node:fs";
import { google } from "googleapis";
import type { PostMeta } from "../../channels/channels";

interface UploadArgs { video: string; meta: PostMeta; publishAt: string; tokenJson?: string | undefined; clientSecretJson?: string | undefined }

/** Upload as private + scheduled publishAt, then read back to verify the schedule. Returns the video ID. */
export async function uploadYouTube({ video, meta, publishAt, tokenJson, clientSecretJson }: UploadArgs): Promise<string> {
  if (!tokenJson || !clientSecretJson) throw new Error("YouTube: missing YT_CLIENT_SECRET_JSON or the channel token secret");
  const conf = JSON.parse(clientSecretJson);
  const c = conf.installed ?? conf.web ?? conf;
  const auth = new google.auth.OAuth2(c.client_id, c.client_secret, (c.redirect_uris ?? ["http://localhost"])[0]);
  const t = JSON.parse(tokenJson);
  auth.setCredentials({ refresh_token: t.refresh_token, access_token: t.access_token, expiry_date: t.expiry_date, token_type: "Bearer" });
  const yt = google.youtube({ version: "v3", auth });

  let at = new Date(publishAt);
  if (at.getTime() < Date.now() + 10 * 60_000) at = new Date(Date.now() + 15 * 60_000); // slot already passed -> publish in 15 min
  const res = await yt.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: { title: meta.title.slice(0, 100), description: meta.description, tags: meta.tags, categoryId: meta.categoryId, defaultLanguage: meta.language, defaultAudioLanguage: meta.language },
      status: { privacyStatus: "private", publishAt: at.toISOString(), selfDeclaredMadeForKids: false }
    },
    media: { body: fs.createReadStream(video) }
  });
  const id = res.data.id;
  if (!id) throw new Error("YouTube: upload returned no video id");
  const check = await yt.videos.list({ part: ["status"], id: [id] });
  const st = check.data.items?.[0]?.status;
  if (st?.privacyStatus !== "private" || !st.publishAt) throw new Error(`YouTube: ${id} uploaded but schedule not confirmed`);
  return id;
}
