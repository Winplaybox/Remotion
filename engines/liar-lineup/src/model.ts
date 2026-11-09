import { z } from "zod";
import { AskOutroSchema, askOutro, askOutroSeconds, askOutroVoice } from "../../ask-outro";
import { CAST_100, getCharacterById } from "../../../packages/visuals/src/rig/cast";

export const FPS = 30;

export const ClueSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  icon: z.string() // emoji or SVG icon key
});

export const SuspectSchema = z.object({
  characterId: z.string(),
  name: z.string(),
  profession: z.string(),
  statement: z.string(),
  isLiar: z.boolean()
});

export const LiarLineupSchema = z.object({
  voice: z.array(z.object({ src: z.string(), at: z.number().min(0) })).default([]),
  sound: z.boolean().default(true),
  brand: z.string(),
  handle: z.string(),
  postNo: z.number().int().min(1),
  caseTitle: z.string(),
  victimEvent: z.string(),
  sceneType: z.enum(["haveli", "vault", "office", "street", "bank", "mansion"]),
  clues: z.array(ClueSchema).length(3),
  suspects: z.array(SuspectSchema).length(3),
  contradiction: z.string(),
  liarIndex: z.number().int().min(0).max(2),
  playSeconds: z.number().positive(),
  introSeconds: z.number().min(0),
  prevAnswer: z.string(),
  askOutro: AskOutroSchema,
  palette: z.object({
    bgTop: z.string(),
    bgBottom: z.string(),
    accent: z.string(),
    gold: z.string(),
    card: z.string(),
    spotlight: z.string()
  }),
  spoken: z.record(z.string(), z.number()).optional()
}).superRefine((p, ctx) => {
  if (p.suspects.filter((s) => s.isLiar).length !== 1) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Exactly one suspect must be the liar" });
  }
  if (!p.suspects[p.liarIndex]?.isLiar) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "liarIndex must point to the suspect with isLiar=true" });
  }
});

export type LiarLineup = z.infer<typeof LiarLineupSchema>;

const NOIR_PALETTES = [
  { bgTop: "#07090E", bgBottom: "#161B26", accent: "#E9B949", gold: "#FFD166", card: "#1A2230", spotlight: "rgba(233,185,73,0.18)" },
  { bgTop: "#0A0D14", bgBottom: "#1C1427", accent: "#FF7B54", gold: "#FFB26B", card: "#241B35", spotlight: "rgba(255,123,84,0.18)" },
  { bgTop: "#061314", bgBottom: "#0F282F", accent: "#2EC4B6", gold: "#CBF3F0", card: "#133842", spotlight: "rgba(46,196,182,0.18)" }
];

interface CaseTemplate {
  title: string;
  victimEvent: string;
  sceneType: LiarLineup["sceneType"];
  clues: [
    { title: string; detail: string; icon: string },
    { title: string; detail: string; icon: string },
    { title: string; detail: string; icon: string }
  ];
  contradiction: string;
  liarStatement: string;
  innocentStatements: [string, string];
  suspectCharacterIds: [string, string, string];
}

