import { P, StoryDioramaSchema, type StoryDiorama, type StoryDioramaInput } from "../../engines/story-diorama/src/model";

/**
 * EpicBharatSaga — one episode per day, numbered globally across seasons.
 * Channel day N = global episode N. Seasons run back to back (SEASONS order).
 * Every episode cites its source in a comment. Unwritten episodes fail closed.
 */

export interface Season {
  id: string;
  /** Shown in the series header, e.g. "VISHNU SEASON". */
  name: string;
  /** Short name for titles, e.g. "Vishnu". */
  short: string;
  outline: readonly string[];
  palette: StoryDioramaInput["palette"];
  hashtags: string;
  tags: readonly string[];
}

const PAL = { paper: "#F5EEDF", ink: "#1C1A17", accent: "#F0533F", accent2: "#F6B93B", accent3: "#5BD17A" };

/** Season roadmap. Outlines after Vishnu are the plan; episodes are written ahead by the daily ops task. */
export const SEASONS: readonly Season[] = [
  {
    id: "vishnu", name: "VISHNU SEASON", short: "Vishnu", palette: PAL,
    outline: ["MATSYA", "KURMA", "VARAHA", "NARASIMHA", "VAMANA", "PARASHURAMA", "RAMA", "KRISHNA", "BUDDHA", "KALKI"],
    hashtags: "#sanatandharma #vishnu #dashavatar #hindumythology",
    tags: ["vishnu", "dashavatar", "bhagavata purana"]
  },
  {
    id: "shiva", name: "SHIV SEASON", short: "Mahadev", palette: { ...PAL, accent: "#4FA3D8" },
    outline: ["NEELKANTH", "SATI", "GANGADHAR", "ARDHANARISHWAR", "JYOTIRLINGA", "TRIPURARI", "MARKANDEYA", "KIRAT ARJUN", "RAVAN AUR KAILASH", "NANDI"],
    hashtags: "#sanatandharma #mahadev #shiva #harharmahadev",
    tags: ["shiva", "mahadev", "shiv puran"]
  },
  {
    id: "ganesha", name: "GANESH SEASON", short: "Ganesh", palette: { ...PAL, accent: "#E8731C" },
    outline: ["GANESH JANM", "GAJMUKH", "PARIKRAMA", "MOOSHAK", "CHANDRA SHRAAP", "MAHABHARAT KE LEKHAK", "EKDANT", "VIGHNAHARTA"],
    hashtags: "#sanatandharma #ganesh #ganpatibappa #vighnaharta",
    tags: ["ganesh", "ganpati", "ganesh puran"]
  },
  {
    id: "devi", name: "DEVI SEASON", short: "Maa Durga", palette: { ...PAL, accent: "#D6336C" },
    outline: ["SHAILPUTRI", "BRAHMACHARINI", "CHANDRAGHANTA", "KUSHMANDA", "SKANDAMATA", "KATYAYANI", "KAALRATRI", "MAHAGAURI", "SIDDHIDATRI", "MAHISHASUR MARDINI"],
    hashtags: "#sanatandharma #maadurga #navdurga #jaimatadi",
    tags: ["durga", "navdurga", "devi mahatmya"]
  },
  {
    id: "hanuman", name: "HANUMAN SEASON", short: "Hanuman", palette: { ...PAL, accent: "#E8501C" },
    outline: ["BAAL HANUMAN", "SURYA AUR HANUMAN", "RAM MILAN", "SAMUDRA LAANGHNA", "LANKA DAHAN", "SANJEEVANI", "PANCHMUKHI", "BHEEM AUR HANUMAN", "CHIRANJEEVI", "HANUMAN CHALISA"],
    hashtags: "#sanatandharma #hanuman #jaibajrangbali #ramayan",
    tags: ["hanuman", "bajrangbali", "ramayana"]
  }
];

/** Kept for existing imports. */
export const VISHNU_SEASON = { ...SEASONS[0]!, total: SEASONS[0]!.outline.length } as const;

export interface EpisodeInfo { global: number; season: Season; seasonIndex: number; local: number; total: number; name: string }

/** Global episode N -> season + episode within it. Null past the last planned season. */
export function episodeInfo(n: number): EpisodeInfo | null {
  let left = Math.max(1, Math.floor(n));
  for (let i = 0; i < SEASONS.length; i++) {
    const season = SEASONS[i]!;
    if (left <= season.outline.length) return { global: Math.floor(n), season, seasonIndex: i, local: left, total: season.outline.length, name: season.outline[left - 1]! };
    left -= season.outline.length;
  }
  return null;
}

type FullScene = StoryDioramaInput["scenes"][number];
/** Authored scene: `fig` is filled in automatically ("SCENE n"). */
type Scene = Omit<FullScene, "fig"> & { fig?: string };
type Ep = { scenes: Scene[] };

const OCEAN_SKY: [string, string] = ["#0E2A47", "#1E5F78"];
const STORM_SKY: [string, string] = ["#1B2233", "#3A4A5E"];
const NIGHT_SKY: [string, string] = ["#1E1A3A", "#4A2A4A"];
const DAWN_SKY: [string, string] = ["#F2C98B", "#E59A6B"];
const FIRE_SKY: [string, string] = ["#2A1440", "#6B3A2A"];
const FOREST_SKY: [string, string] = ["#1F3A2A", "#4E6B3A"];

const ASURA = { robe: "#3A2A4A", skin: "#7A5A8A", horns: true, glowEyes: true, head: "crown" };
const DEVA = { robe: "#F28C28", head: "crown", item: "namaste" };
const SAGE = { robe: "#E06A1B", head: "sage", item: "kamandalu" };

/** Dashavatar progress card for the closing scene of season episode `local` (1-based). */
function tracker(season: Season, local: number) {
  const total = season.outline.length;
  const start = Math.max(1, Math.min(local - 1, total - 4));
  return P("festivalTracker", 540, 1130, {
    depth: 0.7, at: 0.3, enter: "drop",
    data: { title: season.name.replace(" SEASON", ""), prefix: "EP", start, items: season.outline.slice(start - 1, start + 4), done: local - start + 1 }
  });
}

/** Closing scene: what comes tomorrow + follow CTA. */
function nextScene(season: Season, local: number, narration: string, caption: string, nextTitle: string): Scene {
  return {
    id: "next", seconds: 5.5, location: `${season.name.replace(" SEASON", "")} · AAGE`, sky: NIGHT_SKY, particles: "stars",
    narration, caption,
    headlines: [{ at: 0, lines: [{ text: `KAL: EP ${String(local + 1).padStart(2, "0")}` }, { text: nextTitle, tone: "accent3" }] }],
    layers: [tracker(season, local)]
  };
}

const V = SEASONS[0]!;

