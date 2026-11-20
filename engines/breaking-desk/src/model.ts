import { z } from "zod";
import {
  AskOutroSchema,
  askOutro,
  askOutroSeconds,
  askOutroVoice
} from "../../ask-outro";
import type { VoiceLine } from "../../../channels/channels";

export const FPS = 30;

export const ChatLineSchema = z.object({
  id: z.string(),
  sender: z.enum(["user", "contact"]),
  text: z.string(),
  time: z.string().optional(),
  highlight: z.boolean().optional(),
  hasReadReceipt: z.boolean().optional()
});

export const NewsStorySchema = z.object({
  id: z.string(),
  category: z.string(), // "AI & TECH", "SPACE", "SCIENCE", "BHAKTI", "GLOBAL"
  location: z.string(),
  headline: z.string(),
  subhead: z.string(),
  source: z.string(),
  cardText: z.string(),
  highlightLine: z.string(),
  reactionPill: z.string(),
  voiceScript: z.string(), // Devanagari script for Kokoro/TTS
  ticker: z.array(z.string()).min(2),
  contactName: z.string().optional(),
  contactAvatar: z.string().optional(),
  contactStatus: z.string().optional(),
  dialogue: z.array(ChatLineSchema).optional()
});

export const BreakingDeskSchema = z.object({
  voice: z.array(z.object({ src: z.string(), at: z.number().min(0) })).default([]),
  sound: z.boolean().default(true),
  brand: z.string(),
  handle: z.string(),
  postNo: z.number().int().min(1),
  story: NewsStorySchema,
  liveClock: z.string(),
  playSeconds: z.number().positive(),
  introSeconds: z.number().min(0),
  prevAnswer: z.string(),
  askOutro: AskOutroSchema,
  palette: z.object({
    bgTop: z.string(),
    bgBottom: z.string(),
    accent: z.string(),
    cardBg: z.string(),
    cardText: z.string(),
    highlight: z.string()
  })
});
export type BreakingDesk = z.infer<typeof BreakingDeskSchema>;

