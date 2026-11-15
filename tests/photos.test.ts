import { creditLines, creditsFor, photoKey, pickCommons } from "../scripts/photos/commons";
import { horrorTapeCount, horrorTapeForDay } from "../content/indian-horror-tapes/tapes";
import { trainBattleCount, trainBattleForDay } from "../content/alltrainreels/battles";
import { stickRiddleCount, stickRiddleForDay } from "../content/stickman/riddles";
import { StoryDioramaSchema } from "../engines/story-diorama/src/model";

const page = (title: string, license: string, w = 1600, h = 1067, index = 1) => ({
  index, title, imageinfo: [{ mime: "image/jpeg", width: w, height: h, thumburl: `https://x/${title}.jpg`, descriptionurl: `https://c/${title}`, extmetadata: { LicenseShortName: { value: license }, Artist: { value: "<a href='x'>Jane Doe</a>" } } }]
});

describe("Wikimedia Commons photos", () => {
  it("only free licences (no NC/ND), big enough, best-ranked first", () => {
    const hit = pickCommons([page("File:A.jpg", "CC BY-NC-SA 4.0", 1600, 1067, 1), page("File:B.jpg", "CC BY-SA 4.0", 800, 600, 2), page("File:C.jpg", "CC BY-SA 4.0", 2000, 1300, 4), page("File:D.jpg", "Public domain", 2000, 1300, 3)]);
    expect(hit?.title).toBe("File:D.jpg");
    expect(pickCommons([page("File:E.jpg", "CC BY-ND 2.0")])).toBeNull();
    expect(pickCommons([page("File:F.jpg", "CC BY-SA 3.0")])?.author).toBe("Jane Doe");
  });
  it("stable keys and credit lines with author, licence and link", () => {
    expect(photoKey(["Bhangarh Fort", "x"])).toBe("bhangarh-fort");
    const c = { key: "k", query: "q", title: "T.jpg", author: "Jane", license: "CC BY-SA 4.0", page: "https://c/T" };
    expect(creditLines([c])).toContain("T.jpg — Jane, CC BY-SA 4.0 — https://c/T");
    expect(creditLines([])).toBe("");
  });
  it("every tape and battle asks for real photos; drawn stand-ins are marked art", () => {
    for (let n = 1; n <= horrorTapeCount(); n++) {
      const p = horrorTapeForDay(n);
      expect(p.scenes.every((s) => (s.photos?.length ?? 0) === 1)).toBe(true);
      expect(p.scenes[0]!.layers.some((l) => l.art === true)).toBe(true);
      expect(creditsFor(p, {})).toEqual([]);
    }
    for (let n = 1; n <= trainBattleCount(); n++) {
      const p = trainBattleForDay(n);
      expect(p.scenes[0]!.photos).toHaveLength(2);
      expect(p.scenes[0]!.layers.filter((l) => l.kind === "prop" && l.prop === "train").every((l) => l.art === true)).toBe(true);
    }
  });
});

describe("stickman riddles (original rig)", () => {
  it("parse, end on the A/B/C AskOutro, fail closed", () => {
    for (let n = 1; n <= stickRiddleCount(); n++) {
      const p = stickRiddleForDay(n);
      expect(() => StoryDioramaSchema.parse(p)).not.toThrow();
      expect(p.ask!.options).toEqual(["A", "B", "C"]);
    }
    expect(() => stickRiddleForDay(stickRiddleCount() + 1)).toThrow(/not written/);
  });
});
