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