const STORIES = [
  // ==========================================
  // 0. LORD HANUMAN CHAT (Interactive Dialogue)
  // ==========================================
  {
    category: "BHAKTI & SANATAN",
    location: "Ayodhya Dham",
    headline: "भयभीत मत हो वत्स, जहाँ श्री राम का नाम है वहाँ कोई संकट टिक नहीं सकता।",
    subhead: "संकट मोचन हनुमान जी से सीधा संवाद",
    source: "श्री राम चरित मानस",
    cardText: "संकट कटै मिटै सब पीरा। जो सुमिरै हनुमत बलबीरा॥ मेरा आशीर्वाद सदा तुम्हारे साथ है।",
    highlightLine: "जय श्री राम! जय बजरंगबली! 🚩🙏",
    reactionPill: "🚩 संकटमोचन",
    contactName: "श्री हनुमान जी 🚩",
    contactAvatar: "saffron-gada",
    contactStatus: "सदैव आपके साथ • online",
    voiceScript: "वत्स, भयभीत मत हो। निष्कपट भाव से प्रभु राम की शरण में आओ। संकट कटै मिटै सब पीरा, जो सुमिरै हनुमत बलबीरा।",
    question: "क्या आप प्रतिदिन हनुमान चालीसा का पाठ करते हैं?",
    options: ["1. हाँ, प्रतिदिन 🙏", "2. मंगलवार को 🚩", "3. आज से शुरू करूँगा ✨"],
    voiceQuestion: "क्या आप प्रतिदिन हनुमान चालीसा का पाठ करते हैं?",
    answer: "हनुमान चालीसा का नियमित पाठ भय, नकारात्मकता और हर संकट को दूर करता है।",
    ticker: ["हनुमान चालीसा पाठ से दूर होते हैं सारे संकट", "मंगलवार और शनिवार को करें विशेष ध्यान", "जय बजरंगबली 🚩"],
    dialogue: [
      { id: "m1", sender: "user" as const, text: "प्रभु, जीवन में बहुत संकट और अशांति है, क्या करूं? 😔", time: "11:41 PM" },
      { id: "m2", sender: "contact" as const, text: "वत्स, भयभीत मत हो। जहाँ श्री राम का नाम है, वहाँ कोई संकट टिक नहीं सकता।", time: "11:42 PM" },
      { id: "m3", sender: "user" as const, text: "प्रभु, क्या आप सच में हर पल मेरी रक्षा करते हैं? 🙏", time: "11:42 PM", hasReadReceipt: true },
      { id: "m4", sender: "contact" as const, text: "सदा! 'संकट कटै मिटै सब पीरा, जो सुमिरै हनुमत बलबीरा॥' तुम बस सच्चे मन से राम नाम का स्मरण करो।", time: "11:43 PM" },
      { id: "m5", sender: "contact" as const, text: "🚩 मेरा आशीर्वाद और सुरक्षा कवच सदा तुम्हारे साथ है।", time: "11:43 PM", highlight: true },
      { id: "m6", sender: "user" as const, text: "जय श्री राम! जय बजरंगबली! 🚩🙏", time: "11:44 PM" }
    ]
  },
  {
    category: "AI & TECH",
    location: "San Francisco, USA",
    headline: "AI MODEL BEATS HUMAN SCIENTISTS IN LAB EXPERIMENTS",
    subhead: "AUTONOMOUS RESEARCH BREAKTHROUGH",
    source: "TECH WIRE DISPATCH",
    cardText: "A new autonomous AI system has formulated and verified a novel physics hypothesis in under 48 hours without human intervention.",
    highlightLine: "NO HUMAN INPUT REQUIRED FOR 48 HOURS",
    reactionPill: "⚡ MILESTONE",
    contactName: "BREAKING WIRE",
    contactStatus: "• online",
    voiceScript: "ब्रेकिंग न्यूज़! एआई ने पहली बार बिना किसी इंसान की मदद के, अड़तालीस घंटे में खुद एक नई साइंस थ्योरी साबित कर दी!",
    question: "Kya AI Agle 5 Saal Mein Scientists Ko Replace Karega?",
    options: ["1. HAAN 🚀", "2. NAHI 👨‍🔬", "3. PATA NAHI 🤔"],
    voiceQuestion: "क्या एआई अगले पाँच साल में वैज्ञानिकों को पीछे छोड़ देगा?",
    answer: "Experts maante hain AI lab assistant banega, par human intuition ko replace nahi kar sakta.",
    ticker: ["AI RESEARCH PASSES PEER REVIEW", "GLOBAL CHIP PRODUCTION UP 18%", "SUPERCOMPUTER SPEEDS TRIPLE"],
    dialogue: [
      { id: "m1", sender: "user" as const, text: "did you see what just dropped in the news?!", time: "11:41 PM" },
      { id: "m2", sender: "contact" as const, text: "AI MODEL BEATS HUMAN SCIENTISTS IN LAB EXPERIMENTS", time: "11:42 PM" },
      { id: "m3", sender: "user" as const, text: "Wait, is this officially confirmed?!", time: "11:42 PM", hasReadReceipt: true },
      { id: "m4", sender: "contact" as const, text: "A new autonomous AI system formulated and verified a novel physics hypothesis in under 48 hours without human intervention.", time: "11:43 PM" },
      { id: "m5", sender: "contact" as const, text: "⚡ NO HUMAN INPUT REQUIRED FOR 48 HOURS", time: "11:43 PM", highlight: true },
      { id: "m6", sender: "user" as const, text: "This changes literally everything.", time: "11:44 PM" }
    ]
  },
  {
    category: "SPACE",
    location: "Sriharikota, India",
    headline: "ISRO ANNOUNCES NEXT SOLAR PROBE LAUNCH WINDOW",
    subhead: "DEEP SPACE HELIOSPHERE MISSION",
    source: "COSMOS JOURNAL",
    cardText: "Indian space scientists have revealed the final integration timeline for the high-altitude coronagraph satellite.",
    highlightLine: "DIRECT REAL-TIME SOLAR FLARE ALERTS",
    reactionPill: "🚀 SPACE RACE",
    contactName: "SPACE DESK",
    contactStatus: "• online",
    voiceScript: "बड़ी खबर! इसरो ने अपने नए सोलर मिशन की तारीख तय कर दी है, जो सूरज के तूफानों की लाइव चेतावनी सीधे धरती पर भेजेगा!",
    question: "Kaun Sa Desh Pehle Deep-Space Base Banayega?",
    options: ["1. BHARAT 🇮🇳", "2. USA 🇺🇸", "3. CHINA 🇨🇳"],
    voiceQuestion: "कौन सा देश सबसे पहले डीप स्पेस बेस बनाएगा?",
    answer: "ISRO aur NASA dono 2035 tak permanent lunar stations plan kar rahe hain.",
    ticker: ["ISRO ENGINE TEST CLEARS 100% THRUST", "METEOR SHOWER VISIBLE TONIGHT", "LUNAR ROVER ENTERS SLEEP MODE"]
  },
  {
    category: "GADGETS",
    location: "Tokyo, Japan",
    headline: "NEW GRAPHENE BATTERY CHARGES IN ONLY 3 MINUTES",
    subhead: "1000 KM ELECTRIC VEHICLE RANGE",
    source: "ENERGY TOKYO",
    cardText: "Solid-state graphene cell shows zero degradation after 2,000 rapid charging cycles at extreme temperatures.",
    highlightLine: "0 TO 100% IN UNDER 180 SECONDS",
    reactionPill: "🔋 BATTERY TECH",
    contactName: "TECH DISPATCH",
    contactStatus: "• online",
    voiceScript: "इलेक्ट्रिक गाड़ियों की सबसे बड़ी समस्या खत्म! टोक्यो में नई ग्रैफीन बैटरी बनी है जो सिर्फ तीन मिनट में फुल चार्ज हो जाती है!",
    question: "Kya Aap Graphene EV Kharidne Ke Liye Ready Hain?",
    options: ["1. BILKUL ⚡", "2. ABHI NAHI 🛑", "3. PRICE PAR DEPEND 🤔"],
    voiceQuestion: "क्या आप तीन मिनट में चार्ज होने वाली ईवी खरीदेंगे?",
    answer: "Mass production agle saal commercial cars ke saath launch hone ki umeed hai.",
    ticker: ["GLOBAL OIL DEMAND FORECAST DROPS", "FAST CHARGING HUBS EXPAND", "SOLID STATE CELLS CLEARED"]
  },
  {
    category: "SCIENCE",
    location: "Mariana Trench, Pacific",
    headline: "NEW GLOWING ORGANISM FOUND AT 9000M DEPTH",
    subhead: "EXTREME PRESSURE BIOLOGY DISCOVERY",
    source: "OCEAN EXPLORATION LAB",
    cardText: "Deep-sea submersible cameras captured an undiscovered organism with bioluminescent crystalline skin surviving 900 atm pressure.",
    highlightLine: "SURVIVES 900 TIMES SURFACE PRESSURE",
    reactionPill: "🌊 DEEP OCEAN",
    contactName: "OCEAN WIRE",
    contactStatus: "• online",
    voiceScript: "समंदर के नौ हज़ार मीटर गहरे अंधेरे में एक नया जीव मिला है, जो नौ सौ गुना दबाव में भी नीली रोशनी छोड़ता है!",
    question: "Samandar Mein Zyada Secrets Hain Ya Space Mein?",
    options: ["1. OCEAN 🌊", "2. SPACE 🌌", "3. DONO EQUAL ⚖️"],
    voiceQuestion: "समंदर में ज़्यादा रहस्य छुपे हैं या अंतरिक्ष में?",
    answer: "Scientists kehte hain humne abhi tak samandar ka 80% hissa explore hi nahi kiya hai.",
    ticker: ["SUBMERSIBLE RESEARCH EXPEDITIONS EXPAND", "DEEP TRENCH MAPPING COMPLETED", "NEW MICROBES FOUND"]
  },
  {
    category: "GAMING",
    location: "Seoul, South Korea",
    headline: "HAPTIC FULL-BODY SUIT LETS PLAYERS FEEL IN-GAME WEATHER",
    subhead: "NEURAL FEEDBACK HARDWARE",
    source: "VIRTUAL HORIZONS",
    cardText: "Players can now experience realistic rain drops, sub-zero wind chills, and projectile impacts with 1ms micro-actuators.",
    highlightLine: "REAL TEMPERATURE AND RAIN SENSATION",
    reactionPill: "🎮 VR REVOLUTION",
    contactName: "GAMING WIRE",
    contactStatus: "• online",
    voiceScript: "गेमिंग का भविष्य आ चुका है! इस नए हैप्टिक सूट को पहनकर आप गेम की ठंडी हवा, बारिश और गोलियों का झटका असल में महसूस कर सकते हैं!",
    question: "Kya Aap Aisa Full-Body VR Suit Pehankar Kheloge?",
    options: ["1. ZAROOR 🥽", "2. DAR LAGTA HAI 😅", "3. BOHOT MEHNGA HAI 💸"],
    voiceQuestion: "क्या आप ऐसा फुल बॉडी वीआर सूट पहनकर गेम खेलेंगे?",
    answer: "Immersion bohot high hai par motion sickness test pass karna zaroori hai.",
    ticker: ["VR ESPORTS LEAGUE LAUNCHED", "NEXT GEN GRAPHICS ENGINES GO OPEN SOURCE", "HAPTIC TECH PATENTS DOUBLED"]
  },
  {
    category: "GLOBAL",
    location: "Reykjavik, Iceland",
    headline: "GEOTHERMAL PLANT REVERSES CARBON EMISSIONS INTO STONE",
    subhead: "CLIMATE EXTRACTION MILESTONE",
    source: "EARTH CLIMATE MONITOR",
    cardText: "Underground basalt reactors capture 4,000 tons of atmospheric CO2 each year, turning carbon into solid stone minerals.",
    highlightLine: "TURNS CO2 GAS DIRECTLY INTO SOLID ROCK",
    reactionPill: "🌱 CLEAN TECH",
    contactName: "EARTH WIRE",
    contactStatus: "• online",
    voiceScript: "आइसलैंड के वैज्ञानिकों ने कमाल कर दिया! हवा से प्रदूषण खींचकर उसे ज़मीन के नीचे पत्थर में बदलने का प्लांट शुरू हो गया है!",
    question: "Kya Aise Plants Puri Duniya Mein Lagne Chahiye?",
    options: ["1. SAHI HAI 🌍", "2. EXPENSIVE HAI 💰", "3. OTHER WAYS CHAHIYE 🌳"],
    voiceQuestion: "क्या ऐसे प्लांट पूरी दुनिया में लगने चाहिए?",
    answer: "Basalt rock wale regions mein ye technology 100% safe aur permanent maani gayi hai.",
    ticker: ["GREEN ENERGY INVESTMENT CROSSES TRILLION", "SOLAR ROOF ADOPTION JUMPS", "AIR QUALITY INDEX IMPROVES"]
  },
  {
    category: "CYBER",
    location: "Zurich, Switzerland",
    headline: "QUANTUM ENCRYPTION SHIELD STOPS SUPERCOMPUTER HACKERS",
    subhead: "UNBREAKABLE ENTANGLED NETWORK",
    source: "SECURE MATRIX",
    cardText: "Photonic quantum key distribution network tested over 400 kilometers with zero unauthorized decryptions achieved.",
    highlightLine: "ZERO PACKETS DECRYPTED IN 6 MONTHS",
    reactionPill: "🔒 CYBER DEFENSE",
    contactName: "CYBER MATRIX",
    contactStatus: "• online",
    voiceScript: "हैकिंग का खतरा अब खत्म! क्वांटम नेटवर्क का नया शील्ड तैयार हुआ है, जिसे दुनिया का सबसे बड़ा सुपरकंप्यूटर भी नहीं तोड़ पाया!",
    question: "Aapke Phone Mein Quantum Security Honi Chahiye?",
    options: ["1. YES PRIVACY FIRST 🔐", "2. REGULAR PASSWORD THEEK HAI 👍", "3. NAHI PATA 🤷"],
    voiceQuestion: "क्या आपके फोन में भी क्वांटम सिक्योरिटी होनी चाहिए?",
    answer: "Quantum encryption banking aur defense ke baad aam smartphones mein aayegi.",
    ticker: ["CYBER FRAUD PREVENTION TOOLS UPDATED", "BIOMETRIC CHIPS ENTER PRODUCTION", "GLOBAL SATELLITE LINKS SECURED"]
  }
];

