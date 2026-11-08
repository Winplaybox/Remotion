import fs from "node:fs";
import { CHANNELS } from "../channels/channels";

describe("bot publish targets", () => {
  const targets = JSON.parse(fs.readFileSync("channels/publish-targets.json", "utf8")) as { id: string; youtubeTokenSecret: string; metaSecretPrefix: string }[];
  it("every target is a configured channel with the same secrets", () => {
    for (const t of targets) {
      const c = (CHANNELS as Record<string, { youtubeTokenSecret: string; metaSecretPrefix: string }>)[t.id];
      expect(c).toBeDefined();
      expect(t.youtubeTokenSecret).toBe(c!.youtubeTokenSecret);
      expect(t.metaSecretPrefix).toBe(c!.metaSecretPrefix);
    }
  });
  it("ids fit in Telegram callback data", () => {
    for (const t of targets) expect(`pub:a:PUB-00001:${t.id}:yif:t09`.length).toBeLessThanOrEqual(64);
  });
});
