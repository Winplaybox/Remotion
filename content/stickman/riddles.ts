import { askOutro } from "../../engines/ask-outro";
import { P, StoryDioramaSchema, type StoryDiorama, type StoryDioramaInput } from "../../engines/story-diorama/src/model";

/**
 * BACHKE DIKHAO — Hinglish stickman survival riddles on their own channel (not Dimaag Lock, not Jasoos Bhai).
 * Original stickman (props-channels.tsx `stickman`, WinPlayBox design — not based on any existing character).
 * Each post: hook -> the three doors -> clues -> AskOutro "A, B ya C?"; the answer comes in the next video and as a
 * comment. Roman Hinglish on screen, Devanagari for the voice. Post n = RIDDLES[n - 1]; unwritten posts fail closed.
 */

type Icon = "fire" | "lion" | "gun" | "water" | "skull" | "door";
export interface Riddle {
  h1: string; h2: string;
  hookHi: string; hookEn: string;
  setupHi: string; setupEn: string;
  doors: [Icon, Icon, Icon];
  /** NoteCard lines, <= 18 chars. */
  clues: [string, string, string];
  clueHi: string; clueEn: string;
  question: string; voiceQuestion: string;
  /** 0-based index of the right answer. */
  answer: number; why: string;
}

const RIDDLES: Riddle[] = [
  {
    h1: "BACHKE", h2: "DIKHAO!",
    hookHi: "तुम फँस गए हो। तीन दरवाज़े। सिर्फ़ एक में जान बचेगी।",
    hookEn: "Tum phas gaye ho. Teen darwaaze. Sirf ek mein jaan bachegi.",
    setupHi: "दरवाज़ा A में आग है। B में शेर हैं, जिन्होंने तीन साल से कुछ नहीं खाया। C में बंदूक वाले पहरेदार हैं।",
    setupEn: "Darwaza A mein aag. B mein sher, jinhone teen saal se kuch nahi khaaya. C mein bandook wale pehredaar.",
    doors: ["fire", "lion", "gun"],
    clues: ["A: AAG", "B: SHER, 3 SAAL", "C: BANDOOK"], clueHi: "ध्यान से सोचो, हर बात में सुराग है।", clueEn: "Dhyaan se socho, har baat mein suraag hai.",
    question: "KAUNSA DARWAZA SAFE?", voiceQuestion: "तुम कौन सा दरवाज़ा चुनोगे? A, B, या C?",
    answer: 1, why: "Teen saal bina khaana koi sher zinda nahi rehta — kamra khaali hai."
  },
  {
    h1: "EK HI", h2: "SAFE HAI",
    hookHi: "फिर से तीन दरवाज़े। एक ग़लत क़दम, और गेम ओवर।",
    hookEn: "Phir se teen darwaaze. Ek galat kadam, aur game over.",
    setupHi: "A में तेज़ी से पानी भर रहा है। B में ज़मीन पर बस एक खोपड़ी पड़ी है। C में आग लगी है।",
    setupEn: "A mein tezi se paani bhar raha hai. B mein zameen par bas ek khopdi padi hai. C mein aag lagi hai.",
    doors: ["water", "skull", "fire"],
    clues: ["A: PAANI BHARTA", "B: SIRF KHOPDI", "C: AAG"], clueHi: "डरावनी चीज़ हमेशा ख़तरनाक नहीं होती।", clueEn: "Daraavni cheez hamesha khatarnaak nahi hoti.",
    question: "KAHAN JAOGE?", voiceQuestion: "कहाँ जाओगे? A, B, या C?",
    answer: 1, why: "Khopdi kuch nahi kar sakti — khaali kamra hi safe hai."
  },
  {
    h1: "BIJLI", h2: "KA KAMRA",
    hookHi: "तीन सज़ाएँ, तुम्हें एक चुननी है। सोच समझकर।",
    hookEn: "Teen sazaayein, tumhe ek chunni hai. Soch samajh kar.",
    setupHi: "A में बिजली की कुर्सी है, पर शहर में एक साल से बिजली नहीं है। B में ज़हरीली गैस है। C में भूखे शार्क का पूल है।",
    setupEn: "A mein bijli ki kursi, par shehar mein ek saal se bijli nahi. B mein zehreeli gas. C mein bhookhe shark ka pool.",
    doors: ["door", "skull", "water"],
    clues: ["A: BIJLI KURSI", "B: ZEHREELI GAS", "C: SHARK POOL"], clueHi: "एक लाइन दोबारा पढ़ो। जवाब वहीं है।", clueEn: "Ek line dobara padho. Jawab wahin hai.",
    question: "KAUNSI SAZAA?", voiceQuestion: "कौन सी सज़ा चुनोगे? A, B, या C?",
    answer: 0, why: "Shehar mein ek saal se bijli hi nahi — kursi chalegi kaise?"
  },
  {
    h1: "SACH YA", h2: "JHOOTH?",
    hookHi: "दो दरवाज़े, दो पहरेदार। एक हमेशा सच बोलता है, एक हमेशा झूठ। तुम्हें सिर्फ़ एक सवाल पूछना है।",
    hookEn: "Do darwaaze, do pehredaar. Ek hamesha sach bolta hai, ek hamesha jhooth. Tumhe sirf ek sawaal poochhna hai.",
    setupHi: "A: सीधा पूछो, सही दरवाज़ा कौन सा है। B: किसी से भी पूछो, दूसरा पहरेदार कौन सा बताएगा, और उसका उल्टा चुनो। C: सिक्का उछालो।",
    setupEn: "A: seedha poochho sahi darwaza kaunsa hai. B: kisi se bhi poochho doosra kaunsa batayega, aur ulta chuno. C: sikka uchhalo.",
    doors: ["door", "door", "door"],
    clues: ["A: SEEDHA SAWAAL", "B: ULTA CHUNO", "C: SIKKA"], clueHi: "तुम्हें नहीं पता कौन झूठा है।", clueEn: "Tumhe nahi pata kaun jhootha hai.",
    question: "KAUNSA TARIKA?", voiceQuestion: "कौन सा तरीका पक्का बचाएगा? A, B, या C?",
    answer: 1, why: "Dono pehredaar galat darwaza hi batayenge — uska ulta hamesha sahi hai."
  },
  {
    h1: "JAIL SE", h2: "BHAAGO!",
    hookHi: "जेल से भागने के तीन रास्ते। सिर्फ़ एक में ज़िंदा बचोगे।",
    hookEn: "Jail se bhaagne ke teen raaste. Sirf ek mein zinda bachoge.",
    setupHi: "A: दोपहर की धूप में, दस किलोमीटर रेगिस्तान। B: अँधेरी गुफ़ा, जिसमें सिर्फ़ चमगादड़ हैं। C: टूटा हुआ पुल, नीचे गहरी खाई।",
    setupEn: "A: dopahar ki dhoop mein das kilometer registaan. B: andheri gufa, jismein sirf chamgaadad hain. C: toota pul, neeche gehri khaai.",
    doors: ["fire", "door", "skull"],
    clues: ["A: 10 KM DHOOP", "B: GUFA, CHAMGADAD", "C: TOOTA PUL"], clueHi: "डर और ख़तरे में फ़र्क़ समझो।", clueEn: "Darr aur khatre mein farak samjho.",
    question: "KAUNSA RAASTA?", voiceQuestion: "कौन सा रास्ता लोगे? A, B, या C?",
    answer: 1, why: "Chamgaadad darraate hain, par insaan par hamla nahi karte — gufa hi safe raasta hai."
  }
];

