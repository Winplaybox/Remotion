/**
 * JHOOTH KAUN? — content bank. Roman Hinglish (`r`, on screen) + Devanagari (`d`, Hindi TTS voice).
 * Gender tokens: {R} raha/rahi · {T} tha/thi · {G} gaya/gayi · {A} aaya/aayi. {V} = victim (Seth ji…).
 *
 * The game is decided by RULES: each rule = one clue that makes exactly one alibi impossible.
 * Honest alibis list the rules they would ALSO break (`breaks`) so the generator never picks them for that rule —
 * that is what guarantees exactly one liar (tests/liar-lineup.test.ts checks every day).
 */
import type { CastId as PresetId } from "@visuals/rig/cast";

export interface Bi { r: string; d: string }
export type SetKey = "haveli" | "village" | "flat";
export type When = "night" | "day" | "any";

export interface Rule {
  id: string;
  sets: SetKey[];
  when: Exclude<When, "any">;
  time: Bi;
  clue: Bi;
  liars: Bi[];
  /** one-line reason shown/spoken with the answer in the next video */
  why: Bi;
}

export const RULES: Rule[] = [
  {
    id: "power", sets: ["haveli", "village", "flat"], when: "night",
    time: { r: "raat 10 baje", d: "रात दस बजे" },
    clue: { r: "Raat 9 se 11 baje tak poore mohalle ki BIJLI GAYI hui thi.", d: "रात नौ से ग्यारह बजे तक पूरे मोहल्ले की बिजली गई हुई थी।" },
    liars: [
      { r: "Us waqt main TV pe cricket match dekh {R} {T}.", d: "उस वक़्त मैं टीवी पर क्रिकेट मैच देख {R} {T}।" },
      { r: "Us waqt main mixer mein chutney pees {R} {T}.", d: "उस वक़्त मैं मिक्सर में चटनी पीस {R} {T}।" },
      { r: "Us waqt main washing machine mein kapde dho {R} {T}.", d: "उस वक़्त मैं वॉशिंग मशीन में कपड़े धो {R} {T}।" }
    ],
    why: { r: "Bijli hi nahi thi!", d: "बिजली ही नहीं थी!" }
  },
  {
    id: "rain", sets: ["haveli", "village", "flat"], when: "night",
    time: { r: "raat 9 baje", d: "रात नौ बजे" },
    clue: { r: "Shaam 7 se raat 11 baje tak TEZ BAARISH ho rahi thi.", d: "शाम सात से रात ग्यारह बजे तक तेज़ बारिश हो रही थी।" },
    liars: [
      { r: "Us waqt main chhat pe baith ke taare gin {R} {T}.", d: "उस वक़्त मैं छत पर बैठ के तारे गिन {R} {T}।" },
      { r: "Us waqt main chhat pe kapde sukha {R} {T}.", d: "उस वक़्त मैं छत पर कपड़े सुखा {R} {T}।" }
    ],
    why: { r: "Tez baarish ho rahi thi!", d: "तेज़ बारिश हो रही थी!" }
  },
  {
    id: "moon", sets: ["haveli", "village", "flat"], when: "night",
    time: { r: "raat 10 baje", d: "रात दस बजे" },
    clue: { r: "Kal raat AMAVASYA thi — aasmaan mein CHAAND NAHI tha.", d: "कल रात अमावस्या थी, आसमान में चाँद नहीं था।" },
    liars: [
      { r: "Us waqt main chhat pe poore chaand ki photo le {R} {T}.", d: "उस वक़्त मैं छत पर पूरे चाँद की फ़ोटो ले {R} {T}।" },
      { r: "Us waqt main chaandni raat mein bahar tehel {R} {T}.", d: "उस वक़्त मैं चाँदनी रात में बाहर टहल {R} {T}।" }
    ],
    why: { r: "Amavasya ko chaand kahan?", d: "अमावस्या को चाँद कहाँ?" }
  },
  {
    id: "market", sets: ["haveli", "village", "flat"], when: "day",
    time: { r: "shaam 6 baje", d: "शाम छह बजे" },
    clue: { r: "Kal MANGALWAR tha — poora BAZAAR BAND tha.", d: "कल मंगलवार था, पूरा बाज़ार बंद था।" },
    liars: [
      { r: "Us waqt main bazaar mein sabzi khareed {R} {T}.", d: "उस वक़्त मैं बाज़ार में सब्ज़ी ख़रीद {R} {T}।" },
      { r: "Us waqt main bazaar ki dukaan se mithai le {R} {T}.", d: "उस वक़्त मैं बाज़ार की दुकान से मिठाई ले {R} {T}।" }
    ],
    why: { r: "Bazaar to band tha!", d: "बाज़ार तो बंद था!" }
  },
  {
    id: "water", sets: ["haveli", "village", "flat"], when: "day",
    time: { r: "subah 9 baje", d: "सुबह नौ बजे" },
    clue: { r: "Kal subah se PAANI NAHI AAYA — tanki ekdum KHAALI thi.", d: "कल सुबह से पानी नहीं आया, टंकी एकदम ख़ाली थी।" },
    liars: [
      { r: "Us waqt main nal ke neeche aaraam se naha {R} {T}.", d: "उस वक़्त मैं नल के नीचे आराम से नहा {R} {T}।" },
      { r: "Us waqt main pipe se gaadi dho {R} {T}.", d: "उस वक़्त मैं पाइप से गाड़ी धो {R} {T}।" }
    ],
    why: { r: "Paani to aaya hi nahi!", d: "पानी तो आया ही नहीं!" }
  },
  {
    id: "lift", sets: ["flat"], when: "day",
    time: { r: "dopahar 2 baje", d: "दोपहर दो बजे" },
    clue: { r: "Building ki LIFT do din se KHARAAB padi hai.", d: "बिल्डिंग की लिफ़्ट दो दिन से ख़राब पड़ी है।" },
    liars: [
      { r: "Us waqt main lift se neeche parking mein {G} {T}.", d: "उस वक़्त मैं लिफ़्ट से नीचे पार्किंग में {G} {T}।" },
      { r: "Us waqt main lift se terrace pe {G} {T}.", d: "उस वक़्त मैं लिफ़्ट से छत पर {G} {T}।" }
    ],
    why: { r: "Lift to kharaab thi!", d: "लिफ़्ट तो ख़राब थी!" }
  },
  {
    id: "network", sets: ["village"], when: "night",
    time: { r: "raat 10 baje", d: "रात दस बजे" },
    clue: { r: "Kal raat poore gaon mein MOBILE NETWORK NAHI tha.", d: "कल रात पूरे गाँव में मोबाइल नेटवर्क नहीं था।" },
    liars: [
      { r: "Us waqt main phone pe video call kar {R} {T}.", d: "उस वक़्त मैं फ़ोन पर वीडियो कॉल कर {R} {T}।" },
      { r: "Us waqt main phone pe live cricket score dekh {R} {T}.", d: "उस वक़्त मैं फ़ोन पर लाइव क्रिकेट स्कोर देख {R} {T}।" }
    ],
    why: { r: "Network hi nahi tha!", d: "नेटवर्क ही नहीं था!" }
  },
  {
    id: "gate", sets: ["haveli", "village"], when: "night",
    time: { r: "raat 11 baje", d: "रात ग्यारह बजे" },
    clue: { r: "Main GATE raat 10 baje BAND hua — chaabi sirf {V} ke paas thi.", d: "मेन गेट रात दस बजे बंद हुआ, चाबी सिर्फ़ {V} के पास थी।" },
    liars: [
      { r: "Us waqt main mele se ghoom ke gate se andar {A} {T}.", d: "उस वक़्त मैं मेले से घूम के गेट से अंदर {A} {T}।" },
      { r: "Us waqt main gate khol ke bahar chai peene {G} {T}.", d: "उस वक़्त मैं गेट खोल के बाहर चाय पीने {G} {T}।" }
    ],
    why: { r: "Gate to band tha!", d: "गेट तो बंद था!" }
  },
  {
    id: "school", sets: ["haveli", "village", "flat"], when: "day",
    time: { r: "subah 11 baje", d: "सुबह ग्यारह बजे" },
    clue: { r: "Kal RAVIVAAR tha — saare SCHOOL BAND the.", d: "कल रविवार था, सारे स्कूल बंद थे।" },
    liars: [
      { r: "Us waqt main school mein bachche ki PTM mein {T}.", d: "उस वक़्त मैं स्कूल में बच्चे की पीटीएम में {T}।" },
      { r: "Us waqt main school se chhote bhai ko lene {G} {T}.", d: "उस वक़्त मैं स्कूल से छोटे भाई को लेने {G} {T}।" }
    ],
    why: { r: "Ravivaar ko school band!", d: "रविवार को स्कूल बंद!" }
  },
  {
    id: "gas", sets: ["haveli", "village", "flat"], when: "night",
    time: { r: "raat 8 baje", d: "रात आठ बजे" },
    clue: { r: "Rasoi ka GAS CYLINDER subah se KHAALI tha.", d: "रसोई का गैस सिलेंडर सुबह से ख़ाली था।" },
    liars: [
      { r: "Us waqt main gas pe sabke liye rotiyan sek {R} {T}.", d: "उस वक़्त मैं गैस पर सबके लिए रोटियाँ सेक {R} {T}।" },
      { r: "Us waqt main gas pe doodh garam kar {R} {T}.", d: "उस वक़्त मैं गैस पर दूध गरम कर {R} {T}।" }
    ],
    why: { r: "Cylinder to khaali tha!", d: "सिलेंडर तो ख़ाली था!" }
  }
];