const CASE_TEMPLATES: CaseTemplate[] = [
  {
    title: "HAVELI KI CHORI",
    victimEvent: "Seth Dhaniram ke private vault se 50 lakh ke heere gayab hue!",
    sceneType: "haveli",
    clues: [
      { title: "BAND GHADI", detail: "Diwar ghadi theek 9:15 baje ruki thi.", icon: "⏱" },
      { title: "BIJLI GUL", detail: "Haveli ki light 9:15 se 10 baje tak band thi.", icon: "⚡" },
      { title: "TOTA SURAAG", detail: "Kamre ki khidki andar se band mili.", icon: "🔒" }
    ],
    contradiction: "Ghar ki bijli aur diwar ghadi theek 9:15 baje band ho chuki thi, isliye 9:30 baje ghadi dekhkar time batana asambhav hai!",
    liarStatement: "Main theek 9:30 baje drawing room ki wall clock dekh raha tha, time bilkul sahi tha aur sab theek tha!",
    innocentStatements: [
      "Main kitchen mein tha, achanak light chali gayi to main mombatti dhundh raha tha.",
      "Main garden mein walk kar raha tha, 9 baje ke baad andar nahi aaya."
    ],
    suspectCharacterIds: ["beta-rohan", "naukar-ramu", "driver-bahadur"]
  },
  {
    title: "BARISH MEIN CHORI",
    victimEvent: "Zaveri Jewellers ki dukaan ka taala todkar sone ke haar chori!",
    sceneType: "street",
    clues: [
      { title: "MUSLADHAR BARISH", detail: "Raat 8 baje se lagatar tez barish ho rahi thi.", icon: "🌧" },
      { title: "KEECHAD KE NISHAAN", detail: "Dukaan ke farsh par geeli mitti ke prints the.", icon: "👣" },
      { title: "GIRTI CHHATRI", detail: "Dukaan ke bahar tooti hui chhatri mili.", icon: "☂️" }
    ],
    contradiction: "Bahar 2 ghante se musladhar barish thi aur zameen par keechad tha, to bahar se paidal aane wale ke joote bilkul sookhe aur saaf kaise ho sakte hain?",
    liarStatement: "Main abhi-abhi paidal 2 kilometer chal kar bazaar se aaya hoon, dekho mere kapde aur joote bilkul chamak rahe hain!",
    innocentStatements: [
      "Main dukaan ke pichhle room mein so raha tha, barish ki aawaz se kuch pata nahi chala.",
      "Main gaadi se aaya tha aur barish rukne ka intezaar kar raha tha."
    ],
    suspectCharacterIds: ["gambler-jagga", "munim-chimanlal", "pickpocket-chikna"]
  },
  {
    title: "ANDAR SE BAND KAMRA",
    victimEvent: "Mansion ke study room se shahi khandaani will chori hui!",
    sceneType: "mansion",
    clues: [
      { title: "LOCKED DOOR", detail: "Master darwaza andar se chitkani laga kar band tha.", icon: "🚪" },
      { title: "CHABI ANDAR", detail: "Kamre ki ekmatra chabi andar table par rakhi thi.", icon: "🔑" },
      { title: "CHHAT KI KHIDKI", detail: "Chhat ka skylight kaanch khula hua tha.", icon: "🪟" }
    ],
    contradiction: "Darwaza andar se chitkani band tha aur chabi andar table par thi, to koi main gate ki chabi laga kar andar nahi ja sakta!",
    liarStatement: "Main study room ka main darwaza chabi se khol kar seedha andar gaya tha file lene!",
    innocentStatements: [
      "Maine bahar se awaaz suni par darwaza andar se band tha isliye main andar nahi ja saka.",
      "Main to pehle floor par tha aur skylight par kisi ke chalne ki awaaz suni thi."
    ],
    suspectCharacterIds: ["damaad-vikram", "caretaker-shankar", "chacha-ramesh"]
  },
  {
    title: "GEELA PAINT KA RAAZ",
    victimEvent: "Clubhouse ke locker room se trophy aur cash chori!",
    sceneType: "office",
    clues: [
      { title: "WET PAINT", detail: "Bahar ke wooden bench par 6 baje taaza green paint hua tha.", icon: "🎨" },
      { title: "CAUTION BOARD", detail: "Bench ke upar WET PAINT ka bada board laga tha.", icon: "⚠️" },
      { title: "BENCH PE NISHAAN", detail: "Bench par kisi ke baithne ka geela nishaan tha.", icon: "🪑" }
    ],
    contradiction: "Bench par taaza geela paint laga tha aur nishaan the, agar ye 1 ghante wahan baitha tha to kapdon par paint ka daagh zaroor hota!",
    liarStatement: "Main pichhle ek ghante se usi garden bench par aaram se baitha fresh hawa le raha tha!",
    innocentStatements: [
      "Maine WET PAINT ka board dekha tha isliye main bench ke paas nahi gaya.",
      "Main badminton court mein practice kar raha tha."
    ],
    suspectCharacterIds: ["college-student-aryan", "delivery-boy-sonu", "broker-mehta"]
  },
  {
    title: "ANDHERE MEIN NOVEL",
    victimEvent: "Sethani Malti Devi ka motiyon ka haar dressing table se gayab!",
    sceneType: "haveli",
    clues: [
      { title: "TOTAL BLACKOUT", detail: "Shaam 7 se 9 baje tak poori haveli ki light band thi.", icon: "🌑" },
      { title: "INVERTER FAIL", detail: "Haveli ka backup inverter battery discharge thi.", icon: "🔋" },
      { title: "MOMBATTI NAHI", detail: "Kamre mein koi candle ya emergency lamp nahi jali thi.", icon: "🕯" }
    ],
    contradiction: "Poora kamra ghup andhere mein tha aur koi mombatti nahi thi, to chhota print wala barik novel padhna bilkul jhooth hai!",
    liarStatement: "Main apne kamre mein aaram se baith kar ek barik print wala English novel padh rahi thi!",
    innocentStatements: [
      "Andhera hote hi main dadi ke paas chali gayi thi unka haath pakadne.",
      "Main balcony mein khada tha kyunki kamre mein bahut andhera tha."
    ],
    suspectCharacterIds: ["bahu-sunita", "kaamwali-kamla", "chachi-shobha"]
  },
  {
    title: "LATE TRAIN KA JHOOTH",
    victimEvent: "Bank locker se 2 crore ke gold bonds chori!",
    sceneType: "bank",
    clues: [
      { title: "4 GHANTE LATE", detail: "Rajdhani Express train 4 ghante late hokar raat 11 baje aayi.", icon: "🚆" },
      { title: "EMPTY PLATFORM", detail: "Station master ne record confirm kiya.", icon: "📋" },
      { title: "TICKET TIME", detail: "CCTV mein station par train 11:05 PM pe dikhi.", icon: "🕒" }
    ],
    contradiction: "Train khud raat 11 baje station pahunchi, to sham 8 baje train se utarkar bank aana safed jhooth hai!",
    liarStatement: "Meri train theek sham 7:30 baje aayi aur main 8 baje bank ke samne milne aaya tha!",
    innocentStatements: [
      "Maine train enquiry par call kiya tha unhone bataya train 4 ghante late chal rahi hai.",
      "Main ghar par hi dinner kar raha tha family ke saath."
    ],
    suspectCharacterIds: ["con-artist-bunty", "landlord-verma", "contractor-tiwari"]
  },
  {
    title: "KHIDKI KA TOOTA KAANCH",
    victimEvent: "Museum se Mughal kaaleen aur chandi ke bartan chori!",
    sceneType: "vault",
    clues: [
      { title: "KAANCH ANDAR GIRA", detail: "Khidki ke toote hue kaanch ke tukde kamre ke ANDAR gire the.", icon: "🪟" },
      { title: "BAHAR SAAF", detail: "Bahar garden mein ek bhi kaanch ka tukda nahi tha.", icon: "🌱" },
      { title: "GRILL CUT", detail: "Bahar se lohe ki grill kaati gayi thi.", icon: "✂️" }
    ],
    contradiction: "Kaanch kamre ke andar gira tha jiska matlab patthar bahar se phenka gaya. Agar chor andar se todta to kaanch bahar girta!",
    liarStatement: "Maine dekha chor kamre ke andar se khidki todkar bahar ki taraf kood kar bhaga!",
    innocentStatements: [
      "Maine bahar patrolling karte waqt grill tootne ki aawaz suni thi.",
      "Main control room mein alarm check kar raha tha."
    ],
    suspectCharacterIds: ["chowkidar-birju", "safecracker-kaalia", "fence-billo"]
  },
  {
    title: "KUTTA KYUN NAHI BHAUKA?",
    victimEvent: "Haveli ke store room se shahi khazane ka sandook gayab!",
    sceneType: "haveli",
    clues: [
      { title: "GUARD DOG TIGER", detail: "Kutta Tiger har ajnabee ko dekhte hi gusse se bhaukta hai.", icon: "🐕" },
      { title: "POORI RAAT SHAANT", detail: "Padosiyon aur watchman ne kutte ke bhaukne ki aawaz nahi suni.", icon: "🤫" },
      { title: "BISCUIT MILA", detail: "Kutte ke bartan mein khas home-made mutton biscuit mila.", icon: "🍖" }
    ],
    contradiction: "Shikari kutta kisi ajnabee par bhauke bina reh nahi sakta aur use ghar ka bana biscuit khilaya gaya — matlab chor koi ghar ka jaankar tha!",
    liarStatement: "Maine dekha ek bilkul anjaan naqabposh ajnabee bahar se deewar phand kar aaya aur chori ki!",
    innocentStatements: [
      "Main raat ko Tiger ko khana khilane gaya tha par wo aaram se baitha tha.",
      "Main main gate lock kar raha tha aur wahan koi halchal nahi thi."
    ],
    suspectCharacterIds: ["driver-bahadur", "maali-kaka", "cook-maharaj"]
  }
];

