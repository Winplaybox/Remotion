import { askOutro } from "../../engines/ask-outro";
import { P, StoryDioramaSchema, type StoryDiorama, type StoryDioramaInput } from "../../engines/story-diorama/src/model";

/**
 * #22 KAUN HOON MAIN? — guess the Mahabharata / Ramayana character from 3 clues (each clue from the text, cited).
 * Story-diorama engine + shared AskOutro (A/B/C/D). Has ONE right answer: revealed at the start of the next video
 * and posted as a comment once that video is public (channels.ts answer / answerInNextFrom / quiz).
 * Post n = CHARACTERS[n - 1]; unwritten posts fail closed.
 */

export interface Character {
  name: string; nameHi: string;
  /** Spoken clue (Devanagari, first person) + short card line (<=18 chars). */
  clues: { hi: string; card: string }[];
  /** 3 wrong options from the same epic (shown with the answer in A-D order, answer slot rotates by post). */
  others: [string, string, string];
  fig: Record<string, unknown>;
  sources: string;
}

const C: Character[] = [
  // Adi Parva 104 (born with armour and earrings, raised by Adhiratha & Radha); Vana Parva 300-310 (gives armour to Indra).
  { name: "KARNA", nameHi: "कर्ण", others: ["ARJUN", "BHISHMA", "ASHWATTHAMA"], fig: { robe: "#C9861A", head: "crown", item: "bow" }, sources: "Mahabharat: Adi Parva 104, Vana Parva 300–310",
    clues: [{ hi: "मेरा जन्म कवच और कुंडल के साथ हुआ था।", card: "KAVACH-KUNDAL" }, { hi: "मुझे एक सारथी अधिरथ और राधा ने पाला।", card: "SAARATHI NE PAALA" }, { hi: "मैंने अपना कवच भी इंद्र को दान कर दिया।", card: "KAVACH BHI DAAN" }] },
  // Adi Parva 94 (vow of celibacy, boon of choosing his death); Bhishma Parva 114-120 (bed of arrows).
  { name: "BHISHMA", nameHi: "भीष्म", others: ["DRONA", "VIDUR", "KRIPACHARYA"], fig: { robe: "#F2F2F2", head: "sage", item: "abhaya" }, sources: "Mahabharat: Adi Parva 94, Bhishma Parva 114–120",
    clues: [{ hi: "पिता की खुशी के लिए, मैंने कभी विवाह न करने की प्रतिज्ञा ली।", card: "VIVAH NAHI KARUNGA" }, { hi: "मुझे इच्छा मृत्यु का वरदान मिला।", card: "ICHCHHA MRITYU" }, { hi: "युद्ध के बाद मैं बाणों की शैया पर लेटा रहा।", card: "BAANON KI SHAIYYA" }] },
  // Valmiki Ramayana Kishkindha Kanda 66 (leaps at the sun as a child), Sundara Kanda 1 & 36 (crosses the ocean, gives Rama's ring).
  { name: "HANUMAN", nameHi: "हनुमान", others: ["ANGAD", "SUGREEV", "JAMBAVAN"], fig: { robe: "#E06A1B", skin: "#C98A4A", head: "crown", item: "lift" }, sources: "Valmiki Ramayan: Kishkindha Kand 66, Sundar Kand 1 & 36",
    clues: [{ hi: "बचपन में मैं सूरज को फल समझकर पकड़ने उड़ा।", card: "SURAJ = PHAL?" }, { hi: "मैंने एक छलांग में समुद्र पार किया।", card: "SAMUDRA PAAR" }, { hi: "मैंने सीता माँ को राम की अंगूठी दी।", card: "RAM KI ANGUTHI" }] },
  // Adi Parva 130 (neighed like Uchchaihshravas at birth, hence the name); Sauptika Parva 15-16 (gem on the forehead); son of Drona.
  { name: "ASHWATTHAMA", nameHi: "अश्वत्थामा", others: ["DURYODHAN", "KARNA", "SHAKUNI"], fig: { robe: "#5E3015", head: "sage", item: "bow" }, sources: "Mahabharat: Adi Parva 130, Sauptika Parva 15–16",
    clues: [{ hi: "जन्म लेते ही मैं घोड़े की तरह हिनहिनाया, इसी से मेरा नाम पड़ा।", card: "GHODE JAISI AWAAZ" }, { hi: "मेरे पिता, गुरु द्रोण थे।", card: "PITA: GURU DRONA" }, { hi: "मेरे माथे पर एक मणि थी।", card: "MAATHE PE MANI" }] },
  // Adi Parva 155-157 (born from Drupada's sacrificial fire, named Krishnaa); Adi Parva 190-197 (five husbands).
  { name: "DRAUPADI", nameHi: "द्रौपदी", others: ["KUNTI", "GANDHARI", "SUBHADRA"], fig: { robe: "#D6336C", head: "bun", item: "namaste" }, sources: "Mahabharat: Adi Parva 155–157, 190–197",
    clues: [{ hi: "मेरा जन्म यज्ञ की अग्नि से हुआ।", card: "YAGYA KI AGNI" }, { hi: "मेरा एक नाम कृष्णा भी है।", card: "NAAM: KRISHNAA" }, { hi: "पाँच भाई मेरे पति थे।", card: "PAANCH PATI" }] },
  // Valmiki Ramayana Yuddha Kanda 9-16 (advises returning Sita, joins Rama), 112 (crowned king of Lanka).
  { name: "VIBHISHAN", nameHi: "विभीषण", others: ["KUMBHAKARNA", "MEGHNAD", "MAREECH"], fig: { robe: "#3A2A4A", skin: "#7A5A8A", head: "crown", item: "namaste" }, sources: "Valmiki Ramayan: Yuddha Kand 9–16, 112",
    clues: [{ hi: "मैं रावण का छोटा भाई हूँ।", card: "RAVAN KA BHAI" }, { hi: "मैंने रावण से कहा, सीता को लौटा दो।", card: "SITA LAUTA DO!" }, { hi: "युद्ध के बाद राम ने मुझे लंका का राजा बनाया।", card: "LANKA KA RAJA" }] },
  // Adi Parva 123 (son of the Nishada chief Hiranyadhanus; learns before Drona's image; gives his thumb).
  { name: "EKALAVYA", nameHi: "एकलव्य", others: ["KARNA", "ABHIMANYU", "BARBARIK"], fig: { robe: "#5E3015", skin: "#8A5A3A", head: "feather", item: "bow" }, sources: "Mahabharat: Adi Parva 123",
    clues: [{ hi: "मैं निषाद राजा हिरण्यधनु का पुत्र हूँ।", card: "NISHAD RAJKUMAR" }, { hi: "मैंने गुरु की मूर्ति बनाकर धनुष चलाना सीखा।", card: "GURU KI MURTI" }, { hi: "गुरु दक्षिणा में मैंने अपना अंगूठा दे दिया।", card: "ANGUTHA DAAN" }] },
  // Adi Parva 110 (blindfolds herself), Adi Parva 114-115 (hundred sons), Stri Parva 25 (curses Krishna).
  { name: "GANDHARI", nameHi: "गांधारी", others: ["KUNTI", "DRAUPADI", "SATYAVATI"], fig: { robe: "#5A2A6A", head: "bun", item: "namaste" }, sources: "Mahabharat: Adi Parva 110 & 114–115, Stri Parva 25",
    clues: [{ hi: "पति देख नहीं सकते थे, तो मैंने भी आँखों पर पट्टी बाँध ली।", card: "AANKHON PE PATTI" }, { hi: "मेरे सौ पुत्र थे।", card: "100 PUTRA" }, { hi: "युद्ध के बाद, मैंने कृष्ण को श्राप दिया।", card: "KRISHNA KO SHRAAP" }] },
  // Valmiki Ramayana Aranya Kanda 14 (friend of Dasharatha), 50-51 (fights Ravana for Sita), 67-68 (tells Rama, dies).
  { name: "JATAYU", nameHi: "जटायु", others: ["SAMPATI", "GARUD", "JAMBAVAN"], fig: { robe: "#8A5A2E", skin: "#C9B48A", head: "feather", item: "abhaya" }, sources: "Valmiki Ramayan: Aranya Kand 14, 50–51, 67–68",
    clues: [{ hi: "मैं राजा दशरथ का मित्र, एक गिद्धराज हूँ।", card: "DASHARATH KA MITRA" }, { hi: "सीता को बचाने, मैं अकेला रावण से लड़ा।", card: "RAVAN SE LADA" }, { hi: "मरने से पहले, मैंने राम को रावण का पता बताया।", card: "RAM KO BATAYA" }] },
  // Adi Parva 213-221 (son of Arjuna and Subhadra, Krishna's nephew), Virata Parva 72 (marries Uttara), Drona Parva 33-49 (chakravyuha).
  { name: "ABHIMANYU", nameHi: "अभिमन्यु", others: ["GHATOTKACH", "BARBARIK", "IRAVAN"], fig: { robe: "#4A78B8", head: "child", item: "sword" }, sources: "Mahabharat: Adi Parva 213–221, Virata Parva 72, Drona Parva 33–49",
    clues: [{ hi: "मेरे पिता अर्जुन, और मामा स्वयं कृष्ण।", card: "MAMA: KRISHNA" }, { hi: "मेरा विवाह, राजा विराट की बेटी उत्तरा से हुआ।", card: "PATNI: UTTARA" }, { hi: "सोलह साल की उम्र में मैं चक्रव्यूह में अकेला घुसा।", card: "CHAKRAVYUH" }] },
  // Valmiki Ramayana Aranya Kanda 74 (disciple of Matanga's ashram, waited for Rama, shows the way to Pampa and Sugriva).
  { name: "SHABARI", nameHi: "शबरी", others: ["AHALYA", "ANASUYA", "MANDODARI"], fig: { robe: "#8A6A3A", head: "bun", item: "namaste" }, sources: "Valmiki Ramayan: Aranya Kand 74",
    clues: [{ hi: "मैं मतंग ऋषि के आश्रम में रहती थी।", card: "MATANG ASHRAM" }, { hi: "मैंने बरसों राम की राह देखी।", card: "BARSON INTEZAAR" }, { hi: "मैंने राम को सुग्रीव तक जाने का रास्ता बताया।", card: "SUGREEV KA RASTA" }] },
  // Adi Parva 151-155 (son of Bhima and Hidimbi), Drona Parva 154-179 (Karna uses Indra's shakti on him).
  { name: "GHATOTKACH", nameHi: "घटोत्कच", others: ["BARBARIK", "ABHIMANYU", "IRAVAN"], fig: { robe: "#3A2A2A", skin: "#5A4A6A", head: "jata", item: "lift" }, sources: "Mahabharat: Adi Parva 151–155, Drona Parva 154–179",
    clues: [{ hi: "मेरी माँ हिडिम्बा हैं।", card: "MAA: HIDIMBA" }, { hi: "मेरे पिता, गदाधारी भीम।", card: "PITA: BHEEM" }, { hi: "मुझे रोकने के लिए, कर्ण को इंद्र की शक्ति चलानी पड़ी।", card: "INDRA KI SHAKTI" }] },
  // Valmiki Ramayana Uttara Kanda 10 (boon of long sleep), Yuddha Kanda 60 (woken with drums and elephants), 63 (tells Ravana he erred).
  { name: "KUMBHAKARNA", nameHi: "कुंभकर्ण", others: ["VIBHISHAN", "MEGHNAD", "PRAHAST"], fig: { robe: "#3A2A4A", skin: "#7A5A8A", head: "crown", horns: true }, sources: "Valmiki Ramayan: Uttar Kand 10, Yuddha Kand 60 & 63",
    clues: [{ hi: "एक वरदान से, मैं बहुत लंबी नींद सोता था।", card: "LAMBI NEEND" }, { hi: "मुझे जगाने के लिए, नगाड़े बजे और हाथी चलाए गए।", card: "HAATHI SE JAAGA" }, { hi: "मैंने भाई से साफ़ कहा, तुमने ग़लती की है।", card: "\"TUMNE GALTI KI\"" }] },
  // Adi Parva 100 (born to a maid of Ambika's palace; incarnation of Dharma), Adi Parva 135-136 (warns Pandavas of the lac house).
  { name: "VIDUR", nameHi: "विदुर", others: ["SANJAY", "BHISHMA", "KRIPACHARYA"], fig: { robe: "#F6E2B3", head: "sage", item: "namaste" }, sources: "Mahabharat: Adi Parva 100, 106, 135–136",
    clues: [{ hi: "मैं एक दासी का पुत्र, पर हस्तिनापुर का महामंत्री बना।", card: "DAASI-PUTRA MANTRI" }, { hi: "मुझे धर्मराज यम का अंश माना जाता है।", card: "YAM KA ANSH" }, { hi: "लाक्षागृह का ख़तरा, मैंने पांडवों को पहले ही बता दिया।", card: "LAAKSHAGRIH" }] }
];

