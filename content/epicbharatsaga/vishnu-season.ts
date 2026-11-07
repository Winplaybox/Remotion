import { P, StoryDioramaSchema, type StoryDiorama, type StoryDioramaInput } from "../../engines/story-diorama/src/model";

/**
 * EpicBharatSaga — Season 1: Vishnu (Dashavatar).
 * One episode per day. Episode N is published on channel day N.
 * Source for EP01: Bhagavata Purana 8.24 (Matsya avatar). Verify every new episode before publishing.
 */
export const VISHNU_SEASON = {
  id: "vishnu",
  name: "VISHNU SEASON",
  total: 10,
  palette: { paper: "#F5EEDF", ink: "#1C1A17", accent: "#F0533F", accent2: "#F6B93B", accent3: "#5BD17A" },
  outline: [
    "MATSYA", "KURMA", "VARAHA", "NARASIMHA", "VAMANA",
    "PARASHURAMA", "RAMA", "KRISHNA", "BUDDHA", "KALKI"
  ]
} as const;

type Ep = Pick<StoryDioramaInput, "scenes">;

const OCEAN_SKY: [string, string] = ["#0E2A47", "#1E5F78"];
const STORM_SKY: [string, string] = ["#1B2233", "#3A4A5E"];

/** Fully authored episodes. Add EP02+ here as they are written. */
const EPISODES: Record<number, Ep> = {
  1: {
    scenes: [
      {
        id: "hook", seconds: 5, location: "SATYUG · PRALAY SE PEHLE", fig: "SCENE 1", sky: ["#0B1B3A", "#174A6B"], particles: "stars",
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
        id: "anjali", seconds: 6.5, location: "KRITAMALA NADI · TARPAN", fig: "SCENE 2", sky: ["#F2C98B", "#E59A6B"], tone: "dark", particles: "none",
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
        id: "growth", seconds: 7, location: "EK RAAT MEIN · CHAMATKAR", fig: "SCENE 3", sky: ["#123B4A", "#1E6B78"], particles: "bubbles",
        narration: "राजा ने उसे कमंडल में रखा, पर वह रात भर में बढ़ गई। फिर मटका, फिर सरोवर, और अंत में समुद्र भी उसके लिए छोटा पड़ने लगा।",
        caption: "Kamandal mein rakha, raat bhar mein badi ho gayi. Phir matka, phir sarovar... aur samudra bhi chhota pad gaya!",
        headlines: [{ at: 0, lines: [{ text: "JITNA BADA BARTAN," }, { text: "UTNI BADI MACHHLI", tone: "accent2" }] }],
        layers: [P("growthSteps", 540, 1420, { depth: 0.6, at: 0.4, enter: "none", data: { stepSeconds: 1.2 } })]
      },
      {
        id: "warning", seconds: 6.5, location: "MATSYA KI CHETAVANI", fig: "SCENE 4", sky: STORM_SKY, particles: "rain",
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
        id: "towing", seconds: 7, location: "PRALAY · VASUKI KI RASSI", fig: "SCENE 5", sky: STORM_SKY, particles: "rain", camera: "panRight",
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
        id: "vedas", seconds: 6, location: "ASUR HAYAGRIV KA ANT", fig: "SCENE 6", sky: ["#2A1440", "#6B3A2A"], particles: "embers",
        narration: "और मत्स्य ने असुर हयग्रीव का वध करके चुराए हुए वेद वापस लौटाए।",
        caption: "Aur Matsya ne asur Hayagriv ka vadh karke churaye hue Ved wapas laaye.",
        headlines: [{ at: 0, lines: [{ text: "HAYAGRIV SE" }, { text: "VED WAPAS", tone: "accent3" }] }],
        layers: [
          P("sun", 540, 1000, { depth: 0.1, idle: "pulse", data: { color: "#FFD58A" } }),
          P("vedas", 540, 1400, { depth: 0.8, at: 0.4, enter: "none" })
        ]
      },
      {
        id: "next", seconds: 5.5, location: "DASHAVATAR · AAGE", fig: "SCENE 7", sky: ["#1E1A3A", "#4A2A4A"], particles: "stars",
        narration: "कल देखिए, दूसरा अवतार, कूर्म। फॉलो कीजिए, एपिक भारत सागा।",
        caption: "Kal dekhiye dusra avatar: KURMA. Follow kijiye Epic Bharat Saga.",
        headlines: [{ at: 0, lines: [{ text: "KAL: EP 02" }, { text: "KURMA AVATAR", tone: "accent3" }] }],
        layers: [P("festivalTracker", 540, 1130, { depth: 0.7, at: 0.3, enter: "drop", data: { title: "DASHAVATAR", prefix: "EP", items: ["MATSYA", "KURMA", "VARAHA", "NARASIMHA", "VAMANA"], done: 1 } })]
      }
    ]
  }
};

/** Channel day N -> episode N of the running season. Throws if that episode is not written yet (fail closed). */
export function epicBharatSagaForDay(day: number): StoryDiorama {
  const ep = Math.max(1, Math.floor(day));
  const authored = EPISODES[ep];
  if (!authored) throw new Error(`EpicBharatSaga EP${ep} (${VISHNU_SEASON.outline[ep - 1] ?? "?"}) is not written yet in content/epicbharatsaga/vishnu-season.ts`);
  const input: StoryDioramaInput = {
    brand: "EPIC BHARAT SAGA",
    handle: "@epicbharatsaga",
    tag: `${VISHNU_SEASON.name} · EP `,
    tagAccent: `${String(ep).padStart(2, "0")}/${VISHNU_SEASON.total}`,
    palette: VISHNU_SEASON.palette,
    transitionFrames: 10,
    scenes: authored.scenes.map((s, i) => ({ ...s, audio: s.audio ?? undefined, fig: s.fig ?? `SCENE ${i + 1}` }))
  };
  return StoryDioramaSchema.parse(input);
}

export function authoredEpisodes(): number[] {
  return Object.keys(EPISODES).map(Number).sort((a, b) => a - b);
}
