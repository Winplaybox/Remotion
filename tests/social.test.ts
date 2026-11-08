import { fanout, socialCopy, type Platform, type SocialResult } from "../scripts/publish/social";
import { CHANNELS } from "../channels/channels";

jest.mock("../scripts/publish/meta", () => ({
  hostVideo: jest.fn(async (_f: string, key: string) => `https://cdn.example/${key}.mp4`),
  instagram: jest.fn(async () => "ig-1"),
  facebook: jest.fn(async () => "fb-1")
}));
jest.mock("node:child_process", () => ({ execFileSync: jest.fn(() => Buffer.from("20\n")) }));

const meta = jest.requireMock("../scripts/publish/meta");
const cfg = CHANNELS["chakra-puzzle"];

describe("social copy", () => {
  it("every platform points back to YouTube", () => {
    const c = socialCopy(cfg, cfg.meta(3), "XYZ");
    expect(c.instagram).toContain("@ChakraPuzzle");
    expect(c.facebook).toContain("https://youtube.com/shorts/XYZ");
    expect(c.pinterest.link).toBe("https://youtube.com/shorts/XYZ");
    expect(c.pinterest.title).toContain("Puzzle #3");
    expect(c.pinterest.title.length).toBeLessThanOrEqual(100);
  });
});

describe("social fan-out", () => {
  const env = { ...process.env };
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate"] });
    jest.setSystemTime(Date.parse("2026-11-09T01:00:00Z"));
    Object.assign(process.env, { META_CHAKRA_PAGE_TOKEN: "t", META_CHAKRA_IG_USER_ID: "ig", META_CHAKRA_PAGE_ID: "pg" });
    delete process.env.PINTEREST_APP_ID;
    jest.clearAllMocks();
  });
  afterEach(() => { jest.useRealTimers(); process.env = { ...env }; });

  it("posts Instagram at +5 and Facebook teaser at +10 min after YouTube, records each, skips Pinterest without secrets", async () => {
    const recorded: [Platform, SocialResult][] = [];
    const run = fanout({ cfg, meta: cfg.meta(3), video: "/tmp/v.mp4", youtubeId: "XYZ", publishAt: "2026-11-09T01:00:00Z", key: "chakra-puzzle/post-003", done: {}, record: async (p, r) => { recorded.push([p, r]); } });
    await jest.advanceTimersByTimeAsync(4 * 60_000);
    expect(meta.instagram).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(60_000 + 10);
    expect(meta.instagram).toHaveBeenCalledWith("https://cdn.example/chakra-puzzle/post-003.mp4", expect.stringContaining("@ChakraPuzzle"), "t", "ig");
    expect(meta.facebook).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(5 * 60_000 + 10);
    expect(await run).toBe(0);
    expect(meta.facebook).toHaveBeenCalledWith("https://cdn.example/chakra-puzzle/post-003-teaser.mp4", expect.stringContaining("youtube.com/shorts/XYZ"), "t", "pg");
    expect(recorded.map(([p, r]) => `${p}:${r.ok}`)).toEqual(["instagram:true", "facebook:true"]);
  });

  it("never re-posts a platform that already succeeded or failed for this slot", async () => {
    const at = new Date().toISOString();
    const failed = await fanout({ cfg, meta: cfg.meta(3), video: "/tmp/v.mp4", youtubeId: "XYZ", publishAt: "2026-11-08T20:00:00Z", key: "k",
      done: { instagram: { ok: true, id: "ig-0", at }, facebook: { ok: false, error: "x", at } }, record: async () => undefined });
    expect(failed).toBe(0);
    expect(meta.instagram).not.toHaveBeenCalled();
    expect(meta.facebook).not.toHaveBeenCalled();
  });

  it("a failure is recorded and counted, the next platform still runs", async () => {
    meta.instagram.mockRejectedValueOnce(new Error("token expired"));
    const recorded: string[] = [];
    const n = fanout({ cfg, meta: cfg.meta(3), video: "/tmp/v.mp4", youtubeId: "XYZ", publishAt: "2026-11-08T20:00:00Z", key: "k", done: {}, record: async (p, r) => { recorded.push(`${p}:${r.ok}:${r.error ?? ""}`); } });
    await jest.advanceTimersByTimeAsync(20 * 60_000);
    expect(await n).toBe(1);
    expect(recorded).toEqual(["instagram:false:token expired", "facebook:true:"]);
  });

  it("a Pinterest app on Trial access is skipped, not recorded as a failure", async () => {
    Object.assign(process.env, { PINTEREST_APP_ID: "a", PINTEREST_APP_SECRET: "b", PINTEREST_CHAKRA_REFRESH_TOKEN: "r", PINTEREST_CHAKRA_BOARD_ID: "brd" });
    const at = new Date().toISOString();
    jest.requireActual<typeof import("node:fs")>("node:fs").writeFileSync("/tmp/v.pin.jpg", "x");
    const realFetch = global.fetch;
    global.fetch = jest.fn(async (url: string) => String(url).includes("/oauth/token")
      ? new Response(JSON.stringify({ access_token: "tok" }), { status: 200 })
      : new Response(JSON.stringify({ message: "Apps with Trial access may not create Pins in production" }), { status: 403 })) as unknown as typeof fetch;
    const recorded: string[] = [];
    const n = fanout({ cfg, meta: cfg.meta(3), video: "/tmp/v.mp4", youtubeId: "XYZ", publishAt: "2026-11-08T20:00:00Z", key: "k",
      done: { instagram: { ok: true, at }, facebook: { ok: true, at } }, record: async (p) => { recorded.push(p); } });
    await jest.advanceTimersByTimeAsync(20 * 60_000);
    global.fetch = realFetch;
    expect(await n).toBe(0);
    expect(recorded).toEqual([]);
  });
});