export const KHM_HANDLE = "@EpicBharatSaga";
export const KHM_LETTERS = ["A", "B", "C", "D"] as const;
const CTA_VOICE = "अपना जवाब कमेंट में लिखो, ए, बी, सी या डी! और सही जवाब देखने के लिए फॉलो करो।";
const PAL = { paper: "#F5EEDF", ink: "#1C1A17", accent: "#F0533F", accent2: "#F6B93B", accent3: "#5BD17A" };
const SKY: [string, string] = ["#12172A", "#2E2448"];
const SILHOUETTE = { robe: "#0B0B12", skin: "#0B0B12", head: "crown", sash: "#0B0B12" };

export const kaunHoonMainCount = () => C.length;
export function kaunHoonMainCharacter(n: number): Character {
  const c = C[Math.floor(n) - 1];
  if (!c) throw new Error(`Kaun Hoon Main #${n} is not written yet in content/kaun-hoon-main/characters.ts`);
  return c;
}

/** Options in A-D order; the answer slot rotates with n so it is never always "A". */
export function kaunHoonMainOptions(n: number): { options: string[]; answer: number } {
  const c = kaunHoonMainCharacter(n);
  const answer = (n * 3 + 1) % 4;
  const others = [...c.others];
  const options = [0, 1, 2, 3].map((i) => (i === answer ? c.name : others.shift()!));
  return { options, answer };
}

