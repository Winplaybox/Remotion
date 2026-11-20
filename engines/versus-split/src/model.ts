import { z } from "zod";
import {
  AskOutroSchema,
  askOutro,
  askOutroSeconds,
  askOutroVoice
} from "../../ask-outro";
import type { VoiceLine } from "../../../channels/channels";

export const FPS = 30;

export const FighterSchema = z.object({
  name: z.string(),
  title: z.string(),
  franchise: z.string(), // "DBZ", "ONE PUNCH MAN", "POKEMON", "WWE", "NARUTO"
  color: z.string(),
  signatureMove: z.string(),
  signaturePower: z.number().min(50).max(100),
  speedStat: z.number().min(50).max(100),
  durabilityStat: z.number().min(50).max(100)
});

export const BattleRoundSchema = z.object({
  roundNo: z.number().int().min(1).max(3),
  name: z.string(), // "SIGNATURE ATTACK", "SPEED & AGILITY", "DURABILITY & POWER"
  statA: numberOrString(),
  statB: numberOrString(),
  win: z.enum(["a", "b", "tie"])
});

function numberOrString() {
  return z.union([z.number(), z.string()]);
}

export const VersusSplitSchema = z.object({
  voice: z.array(z.object({ src: z.string(), at: z.number().min(0) })).default([]),
  sound: z.boolean().default(true),
  brand: z.string(),
  handle: z.string(),
  postNo: z.number().int().min(1),
  fighterA: FighterSchema,
  fighterB: FighterSchema,
  rounds: z.array(BattleRoundSchema).length(3),
  winner: z.enum(["a", "b"]),
  climaxSeconds: z.number().positive(),
  playSeconds: z.number().positive(),
  introSeconds: z.number().min(0),
  prevAnswer: z.string(),
  askOutro: AskOutroSchema,
  verdictReason: z.string()
});
export type VersusSplit = z.infer<typeof VersusSplitSchema>;

interface BattlePreset {
  a: z.infer<typeof FighterSchema>;
  b: z.infer<typeof FighterSchema>;
  r1Name: string;
  r1A: string | number;
  r1B: string | number;
  r1Win: "a" | "b" | "tie";
  r2Name: string;
  r2A: string | number;
  r2B: string | number;
  r2Win: "a" | "b" | "tie";
  r3Name: string;
  r3A: string | number;
  r3B: string | number;
  r3Win: "a" | "b";
  winner: "a" | "b";
  voiceHook: string;
  verdictHi: string;
  verdictReason: string;
}

