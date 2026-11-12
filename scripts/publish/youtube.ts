import fs from "node:fs";
import { google } from "googleapis";
import type { PostMeta } from "../../channels/channels";

interface UploadArgs { video: string; meta: PostMeta; publishAt: string; tokenJson?: string | undefined; clientSecretJson?: string | undefined }

/** Upload as private + scheduled publishAt, then read back to verify the schedule. Returns the video ID. */
export function youtubeClient(tokenJson?: string, clientSecretJson?: string) {
  return google.youtube({ version: "v3", auth: youtubeAuth(tokenJson, clientSecretJson) });
}

/** OAuth client for a channel token (also used for YouTube Analytics). */
export function youtubeAuth(tokenJson?: string, clientSecretJson?: string) {
  if (!tokenJson) throw new Error("YouTube: missing the channel token secret");
  const t = JSON.parse(tokenJson);
  // Python google-auth "authorized_user" tokens (colab-YT) carry their own client_id/client_secret.
  const conf = clientSecretJson ? JSON.parse(clientSecretJson) : {};
  const c = t.client_id && t.client_secret ? { client_id: t.client_id, client_secret: t.client_secret } : conf.installed ?? conf.web ?? conf;
  if (!c.client_id || !c.client_secret) throw new Error("YouTube: no OAuth client (set YT_CLIENT_SECRET_JSON or use a token that includes client_id/client_secret)");
  const auth = new google.auth.OAuth2(c.client_id, c.client_secret, "http://localhost");
  const access = t.access_token ?? (typeof t.token === "string" ? t.token : undefined);
  auth.setCredentials({ refresh_token: t.refresh_token, access_token: access, token_type: "Bearer" });
  return auth;
}

/** Slot time, or ~15 min from now when the slot has already passed (YouTube needs publishAt in the future). */
function targetTime(publishAt: string): Date {
  const at = new Date(publishAt);
  return at.getTime() < Date.now() + 10 * 60_000 ? new Date(Date.now() + 15 * 60_000) : at;
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
    if (dupId) {
      // Still private and scheduled for a different time (e.g. queued for a later start date)? Move it to this slot.
      const v = (await yt.videos.list({ part: ["status"], id: [dupId] })).data.items?.[0]?.status;
      const want = targetTime(publishAt);
      if (v?.privacyStatus === "private" && v.publishAt && Math.abs(Date.parse(v.publishAt) - want.getTime()) > 5 * 60_000) {
        try {
          await yt.videos.update({ part: ["status"], requestBody: { id: dupId, status: { privacyStatus: "private", publishAt: want.toISOString(), selfDeclaredMadeForKids: false } } });
          console.log(`[YouTube] already uploaded as ${dupId}; schedule moved ${v.publishAt} -> ${want.toISOString()}`);
        } catch (e) {
          console.warn(`[YouTube] already uploaded as ${dupId}, scheduled ${v.publishAt}; could not move it (${(e as Error).message}) — change it in YouTube Studio`);
        }
      } else console.log(`[YouTube] already uploaded as ${dupId} (${v?.privacyStatus ?? "?"}${v?.publishAt ? `, publishAt ${v.publishAt}` : ""}), skipping`);
      return dupId;
    }
  }

  const at = targetTime(publishAt);
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
