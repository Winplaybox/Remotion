import { filesOf } from "../scripts/telegram/maintenance";

describe("bot maintenance retention", () => {
  it("collects video, thumbnail and every short, skipping empty keys", () => {
    expect(filesOf({ code: "JOB-1", file: "jobs/JOB-1/video.mp4", thumb: "", shorts: null })).toEqual(["jobs/JOB-1/video.mp4"]);
    expect(filesOf({ code: "JOB-2", file: null, thumb: null, shorts: [{ file: "jobs/JOB-2/short-1.mp4" }, { file: "" }, {}] })).toEqual(["jobs/JOB-2/short-1.mp4"]);
    expect(filesOf({ code: "JOB-3", file: "a.mp4", thumb: "a.jpg", shorts: [] })).toEqual(["a.mp4", "a.jpg"]);
  });
});
