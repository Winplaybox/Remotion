import { parseCell, parseNumber } from "../channels/quiz";
import { CHANNELS } from "../channels/channels";
import { decide, replyText, revealedFn, MAX_AGE } from "../scripts/publish/engage";

describe("parseCell", () => {
  it.each([
    ["Row 5 #9", [5, 9]], ["row 5 number 9", [5, 9]], ["R5 N9", [5, 9]], ["r5 c9", [5, 9]], ["5 9", [5, 9]], ["5,9", [5, 9]],
    ["5th row 9th", [5, 9]], ["#9 row 5", [5, 9]], ["Row-5 No-9 mil gaya 😎", [5, 9]], ["row 5 no.9", [5, 9]], ["५ ९", [5, 9]]
  ])("%s", (t, want) => expect(parseCell(t, 20, 12)).toEqual(want));
  it("half / none / out of range", () => {
    expect(parseCell("5", 20, 12)).toBe("partial");
    expect(parseCell("row 5", 20, 12)).toBe("partial");
    expect(parseCell("nice puzzle 😂", 20, 12)).toBeNull();
    expect(parseCell("row 5 #30", 20, 12)).toBeNull();
  });
});

describe("parseNumber", () => {
  it.each([["#7", [7]], ["7", [7]], ["number 7", [7]], ["taxi 12 pe hai", [12]], ["no.3", [3]]])("%s", (t, want) => expect(parseNumber(t, 16)).toEqual(want));
  it("none / out of range", () => { expect(parseNumber("easy tha")).toBeNull(); expect(parseNumber("99")).toBeNull(); });
});

describe("decide", () => {
  const quiz = CHANNELS["chakra-puzzle"].quiz!;
  const now = Date.parse("2026-11-10T00:00:00Z");
  const c = (text: string, hoursAgo = 1) => ({ id: "c1", text, at: now - hoursAgo * 3600_000 });
  it("waits for the reveal before judging a guess", () => {
    expect(decide(c("row 5 #9"), quiz, [5, 9], false, now)).toBeNull();
    expect(decide(c("row 5 #9"), quiz, [5, 9], true, now)).toBe("correct");
    expect(decide(c("row 4 #9"), quiz, [5, 9], true, now)).toBe("wrong");
  });
  it("answers small talk and half answers at once, skips old and spam", () => {
    expect(decide(c("wow 🔥"), quiz, [5, 9], false, now)).toBe("hello");
    expect(decide(c("5"), quiz, [5, 9], false, now)).toBe("partial");
    expect(decide(c("wow", MAX_AGE.other / 3600_000 + 1), quiz, [5, 9], false, now)).toBeNull();
    expect(decide(c("sub 4 sub? check my channel https://x.y"), quiz, [5, 9], true, now)).toBeNull();
    expect(decide(c("   "), quiz, [5, 9], true, now)).toBeNull();
  });
});

describe("replyText", () => {
  const quiz = CHANNELS["kaali-peeli-chase"].quiz!;
  it("shows the answer, varies by comment and adds the YouTube tail on Meta", () => {
    const a = replyText("wrong", "a", quiz, [7], "instagram", "@KaaliPeeliChase");
    expect(a).toContain("#7");
    expect(a).toContain("@KaaliPeeliChase");
    const texts = new Set(["a", "b", "c", "d", "e", "f", "g", "h"].map((id) => replyText("hello", id, quiz, [7], "youtube", "@x")));
    expect(texts.size).toBeGreaterThan(1);
    expect(replyText("hello", "a", quiz, [7], "youtube", "@x")).not.toContain("@x");
  });
});

describe("revealedFn", () => {
  it("answer is out once the next post is live", () => {
    const r = revealedFn([{ n: 4, live: true }, { n: 5, live: true }, { n: 6, live: false }], 4);
    expect(r(4)).toBe(true);
    expect(r(5)).toBe(false);
    expect(r(2)).toBe(true); // before answerInNextFrom: answer in the same video
  });
});

describe("channel quiz keys match the answer comments", () => {
  it.each([["chakra-puzzle"], ["kaali-peeli-chase"]] as const)("%s", (id) => {
    const cfg = CHANNELS[id];
    for (const n of [4, 10, 18]) expect(cfg.answer!(n)).toContain(cfg.quiz!.label(cfg.quiz!.key(n)).replace(" · ", " · "));
  });
});