/** Fully authored episodes, keyed by GLOBAL episode number. */
const EPISODES: Record<number, Ep> = {
  // EP01 Matsya. Source: Bhagavata Purana 8.24.
  1: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "SATYUG · PRALAY SE PEHLE", sky: ["#0B1B3A", "#174A6B"], particles: "stars",
        narration: "भगवान विष्णु का पहला अवतार... एक मछली था। मत्स्य अवतार।",
        caption: "Bhagwan Vishnu ka pehla avatar... ek machhli tha. Matsya avatar.",
        headlines: [
          { at: 0, lines: [{ text: "VISHNU KA" }, { text: "PEHLA AVATAR", tone: "accent2" }] },
          { at: 2.6, lines: [{ text: "EK MACHHLI:" }, { text: "MATSYA", tone: "accent2" }] }
        ],
        layers: [
          P("sun", 540, 900, { depth: 0.1, idle: "pulse", data: { color: "#FFE3A3" } }),
          P("fish", 560, 1220, { at: 0.8, enter: "rise", idle: "bob", depth: 1, scale: 1.25, data: { horn: true } }),
          P("water", 540, 1400, { depth: 0.5, data: { pads: false } })
        ]
      },
      {
        id: "anjali", seconds: 6.5, location: "KRITAMALA NADI · TARPAN", sky: DAWN_SKY, tone: "dark", particles: "none",
        narration: "राजा सत्यव्रत कृतमाला नदी में तर्पण कर रहे थे। तभी उनकी अंजलि में एक छोटी सी मछली आ गई, और बोली, मुझे बड़ी मछलियों से बचा लो।",
        caption: "Raja Satyavrat nadi mein tarpan kar rahe the. Tabhi unki anjali mein ek chhoti machhli aayi aur boli: mujhe bachao.",
        headlines: [
          { at: 0, lines: [{ text: "RAJA SATYAVRAT" }, { text: "KI ANJALI MEIN…", tone: "accent" }] },
          { at: 3.4, lines: [{ text: "\"MUJHE" }, { text: "BACHA LO!\"", tone: "accent" }] }
        ],
        layers: [
          P("sun", 760, 760, { depth: 0.1, data: { color: "#FFF1C9" } }),
          P("hills", 540, 1300, { depth: 0.2, data: { color: "#B5734E" } }),
          P("water", 540, 1420, { depth: 0.5, data: { pads: false, c1: "#4FA3B8", c2: "#3B8DA3", c3: "#2C7489" } }),
          P("kamandalu", 540, 1500, { at: 0.6, enter: "rise", idle: "bob", depth: 1, scale: 1.3 })
        ],
        labels: [{ text: "KAMANDAL", x: 250, y: 1270, toX: 400, toY: 1400, at: 2.2 }, { text: "CHHOTI MACHHLI", x: 790, y: 1180, toX: 600, toY: 1360, at: 2.8 }]
      },
      {
        id: "growth", seconds: 7, location: "EK RAAT MEIN · CHAMATKAR", sky: ["#123B4A", "#1E6B78"], particles: "bubbles",
        narration: "राजा ने उसे कमंडल में रखा, पर वह रात भर में बढ़ गई। फिर मटका, फिर सरोवर, और अंत में समुद्र भी उसके लिए छोटा पड़ने लगा।",
        caption: "Kamandal mein rakha, raat bhar mein badi ho gayi. Phir matka, phir sarovar... aur samudra bhi chhota pad gaya!",
        headlines: [{ at: 0, lines: [{ text: "JITNA BADA BARTAN," }, { text: "UTNI BADI MACHHLI", tone: "accent2" }] }],
        layers: [P("growthSteps", 540, 1420, { depth: 0.6, at: 0.4, enter: "none", data: { stepSeconds: 1.2 } })]
      },
      {
        id: "warning", seconds: 6.5, location: "MATSYA KI CHETAVANI", sky: STORM_SKY, particles: "rain",
        narration: "मछली ने कहा, सात दिन बाद प्रलय आएगी। एक नाव आएगी। उसमें सप्तऋषि, सारे बीज और औषधियाँ ले जाना।",
        caption: "Machhli ne kaha: saat din baad pralay aayegi. Ek naav aayegi. Usmein saptarishi, beej aur aushadhiyan le jaana.",
        headlines: [{ at: 0, lines: [{ text: "SAAT DIN BAAD" }, { text: "PRALAY!", tone: "accent" }] }],
        layers: [
          P("clouds", 540, 900, { depth: 0.3, idle: "drift", data: { count: 4, spread: 250, color: "#7D879A" } }),
          P("noteCard", 540, 1080, { depth: 0.7, at: 0.5, enter: "drop", data: { title: "NAAV MEIN LE JAANA:", items: ["SAPTARISHI", "SAB BEEJ", "SAB AUSHADHI"] } }),
          P("water", 540, 1560, { depth: 0.6, data: { amp: 2.4, pads: false, c1: "#2E5A6E", c2: "#244B5C", c3: "#1A3A48" } })
        ]
      },
      {
        id: "towing", seconds: 7, location: "PRALAY · VASUKI KI RASSI", sky: STORM_SKY, particles: "rain", camera: "panRight",
        narration: "प्रलय आई। मत्स्य के सींग से वासुकि नाग की रस्सी बाँधी गई, और भगवान ने नाव को पूरी प्रलय में सुरक्षित रखा।",
        caption: "Pralay aayi. Matsya ke seeng se Vasuki naag ki rassi bandhi gayi, aur Bhagwan ne naav ko surakshit rakha.",
        headlines: [{ at: 0, lines: [{ text: "VASUKI KI RASSI," }, { text: "MATSYA KA SEENG", tone: "accent2" }] }],
        layers: [
          P("clouds", 540, 820, { depth: 0.2, idle: "drift", data: { count: 3, spread: 200, color: "#6E788A" } }),
          P("towing", 480, 1330, { depth: 0.9, at: 0.3, enter: "slideRight", scale: 0.95 }),
          P("water", 540, 1420, { depth: 0.5, data: { amp: 3, pads: false, c1: "#2E5A6E", c2: "#244B5C", c3: "#1A3A48" } })
        ],
        labels: [{ text: "VASUKI NAAG", x: 540, y: 1000, toX: 520, toY: 1150, at: 2.5 }, { text: "SAPTARISHI", x: 230, y: 1520, toX: 230, toY: 1290, at: 3.2 }]
      },
      {
        id: "vedas", seconds: 6, location: "ASUR HAYAGRIV KA ANT", sky: FIRE_SKY, particles: "embers",
        narration: "और मत्स्य ने असुर हयग्रीव का वध करके चुराए हुए वेद वापस लौटाए।",
        caption: "Aur Matsya ne asur Hayagriv ka vadh karke churaye hue Ved wapas laaye.",
        headlines: [{ at: 0, lines: [{ text: "HAYAGRIV SE" }, { text: "VED WAPAS", tone: "accent3" }] }],
        layers: [
          P("sun", 540, 1000, { depth: 0.1, idle: "pulse", data: { color: "#FFD58A" } }),
          P("vedas", 540, 1400, { depth: 0.8, at: 0.4, enter: "none" })
        ]
      },
      nextScene(V, 1, "कल देखिए, दूसरा अवतार, कूर्म। फॉलो कीजिए, एपिक भारत सागा।", "Kal dekhiye dusra avatar: KURMA. Follow kijiye Epic Bharat Saga.", "KURMA AVATAR")
    ]
  },

  // EP02 Kurma. Source: Bhagavata Purana 8.5–8.8 (samudra manthan; 8.7 Shiva drinks halahala; 8.8 Lakshmi, Dhanvantari with amrit).
  2: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "SATYUG · KSHEER SAGAR", sky: OCEAN_SKY, particles: "stars",
        narration: "भगवान विष्णु का दूसरा अवतार... एक विशाल कछुआ था। कूर्म अवतार।",
        caption: "Bhagwan Vishnu ka dusra avatar... ek vishal kachhua tha. Kurma avatar.",
        headlines: [
          { at: 0, lines: [{ text: "VISHNU KA" }, { text: "DOOSRA AVATAR", tone: "accent2" }] },
          { at: 2.6, lines: [{ text: "EK KACHHUA:" }, { text: "KURMA", tone: "accent2" }] }
        ],
        layers: [
          P("sun", 540, 900, { depth: 0.1, idle: "pulse", data: { color: "#FFE3A3" } }),
          P("tortoise", 540, 1360, { at: 0.8, enter: "rise", idle: "bob", depth: 1, scale: 1.3 }),
          P("water", 540, 1440, { depth: 0.5, data: { pads: false } })
        ]
      },
      {
        id: "plan", seconds: 7, location: "DEVTA SHAKTIHEEN", sky: DAWN_SKY, tone: "dark",
        narration: "असुरों से हारकर देवता शक्तिहीन हो गए। तब भगवान विष्णु ने कहा, असुरों के साथ मिलकर समुद्र मंथन करो। उससे अमृत निकलेगा।",
        caption: "Asuron se haar kar devta shaktiheen ho gaye. Vishnu ne kaha: asuron ke saath milkar samudra manthan karo, amrit niklega.",
        headlines: [
          { at: 0, lines: [{ text: "DEVTA HAARE…" }, { text: "AB AMRIT CHAHIYE", tone: "accent" }] }
        ],
        layers: [
          P("hills", 540, 1300, { depth: 0.2, data: { color: "#B5734E" } }),
          P("noteCard", 540, 1060, { depth: 0.7, at: 0.8, enter: "drop", data: { title: "SAMUDRA MANTHAN:", items: ["MATHANI: MANDAR", "RASSI: VASUKI", "INAAM: AMRIT"] } }),
          P("figure", 200, 1560, { depth: 0.9, at: 0.3, enter: "slideRight", scale: 0.7, data: DEVA }),
          P("figure", 880, 1560, { depth: 0.9, at: 0.5, enter: "slideLeft", scale: 0.7, flip: true, data: ASURA })
        ]
      },
      {
        id: "sink", seconds: 6.5, location: "MANDARACHAL · MATHANI", sky: STORM_SKY, particles: "bubbles",
        narration: "मंदराचल पर्वत को मथानी बनाया गया, और वासुकि नाग को रस्सी। पर पर्वत बहुत भारी था। वो समुद्र में डूबने लगा।",
        caption: "Mandarachal parvat ko mathani banaya, Vasuki naag ko rassi. Par parvat bhaari tha... woh doobne laga!",
        headlines: [
          { at: 0, lines: [{ text: "MANDAR PARVAT" }, { text: "BANA MATHANI", tone: "accent2" }] },
          { at: 3.6, lines: [{ text: "PARVAT" }, { text: "DOOBNE LAGA!", tone: "accent" }] }
        ],
        layers: [
          P("mountain", 540, 1500, { depth: 0.6, at: 0.3, enter: "drop", scale: 1.1 }),
          P("water", 540, 1360, { depth: 0.8, data: { amp: 2.6, pads: false, c1: "#2E5A6E", c2: "#244B5C", c3: "#1A3A48" } })
        ]
      },
      {
        id: "kurma", seconds: 7, location: "KURMA KI PEETH", sky: OCEAN_SKY, particles: "bubbles",
        narration: "तब भगवान ने विशाल कछुए का रूप लिया, और पूरे पर्वत को अपनी पीठ पर उठा लिया। अब मंथन शुरू हुआ।",
        caption: "Tab Bhagwan ne vishal kachhue ka roop liya, aur poore parvat ko apni peeth par utha liya. Manthan shuru!",
        headlines: [{ at: 0, lines: [{ text: "KURMA KI PEETH" }, { text: "PAR PARVAT", tone: "accent2" }] }],
        layers: [
          P("churning", 540, 1460, { depth: 0.9, at: 0.3, enter: "rise", scale: 0.95 }),
          P("water", 540, 1480, { depth: 0.5, data: { amp: 2, pads: false } })
        ],
        labels: [{ text: "ASUR", x: 150, y: 1030, toX: 110, toY: 1130, at: 2.4 }, { text: "DEVTA", x: 930, y: 1210, toX: 960, toY: 1290, at: 2.8 }, { text: "KURMA", x: 760, y: 1550, toX: 650, toY: 1440, at: 3.2 }]
      },
      {
        id: "halahal", seconds: 7.5, location: "HALAHAL VISH", sky: FIRE_SKY, particles: "embers",
        narration: "मंथन से सबसे पहले निकला हलाहल विष। संसार को बचाने के लिए भगवान शिव ने उसे पी लिया, और उनका कंठ नीला हो गया। वो कहलाए नीलकंठ।",
        caption: "Sabse pehle nikla halahal vish. Sansaar ko bachane ke liye Shiv ne use pee liya. Kanth neela hua: NEELKANTH.",
        headlines: [{ at: 0, lines: [{ text: "HALAHAL VISH," }, { text: "SHIV NEELKANTH", tone: "accent3" }] }],
        layers: [
          P("mountain", 540, 1300, { depth: 0.2, scale: 0.9, data: { color: "#3A2E40", trees: false } }),
          P("figure", 540, 1560, { depth: 0.9, at: 0.4, enter: "rise", data: { robe: "#8A6A3A", skin: "#7FA7D9", head: "jata", item: "namaste", sash: "#3E7A3A", halo: true } })
        ]
      },
      {
        id: "amrit", seconds: 7, location: "14 RATNA · AMRIT", sky: ["#1E3A5A", "#5A3A6A"], particles: "petals",
        narration: "फिर निकले चौदह रत्न। माँ लक्ष्मी प्रकट हुईं, और अंत में धन्वंतरि अमृत का कलश लेकर आए।",
        caption: "Phir nikle 14 ratna. Maa Lakshmi prakat huin, aur ant mein Dhanvantari amrit ka kalash lekar aaye.",
        headlines: [{ at: 0, lines: [{ text: "14 RATNA," }, { text: "AMRIT KALASH", tone: "accent2" }] }],
        layers: [
          P("lotus", 260, 1500, { depth: 0.6, at: 0.4, enter: "pop" }),
          P("kalash", 620, 1420, { depth: 0.9, at: 1.2, enter: "rise", idle: "bob" }),
          P("water", 540, 1540, { depth: 0.5, data: { pads: false } })
        ],
        labels: [{ text: "MAA LAKSHMI", x: 250, y: 1150, toX: 260, toY: 1380, at: 1.6 }, { text: "AMRIT KALASH", x: 820, y: 900, toX: 680, toY: 1000, at: 2.2 }]
      },
      nextScene(V, 2, "कल देखिए, तीसरा अवतार, वराह। फॉलो कीजिए, एपिक भारत सागा।", "Kal dekhiye teesra avatar: VARAHA. Follow kijiye Epic Bharat Saga.", "VARAHA AVATAR")
    ]
  },

  // EP03 Varaha. Source: Bhagavata Purana 3.13 (thumb-sized boar from Brahma's nostril, lifts earth on tusks), 3.17–3.19 (Hiranyaksha slain).
  3: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "SRISHTI KA AARAMBH", sky: OCEAN_SKY, particles: "stars",
        narration: "भगवान विष्णु का तीसरा अवतार... एक वराह। वराह अवतार।",
        caption: "Bhagwan Vishnu ka teesra avatar... ek varah. Varaha avatar.",
        headlines: [
          { at: 0, lines: [{ text: "VISHNU KA" }, { text: "TEESRA AVATAR", tone: "accent2" }] },
          { at: 2.6, lines: [{ text: "EK VARAH:" }, { text: "VARAHA", tone: "accent2" }] }
        ],
        layers: [
          P("sun", 540, 900, { depth: 0.1, idle: "pulse", data: { color: "#FFE3A3" } }),
          P("varaha", 470, 1520, { at: 0.8, enter: "rise", depth: 1, scale: 1.1, data: { earth: false } })
        ]
      },
      {
        id: "drowned", seconds: 7, location: "PRITHVI JAL MEIN", sky: ["#0A1426", "#16304A"], particles: "bubbles",
        narration: "पृथ्वी प्रलय के जल में डूबी हुई थी, और दैत्य हिरण्याक्ष समुद्र में आतंक मचा रहा था।",
        caption: "Prithvi pralay ke jal mein doobi hui thi, aur daitya Hiranyaksh samudra mein aatank macha raha tha.",
        headlines: [
          { at: 0, lines: [{ text: "PRITHVI" }, { text: "JAL MEIN DOOBI", tone: "accent" }] },
          { at: 3.6, lines: [{ text: "AUR DAITYA" }, { text: "HIRANYAKSH", tone: "accent" }] }
        ],
        layers: [
          P("water", 540, 900, { depth: 0.4, data: { amp: 2, pads: false, c1: "#1E4A66", c2: "#173C54", c3: "#102C40" } }),
          P("earth", 300, 1380, { depth: 0.7, at: 0.4, enter: "drop", scale: 1.1 }),
          P("figure", 770, 1560, { depth: 0.9, at: 3.4, enter: "slideLeft", flip: true, data: ASURA })
        ]
      },
      {
        id: "nostril", seconds: 7.5, location: "BRAHMA JI KI NAAK SE", sky: ["#2A3A5A", "#5A6A8A"], particles: "fireflies",
        narration: "तब ब्रह्मा जी की नाक से अंगूठे जितना एक छोटा सा वराह निकला, और देखते ही देखते पर्वत जितना विशाल हो गया।",
        caption: "Brahma ji ki naak se angoothe jitna chhota varah nikla... aur dekhte hi dekhte parvat jitna vishal ho gaya!",
        headlines: [
          { at: 0, lines: [{ text: "ANGOOTHE JITNA" }, { text: "CHHOTA VARAH…", tone: "accent2" }] },
          { at: 3.8, lines: [{ text: "…PARVAT JITNA" }, { text: "VISHAL!", tone: "accent2" }] }
        ],
        layers: [
          P("varaha", 820, 880, { depth: 0.6, at: 0.4, enter: "pop", scale: 0.3, data: { earth: false } }),
          P("varaha", 470, 1560, { depth: 1, at: 3.6, enter: "rise", scale: 1.15, data: { earth: false } })
        ]
      },
      {
        id: "lift", seconds: 7, location: "DAANT PAR PRITHVI", sky: OCEAN_SKY, particles: "bubbles", camera: "panRight",
        narration: "वराह ने समुद्र में गोता लगाया, और अपने दाँतों पर पृथ्वी को उठाकर बाहर ले आए।",
        caption: "Varaha ne samudra mein gota lagaya, aur apne daanton par Prithvi ko utha kar bahar le aaye.",
        headlines: [{ at: 0, lines: [{ text: "DAANTON PAR" }, { text: "PRITHVI!", tone: "accent3" }] }],
        layers: [
          P("varaha", 420, 1500, { depth: 0.9, at: 0.3, enter: "rise", scale: 1.05 }),
          P("water", 540, 1480, { depth: 0.5, data: { amp: 2.4, pads: false } })
        ],
        labels: [{ text: "BHUDEVI", x: 820, y: 860, toX: 790, toY: 1020, at: 2.2 }]
      },
      {
        id: "battle", seconds: 7, location: "HIRANYAKSH VADH", sky: FIRE_SKY, particles: "embers",
        narration: "रास्ते में हिरण्याक्ष ने युद्ध के लिए ललकारा। भयंकर युद्ध हुआ, और भगवान वराह ने उसका वध कर दिया।",
        caption: "Raste mein Hiranyaksh ne yuddh ke liye lalkara. Bhayankar yuddh hua, aur Varaha ne uska vadh kar diya.",
        headlines: [{ at: 0, lines: [{ text: "VARAHA VS" }, { text: "HIRANYAKSH", tone: "accent" }] }],
        layers: [
          P("sun", 540, 1000, { depth: 0.1, idle: "pulse", data: { color: "#FFB36B" } }),
          P("figure", 220, 1560, { depth: 0.8, at: 0.3, enter: "slideRight", scale: 0.85, data: ASURA }),
          P("varaha", 600, 1560, { depth: 1, at: 0.6, enter: "slideLeft", scale: 0.9, data: { earth: false } })
        ]
      },
      {
        id: "restore", seconds: 6.5, location: "PRITHVI PHIR SE JAL PAR", sky: DAWN_SKY, tone: "dark", particles: "petals",
        narration: "भगवान ने पृथ्वी को फिर से जल के ऊपर स्थापित कर दिया, और सृष्टि का काम आगे बढ़ा।",
        caption: "Bhagwan ne Prithvi ko phir se jal ke upar sthapit kar diya, aur srishti aage badhi.",
        headlines: [{ at: 0, lines: [{ text: "PRITHVI" }, { text: "PHIR SURAKSHIT", tone: "accent" }] }],
        layers: [
          P("sun", 760, 780, { depth: 0.1, data: { color: "#FFF1C9" } }),
          P("earth", 540, 1180, { depth: 0.8, at: 0.4, enter: "pop", scale: 1.6 }),
          P("lotus", 540, 1520, { depth: 0.6, at: 0.8, enter: "rise" }),
          P("water", 540, 1560, { depth: 0.5, data: { pads: true } })
        ]
      },
      nextScene(V, 3, "हिरण्याक्ष का भाई हिरण्यकशिपु बदला चाहता था। कल देखिए, चौथा अवतार, नरसिंह।", "Hiranyaksh ka bhai Hiranyakashipu badla chahta tha. Kal dekhiye chautha avatar: NARASIMHA.", "NARASIMHA")
    ]
  },

  // EP04 Narasimha. Source: Bhagavata Purana 7.3 (Brahma's boon), 7.5 (attempts on Prahlad), 7.8 (pillar, twilight, threshold, lap, nails).
  4: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "SATYUG · DAITYA RAJ", sky: FIRE_SKY, particles: "embers",
        narration: "भगवान विष्णु का चौथा अवतार... आधा मनुष्य, आधा सिंह। नरसिंह अवतार।",
        caption: "Bhagwan Vishnu ka chautha avatar... aadha manushya, aadha singh. Narasimha avatar.",
        headlines: [
          { at: 0, lines: [{ text: "VISHNU KA" }, { text: "CHAUTHA AVATAR", tone: "accent2" }] },
          { at: 2.6, lines: [{ text: "AADHA NAR," }, { text: "AADHA SINGH", tone: "accent2" }] }
        ],
        layers: [P("narasimha", 540, 1150, { at: 0.8, enter: "none", depth: 1, scale: 1.1 })]
      },
      {
        id: "boon", seconds: 8.5, location: "BRAHMA JI KA VARDAAN", sky: NIGHT_SKY, particles: "stars",
        narration: "हिरण्यकशिपु ने ब्रह्मा जी से वरदान लिया। न मनुष्य मारे, न पशु। न दिन में, न रात में। न घर के अंदर, न बाहर। न धरती पर, न आकाश में। न किसी अस्त्र से।",
        caption: "Hiranyakashipu ka vardaan: na manushya, na pashu. Na din, na raat. Na andar, na baahar. Na dharti, na aakash. Na koi astra.",
        headlines: [{ at: 0, lines: [{ text: "AMAR HONE KA" }, { text: "VARDAAN?", tone: "accent" }] }],
        layers: [P("boonList", 540, 1120, { depth: 0.7, at: 0.3, enter: "drop", data: { title: "MUJHE KOI NA MAARE:", items: ["NA MANUSHYA, NA PASHU", "NA DIN, NA RAAT", "NA ANDAR, NA BAAHAR", "NA DHARTI, NA AAKASH", "NA KOI ASTRA"] } })]
      },
      {
        id: "prahlad", seconds: 6.5, location: "BHAKT PRAHLAD", sky: DAWN_SKY, tone: "dark", particles: "petals",
        narration: "पर उसका अपना बेटा प्रह्लाद, दिन रात नारायण का नाम जपता था।",
        caption: "Par uska apna beta Prahlad, din raat Narayan ka naam japta tha.",
        headlines: [{ at: 0, lines: [{ text: "BETA PRAHLAD:" }, { text: "NARAYAN BHAKT", tone: "accent" }] }],
        layers: [
          P("sun", 540, 980, { depth: 0.1, idle: "pulse", data: { color: "#FFF1C9" } }),
          P("lotus", 540, 1560, { depth: 0.6 }),
          P("figure", 540, 1480, { depth: 0.9, at: 0.4, enter: "rise", scale: 0.85, data: { robe: "#F6C445", head: "child", item: "namaste", halo: true } })
        ]
      },
      {
        id: "saved", seconds: 6.5, location: "HAR BAAR BACHE", sky: FIRE_SKY, particles: "embers",
        narration: "पिता ने उसे मारने के कितने ही प्रयास किए, पर हर बार भगवान ने प्रह्लाद को बचा लिया।",
        caption: "Pita ne use maarne ki kitni koshish ki, par har baar Bhagwan ne Prahlad ko bacha liya.",
        headlines: [{ at: 0, lines: [{ text: "HAR BAAR" }, { text: "PRAHLAD BACHA", tone: "accent3" }] }],
        layers: [
          P("figure", 260, 1560, { depth: 0.8, at: 0.3, enter: "slideRight", data: { ...ASURA, horns: false, glowEyes: false, robe: "#5A1E2A", skin: "#C98A6A" } }),
          P("figure", 760, 1500, { depth: 0.9, at: 0.6, enter: "pop", scale: 0.75, data: { robe: "#F6C445", head: "child", item: "namaste", halo: true } })
        ]
      },
      {
        id: "pillar", seconds: 7.5, location: "\"KAHAN HAI TERA VISHNU?\"", sky: NIGHT_SKY, particles: "none",
        narration: "क्रोधित हिरण्यकशिपु बोला, कहाँ है तेरा विष्णु? क्या इस खंभे में है? और उसने खंभे पर प्रहार किया।",
        caption: "Krodhit Hiranyakashipu bola: kahan hai tera Vishnu? Kya is khambe mein hai? Aur usne khambe par prahaar kiya!",
        headlines: [
          { at: 0, lines: [{ text: "\"KYA IS KHAMBE" }, { text: "MEIN HAI?\"", tone: "accent" }] },
          { at: 5.4, lines: [{ text: "KHAMBA" }, { text: "PHATA!", tone: "accent" }] }
        ],
        layers: [
          P("pillar", 540, 1560, { depth: 0.9, at: 0, enter: "none", data: { burstAt: 5.6 } }),
          P("narasimha", 540, 1180, { depth: 1, at: 5.7, enter: "none", scale: 0.55 })
        ]
      },
      {
        id: "sandhya", seconds: 9, location: "SANDHYA · DEHLEEZ", sky: ["#3A1A2A", "#C2582A"], particles: "embers",
        narration: "खंभे से प्रकट हुए नरसिंह। संध्या के समय, घर की दहलीज़ पर, अपनी गोद में रखकर, नाखूनों से उन्होंने हिरण्यकशिपु का अंत किया। वरदान भी सच रहा।",
        caption: "Narasimha prakat hue. Sandhya ke samay, dehleez par, god mein rakh kar, nakhoon se ant kiya. Vardaan bhi sach raha!",
        headlines: [{ at: 0, lines: [{ text: "VARDAAN BHI" }, { text: "SACH RAHA", tone: "accent2" }] }],
        layers: [
          P("narasimha", 540, 880, { depth: 0.5, at: 0.2, enter: "none", scale: 0.62 }),
          P("noteCard", 540, 1270, { depth: 0.8, at: 2.2, enter: "drop", scale: 0.85, data: { title: "KAISE?", items: ["SANDHYA KA SAMAY", "GHAR KI DEHLEEZ", "NARASIMHA KI GOD", "SIRF NAKHOON"] } })
        ]
      },
      nextScene(V, 4, "कल देखिए, पाँचवाँ अवतार, वामन। और प्रह्लाद के पोते, राजा बलि की कहानी।", "Kal dekhiye paanchva avatar: VAMANA. Aur Prahlad ke pote Raja Bali ki kahani.", "VAMANA AVATAR")
    ]
  },

  // EP05 Vamana. Source: Bhagavata Purana 8.15 (Bali conquers heaven), 8.18–8.20 (Vamana at the yajna, Shukracharya's warning, Trivikrama), 8.22 (Bali offers his head, Sutala).
  5: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "TRETA SE PEHLE", sky: DAWN_SKY, tone: "dark", particles: "none",
        narration: "भगवान विष्णु का पाँचवाँ अवतार... एक छोटा सा ब्राह्मण बालक। वामन अवतार।",
        caption: "Bhagwan Vishnu ka paanchva avatar... ek chhota sa brahman baalak. Vamana avatar.",
        headlines: [
          { at: 0, lines: [{ text: "VISHNU KA" }, { text: "PAANCHVA AVATAR", tone: "accent" }] },
          { at: 2.6, lines: [{ text: "CHHOTA BRAHMAN:" }, { text: "VAMANA", tone: "accent" }] }
        ],
        layers: [
          P("sun", 540, 900, { depth: 0.1, idle: "pulse", data: { color: "#FFF1C9" } }),
          P("figure", 520, 1540, { depth: 1, at: 0.8, enter: "rise", scale: 0.85, data: { robe: "#F6C445", head: "child", item: "umbrella", sash: "#F0533F" } })
        ]
      },
      {
        id: "bali", seconds: 6.5, location: "ASURRAJ BALI", sky: FIRE_SKY, particles: "embers",
        narration: "असुरराज बलि ने तीनों लोक जीत लिए। स्वर्ग से देवताओं को भी निकाल दिया।",
        caption: "Asurraj Bali ne teeno lok jeet liye. Swarg se devtaon ko bhi nikaal diya.",
        headlines: [{ at: 0, lines: [{ text: "RAJA BALI NE" }, { text: "TEENO LOK JEETE", tone: "accent2" }] }],
        layers: [
          P("temple", 830, 1500, { depth: 0.3, scale: 0.8 }),
          P("figure", 420, 1560, { depth: 0.9, at: 0.4, enter: "rise", data: { robe: "#6B3A8A", head: "crown", sash: "#F6B93B" } })
        ]
      },
      {
        id: "ask", seconds: 7, location: "BALI KA YAGYA", sky: DAWN_SKY, tone: "dark", particles: "embers",
        narration: "बलि यज्ञ कर रहा था। तभी वामन आए, और बोले, राजन, मुझे बस तीन पग भूमि चाहिए।",
        caption: "Bali yagya kar raha tha. Tabhi Vamana aaye aur bole: Rajan, mujhe bas teen pag bhoomi chahiye.",
        headlines: [{ at: 0, lines: [{ text: "\"BAS TEEN PAG" }, { text: "BHOOMI DO\"", tone: "accent" }] }],
        layers: [
          P("diya", 540, 1420, { depth: 0.6, at: 0.2, enter: "pop", scale: 1.6 }),
          P("figure", 230, 1560, { depth: 0.9, at: 0.4, enter: "slideRight", scale: 0.9, data: { robe: "#6B3A8A", head: "crown", sash: "#F6B93B" } }),
          P("figure", 850, 1560, { depth: 0.9, at: 1.0, enter: "slideLeft", scale: 0.7, flip: true, data: { robe: "#F6C445", head: "child", item: "umbrella", sash: "#F0533F" } })
        ],
        labels: [{ text: "RAJA BALI", x: 230, y: 1050, toX: 230, toY: 1130, at: 2 }, { text: "VAMANA", x: 850, y: 1150, toX: 850, toY: 1240, at: 2.4 }]
      },
      {
        id: "shukra", seconds: 6.5, location: "GURU KI CHETAVANI", sky: STORM_SKY, particles: "none",
        narration: "गुरु शुक्राचार्य ने चेताया, ये बालक स्वयं विष्णु हैं! पर बलि ने अपना वचन नहीं तोड़ा।",
        caption: "Guru Shukracharya ne chetaya: yeh baalak swayam Vishnu hain! Par Bali ne apna vachan nahi toda.",
        headlines: [
          { at: 0, lines: [{ text: "\"YEH SWAYAM" }, { text: "VISHNU HAIN!\"", tone: "accent" }] },
          { at: 3.6, lines: [{ text: "PAR BALI NE" }, { text: "VACHAN NIBHAYA", tone: "accent2" }] }
        ],
        layers: [
          P("figure", 300, 1560, { depth: 0.9, at: 0.3, enter: "rise", data: SAGE }),
          P("figure", 780, 1560, { depth: 0.8, at: 3.4, enter: "rise", scale: 0.9, data: { robe: "#6B3A8A", head: "crown", item: "namaste", sash: "#F6B93B" } })
        ]
      },
      {
        id: "trivikrama", seconds: 7.5, location: "VAMANA SE TRIVIKRAM", sky: ["#141A44", "#3A2A6A"], particles: "stars",
        narration: "वामन बढ़ने लगे, और विराट हो गए। एक पग में पृथ्वी, दूसरे पग में स्वर्ग नाप लिया। अब तीसरा पग कहाँ रखें?",
        caption: "Vamana badhne lage, viraat ho gaye. Ek pag mein Prithvi, doosre mein Swarg. Ab teesra pag kahan?",
        headlines: [{ at: 0, lines: [{ text: "DO PAG MEIN" }, { text: "SAB NAAP LIYA", tone: "accent2" }] }],
        layers: [
          P("earth", 300, 1440, { depth: 0.4, at: 0.2, enter: "pop", scale: 0.8 }),
          P("threeSteps", 540, 1100, { depth: 0.8, at: 0.6, enter: "none", data: { labels: ["PRITHVI", "SWARG"], stepSeconds: 1.6 } })
        ]
      },
      {
        id: "head", seconds: 8.5, location: "TEESRA PAG", sky: NIGHT_SKY, particles: "petals",
        narration: "बलि ने सिर झुकाया, और बोले, तीसरा पग मेरे सिर पर रखिए। भगवान प्रसन्न हुए। बलि को सुतल लोक का राजा बनाया, और स्वयं उसके रक्षक बने।",
        caption: "Bali ne sir jhukaya: teesra pag mere sir par rakhiye. Bhagwan prasann hue, Bali ko Sutal lok ka raja banaya.",
        headlines: [{ at: 0, lines: [{ text: "TEESRA PAG:" }, { text: "BALI KA SIR", tone: "accent2" }] }],
        layers: [
          P("threeSteps", 660, 640, { depth: 0.6, at: 0.3, enter: "none", data: { labels: ["BALI KA SIR"] } }),
          P("figure", 540, 1560, { depth: 0.9, at: 0.2, enter: "rise", data: { robe: "#6B3A8A", head: "crown", item: "namaste", sash: "#F6B93B", halo: true } })
        ]
      },
      nextScene(V, 5, "कल देखिए, छठा अवतार, परशुराम। फॉलो कीजिए, एपिक भारत सागा।", "Kal dekhiye chhatha avatar: PARASHURAMA. Follow kijiye Epic Bharat Saga.", "PARASHURAMA")
    ]
  },

  // EP06 Parashurama. Source: Bhagavata Purana 9.15 (Jamadagni, Renuka; Kartavirya Arjuna takes the cow and is slain), 9.16 (Jamadagni killed; earth freed 21 times; Mahendra mountain).
  6: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "TRETA YUG", sky: FIRE_SKY, particles: "embers",
        narration: "भगवान विष्णु का छठा अवतार... हाथ में फरसा लिए एक ऋषि। परशुराम।",
        caption: "Bhagwan Vishnu ka chhatha avatar... haath mein pharsa liye ek rishi. Parashuram.",
        headlines: [
          { at: 0, lines: [{ text: "VISHNU KA" }, { text: "CHHATHA AVATAR", tone: "accent2" }] },
          { at: 2.6, lines: [{ text: "FARSE WALE:" }, { text: "PARASHURAM", tone: "accent2" }] }
        ],
        layers: [
          P("mountain", 540, 1300, { depth: 0.2, scale: 1, data: { color: "#4A3040" } }),
          P("figure", 500, 1560, { depth: 1, at: 0.8, enter: "rise", data: { robe: "#E06A1B", head: "jata", item: "axe", skin: "#D9A07A" } })
        ]
      },
      {
        id: "birth", seconds: 6.5, location: "JAMADAGNI KA ASHRAM", sky: FOREST_SKY, particles: "fireflies",
        narration: "महर्षि जमदग्नि और रेणुका के पुत्र थे परशुराम। ऋषि कुल में जन्मे, पर महान योद्धा थे।",
        caption: "Maharshi Jamadagni aur Renuka ke putra the Parashuram. Rishi kul mein janme, par mahaan yoddha the.",
        headlines: [{ at: 0, lines: [{ text: "RISHI KA BETA," }, { text: "MAHAAN YODDHA", tone: "accent2" }] }],
        layers: [
          P("tree", 830, 1500, { depth: 0.3, scale: 0.8 }),
          P("figure", 280, 1560, { depth: 0.9, at: 0.3, enter: "rise", scale: 0.95, data: SAGE }),
          P("figure", 640, 1560, { depth: 0.9, at: 0.8, enter: "rise", scale: 0.95, data: { robe: "#E06A1B", head: "jata", item: "axe", skin: "#D9A07A" } })
        ],
        labels: [{ text: "JAMADAGNI", x: 280, y: 1060, toX: 280, toY: 1150, at: 2 }]
      },
      {
        id: "cow", seconds: 7, location: "KAAMDHENU CHHEENI", sky: STORM_SKY, particles: "none",
        narration: "एक दिन हज़ार भुजाओं वाला राजा कार्तवीर्य अर्जुन, ऋषि की कामधेनु गाय छीन ले गया।",
        caption: "Ek din hazaar bhujaon wala Raja Kartavirya Arjun, rishi ki Kaamdhenu gaay chheen le gaya.",
        headlines: [{ at: 0, lines: [{ text: "KAAMDHENU" }, { text: "CHHEEN LI!", tone: "accent" }] }],
        layers: [
          P("noteCard", 540, 1020, { depth: 0.6, at: 1.2, enter: "drop", data: { title: "KARTAVIRYA ARJUN:", items: ["HAZAAR BHUJAYEN", "RISHI KI GAAY CHHEENI"] } }),
          P("figure", 540, 1560, { depth: 0.9, at: 0.3, enter: "slideLeft", data: { robe: "#8A1E2A", head: "crown", item: "sword", sash: "#C9861A" } })
        ]
      },
      {
        id: "fight", seconds: 6.5, location: "AKELE YUDDH", sky: FIRE_SKY, particles: "embers", camera: "panLeft",
        narration: "परशुराम ने अकेले उसकी पूरी सेना से युद्ध किया, और कार्तवीर्य अर्जुन का वध करके गाय वापस ले आए।",
        caption: "Parashuram ne akele uski poori sena se yuddh kiya, aur Kartavirya ka vadh karke gaay wapas le aaye.",
        headlines: [{ at: 0, lines: [{ text: "AKELE" }, { text: "POORI SENA SE", tone: "accent" }] }],
        layers: [
          P("sun", 540, 1000, { depth: 0.1, idle: "pulse", data: { color: "#FFB36B" } }),
          P("figure", 540, 1560, { depth: 1, at: 0.3, enter: "rise", scale: 1.05, data: { robe: "#E06A1B", head: "jata", item: "axe", skin: "#D9A07A" } })
        ]
      },
      {
        id: "21", seconds: 8, location: "21 BAAR", sky: ["#2A0E14", "#6B1E1E"], particles: "embers",
        narration: "बदले में राजा के पुत्रों ने जमदग्नि ऋषि को मार डाला। दुखी परशुराम ने इक्कीस बार पृथ्वी को अत्याचारी राजाओं से मुक्त किया।",
        caption: "Raja ke beton ne Jamadagni rishi ko maar diya. Parashuram ne 21 baar Prithvi ko atyachari rajaon se mukt kiya.",
        headlines: [{ at: 0, lines: [{ text: "21 BAAR" }, { text: "ADHARM KA ANT", tone: "accent2" }] }],
        layers: [
          P("earth", 640, 960, { depth: 0.4, at: 0.3, enter: "pop", scale: 1.2 }),
          P("figure", 300, 1560, { depth: 0.9, at: 0.6, enter: "rise", scale: 0.9, data: { robe: "#E06A1B", head: "jata", item: "axe", skin: "#D9A07A" } })
        ]
      },
      {
        id: "tapas", seconds: 7, location: "MAHENDRA PARVAT", sky: DAWN_SKY, tone: "dark", particles: "petals",
        narration: "फिर उन्होंने सारी भूमि दान कर दी, और महेंद्र पर्वत पर तपस्या करने चले गए। कहा जाता है, वो आज भी वहीं हैं।",
        caption: "Phir unhone saari bhoomi daan kar di, aur Mahendra parvat par tapasya karne chale gaye. Kehte hain, aaj bhi wahin hain.",
        headlines: [{ at: 0, lines: [{ text: "AAJ BHI" }, { text: "CHIRANJEEVI", tone: "accent" }] }],
        layers: [
          P("mountain", 540, 1500, { depth: 0.3, scale: 1.2 }),
          P("figure", 540, 1560, { depth: 0.9, at: 0.5, enter: "rise", scale: 0.8, data: { robe: "#E06A1B", head: "jata", pose: "seated", item: "namaste", skin: "#D9A07A", halo: true } })
        ]
      },
      nextScene(V, 6, "कल देखिए, सातवाँ अवतार, श्री राम। फॉलो कीजिए, एपिक भारत सागा।", "Kal dekhiye saatva avatar: SHRI RAM. Follow kijiye Epic Bharat Saga.", "SHRI RAM")
    ]
  },

  // EP07 Rama. Source: Bhagavata Purana 9.10–9.11 (summary of the Ramayana); Valmiki Ramayana (Bala, Ayodhya, Aranya, Sundara, Yuddha Kanda).
  7: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "TRETA YUG · AYODHYA", sky: DAWN_SKY, tone: "dark", particles: "petals",
        narration: "भगवान विष्णु का सातवाँ अवतार... मर्यादा पुरुषोत्तम, श्री राम।",
        caption: "Bhagwan Vishnu ka saatva avatar... Maryada Purushottam, Shri Ram.",
        headlines: [
          { at: 0, lines: [{ text: "VISHNU KA" }, { text: "SAATVA AVATAR", tone: "accent" }] },
          { at: 2.6, lines: [{ text: "PURUSHOTTAM" }, { text: "SHRI RAM", tone: "accent" }] }
        ],
        layers: [
          P("sun", 540, 900, { depth: 0.1, idle: "pulse", data: { color: "#FFF1C9" } }),
          P("figure", 500, 1560, { depth: 1, at: 0.8, enter: "rise", data: { robe: "#F6C445", skin: "#5A86B8", head: "crown", item: "bow", sash: "#F0533F" } })
        ]
      },
      {
        id: "bow", seconds: 7, location: "SITA SWAYAMVAR · JANAKPUR", sky: ["#3A1A2A", "#8A3A2A"], particles: "petals",
        narration: "सीता स्वयंवर में, जिस शिव धनुष को कोई उठा भी नहीं पाया, राम ने उसे उठाया, और वो टूट गया।",
        caption: "Sita swayamvar mein, jis Shiv dhanush ko koi utha bhi nahi paya, Ram ne uthaya... aur woh toot gaya!",
        headlines: [
          { at: 0, lines: [{ text: "SHIV DHANUSH" }, { text: "KOI NA UTHA PAYA", tone: "accent2" }] },
          { at: 4.2, lines: [{ text: "DHANUSH" }, { text: "TOOT GAYA!", tone: "accent2" }] }
        ],
        layers: [P("greatBow", 540, 1160, { depth: 0.8, at: 0.2, enter: "pop", data: { breakAt: 4.2 } })]
      },
      {
        id: "vanvas", seconds: 7, location: "14 VARSH VANVAAS", sky: FOREST_SKY, particles: "fireflies",
        narration: "पिता के वचन के लिए, राम, सीता और लक्ष्मण के साथ चौदह वर्ष के वनवास पर गए।",
        caption: "Pita ke vachan ke liye, Ram, Sita aur Lakshman ke saath 14 varsh ke vanvaas par gaye.",
        headlines: [{ at: 0, lines: [{ text: "PITA KA VACHAN," }, { text: "14 VARSH VAN", tone: "accent3" }] }],
        layers: [
          P("tree", 160, 1400, { depth: 0.3, scale: 0.7 }),
          P("tree", 940, 1400, { depth: 0.3, scale: 0.7 }),
          P("figure", 290, 1560, { depth: 0.9, at: 0.3, enter: "rise", scale: 0.85, data: { robe: "#F6C445", skin: "#5A86B8", head: "bun", item: "bow", sash: "#8A6A3A" } }),
          P("figure", 540, 1560, { depth: 0.9, at: 0.6, enter: "rise", scale: 0.8, data: { robe: "#D6336C", head: "bun", item: "namaste", sash: "#F6B93B" } }),
          P("figure", 790, 1560, { depth: 0.9, at: 0.9, enter: "rise", scale: 0.85, data: { robe: "#F28C28", head: "bun", item: "bow", sash: "#8A6A3A" } })
        ],
        labels: [{ text: "RAM", x: 290, y: 1060, toX: 290, toY: 1150, at: 2 }, { text: "SITA", x: 540, y: 1080, toX: 540, toY: 1170, at: 2.3 }, { text: "LAKSHMAN", x: 790, y: 1060, toX: 790, toY: 1150, at: 2.6 }]
      },
      {
        id: "ravan", seconds: 6.5, location: "PANCHAVATI · SITA HARAN", sky: STORM_SKY, particles: "none",
        narration: "वन में लंकापति रावण ने छल से सीता का हरण कर लिया, और उन्हें लंका ले गया।",
        caption: "Van mein Lankapati Raavan ne chhal se Sita ka haran kar liya, aur unhe Lanka le gaya.",
        headlines: [{ at: 0, lines: [{ text: "RAAVAN NE" }, { text: "SITA HARAN KIYA", tone: "accent" }] }],
        layers: [
          P("clouds", 540, 820, { depth: 0.2, idle: "drift", data: { count: 3, spread: 220, color: "#5E6878" } }),
          P("figure", 540, 1560, { depth: 0.9, at: 0.3, enter: "rise", scale: 0.95, data: { robe: "#3A1A2A", skin: "#B07A5A", head: "crown", heads: 10, sash: "#C9861A" } })
        ]
      },
      {
        id: "setu", seconds: 7, location: "RAM SETU", sky: OCEAN_SKY, particles: "bubbles", camera: "panRight",
        narration: "हनुमान ने लंका में सीता को खोज निकाला, और वानर सेना ने समुद्र पर पत्थरों का सेतु बना दिया।",
        caption: "Hanuman ne Lanka mein Sita ko khoj nikala, aur vaanar sena ne samudra par pattharon ka setu bana diya.",
        headlines: [{ at: 0, lines: [{ text: "SAMUDRA PAR" }, { text: "RAM SETU", tone: "accent2" }] }],
        layers: [
          P("water", 540, 1300, { depth: 0.4, data: { amp: 2, pads: false } }),
          P("setu", 540, 1290, { depth: 0.8, at: 0.4, enter: "none" }),
          P("water", 540, 1520, { depth: 0.6, data: { amp: 2.2, pads: false, c1: "#2E7A96", c2: "#25677F", c3: "#1C5468" } })
        ]
      },
      {
        id: "victory", seconds: 7, location: "LANKA VIJAY · AYODHYA", sky: NIGHT_SKY, particles: "fireflies",
        narration: "युद्ध में राम ने रावण का वध किया, और सीता के साथ अयोध्या लौटे। रामराज्य शुरू हुआ।",
        caption: "Yuddh mein Ram ne Raavan ka vadh kiya, aur Sita ke saath Ayodhya laute. Ramrajya shuru hua.",
        headlines: [{ at: 0, lines: [{ text: "ADHARM HARA," }, { text: "RAMRAJYA AAYA", tone: "accent2" }] }],
        layers: [
          P("temple", 540, 1400, { depth: 0.3, scale: 0.9 }),
          P("diyaRow", 540, 1540, { depth: 0.8, at: 0.4, enter: "none", data: { count: 7, spacing: 140 } })
        ]
      },
      nextScene(V, 7, "कल देखिए, आठवाँ अवतार, श्री कृष्ण। फॉलो कीजिए, एपिक भारत सागा।", "Kal dekhiye aathva avatar: SHRI KRISHNA. Follow kijiye Epic Bharat Saga.", "SHRI KRISHNA")
    ]
  },

  // EP08 Krishna. Source: Bhagavata Purana 10.3 (birth in Kamsa's prison, carried to Gokul), 10.25 (Govardhan lifted with one hand), 10.44 (Kamsa slain); Bhagavad Gita 2.47 (Mahabharata, Bhishma Parva).
  8: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "DWAPAR YUG", sky: NIGHT_SKY, particles: "stars",
        narration: "भगवान विष्णु का आठवाँ अवतार... बाँसुरी वाले, श्री कृष्ण।",
        caption: "Bhagwan Vishnu ka aathva avatar... baansuri wale, Shri Krishna.",
        headlines: [
          { at: 0, lines: [{ text: "VISHNU KA" }, { text: "AATHVA AVATAR", tone: "accent2" }] },
          { at: 2.6, lines: [{ text: "BAANSURI WALE" }, { text: "SHRI KRISHNA", tone: "accent2" }] }
        ],
        layers: [
          P("moon", 800, 760, { depth: 0.1 }),
          P("figure", 500, 1560, { depth: 1, at: 0.8, enter: "rise", data: { robe: "#F6C445", skin: "#3E6DB5", head: "feather", item: "flute", sash: "#D6336C" } })
        ]
      },
      {
        id: "birth", seconds: 6.5, location: "MATHURA · KAARAGAAR", sky: ["#0B0F2E", "#1E1A4A"], particles: "stars",
        narration: "मथुरा के कारागार में, आधी रात को, देवकी और वसुदेव के यहाँ कृष्ण का जन्म हुआ।",
        caption: "Mathura ke kaaragaar mein, aadhi raat ko, Devaki aur Vasudev ke yahan Krishna ka janm hua.",
        headlines: [{ at: 0, lines: [{ text: "AADHI RAAT," }, { text: "KAARAGAAR MEIN", tone: "accent2" }] }],
        layers: [
          P("moon", 760, 760, { depth: 0.1 }),
          P("doorway", 540, 1560, { depth: 0.6, at: 0.3, enter: "rise" })
        ]
      },
      {
        id: "yamuna", seconds: 7, location: "YAMUNA PAAR · GOKUL", sky: STORM_SKY, particles: "rain", camera: "panRight",
        narration: "वसुदेव उन्हें टोकरी में रखकर, तूफ़ानी रात में यमुना पार करके, गोकुल ले गए।",
        caption: "Vasudev unhe tokri mein rakh kar, toofani raat mein Yamuna paar karke, Gokul le gaye.",
        headlines: [{ at: 0, lines: [{ text: "TOKRI MEIN" }, { text: "YAMUNA PAAR", tone: "accent2" }] }],
        layers: [
          P("clouds", 540, 820, { depth: 0.2, idle: "drift", data: { count: 3, spread: 220, color: "#5E6878" } }),
          P("figure", 540, 1560, { depth: 0.9, at: 0.3, enter: "slideRight", data: { robe: "#E9D3A6", head: "plain", item: "basket", sash: "#8A6A3A" } }),
          P("water", 540, 1440, { depth: 1, data: { amp: 3, pads: false, c1: "#2E5A6E", c2: "#244B5C", c3: "#1A3A48" } })
        ]
      },
      {
        id: "govardhan", seconds: 7.5, location: "GOVARDHAN PARVAT", sky: STORM_SKY, particles: "rain",
        narration: "इंद्र ने गोकुल पर भारी वर्षा की, तो कृष्ण ने पूरे गोवर्धन पर्वत को एक हाथ से उठा लिया, और सबकी रक्षा की।",
        caption: "Indra ne Gokul par bhaari baarish ki, to Krishna ne poora Govardhan parvat ek haath se utha liya!",
        headlines: [{ at: 0, lines: [{ text: "EK HAATH PAR" }, { text: "GOVARDHAN", tone: "accent3" }] }],
        layers: [
          P("mountain", 620, 1140, { depth: 0.8, at: 0.6, enter: "rise", scale: 0.75 }),
          P("figure", 600, 1560, { depth: 0.9, at: 0.2, enter: "rise", scale: 0.85, data: { robe: "#F6C445", skin: "#3E6DB5", head: "feather", item: "lift", sash: "#D6336C" } }),
          P("figure", 250, 1560, { depth: 0.7, at: 1.4, enter: "rise", scale: 0.6, data: { robe: "#E9D3A6", head: "plain", item: "namaste" } })
        ]
      },
      {
        id: "kamsa", seconds: 6, location: "MATHURA · KANS VADH", sky: FIRE_SKY, particles: "embers",
        narration: "बड़े होकर कृष्ण मथुरा लौटे, और अत्याचारी कंस का अंत किया।",
        caption: "Bade hokar Krishna Mathura laute, aur atyachari Kans ka ant kiya.",
        headlines: [{ at: 0, lines: [{ text: "ATYACHARI KANS" }, { text: "KA ANT", tone: "accent" }] }],
        layers: [
          P("figure", 260, 1560, { depth: 0.8, at: 0.3, enter: "slideRight", scale: 0.9, data: { robe: "#3A1A2A", skin: "#B07A5A", head: "crown", sash: "#C9861A" } }),
          P("figure", 780, 1560, { depth: 0.9, at: 0.7, enter: "slideLeft", flip: true, data: { robe: "#F6C445", skin: "#3E6DB5", head: "feather", sash: "#D6336C" } })
        ]
      },
      {
        id: "gita", seconds: 7, location: "KURUKSHETRA · GITA", sky: DAWN_SKY, tone: "dark", particles: "petals",
        narration: "और कुरुक्षेत्र में अर्जुन को गीता का ज्ञान दिया। कर्म करो, फल की चिंता मत करो।",
        caption: "Aur Kurukshetra mein Arjun ko Gita ka gyaan diya: karm karo, phal ki chinta mat karo.",
        headlines: [{ at: 0, lines: [{ text: "GITA KA" }, { text: "GYAAN", tone: "accent" }] }],
        layers: [
          P("feather", 150, 1560, { depth: 0.5, at: 0.3, enter: "rise", scale: 1.1 }),
          P("noteCard", 600, 1150, { depth: 0.8, at: 0.6, enter: "drop", data: { title: "GITA 2.47:", items: ["KARM KARO", "PHAL KI CHINTA MAT KARO"] } })
        ]
      },
      nextScene(V, 8, "कल देखिए, नौवाँ अवतार, बुद्ध। फॉलो कीजिए, एपिक भारत सागा।", "Kal dekhiye nauva avatar: BUDDHA. Follow kijiye Epic Bharat Saga.", "BUDDHA AVATAR")
    ]
  },

  // EP09 Buddha. Source: Bhagavata Purana 1.3.24 (Buddha, son of Anjana, in Kikata at the start of Kali Yuga);
  // Jayadeva, Gita Govinda 1 (Dashavatara stotra: Buddha condemns animal sacrifice out of compassion). Some traditions list Balarama as the ninth.
  9: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "KALIYUG KA AARAMBH", sky: DAWN_SKY, tone: "dark", particles: "petals",
        narration: "भगवान विष्णु का नौवाँ अवतार... करुणा के रूप, बुद्ध।",
        caption: "Bhagwan Vishnu ka nauva avatar... karuna ke roop, Buddha.",
        headlines: [
          { at: 0, lines: [{ text: "VISHNU KA" }, { text: "NAUVA AVATAR", tone: "accent" }] },
          { at: 2.6, lines: [{ text: "KARUNA KE ROOP:" }, { text: "BUDDHA", tone: "accent" }] }
        ],
        layers: [
          P("tree", 540, 1420, { depth: 0.3, scale: 1 }),
          P("figure", 540, 1560, { depth: 1, at: 0.8, enter: "rise", data: { robe: "#E8731C", head: "bun", pose: "seated", item: "abhaya", sash: "#C9861A", halo: true } })
        ]
      },
      {
        id: "purana", seconds: 8, location: "BHAGAVAT PURAN 1.3.24", sky: NIGHT_SKY, particles: "stars",
        narration: "भागवत पुराण में भगवान के अवतारों में बुद्ध का नाम आता है। कलियुग के आरंभ में, कीकट देश में, अंजना के पुत्र के रूप में।",
        caption: "Bhagavat Puran ke avataron mein Buddha ka naam aata hai: Kaliyug ke aarambh mein, Keekat desh mein, Anjana ke putra.",
        headlines: [{ at: 0, lines: [{ text: "BHAGAVAT PURAN" }, { text: "KYA KEHTA HAI?", tone: "accent2" }] }],
        layers: [P("noteCard", 540, 1120, { depth: 0.7, at: 0.4, enter: "drop", data: { title: "BHAGAVAT 1.3.24:", items: ["KALIYUG KA AARAMBH", "KEEKAT DESH (GAYA)", "ANJANA KE PUTRA"] } })]
      },
      {
        id: "karuna", seconds: 7.5, location: "GEET GOVIND · JAYADEV", sky: FOREST_SKY, particles: "fireflies",
        narration: "कवि जयदेव के गीत गोविंद में भी दशावतार में बुद्ध हैं, जिन्होंने करुणा से पशु बलि का विरोध किया।",
        caption: "Kavi Jayadev ke Geet Govind mein bhi Dashavatar mein Buddha hain, jinhone karuna se pashu bali ka virodh kiya.",
        headlines: [{ at: 0, lines: [{ text: "PASHU BALI" }, { text: "KA VIRODH", tone: "accent3" }] }],
        layers: [
          P("lotus", 270, 1520, { depth: 0.6, at: 0.4, enter: "pop" }),
          P("lotus", 810, 1520, { depth: 0.6, at: 0.6, enter: "pop" }),
          P("figure", 540, 1560, { depth: 0.9, at: 0.2, enter: "rise", data: { robe: "#E8731C", head: "bun", item: "abhaya", sash: "#C9861A", halo: true } })
        ]
      },
      {
        id: "bodhi", seconds: 7, location: "BODHI VRIKSH", sky: ["#1E3A2A", "#6A8A4A"], particles: "petals",
        narration: "बोधि वृक्ष के नीचे ध्यान, और फिर संसार को संदेश: अहिंसा, करुणा, और मध्यम मार्ग।",
        caption: "Bodhi vriksh ke neeche dhyaan, aur phir sansaar ko sandesh: ahinsa, karuna aur madhyam maarg.",
        headlines: [{ at: 0, lines: [{ text: "BODHI VRIKSH" }, { text: "KE NEECHE", tone: "accent2" }] }],
        layers: [
          P("tree", 540, 1380, { depth: 0.3, scale: 1.05 }),
          P("noteCard", 540, 960, { depth: 0.7, at: 1.6, enter: "drop", scale: 0.85, data: { title: "SANDESH:", items: ["AHINSA", "KARUNA", "MADHYAM MAARG"] } }),
          P("figure", 540, 1560, { depth: 0.9, at: 0.3, enter: "rise", scale: 0.9, data: { robe: "#E8731C", head: "bun", pose: "seated", item: "namaste", sash: "#C9861A", halo: true } })
        ]
      },
      {
        id: "balarama", seconds: 6.5, location: "ALAG PARAMPARA", sky: NIGHT_SKY, particles: "stars",
        narration: "कुछ परंपराओं में नौवें अवतार बलराम माने जाते हैं। आपके यहाँ कौन? कमेंट में बताइए।",
        caption: "Kuch paramparaon mein nauve avatar Balaram maane jaate hain. Aapke yahan kaun? Comment mein bataiye!",
        headlines: [{ at: 0, lines: [{ text: "BUDDHA YA" }, { text: "BALARAM?", tone: "accent2" }] }],
        layers: [
          P("figure", 300, 1560, { depth: 0.9, at: 0.3, enter: "rise", scale: 0.85, data: { robe: "#E8731C", head: "bun", item: "abhaya", sash: "#C9861A" } }),
          P("figure", 780, 1560, { depth: 0.9, at: 0.6, enter: "rise", scale: 0.9, data: { robe: "#1E5FA8", skin: "#F2E6D8", head: "crown", sash: "#F6B93B" } })
        ],
        labels: [{ text: "BUDDHA", x: 300, y: 1060, toX: 300, toY: 1150, at: 1.6 }, { text: "BALARAM", x: 780, y: 1030, toX: 780, toY: 1120, at: 2 }]
      },
      nextScene(V, 9, "कल देखिए, दसवाँ और अंतिम अवतार, कल्कि। फॉलो कीजिए, एपिक भारत सागा।", "Kal dekhiye dasva aur antim avatar: KALKI. Follow kijiye Epic Bharat Saga.", "KALKI AVATAR")
    ]
  },

  // EP10 Kalki. Source: Bhagavata Purana 12.2.16–12.2.23 (born in Shambhala to Vishnuyasha, rides Devadatta, restores dharma; Satya Yuga follows), 1.3.25; Bhagavad Gita 4.7–4.8.
  10: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "KALIYUG KA ANT", sky: STORM_SKY, particles: "rain",
        narration: "भगवान विष्णु का दसवाँ अवतार... जो अभी आना बाकी है। कल्कि अवतार।",
        caption: "Bhagwan Vishnu ka dasva avatar... jo abhi aana baaki hai. Kalki avatar.",
        headlines: [
          { at: 0, lines: [{ text: "VISHNU KA" }, { text: "DASVA AVATAR", tone: "accent2" }] },
          { at: 2.6, lines: [{ text: "ABHI AANA HAI:" }, { text: "KALKI", tone: "accent2" }] }
        ],
        layers: [
          P("clouds", 540, 820, { depth: 0.2, idle: "drift", data: { count: 3, spread: 220, color: "#5E6878" } }),
          P("horse", 500, 1560, { depth: 1, at: 0.8, enter: "slideRight", scale: 1 })
        ]
      },
      {
        id: "kali", seconds: 7, location: "KALIYUG", sky: ["#14121E", "#3A3046"], particles: "rain",
        narration: "भागवत पुराण कहता है, कलियुग के अंत में धर्म बहुत कम रह जाएगा, और अधर्म बढ़ जाएगा।",
        caption: "Bhagavat Puran kehta hai: Kaliyug ke ant mein dharm bahut kam reh jaayega, aur adharm badh jaayega.",
        headlines: [{ at: 0, lines: [{ text: "DHARM KAM," }, { text: "ADHARM ZYADA", tone: "accent" }] }],
        layers: [
          P("clouds", 540, 860, { depth: 0.2, idle: "drift", data: { count: 4, spread: 250, color: "#4A5262" } }),
          P("rooftops", 540, 1560, { depth: 0.5 })
        ]
      },
      {
        id: "shambhal", seconds: 7, location: "SHAMBHAL GAON", sky: DAWN_SKY, tone: "dark", particles: "petals",
        narration: "तब शंभल गाँव में, विष्णुयश नाम के ब्राह्मण के घर, कल्कि का जन्म होगा।",
        caption: "Tab Shambhal gaon mein, Vishnuyash naam ke brahman ke ghar, Kalki ka janm hoga.",
        headlines: [{ at: 0, lines: [{ text: "SHAMBHAL GAON," }, { text: "VISHNUYASH", tone: "accent" }] }],
        layers: [
          P("sun", 540, 900, { depth: 0.1, idle: "pulse", data: { color: "#FFF1C9" } }),
          P("temple", 780, 1500, { depth: 0.3, scale: 0.8 }),
          P("figure", 340, 1560, { depth: 0.9, at: 0.4, enter: "rise", data: SAGE })
        ]
      },
      {
        id: "devadatta", seconds: 7.5, location: "DEVADATTA · SAFED GHODA", sky: FIRE_SKY, particles: "embers", camera: "panRight",
        narration: "देवदत्त नाम के सफ़ेद घोड़े पर, हाथ में तलवार लेकर, वो अधर्म का नाश करेंगे।",
        caption: "Devadatt naam ke safed ghode par, haath mein talwaar lekar, woh adharm ka naash karenge.",
        headlines: [{ at: 0, lines: [{ text: "SAFED GHODA" }, { text: "DEVADATT", tone: "accent2" }] }],
        layers: [
          P("sun", 540, 1000, { depth: 0.1, idle: "pulse", data: { color: "#FFB36B" } }),
          P("horse", 480, 1560, { depth: 1, at: 0.3, enter: "slideRight", scale: 1.1 })
        ]
      },
      {
        id: "satyug", seconds: 8, location: "PHIR SE SATYUG", sky: ["#F5D08B", "#F2A66B"], tone: "dark", particles: "petals",
        narration: "और फिर से सतयुग आएगा। दस अवतार, एक ही संदेश: जब जब धर्म की हानि होगी, भगवान आएँगे।",
        caption: "Aur phir se Satyug aayega. Das avatar, ek hi sandesh: jab jab dharm ki haani hogi, Bhagwan aayenge.",
        headlines: [
          { at: 0, lines: [{ text: "PHIR SE" }, { text: "SATYUG", tone: "accent" }] },
          { at: 3.6, lines: [{ text: "\"YADA YADA" }, { text: "HI DHARMASYA…\"", tone: "accent" }] }
        ],
        layers: [
          P("sun", 540, 1000, { depth: 0.1, idle: "pulse", data: { color: "#FFF6DA" } }),
          P("lotus", 540, 1500, { depth: 0.8, at: 0.4, enter: "rise", scale: 1.3 }),
          P("water", 540, 1560, { depth: 0.5, data: { pads: true } })
        ]
      },
      {
        id: "next", seconds: 6, location: "VISHNU SEASON · POORA", sky: NIGHT_SKY, particles: "stars",
        narration: "विष्णु सीज़न पूरा हुआ। कल से नया सीज़न, महादेव शिव। फॉलो कीजिए, एपिक भारत सागा।",
        caption: "Vishnu season poora hua! Kal se naya season: MAHADEV SHIV. Follow kijiye Epic Bharat Saga.",
        headlines: [{ at: 0, lines: [{ text: "KAL SE NAYA:" }, { text: "SHIV SEASON", tone: "accent3" }] }],
        layers: [tracker(V, 10)]
      }
    ]
  }
};

/** Channel day N -> global episode N. Throws if that episode is not written yet (fail closed). */
export function epicBharatSagaForDay(day: number): StoryDiorama {
  const ep = Math.max(1, Math.floor(day));
  const info = episodeInfo(ep);
  const authored = EPISODES[ep];
  if (!authored || !info) throw new Error(`EpicBharatSaga EP${ep} (${info ? `${info.season.short} ${info.local}: ${info.name}` : "no season planned"}) is not written yet in content/epicbharatsaga/vishnu-season.ts`);
  const input: StoryDioramaInput = {
    brand: "EPIC BHARAT SAGA",
    handle: "@EpicBharatSaga",
    tag: `${info.season.name} · EP `,
    tagAccent: `${String(info.local).padStart(2, "0")}/${info.total}`,
    palette: info.season.palette,
    transitionFrames: 10,
    scenes: authored.scenes.map((s, i) => ({ ...s, audio: s.audio ?? undefined, fig: s.fig ?? `SCENE ${i + 1}` }))
  };
  return StoryDioramaSchema.parse(input);
}

export function authoredEpisodes(): number[] {
  return Object.keys(EPISODES).map(Number).sort((a, b) => a - b);
}
