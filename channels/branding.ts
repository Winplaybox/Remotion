/**
 * YouTube channel branding: description, keywords, banner, watermark (+ a logo file to upload by hand —
 * the YouTube API cannot change the profile picture). Applied by scripts/publish/branding.ts.
 * Country is left blank on purpose.
 */
export interface ChannelBrand {
  /** YouTube token secret of the channel. */
  tokenSecret: string;
  handle: string;
  title: string;
  tagline: string;
  /** Banner / logo colours: background gradient, accent, text. */
  colors: { bg1: string; bg2: string; accent: string; text: string };
  /** Symbol drawn on the logo / watermark. */
  icon: "chakra" | "taxi" | "lock" | "magnifier";
  language: string;
  description: string;
  /** Space-separated; multi-word keywords in quotes (YouTube format). */
  keywords: string[];
}

export const BRANDS: Record<string, ChannelBrand> = {
  "chakra-puzzle": {
    tokenSecret: "YT_TOKEN_CHAKRA_PUZZLE", handle: "@ChakraPuzzle", title: "CHAKRA PUZZLE", tagline: "Kitna tez hai tumhara dimaag?",
    colors: { bg1: "#120B33", bg2: "#3B1C7A", accent: "#FFD23F", text: "#FFFFFF" }, icon: "chakra", language: "hi",
    description: [
      "🧠 Chakra Puzzle — roz naye Odd-One-Out brain puzzles, Hindi mein!",
      "Ghoomte chakron mein woh EK dhundo jo alag hai: ulta ghoomne wala, sabse tez, sabse dheema, alag rang wala, chhupa hua letter…",
      "",
      "⏰ Roz 3 naye Shorts — subah 6:30, 8:30 aur shaam 7:30",
      "🏆 Har Mon / Wed / Fri shaam 6:30 — IQ MARATHON: 25 puzzles + BONUS (9 min). Score gino, apna rank dekho!",
      "💬 Jawab comment karo — sahi jawab AGLE video mein aata hai.",
      "",
      "Easy se Expert tak — kitne level solve kar paoge? Subscribe karo aur roz apna dimaag tez karo 🔔",
      "",
      "#puzzle #brainteaser #oddoneout #iqtest #dimaagkapuzzle #hindipuzzle"
    ].join("\n"),
    keywords: ["puzzle", "brain teaser", "odd one out", "iq test", "hindi puzzle", "dimaag ka puzzle", "find the odd one", "brain test", "puzzle game", "paheli", "focus test", "eye test"]
  },
  "kaali-peeli-chase": {
    tokenSecret: "YT_TOKEN_KAALI_PEELI_CHASE", handle: "@KaaliPeeliChase", title: "KAALI PEELI CHASE", tagline: "Nazar rakho! Kahan gayi?",
    colors: { bg1: "#0D0D0D", bg2: "#2A2A2A", accent: "#FFC400", text: "#FFFFFF" }, icon: "taxi", language: "hi",
    description: [
      "🚕 Kaali Peeli Chase — Mumbai ki taxi, auto, BEST bus… shuffle ke baad nazar mein rakh paoge?",
      "Har level mein gaadiyan ghoomti hain, tez hoti hain — aakhir mein batao woh kahan hai!",
      "",
      "⏰ Roz 3 naye Shorts — subah 7, 9 aur raat 8 baje",
      "🏆 Har Tue / Thu / Sat shaam 6:30 — CHAMPIONSHIP: 20 rounds + BONUS (9 min). Score gino, apna rank dekho!",
      "💬 Number comment karo — sahi jawab AGLE video mein.",
      "",
      "Focus aur memory ka asli test. Subscribe karo 🔔",
      "",
      "#puzzle #trackthecar #shellgame #eyetest #brainteaser #mumbai"
    ].join("\n"),
    keywords: ["track the car", "shell game", "eye test", "focus test", "brain teaser", "puzzle", "kaali peeli", "mumbai taxi", "memory test", "hindi puzzle", "find the car", "nazar test"]
  },
  "dimaag-lock": {
    tokenSecret: "YT_TOKEN_DIMAAG_LOCK", handle: "@DimaagLock", title: "DIMAAG LOCK", tagline: "Crack the code. Every day.",
    colors: { bg1: "#021018", bg2: "#06374A", accent: "#00E5FF", text: "#FFFFFF" }, icon: "lock", language: "en",
    description: [
      "🔐 Dimaag Lock — one secret code, five clues. Can you crack it before the timer runs out?",
      "Every clue tells you how many digits are correct and how many are in the right place. Only one code fits them all.",
      "",
      "⏰ Two new code puzzles every day — 12:30 PM and 7:30 PM IST",
      "💬 Comment your code — the answer is revealed in the NEXT puzzle.",
      "",
      "Logic, deduction and number puzzles for sharp minds. Subscribe and keep your brain unlocked 🔔",
      "",
      "#codebreaker #logicpuzzle #brainteaser #numberpuzzle #riddle"
    ].join("\n"),
    keywords: ["code breaker", "crack the code", "logic puzzle", "number puzzle", "brain teaser", "riddle", "mastermind puzzle", "deduction puzzle", "iq test", "math puzzle", "lock puzzle", "brain game"]
  },
  "liar-lineup": {
    tokenSecret: "YT_TOKEN_LIAR_LINEUP", handle: "@JasoosBhaiCases", title: "JASOOS BHAI", tagline: "Jhooth kaun bol raha hai?",
    colors: { bg1: "#14100C", bg2: "#3A2A1A", accent: "#FF6B3D", text: "#FFF4E2" }, icon: "magnifier", language: "hi",
    description: [
      "🕵️ Jasoos Bhai — har din ek naya case! Suspects ki baatein suno, clues pakdo aur batao: JHOOTH KAUN bol raha hai?",
      "",
      "⏰ Roz 3 naye cases — subah 7:15, dopahar 1:15 aur raat 8:15",
      "💬 Apna jawab comment karo — sach AGLE case mein khulega.",
      "",
      "Desi detective mysteries, riddles aur logic — Hindi mein. Subscribe karo aur jasoos bano 🔔",
      "",
      "#mystery #detective #riddle #whoistheliar #paheli #hindimystery"
    ].join("\n"),
    keywords: ["mystery", "detective", "riddle", "who is lying", "jhooth kaun", "paheli", "hindi mystery", "detective puzzle", "logic puzzle", "jasoos", "brain teaser", "find the liar"]
  }
};