export interface Honest extends Bi { when: When; breaks: string[] }
export const HONEST: Honest[] = [
  { r: "Us waqt main apne kamre mein so {R} {T}.", d: "उस वक़्त मैं अपने कमरे में सो {R} {T}।", when: "night", breaks: [] },
  { r: "Us waqt main pooja ghar mein diya jala ke aarti kar {R} {T}.", d: "उस वक़्त मैं पूजा घर में दिया जला के आरती कर {R} {T}।", when: "any", breaks: [] },
  { r: "Us waqt main {V} ke pair daba {R} {T}.", d: "उस वक़्त मैं {V} के पैर दबा {R} {T}।", when: "any", breaks: [] },
  { r: "Us waqt main kamre mein baith ke sweater bun {R} {T}.", d: "उस वक़्त मैं कमरे में बैठ के स्वेटर बुन {R} {T}।", when: "any", breaks: [] },
  { r: "Us waqt main seedhiyon pe baith ke joote polish kar {R} {T}.", d: "उस वक़्त मैं सीढ़ियों पर बैठ के जूते पॉलिश कर {R} {T}।", when: "any", breaks: [] },
  { r: "Us waqt main harmonium pe bhajan ga {R} {T}.", d: "उस वक़्त मैं हारमोनियम पर भजन गा {R} {T}।", when: "any", breaks: [] },
  { r: "Us waqt main diary mein ghar ka hisaab likh {R} {T}.", d: "उस वक़्त मैं डायरी में घर का हिसाब लिख {R} {T}।", when: "any", breaks: [] },
  { r: "Us waqt main almari mein kapde tah kar {R} {T}.", d: "उस वक़्त मैं अलमारी में कपड़े तह कर {R} {T}।", when: "any", breaks: [] },
  { r: "Us waqt main bachchon ko kahani suna {R} {T}.", d: "उस वक़्त मैं बच्चों को कहानी सुना {R} {T}।", when: "any", breaks: [] },
  { r: "Us waqt main rasoi mein baith ke sabzi kaat {R} {T}.", d: "उस वक़्त मैं रसोई में बैठ के सब्ज़ी काट {R} {T}।", when: "any", breaks: [] },
  { r: "Us waqt main thaali mein chawal saaf kar {R} {T}.", d: "उस वक़्त मैं थाली में चावल साफ़ कर {R} {T}।", when: "any", breaks: [] },
  { r: "Us waqt main balti mein kapde bhigo {R} {T}.", d: "उस वक़्त मैं बाल्टी में कपड़े भिगो {R} {T}।", when: "any", breaks: ["water"] },
  { r: "Us waqt main gas pe sabke liye chai bana {R} {T}.", d: "उस वक़्त मैं गैस पर सबके लिए चाय बना {R} {T}।", when: "any", breaks: ["gas"] },
  { r: "Us waqt main TV pe purani film dekh {R} {T}.", d: "उस वक़्त मैं टीवी पर पुरानी फ़िल्म देख {R} {T}।", when: "night", breaks: ["power"] },
  { r: "Us waqt main phone pe gaane sun {R} {T}.", d: "उस वक़्त मैं फ़ोन पर गाने सुन {R} {T}।", when: "any", breaks: ["network", "power"] }
];