type Scene = Omit<StoryDioramaInput["scenes"][number], "fig">;

export function kaunHoonMainForDay(n: number): StoryDiorama {
  const c = kaunHoonMainCharacter(n);
  const { options } = kaunHoonMainOptions(n);
  const scenes: Scene[] = [];
  if (n >= 2) {
    const prev = kaunHoonMainCharacter(n - 1);
    const pa = kaunHoonMainOptions(n - 1);
    scenes.push({
      id: "prev", seconds: 3.5, location: "PICHHLE SAWAAL KA JAWAB", sky: SKY, particles: "stars", camera: "still",
      narration: `पिछला जवाब था, ${KHM_LETTERS[pa.answer]}, ${prev.nameHi}।`, caption: `Pichhla jawab: ${KHM_LETTERS[pa.answer]} — ${prev.name}`,
      headlines: [{ at: 0, lines: [{ text: "PICHHLA JAWAB:" }, { text: prev.name, tone: "accent3" }] }],
      layers: [P("figure", 540, 1560, { depth: 1, enter: "pop", data: { ...prev.fig, halo: true } })]
    });
  }
  scenes.push({
    id: "hook", seconds: 4, location: `KAUN HOON MAIN? #${String(n).padStart(2, "0")}`, sky: SKY, particles: "stars",
    narration: "मैं कौन हूँ? तीन सुराग, एक जवाब।", caption: "Main kaun hoon? 3 suraag, 1 jawab.",
    headlines: [{ at: 0, lines: [{ text: "KAUN HOON" }, { text: "MAIN?", tone: "accent2" }] }],
    layers: [P("moon", 540, 860, { depth: 0.1, idle: "pulse" }), P("figure", 540, 1560, { depth: 1, at: 0.2, enter: "rise", data: SILHOUETTE })]
  });
  c.clues.forEach((cl, i) => scenes.push({
    id: `clue-${i + 1}`, seconds: 5.5, location: `SURAAG ${i + 1} / 3`, sky: SKY, particles: "stars", camera: "still",
    narration: cl.hi, caption: "",
    headlines: [{ at: 0, lines: [{ text: `SURAAG ${i + 1}:` }, { text: cl.card.length <= 16 ? cl.card : "DHYAN SE SUNO", tone: "accent2" }] }],
    layers: [
      P("figure", 300, 1600, { depth: 1, scale: 0.85, data: SILHOUETTE }),
      P("noteCard", 720, 1100, { depth: 0.7, at: 0.2, enter: i === 0 ? "drop" : "none", scale: 0.85, data: { title: "SURAAG:", items: c.clues.slice(0, i + 1).map((x) => x.card) } })
    ]
  }));
  const q = "MAIN KAUN HOON?";
  scenes.push({
    id: "ask", seconds: 9.5, location: "AAPKA JAWAB", sky: SKY, particles: "stars", camera: "still",
    narration: `तो बताइए, मैं कौन हूँ? ${CTA_VOICE}`, caption: "",
    headlines: [{ at: 0, lines: [{ text: "KAUN?" }] }],
    layers: [
      P("figure", 300, 1600, { depth: 1, scale: 0.85, data: SILHOUETTE }),
      P("noteCard", 720, 1100, { depth: 0.7, scale: 0.85, data: { title: "SURAAG:", items: c.clues.map((x) => x.card) } })
    ]
  });
  return StoryDioramaSchema.parse({
    brand: "EPIC BHARAT SAGA", handle: KHM_HANDLE, tag: "KAUN HOON MAIN · #", tagAccent: String(n).padStart(2, "0"),
    palette: PAL, transitionFrames: 10,
    scenes: scenes.map((s, i) => ({ ...s, fig: `SCENE ${i + 1}` })),
    ask: askOutro({
      question: q, options: options.map((o, i) => `${KHM_LETTERS[i]}: ${o}`), voiceQuestion: "तो बताइए, मैं कौन हूँ?",
      voiceCta: CTA_VOICE, handle: KHM_HANDLE, questionSeconds: 4, ctaSeconds: 5.5
    })
  });
}