export function liarLineupForDay(day: number): LiarLineup {
  const d = Math.max(1, Math.floor(day));
  const templateIndex = (d - 1) % CASE_TEMPLATES.length;
  const tmpl = CASE_TEMPLATES[templateIndex]!;

  // Deterministically choose which suspect is the liar (rotates 0, 1, 2)
  const liarIndex = (d * 2) % 3;

  // Assign statements to 3 suspects
  const suspectSpecs: LiarLineup["suspects"] = [];
  let innocentCount = 0;

  for (let i = 0; i < 3; i++) {
    const charId = tmpl.suspectCharacterIds[i]!;
    const charDef = getCharacterById(charId);
    const isLiar = i === liarIndex;
    const statement = isLiar
      ? tmpl.liarStatement
      : tmpl.innocentStatements[innocentCount++]!;

    suspectSpecs.push({
      characterId: charDef.id,
      name: charDef.name,
      profession: charDef.profession,
      statement,
      isLiar
    });
  }

  const prevTemplate = d > 1 ? CASE_TEMPLATES[(d - 2) % CASE_TEMPLATES.length]! : null;
  const prevLiarIndex = d > 1 ? ((d - 1) * 2) % 3 : 0;
  const prevCharId = prevTemplate ? prevTemplate.suspectCharacterIds[prevLiarIndex]! : "";
  const prevChar = prevCharId ? getCharacterById(prevCharId) : null;
  const prevAnswerText = prevChar ? `CASE #${d - 1}: SUSPECT #${prevLiarIndex + 1} (${prevChar.name.toUpperCase()})` : "";

  const playSeconds = 18;
  const introSeconds = d > 1 ? 2.8 : 0;
  const palette = NOIR_PALETTES[(d - 1) % NOIR_PALETTES.length]!;

  const liarSuspect = suspectSpecs[liarIndex]!;

  return {
    voice: [],
    sound: true,
    brand: "JASOOS BHAI CASES",
    handle: "@JasoosBhaiCases",
    postNo: d,
    caseTitle: tmpl.title,
    victimEvent: tmpl.victimEvent,
    sceneType: tmpl.sceneType,
    clues: tmpl.clues.map((c, idx) => ({ id: `clue-${idx + 1}`, ...c })),
    suspects: suspectSpecs,
    contradiction: tmpl.contradiction,
    liarIndex,
    playSeconds,
    introSeconds,
    prevAnswer: prevAnswerText,
    askOutro: askOutro({
      question: "KAUN JHOOTH BOL RAHA HAI?",
      options: [
        `[1] ${suspectSpecs[0]!.name.toUpperCase()}`,
        `[2] ${suspectSpecs[1]!.name.toUpperCase()}`,
        `[3] ${suspectSpecs[2]!.name.toUpperCase()}`
      ],
      voiceQuestion: "Kaun jhooth bol raha hai? Number 1, 2 ya 3 comment karo!",
      cta: "APNA JAWAB COMMENT KARO!",
      ctaSub: "FOLLOW @JasoosBhaiCases ROZ NAYE MYSTERY CASES KE LIYE",
      voiceCta: "Comment karo aur follow karo Jasoos Bhai Cases ko kal ka jawab dekhne ke liye.",
      handle: "@JasoosBhaiCases"
    }),
    palette
  };
}