/** Clues that are true in every case and point at nobody — they make the board feel like a real investigation. */
export const FLAVOR: Bi[] = [
  { r: "Tijori ka TAALA TOOTA NAHI — chaabi se khola gaya.", d: "तिजोरी का ताला टूटा नहीं, चाबी से खोला गया।" },
  { r: "Khidkiyaan ANDAR SE BAND thi — chor ghar ka hi hai.", d: "खिड़कियाँ अंदर से बंद थीं, चोर घर का ही है।" },
  { r: "Kutta ek baar bhi NAHI BHAUNKA — koi ajnabi nahi aaya.", d: "कुत्ता एक बार भी नहीं भौंका, कोई अजनबी नहीं आया।" },
  { r: "Farsh pe kisi ke JOOTON KE NISHAAN nahi mile.", d: "फ़र्श पर किसी के जूतों के निशान नहीं मिले।" },
  { r: "Chaabi ki jagah sirf GHAR WALON ko pata thi.", d: "चाबी की जगह सिर्फ़ घर वालों को पता थी।" }
];

export interface SetInfo { victim: Bi; place: Bi; roles: { preset: PresetId; role: Bi }[] }
const R = (preset: PresetId, r: string, d: string) => ({ preset, role: { r, d } });
export const SETS: Record<SetKey, SetInfo> = {
  haveli: {
    victim: { r: "Seth ji", d: "सेठ जी" }, place: { r: "Seth ji ki haveli", d: "सेठ जी की हवेली" },
    roles: [R("naukar", "Naukar", "नौकर"), R("maali", "Maali", "माली"), R("driver", "Driver", "ड्राइवर"), R("munim", "Munim", "मुनीम"), R("beta", "Beta", "बेटा"), R("bahu", "Bahu", "बहू"), R("beti", "Beti", "बेटी"), R("dadi", "Dadi", "दादी"), R("kaamwali", "Kaamwali", "कामवाली"), R("chowkidar", "Chowkidar", "चौकीदार")]
  },
  village: {
    victim: { r: "Mukhiya ji", d: "मुखिया जी" }, place: { r: "Mukhiya ji ka ghar", d: "मुखिया जी का घर" },
    roles: [R("naukar", "Naukar", "नौकर"), R("maali", "Maali", "माली"), R("beta", "Beta", "बेटा"), R("bahu", "Bahu", "बहू"), R("beti", "Beti", "बेटी"), R("dadi", "Dadi", "दादी"), R("kaamwali", "Kaamwali", "कामवाली"), R("chowkidar", "Chowkidar", "चौकीदार")]
  },
  flat: {
    victim: { r: "Sharma ji", d: "शर्मा जी" }, place: { r: "Sharma ji ka flat", d: "शर्मा जी का फ़्लैट" },
    roles: [R("driver", "Driver", "ड्राइवर"), R("beta", "Beta", "बेटा"), R("bahu", "Bahu", "बहू"), R("beti", "Beti", "बेटी"), R("dadi", "Dadi", "दादी"), R("kaamwali", "Kaamwali", "कामवाली"), R("chowkidar", "Guard", "गार्ड")]
  }
};