const BATTLES: BattlePreset[] = [
  {
    a: { name: "GOKU", title: "Ultra Instinct", franchise: "DRAGON BALL", color: "#3B82F6", signatureMove: "Kamehameha", signaturePower: 98, speedStat: 99, durabilityStat: 95 },
    b: { name: "SAITAMA", title: "Serious Mode", franchise: "ONE PUNCH MAN", color: "#EF4444", signatureMove: "Serious Punch", signaturePower: 99, speedStat: 94, durabilityStat: 99 },
    r1Name: "SIGNATURE ATTACK", r1A: "Kamehameha (98)", r1B: "Serious Punch (99)", r1Win: "b",
    r2Name: "COMBAT SPEED", r2A: "Instant Transmission", r2B: "Hypersonic Jump", r2Win: "a",
    r3Name: "INFINITE POWER", r3A: "God Ki Limit", r3B: "Broken Limiter", r3Win: "b",
    winner: "b",
    voiceHook: "गोकू बनाम सैतामा! ड्रैगन बॉल और वन पंच मैन का सबसे बड़ा मुकाबला!",
    verdictHi: "क्राउन सैतामा के सिर पर! बिना किसी सीमा के ताकत ने मैच जीत लिया!",
    verdictReason: "Saitama ka broken limiter infinite strength deta hai, isliye Serious Punch ne win li!"
  },
  {
    a: { name: "CHARIZARD", title: "Mega Charizard X", franchise: "POKEMON", color: "#F97316", signatureMove: "Blast Burn", signaturePower: 92, speedStat: 88, durabilityStat: 85 },
    b: { name: "BLASTOISE", title: "Mega Blastoise", franchise: "POKEMON", color: "#06B6D4", signatureMove: "Hydro Cannon", signaturePower: 95, speedStat: 80, durabilityStat: 94 },
    r1Name: "SPECIAL ATTACK", r1A: "Blast Burn 150", r1B: "Hydro Cannon 150", r1Win: "tie",
    r2Name: "AERIAL SPEED", r2A: "Mach 2 Flight", r2B: "Ground Stance", r2Win: "a",
    r3Name: "TYPE ADVANTAGE", r3A: "Fire / Dragon", r3B: "Mega Launcher Water", r3Win: "b",
    winner: "b",
    voiceHook: "मेगा चॉरिज़ार्ड बनाम मेगा ब्लास्टॉइज़! बचपन की सबसे बड़ी पोकेमोन फाइट!",
    verdictHi: "ब्लास्टॉइज़ को मिला ताज! हाइड्रो कैनन और टाइप एडवांटेज ने जीत पक्की की!",
    verdictReason: "Water type advantage aur Mega Launcher ne Blastoise ko edge diya!"
  },
  {
    a: { name: "UNDERTAKER", title: "The Deadman", franchise: "WWE", color: "#8B5CF6", signatureMove: "Tombstone Piledriver", signaturePower: 99, speedStat: 75, durabilityStat: 98 },
    b: { name: "JOHN CENA", title: "Franchise Player", franchise: "WWE", color: "#10B981", signatureMove: "Attitude Adjustment", signaturePower: 94, speedStat: 82, durabilityStat: 95 },
    r1Name: "SIGNATURE SLAM", r1A: "Tombstone 10/10", r1B: "AA Slam 9/10", r1Win: "a",
    r2Name: "STAMINA & PACE", r2A: "Slow Stalk", r2B: "Hustle Loyalty", r2Win: "b",
    r3Name: "WRESTLEMANIA STREAK", r3A: "21-0 Streak", r3B: "16x World Champ", r3Win: "a",
    winner: "a",
    voiceHook: "द अंडरटेकर बनाम जॉन सीना! डब्ल्यूडब्ल्यूई इतिहास की दो सबसे बड़ी लेजेंड्स आमने-सामने!",
    verdictHi: "अंडरटेकर बने विनर! टूंबस्टोन पाइलड्राइवर और रेसलमेनिया स्ट्रीक अजेय है!",
    verdictReason: "Undertaker ki WrestleMania presence aur Tombstone Piledriver deadly tha!"
  },
  {
    a: { name: "NARUTO", title: "Baryon Mode", franchise: "NARUTO", color: "#F59E0B", signatureMove: "Rasenshuriken", signaturePower: 96, speedStat: 98, durabilityStat: 94 },
    b: { name: "SASUKE", title: "Rinnegan Master", franchise: "NARUTO", color: "#6366F1", signatureMove: "Indra Arrow", signaturePower: 95, speedStat: 97, durabilityStat: 92 },
    r1Name: "JUTSU CLASH", r1A: "Super Rasengan", r1B: "Chidori Stream", r1Win: "a",
    r2Name: "EYE TECHNIQUES", r2A: "Sage Sensory", r2B: "Amenotejikara Swap", r2Win: "b",
    r3Name: "LIFETIME CHAKRA", r3A: "Kurama Baryon Life", r3B: "Six Paths Rinnegan", r3Win: "a",
    winner: "a",
    voiceHook: "नारुतो बेरियन मोड बनाम सासुके रिन्नेगन! हिडन लीफ विलेज की आखिरी जंग!",
    verdictHi: "नारुतो के सिर पर क्राउन! बेरियन मोड की बेजोड़ स्पीड ने फैसला किया!",
    verdictReason: "Baryon Mode ki raw energy aur speed ne Sasuke ke Rinnegan ko overwhelm kiya!"
  },
  {
    a: { name: "LUFFY", title: "Gear 5 Nika", franchise: "ONE PIECE", color: "#EC4899", signatureMove: "Bajrang Gun", signaturePower: 98, speedStat: 92, durabilityStat: 97 },
    b: { name: "ZORO", title: "King of Hell", franchise: "ONE PIECE", color: "#10B981", signatureMove: "Ashura 9-Sword", signaturePower: 94, speedStat: 95, durabilityStat: 94 },
    r1Name: "RAW DESTRUCTION", r1A: "Island Sized Fist", r1B: "Three Thousand Worlds", r1Win: "a",
    r2Name: "SWORD MASTERY", r2A: "Rubber Bending", r2B: "Advanced Conqueror", r2Win: "b",
    r3Name: "SUN GOD AWAKENING", r3A: "Toon Physics Nika", r3B: "Demon Aura", r3Win: "a",
    winner: "a",
    voiceHook: "लफी गियर फाइव बनाम जोरो किंग ऑफ हेल! स्ट्रॉ हैट समुद्री डाकुओं का महामुकाबला!",
    verdictHi: "लफी बने किंग! गियर फाइव की कार्टून फिजिक्स को कोई तलवार नहीं रोक पाई!",
    verdictReason: "Gear 5 Nika ki reality-bending rubber physics ne Bajrang Gun se win dilayi!"
  },
  {
    a: { name: "IRON MAN", title: "Mark 85 Nanotech", franchise: "MARVEL", color: "#DC2626", signatureMove: "Nano Repulsor", signaturePower: 91, speedStat: 93, durabilityStat: 90 },
    b: { name: "BATMAN", title: "Hellbat Armor", franchise: "DC COMICS", color: "#4B5563", signatureMove: "Chaos Blade", signaturePower: 93, speedStat: 90, durabilityStat: 94 },
    r1Name: "TECH WEAPONRY", r1A: "Energy Blades & Shield", r1B: "Forged by Justice League", r1Win: "b",
    r2Name: "FLIGHT & MOBILITY", r2A: "Mach 8 Thrusters", r2B: "Glide Wings", r2Win: "a",
    r3Name: "PREPARATION TACTICS", r3A: "Friday AI Protocol", r3B: "Contingency Master", r3Win: "b",
    winner: "b",
    voiceHook: "आयरन मैन नैनोटेक बनाम बैटमैन हेलबैट! मार्वल और डीसी के जीनियस का आमना-सामना!",
    verdictHi: "बैटमैन ने जीता ताज! हेलबैट आर्मर और सटीक प्लानिंग ने बाजी मारी!",
    verdictReason: "Hellbat Armor ko Darkseid se ladne ke liye banaya gaya tha, isliye Batman jeeta!"
  },
  {
    a: { name: "VEGETA", title: "Ultra Ego", franchise: "DRAGON BALL", color: "#9333EA", signatureMove: "Hakai Sphere", signaturePower: 97, speedStat: 96, durabilityStat: 98 },
    b: { name: "THOR", title: "Rune King God", franchise: "MARVEL", color: "#2563EB", signatureMove: "God Blast", signaturePower: 98, speedStat: 94, durabilityStat: 97 },
    r1Name: "DIVINE POWER", r1A: "God of Destruction Hakai", r1B: "All-Father Force", r1Win: "tie",
    r2Name: "PAIN ABSORPTION", r2A: "Damage Boosts Ego", r2B: "Asgardian Stamina", r2Win: "a",
    r3Name: "ULTIMATE FEATS", r3A: "Sphere of Destruction", r3B: "Shattered Yggdrasil", r3Win: "b",
    winner: "b",
    voiceHook: "वेजीटा अल्ट्रा ईगो बनाम थॉर रुन किंग! यूनिवर्स के दो सबसे शक्तिशाली देवताओं का युद्ध!",
    verdictHi: "थॉर के सिर पर ताज! रुन किंग की जादुई ताकत ने मुकाबला जीता!",
    verdictReason: "Rune King Thor ki omniscient reality powers ne Hakai energy ko counter kiya!"
  }
];

