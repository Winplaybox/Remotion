import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import { unseal, workerSig } from "../scripts/publish/social-accounts";

it("workers open tokens sealed by the bot server, with the same signature scheme", () => {
  const out = execFileSync("node", ["--input-type=module", "-e",
    `import { seal, tokenKey, workerSig } from "./apps/telegram-bot/social-connect.mjs"; console.log(JSON.stringify({ s: seal("tok-123", tokenKey("sk")), w: workerSig("sk", "chakra-puzzle", 5) }));`]).toString();
  const { s, w } = JSON.parse(out);
  expect(unseal(s, crypto.createHash("sha256").update("social-tokens:sk").digest())).toBe("tok-123");
  expect(workerSig("sk", "chakra-puzzle", 5)).toBe(w);
});

describe("metaCreds", () => {
  const seal = (s: string) => {
    const k = crypto.createHash("sha256").update("social-tokens:sk").digest(), iv = crypto.randomBytes(12);
    const c = crypto.createCipheriv("aes-256-gcm", k, iv), ct = Buffer.concat([c.update(s, "utf8"), c.final()]);
    return `v1:${Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64")}`;
  };
  const env = { ...process.env };
  const realFetch = global.fetch;
  let graphOk: Record<string, boolean>;
  beforeEach(() => {
    Object.assign(process.env, { SUPABASE_URL: "https://sb.test", SUPABASE_SERVICE_ROLE_KEY: "sk", T_PAGE_ID: "p-secret", T_IG_USER_ID: "ig-secret", T_PAGE_TOKEN: "secret-tok" });
    graphOk = { "secret-tok": false, "dash-tok": true };
    global.fetch = (async (url: string) => {
      if (url.includes("/rpc/videobot_social_get")) return new Response(JSON.stringify({ page_id: "p-dash", ig_user_id: "ig-dash", board_id: "", token_enc: seal("dash-tok"), refresh_enc: "", expires_at: null }));
      const tok = new URL(url).searchParams.get("access_token")!;
      return graphOk[tok] ? new Response(JSON.stringify({ id: "1" })) : new Response(JSON.stringify({ error: { code: 190, message: "Session has expired" } }), { status: 400 });
    }) as typeof fetch;
  });
  afterEach(() => { process.env = { ...env }; global.fetch = realFetch; });

  it("uses a working secret token", async () => {
    graphOk["secret-tok"] = true;
    const { metaCreds } = await import("../scripts/publish/social-accounts");
    expect(await metaCreds("chakra-puzzle", { metaSecretPrefix: "T" })).toMatchObject({ pageToken: "secret-tok", source: "secrets" });
  });

  it("falls back to the dashboard connection when the secret token has expired", async () => {
    const { metaCreds } = await import("../scripts/publish/social-accounts");
    expect(await metaCreds("chakra-puzzle", { metaSecretPrefix: "T" })).toMatchObject({ pageToken: "dash-tok", pageId: "p-dash", igUserId: "ig-dash", source: "dashboard" });
  });

  it("reports no account when every token is dead, instead of failing after the wait", async () => {
    graphOk["dash-tok"] = false;
    const { metaCreds } = await import("../scripts/publish/social-accounts");
    const m = await metaCreds("chakra-puzzle", { metaSecretPrefix: "T" });
    expect(m.pageToken).toBeUndefined();
    expect(m.source).toMatch(/expired/);
  });
});