const PALETTES = [
  { bgTop: "#0B0E17", bgBottom: "#141A29", accent: "#E11D2E", cardBg: "#F0F3F8", cardText: "#0F141C", highlight: "#FFD60A" },
  { bgTop: "#081018", bgBottom: "#0F1C2B", accent: "#2F6FD8", cardBg: "#EEF3FA", cardText: "#0A1118", highlight: "#FFDD00" },
  { bgTop: "#120B16", bgBottom: "#1F1226", accent: "#E11D48", cardBg: "#F6EFF7", cardText: "#1A0C20", highlight: "#FBBF24" }
];

export function breakingDeskForDay(day: number): BreakingDesk {
  const d = Math.max(1, Math.floor(day));
  const s = STORIES[(d - 1) % STORIES.length]!;
  const pal = PALETTES[(d - 1) % PALETTES.length]!;

  const outro = askOutro({
    question: s.question,
    options: s.options,
    voiceQuestion: s.voiceQuestion,
    handle: "@BreakingDeskNews"
  });

  const introSeconds = d === 1 ? 0 : 2.6;
  const playSeconds = 18.0;
  const prevAnswer = d === 1 ? "" : "Pichhli report: Experts ne AI lab integration ko confirm kiya.";

  // Story variation by day number
  const uniqueStory = {
    id: `news-${d}`,
    category: s.category,
    location: s.location,
    headline: `${s.headline}`,
    subhead: `${s.subhead} · REPORT #${d}`,
    source: s.source,
    cardText: s.cardText,
    highlightLine: s.highlightLine,
    reactionPill: s.reactionPill,
    voiceScript: s.voiceScript,
    ticker: s.ticker,
    contactName: (s as any).contactName,
    contactAvatar: (s as any).contactAvatar,
    contactStatus: (s as any).contactStatus,
    dialogue: (s as any).dialogue
  };

  const hour = 18 + ((d * 3) % 4);
  const min = ((d * 17) % 60).toString().padStart(2, "0");

  return {
    voice: [],
    sound: true,
    brand: (s as any).contactName || "BREAKING DESK",
    handle: "@BreakingDeskNews",
    postNo: d,
    story: uniqueStory,
    liveClock: `${hour}:${min}`,
    playSeconds,
    introSeconds,
    prevAnswer,
    askOutro: outro,
    palette: pal
  };
}

export function breakingDeskDuration(p: BreakingDesk): number {
  return Math.round((p.introSeconds + p.playSeconds + askOutroSeconds(p.askOutro)) * FPS);
}

export function breakingDeskVoiceLines(p: BreakingDesk): VoiceLine[] {
  const lines: VoiceLine[] = [];
  let t = 0;

  if (p.introSeconds > 0) {
    lines.push({ file: "prev.wav", text: "पिछली रिपोर्ट का अपडेट आपकी स्क्रीन पर।", at: 0 });
    t += p.introSeconds;
  }

  // Hook line
  lines.push({ file: `hook_${p.postNo}.wav`, text: p.story.voiceScript, at: +t.toFixed(2) });
  t += 7.5;

  // AskOutro
  lines.push(...askOutroVoice(p.askOutro, +t.toFixed(2)));

  return lines;
}

export function breakingDeskAnswerComment(p: BreakingDesk): string {
  const s = STORIES[(p.postNo - 1) % STORIES.length]!;
  return `📌 REPORT #${p.postNo} INSIGHT: ${s.answer}`;
}