const PAL = { paper: "#FFFFFF", ink: "#141414", accent: "#FF4D3D", accent2: "#FFD23F", accent3: "#3DD6FF" };
const DESERT: [string, string] = ["#F7D488", "#F2B65E"];
const ROOM: [string, string] = ["#2A2440", "#4A3A5E"];

/** Change here if the new YouTube channel gets another handle. */
export const STICK_HANDLE = "@BachkeDikhao";
export const STICK_CTA_VOICE = "अपना जवाब कमेंट में लिखो! और सही जवाब देखने के लिए फॉलो करो।";
export const stickRiddleCount = () => RIDDLES.length;
export function stickRiddle(n: number): Riddle {
  const r = RIDDLES[Math.floor(n) - 1];
  if (!r) throw new Error(`Stickman riddle #${n} is not written yet in content/stickman/riddles.ts`);
  return r;
}
export const stickRiddleAnswer = (n: number) => { const r = stickRiddle(n); return `✅ JAWAB: ${"ABC"[r.answer]} — ${r.why}\nAap bach gaye? Reply mein batao 👇`; };

type Scene = Omit<StoryDioramaInput["scenes"][number], "fig">;

export function stickRiddleForDay(n: number): StoryDiorama {
  const r = stickRiddle(n);
  const floor = { color: "#1C1626", y: 1480 };
  const scenes: Scene[] = [
    {
      id: "hook", seconds: 5, location: `RIDDLE #${String(n).padStart(2, "0")}`, sky: DESERT, ground: { color: "#E3A24C", y: 1480 }, tone: "dark", camera: "push", particles: "none",
      narration: r.hookHi, caption: r.hookEn, sfx: ["riser"],
      headlines: [{ at: 0, lines: [{ text: r.h1 }, { text: r.h2, tone: "accent" }] }],
      layers: [P("sun", 820, 640, { depth: 0.1, idle: "pulse" }), P("stickman", 540, 1560, { depth: 1, enter: "pop", data: { pose: "panic", face: "shock", sweat: true } })]
    },
    {
      id: "doors", seconds: 10, location: "TEEN DARWAAZE", sky: ROOM, ground: floor, tone: "light", camera: "still", particles: "none",
      narration: r.setupHi, caption: r.setupEn,
      headlines: [{ at: 0, lines: [{ text: "EK CHUNO" }] }],
      layers: [
        P("threeDoors", 540, 1300, { depth: 0.7, enter: "none", data: { labels: ["A", "B", "C"], icons: r.doors } }),
        P("stickman", 540, 1640, { depth: 1, scale: 0.55, enter: "rise", data: { pose: "think", face: "think" } })
      ]
    },
    {
      id: "clues", seconds: 5, location: "SURAAG", sky: ROOM, tone: "light", camera: "push", particles: "none",
      narration: r.clueHi, caption: r.clueEn,
      headlines: [{ at: 0, lines: [{ text: "SOCHO!" }] }],
      layers: [
        P("noteCard", 540, 1000, { depth: 0.8, enter: "drop", scale: 0.85, data: { title: "SURAAG", items: r.clues } }),
        P("stickman", 860, 1660, { depth: 1, scale: 0.6, data: { pose: "shrug", face: "sad" } })
      ]
    },
    {
      id: "ask", seconds: 9.5, location: "TUMHARA FAISLA", sky: ROOM, ground: floor, tone: "light", camera: "still", particles: "none",
      narration: `${r.voiceQuestion} ${STICK_CTA_VOICE}`, caption: "",
      headlines: [{ at: 0, lines: [{ text: "A, B YA C?" }] }],
      layers: [
        P("threeDoors", 540, 1300, { depth: 0.7, enter: "none", data: { labels: ["A", "B", "C"], icons: r.doors } }),
        P("stickman", 540, 1640, { depth: 1, scale: 0.55, data: { pose: "point", face: "shock", sweat: true } })
      ]
    }
  ];
  return StoryDioramaSchema.parse({
    music: "sfx/music_puzzle.mp3", brand: "BACHKE DIKHAO", handle: STICK_HANDLE,
    tag: "RIDDLE · #", tagAccent: String(n).padStart(2, "0"),
    palette: PAL, transitionFrames: 8, finish: "rail",
    scenes: scenes.map((s, i) => ({ ...s, fig: `${i + 1}/4` })),
    ask: askOutro({
      question: r.question, options: ["A", "B", "C"], voiceQuestion: r.voiceQuestion,
      cta: "JAWAB COMMENT MEIN LIKHO! 👇", ctaSub: "Sahi jawab agli video mein — FOLLOW karo!", voiceCta: STICK_CTA_VOICE,
      handle: STICK_HANDLE, questionSeconds: 4, ctaSeconds: 5.5
    })
  });
}

export function stickRiddleMeta(n: number) {
  const r = stickRiddle(n);
  return {
    title: `${r.h1} ${r.h2} ${r.question.charAt(0)}${r.question.slice(1).toLowerCase()} 🧠 | Riddle #${n} #shorts`.slice(0, 100),
    description: [
      `${r.hookEn}`,
      "A, B ya C — apna jawab comment mein likho 👇 Sahi jawab agli video mein!",
      "", `Roz ek naya riddle — subscribe ${STICK_HANDLE}`,
      "#riddle #paheli #stickman #bachkedikhao #brainteaser #hindiriddles #shorts"
    ].join("\n"),
    tags: ["riddle", "paheli", "stickman", "hindi riddles", "brain teaser", "survival riddle", "dimaag ki paheli", "shorts"],
    caption: `Riddle #${n} 🧠 ${r.hookEn}\nA, B ya C? Comment karo 👇\nYouTube pe roz naya riddle 👉 ${STICK_HANDLE}\n#riddle #paheli #stickman #reels`,
    language: "hi",
    categoryId: "24"
  };
}