export const liarLineupDuration = (p: LiarLineup) =>
  Math.round((p.introSeconds + p.playSeconds + askOutroSeconds(p.askOutro)) * FPS);

export const liarLineupAnswer = (p: LiarLineup) =>
  `#${p.liarIndex + 1} (${p.suspects[p.liarIndex]!.name})`;

export const liarLineupAnswerComment = (p: LiarLineup) =>
  `🕵️ JAWAB: Suspect #${p.liarIndex + 1} (${p.suspects[p.liarIndex]!.name}) JHOOTH BOL RAHA THA!\n` +
  `Kyunki: ${p.contradiction}\n\n` +
  `Aapne sahi pakda tha? Roz naya case solve karne ke liye follow karo @JasoosBhaiCases! 🔍`;

export function liarLineupVoiceLines(p: LiarLineup) {
  const start = p.introSeconds;
  return [
    ...(start ? [{ file: "prev.wav", at: 0.2, text: `Pichhle case ka chor tha: ${p.prevAnswer}.` }] : []),
    { file: "case-intro.wav", at: start + 0.2, text: `Case number ${p.postNo}. ${p.caseTitle}. ${p.victimEvent}` },
    { file: "clues.wav", at: start + 4.0, text: `Jasoos Bhai ko mile 3 bade suraag: ${p.clues[0]!.title}, ${p.clues[1]!.title}, aur ${p.clues[2]!.title}.` },
    { file: "suspect-1.wav", at: start + 8.5, text: `Suspect number 1, ${p.suspects[0]!.name}: "${p.suspects[0]!.statement}"` },
    { file: "suspect-2.wav", at: start + 11.5, text: `Suspect number 2, ${p.suspects[1]!.name}: "${p.suspects[1]!.statement}"` },
    { file: "suspect-3.wav", at: start + 14.5, text: `Suspect number 3, ${p.suspects[2]!.name}: "${p.suspects[2]!.statement}"` },
    ...askOutroVoice(p.askOutro, start + p.playSeconds)
  ];
}
