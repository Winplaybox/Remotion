import fs from "node:fs";
import { google } from "googleapis";
import type { PostMeta } from "../../channels/channels";

interface UploadArgs { video: string; meta: PostMeta; publishAt: string; tokenJson?: string | undefined; clientSecretJson?: string | undefined }

/** Upload as private + scheduled publishAt, then read back to verify the schedule. Returns the video ID. */
export function youtubeClient(tokenJson?: string, clientSecretJson?: string) {
  if (!tokenJson) throw new Error("YouTube: missing the channel token secret");
  const t = JSON.parse(tokenJson);
  // Python google-auth "authorized_user" tokens (colab-YT) carry their own client_id/client_secret.
  const conf = clientSecretJson ? JSON.parse(clientSecretJson) : {};
  const c = t.client_id && t.client_secret ? { client_id: t.client_id, client_secret: t.client_secret } : conf.installed ?? conf.web ?? conf;
  if (!c.client_id || !c.client_secret) throw new Error("YouTube: no OAuth client (set YT_CLIENT_SECRET_JSON or use a token that includes client_id/client_secret)");
  const auth = new google.auth.OAuth2(c.client_id, c.client_secret, "http://localhost");
  const access = t.access_token ?? (typeof t.token === "string" ? t.token : undefined);
  auth.setCredentials({ refresh_token: t.refresh_token, access_token: access, token_type: "Bearer" });
  return google.youtube({ version: "v3", auth });
}

export async function uploadYouTube({ video, meta, publishAt, tokenJson, clientSecretJson }: UploadArgs): Promise<string> {
  const yt = youtubeClient(tokenJson, clientSecretJson);

  // Idempotent: if a video with this exact title is already on the channel (e.g. scheduled by a manual run), reuse it.
  const ch = await yt.channels.list({ part: ["contentDetails"], mine: true });
  const uploads = ch.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (uploads) {
    const recent = await yt.playlistItems.list({ part: ["snippet"], playlistId: uploads, maxResults: 50 });
    const dup = recent.data.items?.find((i) => i.snippet?.title === meta.title.slice(0, 100));
    const dupId = dup?.snippet?.resourceId?.videoId;
    if (dupId) { console.log(`[YouTube] already uploaded as ${dupId}, skipping`); return dupId; }
  }

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
