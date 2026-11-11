import { parseCell, parseNumber } from "../channels/quiz";
import { CHANNELS } from "../channels/channels";
import { decide, decideGeneric, likeDue, replyDue, replyText, revealedFn, MAX_AGE } from "../scripts/publish/engage";
import { blocked, tone } from "../channels/moderation";

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
    expect(decide(c("sub 4 sub? check my channel https://x.y"), quiz, [5, 9], true, now)).toBe("hide");
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

describe("moderation", () => {
  it.each(["chutiya video", "B.C kya hai ye", "ch*tiya", "f**k this", "fuuuuck", "teri maa ki", "M C", "bsdk", "earn money fast whatsapp me", "visit my channel"])("hides %s", (t) => expect(blocked(t)).not.toBeNull());
  it.each(["row 5 #9", "mast puzzle 🔥", "chod do yaar mushkil hai", "class mein dekha", "chakka maar diya", "suno", "become better", "assignment ke baad dekha", "Shukriya"])("keeps %s", (t) => expect(blocked(t)).toBeNull());
  it("extra blocked words from the dashboard", () => expect(blocked("ye bilkul pagal hai", ["pagal"])).toBe("pagal"));
  it("tone", () => {
    expect(tone("bakwas video")).toBe("negative");
    expect(tone("wow 🔥")).toBe("positive");
    expect(tone("hmm")).toBe("unclear");
  });
});

describe("decide: no wrong replies", () => {
  const quiz = CHANNELS["chakra-puzzle"].quiz!;
  const now = Date.parse("2026-11-10T00:00:00Z");
  const c = (text: string) => ({ id: "c1", text, at: now - 3600_000 });
  it("abuse is hidden, never answered — even with a correct guess", () => expect(decide(c("row 5 #9 chutiye"), quiz, [5, 9], true, now)).toBe("hide"));
  it("negative or unclear comments get no reply", () => {
    expect(decide(c("bakwas video"), quiz, [5, 9], true, now)).toBeNull();
    expect(decide(c("hmm"), quiz, [5, 9], true, now)).toBeNull();
  });
  it("numbers inside a long sentence are not judged", () => {
    expect(decide(c("maine 3 baar dekha phir bhi nahi mila 10 second kam hai yaar"), quiz, [5, 9], true, now)).toBeNull();
  });
  it("clear answers are judged", () => {
    expect(decide(c("Row 5 number 9 mil gaya bhai finally"), quiz, [5, 9], true, now)).toBe("correct");
    expect(decide(c("5 9"), quiz, [5, 9], true, now)).toBe("correct");
  });
});

describe("comment care timing + generic channels", () => {
  const T = 1_800_000_000_000, mk = (text: string, minAgo: number) => ({ id: "c", text, at: T - minAgo * 60_000 });
  it("likes after 30 min, replies after 60 min", () => {
    expect(likeDue(mk("nice", 29), T)).toBe(false);
    expect(likeDue(mk("nice", 30), T)).toBe(true);
    expect(replyDue(mk("nice", 59), T)).toBe(false);
    expect(replyDue(mk("nice", 60), T)).toBe(true);
  });
  it("non-quiz channels: thanks for friendly comments, nothing for empty, hide for abuse", () => {
    expect(decideGeneric(mk("Bahut mast video ❤️", 61), T)).toBe("thanks");
    expect(decideGeneric(mk("   ", 61), T)).toBeNull();
    expect(decideGeneric(mk("nice", 49 * 60), T)).toBeNull(); // too old for small talk
  });
});