export function versusSplitForDay(day: number): VersusSplit {
  const d = Math.max(1, Math.floor(day));
  const b = BATTLES[(d - 1) % BATTLES.length]!;

  const outro = askOutro({
    question: `Aapka Winner Kaun Hai? ${b.a.name} ya ${b.b.name}?`,
    options: [`1. ${b.a.name} 🔥`, `2. ${b.b.name} ⚡`, `3. TIE THA 🤝`],
    voiceQuestion: `आपके हिसाब से असली विनर कौन है? ${b.a.name} या ${b.b.name}?`,
    handle: "@VersusSplitClash"
  });

  const introSeconds = d === 1 ? 0 : 2.6;
  const playSeconds = 17.0;
  const climaxSeconds = 4.0;
  const prevAnswer = d === 1 ? "" : `Pichhla winner: ${BATTLES[(d - 2) % BATTLES.length]!.winner === "a" ? BATTLES[(d - 2) % BATTLES.length]!.a.name : BATTLES[(d - 2) % BATTLES.length]!.b.name} ne baazi maari thi.`;

  return {
    voice: [],
    sound: true,
    brand: "VERSUS SPLIT",
    handle: "@VersusSplitClash",
    postNo: d,
    fighterA: b.a,
    fighterB: b.b,
    rounds: [
      { roundNo: 1, name: b.r1Name, statA: b.r1A, statB: b.r1B, win: b.r1Win },
      { roundNo: 2, name: b.r2Name, statA: b.r2A, statB: b.r2B, win: b.r2Win },
      { roundNo: 3, name: b.r3Name, statA: b.r3A, statB: b.r3B, win: b.r3Win }
    ],
    winner: b.winner,
    climaxSeconds,
    playSeconds,
    introSeconds,
    prevAnswer,
    askOutro: outro,
    verdictReason: b.verdictReason
  };
}