/**
 * Viewer guess for comment auto-replies -> [1..4]. Conservative on purpose (a wrong auto-reply is worse than none):
 * only a comment that is JUST the letter ("B", "b)", "option c", "Ans: D", "jawab - a 🙏") counts.
 */
export function parseKhmLetter(text: string): number[] | null {
  const t = text.toLowerCase().replace(/[^\p{L}\p{N}\s:\-)]/gu, " ").trim();
  const m = /^(?:option|opt|ans|answer|jawab|uttar)?\s*[:\-]?\s*([abcd])\s*\)?$/.exec(t);
  return m ? ["abcd".indexOf(m[1]!) + 1] : null;
}

/** Viewer guess -> [1..4]: the letter, or the option's name ("karna" — whole word only). Needs the post number. */
export function parseKhmGuess(text: string, n: number): number[] | null {
  const t = ` ${text.toLowerCase()} `;
  const { options } = kaunHoonMainOptions(n);
  const byName = options.findIndex((o) => new RegExp(`(^|[^a-z])${o.toLowerCase()}([^a-z]|$)`).test(t));
  if (byName >= 0) return [byName + 1];
  const m = /(?:^|[^a-z])([abcd])(?=[^a-z]|$)/.exec(t);
  return m ? ["abcd".indexOf(m[1]!) + 1] : null;
}

export function kaunHoonMainMeta(n: number) {
  const c = kaunHoonMainCharacter(n);
  const { options } = kaunHoonMainOptions(n);
  return {
    title: `Main Kaun Hoon? 3 suraag, 1 jawab 🤔 | Kaun Hoon Main #${n} #shorts`,
    description: [
      "3 suraag suno aur batao main kaun hoon 👇",
      options.map((o, i) => `${KHM_LETTERS[i]}: ${o}`).join(" · "),
      "Sahi jawab agli video mein — FOLLOW karo!",
      `Suraag ka source: ${c.sources}`,
      "", "#mahabharat #ramayan #mythologyquiz #sanatandharma #shorts"
    ].join("\n"),
    tags: ["kaun hoon main", "mythology quiz", "mahabharat quiz", "ramayan quiz", "guess the character", "hindu mythology", "sanatan dharma", "epic bharat saga", "shorts"],
    caption: "Main kaun hoon? 3 suraag 🤔 Jawab comment mein (A/B/C/D) 👇 Sahi jawab agli video mein!\n#mahabharat #ramayan #mythologyquiz #reels",
    language: "hi",
    categoryId: "27"
  };
}