export const NAMES: Record<"m" | "f", Bi[]> = {
  m: [
    { r: "Ramu", d: "रामू" }, { r: "Shyam", d: "श्याम" }, { r: "Bholu", d: "भोलू" }, { r: "Kallu", d: "कल्लू" }, { r: "Raju", d: "राजू" },
    { r: "Pappu", d: "पप्पू" }, { r: "Munna", d: "मुन्ना" }, { r: "Chhotu", d: "छोटू" }, { r: "Girdhar", d: "गिरधर" }, { r: "Banwari", d: "बनवारी" }
  ],
  f: [
    { r: "Kamla", d: "कमला" }, { r: "Sarla", d: "सरला" }, { r: "Pinki", d: "पिंकी" }, { r: "Rani", d: "रानी" }, { r: "Geeta", d: "गीता" },
    { r: "Meena", d: "मीना" }, { r: "Sunita", d: "सुनीता" }, { r: "Savitri", d: "सावित्री" }
  ]
};

export const ITEMS: (Bi & { title: string })[] = [
  { r: "SONE KA HAAR", d: "सोने का हार", title: "HAAR KISNE CHURAYA?" },
  { r: "HEERE KI ANGOOTHI", d: "हीरे की अंगूठी", title: "ANGOOTHI KISNE CHURAYI?" },
  { r: "5 LAKH RUPAYE", d: "पाँच लाख रुपये", title: "PAISE KISNE CHURAYE?" },
  { r: "CHAANDI KE SIKKE", d: "चाँदी के सिक्के", title: "SIKKE KISNE CHURAYE?" },
  { r: "SONE KI PURANI GHADI", d: "सोने की पुरानी घड़ी", title: "GHADI KISNE CHURAYI?" },
  { r: "ZAMEEN KE KAAGAZ", d: "ज़मीन के कागज़", title: "KAAGAZ KISNE CHURAYE?" }
];

const TOK = {
  m: { r: { R: "raha", T: "tha", G: "gaya", A: "aaya" }, d: { R: "रहा", T: "था", G: "गया", A: "आया" } },
  f: { r: { R: "rahi", T: "thi", G: "gayi", A: "aayi" }, d: { R: "रही", T: "थी", G: "गई", A: "आई" } }
} as const;

/** Fill gender + victim tokens. */
export function fill(b: Bi, g: "m" | "f", victim: Bi): Bi {
  const sub = (s: string, t: Record<string, string>, v: string) => s.replace(/\{(R|T|G|A)\}/g, (_, k: string) => t[k] ?? k).replace(/\{V\}/g, v);
  return { r: sub(b.r, TOK[g].r, victim.r), d: sub(b.d, TOK[g].d, victim.d) };
}