export function versusSplitDuration(p: VersusSplit): number {
  return Math.round((p.introSeconds + p.playSeconds + askOutroSeconds(p.askOutro)) * FPS);
}

export function versusSplitVoiceLines(p: VersusSplit): VoiceLine[] {
  const lines: VoiceLine[] = [];
  const b = BATTLES[(p.postNo - 1) % BATTLES.length]!;
  let t = 0;

  if (p.introSeconds > 0) {
    lines.push({ file: "prev.wav", text: "पिछले मैच का नतीजा आपकी स्क्रीन पर।", at: 0 });
    t += p.introSeconds;
  }

  // Hook line
  lines.push({ file: `hook_${p.postNo}.wav`, text: b.voiceHook, at: +t.toFixed(2) });
  t += 6.5;

  // Verdict line
  lines.push({ file: `verdict_${p.postNo}.wav`, text: b.verdictHi, at: +t.toFixed(2) });
  t += 6.5;

  // Ask outro lines
  const outroLines = askOutroVoice(p.askOutro, p.introSeconds + p.playSeconds);
  lines.push(...outroLines);

  return lines;
}

export function versusSplitAnswerComment(p: VersusSplit): string {
  const b = BATTLES[(p.postNo - 1) % BATTLES.length]!;
  const winFighter = b.winner === "a" ? b.a.name : b.b.name;
  return `👑 OFFICIAL VERDICT #${p.postNo}: Crown lands on ${winFighter}! ${b.verdictReason} Aap kiske fan ho? Subscribe karein @VersusSplitClash!`;
}
