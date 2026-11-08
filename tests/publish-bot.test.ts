jest.mock("../scripts/publish/youtube", () => ({ uploadYouTube: jest.fn(async () => "yt123") }));
jest.mock("../scripts/publish/meta", () => ({ publishMeta: jest.fn(async (a: { igUserId?: string }) => { if (a.igUserId) throw new Error("IG token expired"); }) }));
jest.mock("../scripts/telegram/storage", () => ({ fetchFile: jest.fn(async (_r: string, local: string) => { require("node:fs").writeFileSync(local, "x"); }) }));

import { uploadYouTube } from "../scripts/publish/youtube";
import { publishMeta } from "../scripts/publish/meta";
import { publishOne } from "../scripts/telegram/publish-bot";

const base = { code: "PUB-00001", status: "PUBLISHING", target: "chakra-puzzle", publish_at: "2026-11-09T03:30:00Z", title: "Holi kyun?", description: "D", hashtags: ["#shorts", "#holi"], requested_by: 42, results: {}, job: { code: "JOB-00001", chat_id: 42, output: { file: "jobs/JOB-00001/video.mp4" } } };

describe("bot publishing worker", () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.YT_TOKEN_CHAKRA_PUZZLE = "{}"; process.env.META_CHAKRA_PAGE_TOKEN = "t"; process.env.META_CHAKRA_IG_USER_ID = "ig"; process.env.META_CHAKRA_PAGE_ID = "pg"; });

  it("uploads YouTube scheduled at publish_at, records per-platform results, one failure does not stop others", async () => {
    const r = await publishOne({ ...base, platforms: ["youtube", "instagram", "facebook"] });
    expect(r).toEqual({ youtube: { ok: true, id: "yt123" }, instagram: { ok: false, error: "IG token expired" }, facebook: { ok: true, id: "published" } });
    expect((uploadYouTube as jest.Mock).mock.calls[0][0]).toMatchObject({ publishAt: "2026-11-09T03:30:00Z", meta: { title: "Holi kyun?", tags: ["shorts", "holi", "shorts"] } });
  });

  it("retries never repeat a platform that already succeeded", async () => {
    const r = await publishOne({ ...base, platforms: ["youtube", "instagram"], results: { youtube: { ok: true, id: "yt123" } } });
    expect(uploadYouTube).not.toHaveBeenCalled();
    expect(Object.keys(r)).toEqual(["instagram"]);
  });

  it("missing secrets or unknown target fail cleanly without uploading", async () => {
    delete process.env.META_CHAKRA_PAGE_ID;
    expect((await publishOne({ ...base, platforms: ["facebook"] })).facebook).toEqual({ ok: false, error: "META_CHAKRA facebook secrets not set" });
    expect(publishMeta).not.toHaveBeenCalled();
    expect((await publishOne({ ...base, target: "nope", platforms: ["youtube"] })).youtube?.ok).toBe(false);
  });
});
