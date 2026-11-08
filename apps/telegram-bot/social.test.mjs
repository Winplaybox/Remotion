import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { SOCIAL_CHANNELS, looksLike, metaAuthUrl, pinterestAuthUrl, readState, seal, signState, tokenKey, unseal, workerSig } from "./social-connect.mjs";

test("tokens are sealed with AES-GCM and only the right key opens them", () => {
  const k = tokenKey("service-role-1");
  const s = seal("EAAG-page-token", k);
  assert.match(s, /^v1:/);
  assert.doesNotMatch(s, /EAAG/);
  assert.equal(unseal(s, k), "EAAG-page-token");
  assert.notEqual(seal("x", k), seal("x", k)); // random IV
  assert.throws(() => unseal(s, tokenKey("other")));
  const t = Buffer.from(s.slice(3), "base64"); t[t.length - 1] ^= 1;
  assert.throws(() => unseal(`v1:${t.toString("base64")}`, k));
  assert.equal(seal("", k), "");
});

test("OAuth state is signed and expires after 15 min", () => {
  const k = Buffer.alloc(32, 7);
  const st = signState({ p: "meta", c: "chakra-puzzle", n: "abc" }, k, 1_000_000);
  assert.equal(readState(st, k, 1_000_000 + 60_000).c, "chakra-puzzle");
  assert.equal(readState(st, k, 1_000_000 + 16 * 60_000), null);
  assert.equal(readState(st.replace(/^./, "x"), k, 1_000_000), null);
  assert.equal(readState(st, Buffer.alloc(32, 8), 1_000_000), null);
  assert.equal(readState("junk", k), null);
});

test("auth URLs carry the redirect, state and scopes", () => {
  const m = new URL(metaAuthUrl({ appId: "1", redirect: "https://bot/admin/connect/meta/callback", state: "S" }));
  assert.equal(m.searchParams.get("redirect_uri"), "https://bot/admin/connect/meta/callback");
  assert.match(m.searchParams.get("scope"), /instagram_content_publish/);
  const c = new URL(metaAuthUrl({ appId: "1", redirect: "https://bot/cb", state: "S", configId: "99" }));
  assert.equal(c.searchParams.get("config_id"), "99");
  assert.equal(c.searchParams.get("scope"), null);
  const p = new URL(pinterestAuthUrl({ appId: "2", redirect: "https://bot/admin/connect/pinterest/callback", state: "S" }));
  assert.match(p.searchParams.get("scope"), /pins:write/);
  assert.equal(p.searchParams.get("state"), "S");
});

test("page/board names match their channel", () => {
  assert.ok(looksLike("Chakra Puzzle", "Chakra Puzzle"));
  assert.ok(looksLike("chakrapuzzle", "Chakra Puzzle"));
  assert.ok(looksLike("Kaali Peeli Chase Official", "Kaali Peeli Chase"));
  assert.ok(!looksLike("Epic Bharat", "Chakra Puzzle"));
  assert.ok(!looksLike("", "Chakra Puzzle"));
});

test("social channels match channels/publish-targets.json", () => {
  const targets = JSON.parse(fs.readFileSync(new URL("../../channels/publish-targets.json", import.meta.url), "utf8"));
  assert.deepEqual(SOCIAL_CHANNELS.map((c) => c.id), targets.map((t) => t.id));
});

test("worker signature is bound to channel and time", () => {
  assert.notEqual(workerSig("k", "chakra-puzzle", 1), workerSig("k", "kaali-peeli-chase", 1));
  assert.notEqual(workerSig("k", "chakra-puzzle", 1), workerSig("k", "chakra-puzzle", 2));
});
