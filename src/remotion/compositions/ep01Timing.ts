/**
 * Frame durations generated from assets/audio/generated/ep01/manifest.json.
 * Regenerate by running automation/generate-narration.py, then update these
 * values and re-copy MP3s into public/audio/ep01/.
 */
export const EP01_BEATS = [
  { beat: 1, durationFrames: 284, audioFile: "beat-01.mp3" },
  { beat: 2, durationFrames: 415, audioFile: "beat-02.mp3" },
  { beat: 3, durationFrames: 526, audioFile: "beat-03.mp3" },
  { beat: 4, durationFrames: 395, audioFile: "beat-04.mp3" },
  { beat: 5, durationFrames: 410, audioFile: "beat-05.mp3" },
  { beat: 6, durationFrames: 403, audioFile: "beat-06.mp3" },
  { beat: 7, durationFrames: 337, audioFile: "beat-07.mp3" },
  { beat: 8, durationFrames: 325, audioFile: "beat-08.mp3" },
] as const;

export const EP01_CAPTIONS = [
  "Agar main tumse kahu ki ek machine ne, sirf 5 saal mein, wo kaam seekh liya jisme insaan ko sadiyo lagi — tum believe karoge?",
  "Aur sabse darawani baat? Ye sirf shuruat hai. Jo tum abhi dekhoge, usko Stanford ki official 2026 report ne record kiya hai.",
  "2019 mein AI ek photo tak sahi se pehchaan nahi sakti thi. 2024 mein, usne MMLU test mein 90% score kiya — matlab law, medicine, science ke sawalo mein almost insaan jaisa.",
  "Lekin yahi nahi — 2023 mein akele 149 naye AI models launch hue. Matlab har 2-3 din mein ek naya AI duniya mein aaya.",
  "Companies ne is race mein 67 billion dollar laga diye — sirf ek saal mein. Ye paisa kisi normal business mein nahi, balki ek hathiyaro ki race jaisa lag raha hai.",
  "Toh sawaal ye nahi ki AI kitni smart hai. Sawaal ye hai — agar yahi speed rahi, to 2030 tak tumhari job, tumhari padhai, sab kuch kaisa dikhega?",
  "Benchmarks khatam ho rahe hain — AI insaan se aage nikal chuki hai kai jagah. Ab asli sawaal competition nahi, control ka hai.",
  "Agar tumhe lagta hai ye sirf shuruat hai, to comment karo AI — aur follow karo, kyuki part 2 mein hum dikhayenge AI ki asli chhupi hui cost.",
] as const;

type OffsetsTuple = readonly [number, number, number, number, number, number, number, number];

export function computeOffsets(): OffsetsTuple {
  const result: number[] = [];
  let cursor = 0;
  for (const b of EP01_BEATS) {
    result.push(cursor);
    cursor += b.durationFrames;
  }
  return result as unknown as OffsetsTuple;
}

export const EP01_TOTAL_FRAMES = EP01_BEATS.reduce((sum, b) => sum + b.durationFrames, 0);
