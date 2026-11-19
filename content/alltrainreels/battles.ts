import { creditLines, photo } from "../commons";
import { askOutro } from "../../engines/ask-outro";
import { P, StoryDioramaSchema, type StoryDiorama, type StoryDioramaInput } from "../../engines/story-diorama/src/model";

/**
 * ALLTRAINREELS — "TRAIN BATTLE" Shorts. The channel's own data: its "vs" Shorts out-performed single-fact Shorts by
 * 3-10x (Mumbai Local vs Tokyo Metro 927 views, Vande Bharat vs Shatabdi 243, Steam vs Diesel vs Electric 182 against
 * 20-100 for the rest). So every post is one head-to-head:
 *   hook (both sides roll in) -> stat rounds (bars race, crown per round) -> one twist fact -> AskOutro "A ya B?".
 * The verdict is the viewer's (comment A or B); the rounds are facts. Numbers are rounded and phrased "lagbhag" where
 * sources differ, and every post carries its sources in the description. Post n = BATTLES[n - 1]; unwritten posts fail closed.
 */

type Side = { name: string; train: Record<string, unknown> };
export interface Round { label: string; a: number; b: number; aText: string; bText: string; win: "a" | "b" | "none" }
export interface Battle {
  /** Headline lines, <= 16 chars each. */
  h1: string; h2: string;
  hookHi: string; hookEn: string;
  a: Side; b: Side;
  rounds: Round[];
  roundsHi: string; roundsEn: string;
  twist: { title: string; items: string[]; hi: string; en: string };
  ask: string; askHi: string;
  title: string; sources: string; tags: string[];
}

const VB = { kind: "bullet", color: "#F4F1E8", stripe: "#2F6FD8", cars: 1 };
const SHATABDI = { kind: "electric", color: "#3E5FA8", stripe: "#F4F1E8", cars: 1 };
const RAJDHANI = { kind: "electric", color: "#B8322A", stripe: "#F6B93B", cars: 1 };
const SHINKANSEN = { kind: "bullet", color: "#F4F1E8", stripe: "#1F4FA8", cars: 1 };
const TGV = { kind: "bullet", color: "#D9DDE3", stripe: "#7A1F3A", cars: 1 };
const FUXING = { kind: "bullet", color: "#F4F1E8", stripe: "#C8102E", cars: 1 };
const MAGLEV = { kind: "maglev", color: "#E9EEF4", stripe: "#1F4FA8", cars: 1 };
const STEAM = { kind: "steam", color: "#2A2622", stripe: "#C8102E", cars: 1 };
const ELECTRIC = { kind: "electric", color: "#2F6FD8", stripe: "#F6B93B", cars: 1 };
const FREIGHT_IN = { kind: "freight", color: "#7A3A22", stripe: "#F6B93B", cars: 2 };
const FREIGHT_AU = { kind: "freight", color: "#E0A02A", stripe: "#1C1A17", cars: 2 };
const TOY_RED = { kind: "toy", color: "#B8322A", stripe: "#F6E3A8", cars: 2 };
const TOY_BLUE = { kind: "toy", color: "#2E5A9A", stripe: "#F6E3A8", cars: 2 };
const EXPRESS = { kind: "electric", color: "#3A6A4A", stripe: "#F6B93B", cars: 1 };
const RUSSIA = { kind: "electric", color: "#B8322A", stripe: "#F4F1E8", cars: 1 };
const VB_ORANGE = { kind: "bullet", color: "#F28C28", stripe: "#3A3A3A", cars: 1 };
const BULLET_IN = { kind: "bullet", color: "#F4F1E8", stripe: "#1E7A4A", cars: 1 };
const HERITAGE = { kind: "steam", color: "#3A2A22", stripe: "#C9861A", cars: 1 };

/** Global post order (14 written = two weeks at one post a day). */
const BATTLES: Battle[] = [
  {
    h1: "VANDE BHARAT", h2: "VS SHATABDI",
    hookHi: "वंदे भारत या शताब्दी? भारत की दो सबसे तेज़ ट्रेनें, आज आमने सामने।",
    hookEn: "Vande Bharat ya Shatabdi? Bharat ki do sabse tez trains, aaj aamne saamne.",
    a: { name: "VANDE BHARAT", train: VB }, b: { name: "SHATABDI", train: SHATABDI },
    rounds: [
      { label: "MAX SERVICE SPEED (KM/H)", a: 160, b: 150, aText: "160", bText: "150", win: "a" },
      { label: "SHURUAAT (SAAL)", a: 2019, b: 1988, aText: "2019", bText: "1988", win: "none" }
    ],
    roundsHi: "सर्विस में वंदे भारत एक सौ साठ, शताब्दी एक सौ पचास तक। ट्रायल में वंदे भारत एक सौ तिरासी तक गई। पर शताब्दी उन्नीस सौ अठासी से दौड़ रही है।",
    roundsEn: "Service mein Vande Bharat 160, Shatabdi 150 tak. Trial mein Vande Bharat 183 tak gayi. Par Shatabdi 1988 se daud rahi hai.",
    twist: { title: "TWIST", items: ["ENGINE ALAG NAHI", "HAR DIBBE MEIN MOTOR"], hi: "ट्विस्ट: वंदे भारत में अलग इंजन होता ही नहीं। मोटरें डिब्बों के नीचे लगी होती हैं।", en: "Twist: Vande Bharat mein alag engine hota hi nahi. Motorein dibbon ke neeche lagi hoti hain." },
    ask: "AAP KISME JAOGE?", askHi: "आप किसमें सफ़र करोगे? A, वंदे भारत, या B, शताब्दी?",
    title: "Vande Bharat vs Shatabdi — asli farak", sources: "Indian Railways / ICF; Vande Bharat trial runs 2018-19 (183 km/h)", tags: ["vande bharat", "shatabdi express", "vande bharat vs shatabdi"]
  },
  {
    h1: "SHINKANSEN", h2: "VS TGV",
    hookHi: "जापान की शिंकानसेन या फ़्रांस की टीजीवी? दुनिया की दो सबसे मशहूर बुलेट ट्रेनें।",
    hookEn: "Japan ki Shinkansen ya France ki TGV? Duniya ki do sabse mashhoor bullet trains.",
    a: { name: "SHINKANSEN", train: SHINKANSEN }, b: { name: "TGV", train: TGV },
    rounds: [
      { label: "SHURUAAT (SAAL)", a: 1964, b: 1981, aText: "1964", bText: "1981", win: "a" },
      { label: "SERVICE SPEED (KM/H)", a: 320, b: 320, aText: "320", bText: "320", win: "none" },
      { label: "SPEED RECORD (KM/H)", a: 443, b: 574.8, aText: "443", bText: "574.8", win: "b" }
    ],
    roundsHi: "शिंकानसेन उन्नीस सौ चौंसठ में आई, दुनिया की पहली बुलेट ट्रेन। सर्विस स्पीड दोनों की तीन सौ बीस। पर रिकॉर्ड में टीजीवी पाँच सौ चौहत्तर तक गई।",
    roundsEn: "Shinkansen 1964 mein aayi, duniya ki pehli bullet train. Service speed dono ki 320. Par record mein TGV 574.8 tak gayi.",
    twist: { title: "TWIST", items: ["60 SAAL", "EK BHI YATRI KI MAUT NAHI"], hi: "ट्विस्ट: साठ साल में, शिंकानसेन की टक्कर या पटरी से उतरने में एक भी यात्री की जान नहीं गई।", en: "Twist: 60 saal mein Shinkansen ki takkar ya derailment mein ek bhi yatri ki jaan nahi gayi." },
    ask: "BEST BULLET TRAIN?", askHi: "बेस्ट बुलेट ट्रेन कौन? A, शिंकानसेन, या B, टीजीवी?",
    title: "Shinkansen vs TGV — duniya ki best bullet train?", sources: "JR Central (Shinkansen 1964; no passenger fatalities from collision/derailment); SNCF (TGV 1981; 574.8 km/h record 2007)", tags: ["shinkansen", "tgv", "bullet train", "japan train", "france train"]
  },
  {
    h1: "MAGLEV", h2: "VS TGV",
    hookHi: "एक ट्रेन पहियों पर, दूसरी हवा में तैरती हुई। सबसे तेज़ कौन?",
    hookEn: "Ek train pahiyon par, doosri hawa mein tairti hui. Sabse tez kaun?",
    a: { name: "JAPAN MAGLEV", train: MAGLEV }, b: { name: "TGV", train: TGV },
    rounds: [
      { label: "SPEED RECORD (KM/H)", a: 603, b: 574.8, aText: "603", bText: "574.8", win: "a" },
      { label: "RECORD SAAL", a: 2015, b: 2007, aText: "2015", bText: "2007", win: "none" }
    ],
    roundsHi: "जापान की मैगलेव ने दो हज़ार पंद्रह में छह सौ तीन किलोमीटर प्रति घंटा छुआ। पहियों वाली टीजीवी का रिकॉर्ड पाँच सौ चौहत्तर।",
    roundsEn: "Japan ki Maglev ne 2015 mein 603 km/h chhua. Pahiyon wali TGV ka record 574.8.",
    twist: { title: "KAISE?", items: ["MAGNET SE UTHTI HAI", "PATRI KO CHHOOTI NAHI"], hi: "मैगलेव चुंबक से हवा में उठ जाती है, पटरी को छूती ही नहीं। इसलिए घर्षण लगभग ख़त्म।", en: "Maglev chumbak se hawa mein uth jaati hai, patri ko chhooti hi nahi. Isliye gharshan lagbhag khatam." },
    ask: "FUTURE KISKA?", askHi: "फ़्यूचर किसका? A, मैगलेव, या B, पहियों वाली बुलेट ट्रेन?",
    title: "Maglev vs TGV — hawa mein tairti train jeet gayi?", sources: "Central Japan Railway (SCMaglev 603 km/h, April 2015); SNCF (TGV 574.8 km/h, April 2007)", tags: ["maglev", "tgv", "fastest train", "603 kmph", "bullet train"]
  },
  {
    h1: "STEAM", h2: "VS ELECTRIC",
    hookHi: "भाप वाला इंजन या बिजली वाला? सौ साल का फ़र्क़, एक बैटल में।",
    hookEn: "Bhaap wala engine ya bijli wala? Sau saal ka farak, ek battle mein.",
    a: { name: "STEAM", train: STEAM }, b: { name: "ELECTRIC", train: ELECTRIC },
    rounds: [
      { label: "INDIA MEIN PEHLI BAAR", a: 1853, b: 1925, aText: "1853", bText: "1925", win: "a" },
      { label: "EFFICIENCY (LAGBHAG %)", a: 8, b: 85, aText: "~8%", bText: "~85%", win: "b" }
    ],
    roundsHi: "भारत में पहली भाप ट्रेन अठारह सौ तिरपन में चली, बिजली वाली उन्नीस सौ पच्चीस में। पर भाप इंजन अपनी ऊर्जा का लगभग आठ प्रतिशत ही काम में लाता है।",
    roundsEn: "Bharat mein pehli bhaap train 1853 mein chali, bijli wali 1925 mein. Par steam engine apni energy ka lagbhag 8% hi kaam mein laata hai.",
    twist: { title: "AAJ BHI CHALTI HAI", items: ["DARJEELING TOY TRAIN", "STEAM PE!"], hi: "पर दार्जिलिंग की टॉय ट्रेन में आज भी भाप इंजन चलते हैं, यूनेस्को धरोहर के रूप में।", en: "Par Darjeeling ki toy train mein aaj bhi steam engine chalte hain, UNESCO dharohar ke roop mein." },
    ask: "DIL KISKE SAATH?", askHi: "आपका दिल किसके साथ? A, स्टीम, या B, इलेक्ट्रिक?",
    title: "Steam vs Electric engine — 100 saal ka farak", sources: "Indian Railways (16 Apr 1853 Bori Bunder–Thane; 3 Feb 1925 first electric train); typical steam ~6-10% vs electric traction ~85%+ efficiency; UNESCO DHR", tags: ["steam engine", "electric locomotive", "steam vs electric", "indian railways history"]
  },
  {
    h1: "SUPER VASUKI", h2: "VS AUSTRALIA",
    hookHi: "भारत की सबसे लंबी मालगाड़ी, सुपर वासुकी, बनाम दुनिया की सबसे लंबी ट्रेन।",
    hookEn: "Bharat ki sabse lambi maalgaadi, Super Vasuki, banaam duniya ki sabse lambi train.",
    a: { name: "SUPER VASUKI", train: FREIGHT_IN }, b: { name: "BHP AUSTRALIA", train: FREIGHT_AU },
    rounds: [
      { label: "LAMBAI (KM)", a: 3.5, b: 7.35, aText: "3.5", bText: "7.35", win: "b" },
      { label: "DIBBE (WAGONS)", a: 295, b: 682, aText: "295", bText: "682", win: "b" }
    ],
    roundsHi: "सुपर वासुकी साढ़े तीन किलोमीटर लंबी थी, दो सौ पंचानवे डिब्बे। ऑस्ट्रेलिया की बीएचपी ट्रेन सवा सात किलोमीटर से ज़्यादा, छह सौ बयासी डिब्बे।",
    roundsEn: "Super Vasuki 3.5 km lambi thi, 295 dibbe. Australia ki BHP train 7.35 km, 682 dibbe.",
    twist: { title: "SOCHO", items: ["STATION PAAR KARNE", "MEIN 4 MINUTE!"], hi: "सुपर वासुकी को एक स्टेशन पार करने में करीब चार मिनट लगे। और सत्ताईस हज़ार टन कोयला लेकर चली।", en: "Super Vasuki ko ek station paar karne mein kareeb 4 minute lage. Aur 27,000 tonne koyla lekar chali." },
    ask: "ZYADA DUM KISME?", askHi: "ज़्यादा दम किसमें? A, सुपर वासुकी, या B, ऑस्ट्रेलिया की ट्रेन?",
    title: "Super Vasuki vs duniya ki sabse lambi train", sources: "Indian Railways / SECR (Super Vasuki, Aug 2022: 3.5 km, 295 wagons, ~27,000 t coal); BHP Iron Ore record run, 2001 (7.35 km, 682 wagons)", tags: ["super vasuki", "longest train", "freight train", "indian railways", "longest train in the world"]
  },
  {
    h1: "VIVEK EXPRESS", h2: "VS RUSSIA",
    hookHi: "भारत का सबसे लंबा रूट बनाम दुनिया का सबसे लंबा रेल रूट। कौन कितना चलता है?",
    hookEn: "Bharat ka sabse lamba route banaam duniya ka sabse lamba rail route. Kaun kitna chalta hai?",
    a: { name: "VIVEK EXPRESS", train: EXPRESS }, b: { name: "TRANS-SIBERIAN", train: RUSSIA },
    rounds: [
      { label: "DOORI (KM, LAGBHAG)", a: 4150, b: 9289, aText: "4,150+", bText: "9,289", win: "b" },
      { label: "SAFAR (GHANTE, LAGBHAG)", a: 75, b: 144, aText: "~75", bText: "~144", win: "b" }
    ],
    roundsHi: "विवेक एक्सप्रेस डिब्रूगढ़ से कन्याकुमारी, चार हज़ार किलोमीटर से ज़्यादा, लगभग पचहत्तर घंटे। रूस की ट्रांस साइबेरियन, नौ हज़ार दो सौ नवासी किलोमीटर।",
    roundsEn: "Vivek Express Dibrugarh se Kanyakumari, 4,000 km se zyada, lagbhag 75 ghante. Russia ki Trans-Siberian, 9,289 km.",
    twist: { title: "TRANS-SIBERIAN", items: ["7 TIME ZONE", "PAAR KARTI HAI"], hi: "ट्रांस साइबेरियन रास्ते में सात टाइम ज़ोन पार करती है। घड़ी बदलते बदलते सफ़र ख़त्म।", en: "Trans-Siberian raaste mein 7 time zone paar karti hai. Ghadi badalte badalte safar khatam." },
    ask: "KAUN SA SAFAR?", askHi: "आप कौन सा सफ़र करोगे? A, विवेक एक्सप्रेस, या B, ट्रांस साइबेरियन?",
    title: "Vivek Express vs Trans-Siberian — sabse lamba safar", sources: "Indian Railways / NFR (Vivek Express Dibrugarh–Kanniyakumari ~4,150-4,190 km, ~75 h); Russian Railways (Moscow–Vladivostok 9,289 km)", tags: ["vivek express", "trans siberian railway", "longest train route", "indian railways"]
  },
  {
    h1: "KALKA SHIMLA", h2: "VS DARJEELING",
    hookHi: "पहाड़ों की दो टॉय ट्रेनें, दोनों यूनेस्को धरोहर। कालका शिमला या दार्जिलिंग?",
    hookEn: "Pahadon ki do toy trains, dono UNESCO dharohar. Kalka-Shimla ya Darjeeling?",
    a: { name: "KALKA-SHIMLA", train: TOY_RED }, b: { name: "DARJEELING", train: TOY_BLUE },
    rounds: [
      { label: "LAMBAI (KM)", a: 96, b: 88, aText: "96", bText: "88", win: "a" },
      { label: "SHURUAAT (SAAL)", a: 1903, b: 1881, aText: "1903", bText: "1881", win: "b" },
      { label: "UNESCO (SAAL)", a: 2008, b: 1999, aText: "2008", bText: "1999", win: "b" }
    ],
    roundsHi: "कालका शिमला छियानवे किलोमीटर, सौ से ज़्यादा सुरंगें। दार्जिलिंग अठासी किलोमीटर, पर ये उससे पुरानी है, अठारह सौ इक्यासी की, और यूनेस्को में भी पहले आई।",
    roundsEn: "Kalka-Shimla 96 km, 100 se zyada surangein. Darjeeling 88 km, par ye purani hai, 1881 ki, aur UNESCO mein bhi pehle aayi.",
    twist: { title: "KALKA-SHIMLA", items: ["100+ SURANGEIN", "800+ PUL"], hi: "कालका शिमला लाइन पर सौ से ज़्यादा सुरंगें और आठ सौ से ज़्यादा पुल हैं। सिर्फ़ छियानवे किलोमीटर में।", en: "Kalka-Shimla line par 100 se zyada surangein aur 800 se zyada pul hain. Sirf 96 km mein." },
    ask: "BEST TOY TRAIN?", askHi: "बेस्ट टॉय ट्रेन कौन? A, कालका शिमला, या B, दार्जिलिंग?",
    title: "Kalka-Shimla vs Darjeeling toy train", sources: "UNESCO Mountain Railways of India (DHR 1999, Kalka–Shimla 2008); ICOMOS evaluation 2008 (102 tunnels in use)", tags: ["kalka shimla toy train", "darjeeling toy train", "unesco", "toy train", "mountain railway"]
  },
  {
    h1: "FUXING", h2: "VS SHINKANSEN",
    hookHi: "चीन की फ़ूशिंग या जापान की शिंकानसेन? रोज़ की सर्विस में सबसे तेज़ कौन?",
    hookEn: "China ki Fuxing ya Japan ki Shinkansen? Roz ki service mein sabse tez kaun?",
    a: { name: "FUXING", train: FUXING }, b: { name: "SHINKANSEN", train: SHINKANSEN },
    rounds: [
      { label: "SERVICE SPEED (KM/H)", a: 350, b: 320, aText: "350", bText: "320", win: "a" },
      { label: "SHURUAAT (SAAL)", a: 2017, b: 1964, aText: "2017", bText: "1964", win: "b" }
    ],
    roundsHi: "फ़ूशिंग रोज़ की सर्विस में तीन सौ पचास तक चलती है, शिंकानसेन तीन सौ बीस। पर शिंकानसेन उन्नीस सौ चौंसठ से चल रही है, फ़ूशिंग दो हज़ार सत्रह से।",
    roundsEn: "Fuxing roz ki service mein 350 tak chalti hai, Shinkansen 320. Par Shinkansen 1964 se chal rahi hai, Fuxing 2017 se.",
    twist: { title: "SOCHO", items: ["DELHI SE AGRA", "35 MINUTE MEIN!"], hi: "तीन सौ पचास की रफ़्तार से, दिल्ली से आगरा लगभग पैंतीस मिनट में पहुँच जाओ।", en: "350 ki raftaar se Delhi se Agra lagbhag 35 minute mein pahunch jao." },
    ask: "KAUN JEETA?", askHi: "आपके हिसाब से कौन जीता? A, फ़ूशिंग, या B, शिंकानसेन?",
    title: "Fuxing vs Shinkansen — service mein sabse tez kaun?", sources: "China State Railway Group (Fuxing CR400, 350 km/h service from 2017); JR (Shinkansen 1964, up to 320 km/h)", tags: ["fuxing", "shinkansen", "china bullet train", "japan bullet train", "fastest train"]
  },
  {
    h1: "RAJDHANI", h2: "VS SHATABDI",
    hookHi: "राजधानी और शताब्दी, भारत की दो सबसे इज़्ज़तदार ट्रेनें। असली फ़र्क़ क्या है?",
    hookEn: "Rajdhani aur Shatabdi, Bharat ki do sabse izzatdar trains. Asli farak kya hai?",
    a: { name: "RAJDHANI", train: RAJDHANI }, b: { name: "SHATABDI", train: SHATABDI },
    rounds: [
      { label: "SHURUAAT (SAAL)", a: 1969, b: 1988, aText: "1969", bText: "1988", win: "a" },
      { label: "SAFAR", a: 1, b: 1, aText: "RAAT", bText: "DIN", win: "none" }
    ],
    roundsHi: "राजधानी उन्नीस सौ उनहत्तर में आई, दिल्ली को राज्यों की राजधानियों से जोड़ने। ये रात भर चलती है, स्लीपर के साथ। शताब्दी अठासी में आई, दिन की चेयर कार ट्रेन।",
    roundsEn: "Rajdhani 1969 mein aayi, Delhi ko rajyon ki rajdhaniyon se jodne. Ye raat bhar chalti hai. Shatabdi 1988 mein aayi, din ki chair car train.",
    twist: { title: "NAAM KA RAAZ", items: ["SHATABDI = 100 SAAL", "NEHRU JI KI JAYANTI"], hi: "शताब्दी नाम क्यों? ये उन्नीस सौ अठासी में नेहरू जी की सौवीं जयंती पर शुरू हुई थी।", en: "Shatabdi naam kyun? Ye 1988 mein Nehru ji ki sauvin jayanti par shuru hui thi." },
    ask: "AAPKI FAVOURITE?", askHi: "आपकी फ़ेवरेट कौन? A, राजधानी, या B, शताब्दी?",
    title: "Rajdhani vs Shatabdi — asli farak kya hai?", sources: "Indian Railways (Howrah Rajdhani 1969; Shatabdi 1988, Nehru birth centenary)", tags: ["rajdhani express", "shatabdi express", "indian railways", "rajdhani vs shatabdi"]
  },
  {
    h1: "BULLET TRAIN", h2: "VS VANDE BHARAT",
    hookHi: "भारत की आने वाली बुलेट ट्रेन बनाम आज की वंदे भारत। रफ़्तार में कितना फ़र्क़?",
    hookEn: "Bharat ki aane wali bullet train banaam aaj ki Vande Bharat. Raftaar mein kitna farak?",
    a: { name: "BULLET (PLAN)", train: BULLET_IN }, b: { name: "VANDE BHARAT", train: VB_ORANGE },
    rounds: [
      { label: "DESIGN SPEED (KM/H)", a: 320, b: 180, aText: "320", bText: "180", win: "a" },
      { label: "SERVICE SPEED (KM/H)", a: 320, b: 160, aText: "320*", bText: "160", win: "a" }
    ],
    roundsHi: "मुंबई अहमदाबाद बुलेट ट्रेन तीन सौ बीस की रफ़्तार के लिए बन रही है। वंदे भारत की सर्विस स्पीड एक सौ साठ। मतलब लगभग दोगुना।",
    roundsEn: "Mumbai-Ahmedabad bullet train 320 ki raftaar ke liye ban rahi hai. Vande Bharat ki service speed 160. Matlab lagbhag doguna.",
    twist: { title: "* PLAN", items: ["MUMBAI-AHMEDABAD", "LAGBHAG 508 KM"], hi: "ध्यान रहे, बुलेट ट्रेन अभी बन रही है। मुंबई से अहमदाबाद लगभग पाँच सौ आठ किलोमीटर का रूट।", en: "Dhyaan rahe, bullet train abhi ban rahi hai. Mumbai se Ahmedabad lagbhag 508 km ka route." },
    ask: "KISKA INTEZAAR?", askHi: "आपको किसका इंतज़ार है? A, बुलेट ट्रेन, या B, नई वंदे भारत?",
    title: "India ki bullet train vs Vande Bharat — kitna farak?", sources: "NHSRCL (Mumbai–Ahmedabad HSR, ~508 km, 320 km/h design, under construction); Indian Railways (Vande Bharat 160 km/h service)", tags: ["bullet train india", "vande bharat", "mumbai ahmedabad bullet train", "high speed rail"]
  },
  {
    h1: "GOTTHARD", h2: "VS SEIKAN",
    hookHi: "पहाड़ के नीचे या समुद्र के नीचे? दुनिया की दो सबसे लंबी रेल सुरंगें।",
    hookEn: "Pahaad ke neeche ya samundar ke neeche? Duniya ki do sabse lambi rail surangein.",
    a: { name: "GOTTHARD", train: ELECTRIC }, b: { name: "SEIKAN", train: SHINKANSEN },
    rounds: [
      { label: "LAMBAI (KM)", a: 57, b: 53.9, aText: "57", bText: "53.9", win: "a" },
      { label: "KHULI (SAAL)", a: 2016, b: 1988, aText: "2016", bText: "1988", win: "none" }
    ],
    roundsHi: "स्विट्ज़रलैंड की गोटहार्ड सुरंग सत्तावन किलोमीटर, आल्प्स पहाड़ के नीचे। जापान की सेइकान लगभग चौवन किलोमीटर, और इसका बड़ा हिस्सा समुद्र के नीचे है।",
    roundsEn: "Switzerland ki Gotthard surang 57 km, Alps pahaad ke neeche. Japan ki Seikan lagbhag 54 km, aur iska bada hissa samundar ke neeche hai.",
    twist: { title: "GOTTHARD", items: ["UPAR 2,300 M", "PAHAAD!"], hi: "गोटहार्ड सुरंग के ऊपर, कुछ जगह दो हज़ार मीटर से ज़्यादा पहाड़ है।", en: "Gotthard surang ke upar kuch jagah 2,000 meter se zyada pahaad hai." },
    ask: "ZYADA KHATARNAAK?", askHi: "आपके हिसाब से कौन ज़्यादा कमाल? A, गोटहार्ड, या B, सेइकान?",
    title: "Gotthard vs Seikan — duniya ki sabse lambi rail surang", sources: "AlpTransit Gotthard (57.1 km, opened 2016, up to ~2,300 m rock overburden); JR Hokkaido (Seikan 53.85 km, 1988)", tags: ["gotthard base tunnel", "seikan tunnel", "longest tunnel", "rail tunnel"]
  },
  {
    h1: "HUBBALLI", h2: "VS GORAKHPUR",
    hookHi: "दुनिया का सबसे लंबा रेलवे प्लेटफ़ॉर्म भारत में है। पर कौन सा? हुबली या गोरखपुर?",
    hookEn: "Duniya ka sabse lamba railway platform Bharat mein hai. Par kaunsa? Hubballi ya Gorakhpur?",
    a: { name: "HUBBALLI", train: EXPRESS }, b: { name: "GORAKHPUR", train: RAJDHANI },
    rounds: [
      { label: "PLATFORM (METER)", a: 1507, b: 1366, aText: "1,507", bText: "1,366", win: "a" }
    ],
    roundsHi: "कर्नाटक के हुबली स्टेशन का प्लेटफ़ॉर्म पंद्रह सौ सात मीटर लंबा है, दुनिया में सबसे लंबा। इससे पहले रिकॉर्ड गोरखपुर का था, तेरह सौ छियासठ मीटर।",
    roundsEn: "Karnataka ke Hubballi station ka platform 1,507 meter lamba hai, duniya mein sabse lamba. Isse pehle record Gorakhpur ka tha, 1,366 meter.",
    twist: { title: "SOCHO", items: ["1.5 KM PAIDAL", "LAGBHAG 20 MINUTE"], hi: "एक सिरे से दूसरे सिरे तक पैदल चलो, तो लगभग बीस मिनट लग जाएँगे।", en: "Ek sire se doosre sire tak paidal chalo, to lagbhag 20 minute lag jaayenge." },
    ask: "KABHI GAYE HO?", askHi: "आप कहाँ गए हो? A, हुबली, या B, गोरखपुर?",
    title: "Duniya ka sabse lamba platform — Hubballi vs Gorakhpur", sources: "South Western Railway (Hubballi PF-1, 1,507 m, Guinness record 2023); North Eastern Railway (Gorakhpur 1,366 m)", tags: ["longest platform", "hubballi", "gorakhpur", "indian railways record"]
  },
  {
    h1: "CHENAB BRIDGE", h2: "VS EIFFEL TOWER",
    hookHi: "भारत का चिनाब ब्रिज, पेरिस के एफ़िल टावर से भी ऊँचा? चलो नापते हैं।",
    hookEn: "Bharat ka Chenab bridge, Paris ke Eiffel Tower se bhi ooncha? Chalo naapte hain.",
    a: { name: "CHENAB BRIDGE", train: VB }, b: { name: "EIFFEL TOWER", train: TGV },
    rounds: [
      { label: "UNCHAI (METER)", a: 359, b: 330, aText: "359", bText: "330", win: "a" }
    ],
    roundsHi: "जम्मू कश्मीर में चिनाब नदी से तीन सौ उनसठ मीटर ऊपर ये दुनिया का सबसे ऊँचा रेलवे आर्च ब्रिज है। एफ़िल टावर लगभग तीन सौ तीस मीटर।",
    roundsEn: "Jammu-Kashmir mein Chenab nadi se 359 meter upar ye duniya ka sabse ooncha railway arch bridge hai. Eiffel Tower lagbhag 330 meter.",
    twist: { title: "AUR SUNO", items: ["TOOFAN JHEL SAKTA", "TEZ HAWA MEIN BHI"], hi: "ये ब्रिज बहुत तेज़ हवा और भूकंप झेलने के लिए बनाया गया है।", en: "Ye bridge bahut tez hawa aur bhookamp jhelne ke liye banaya gaya hai." },
    ask: "ZYADA KAMAAL KAUN?", askHi: "ज़्यादा कमाल कौन? A, चिनाब ब्रिज, या B, एफ़िल टावर?",
    title: "Chenab Bridge vs Eiffel Tower — kaun ooncha?", sources: "Northern Railway / USBRL (Chenab Rail Bridge, 359 m above river, opened 2025); Eiffel Tower ~330 m", tags: ["chenab bridge", "eiffel tower", "highest railway bridge", "jammu kashmir", "indian railways"]
  },
  {
    h1: "INDIA RAIL", h2: "VS CHINA RAIL",
    hookHi: "भारत का रेल नेटवर्क बनाम चीन का। कौन कितना बड़ा?",
    hookEn: "Bharat ka rail network banaam China ka. Kaun kitna bada?",
    a: { name: "INDIA", train: RAJDHANI }, b: { name: "CHINA", train: FUXING },
    rounds: [
      { label: "ROUTE (HAZAAR KM, LAGBHAG)", a: 69, b: 160, aText: "~69", bText: "~160", win: "b" },
      { label: "PEHLI TRAIN (SAAL)", a: 1853, b: 1876, aText: "1853", bText: "1876", win: "a" }
    ],
    roundsHi: "भारत का रेल रूट लगभग उनहत्तर हज़ार किलोमीटर, चीन का लगभग एक लाख साठ हज़ार। पर भारत में ट्रेन पहले चली, अठारह सौ तिरपन में।",
    roundsEn: "Bharat ka rail route lagbhag 69 hazaar km, China ka lagbhag 1 lakh 60 hazaar. Par Bharat mein train pehle chali, 1853 mein.",
    twist: { title: "INDIAN RAILWAYS", items: ["ROZ 2 CRORE+", "YATRI"], hi: "पर भारतीय रेल हर दिन दो करोड़ से ज़्यादा यात्रियों को ले जाती है।", en: "Par Indian Railways har din 2 crore se zyada yatriyon ko le jaati hai." },
    ask: "KAUN AAGE NIKLEGA?", askHi: "दस साल में कौन आगे? A, भारत, या B, चीन?",
    title: "Indian Railways vs China Railways — kaun bada?", sources: "Indian Railways Year Book (~69,000 route km; 2 crore+ passengers/day); China State Railway Group (~160,000 km); Woosung Road 1876", tags: ["indian railways", "china railway", "india vs china", "rail network"]
  }
];

const PAL = { paper: "#F6F7FB", ink: "#12151C", accent: "#FF4D3D", accent2: "#FFD23F", accent3: "#3DD6FF" };
const SKIES: [string, string][] = [["#0E1A33", "#1E3A66"], ["#141428", "#2E2A5A"], ["#0F2230", "#1F4A5A"], ["#1A1426", "#3A2A4A"]];

export const TRAIN_HANDLE = "@AllTrainReels";
export const TRAIN_CTA_VOICE = "अपना जवाब कमेंट में लिखो, A या B!";
export const trainBattleCount = () => BATTLES.length;

export function trainBattle(n: number): Battle {
  const b = BATTLES[Math.floor(n) - 1];
  if (!b) throw new Error(`Train Battle #${n} is not written yet in content/alltrainreels/battles.ts`);
  return b;
}

type Scene = Omit<StoryDioramaInput["scenes"][number], "fig">;

/** Post n -> a Short on the story-diorama engine (rail finish) with the shared AskOutro ending. */
/** Real photo (Wikimedia Commons register id) for every side name used in BATTLES. Tested: no side without a photo. */
const SIDE_PHOTO: Record<string, string> = {
  "VANDE BHARAT": "train-vandebharat", SHATABDI: "train-shatabdi", SHINKANSEN: "train-shinkansen", TGV: "train-tgv",
  "JAPAN MAGLEV": "train-maglev", STEAM: "train-steam", ELECTRIC: "train-electric", "SUPER VASUKI": "train-supervasuki",
  "BHP AUSTRALIA": "train-bhp", "VIVEK EXPRESS": "train-vivek", "TRANS-SIBERIAN": "train-transsiberian", "KALKA-SHIMLA": "train-kalkashimla",
  DARJEELING: "train-darjeeling", FUXING: "train-fuxing", RAJDHANI: "train-rajdhani", "BULLET (PLAN)": "train-bullet",
  GOTTHARD: "train-gotthard", SEIKAN: "train-seikan", HUBBALLI: "train-hubballi", GORAKHPUR: "train-gorakhpur",
  "CHENAB BRIDGE": "train-chenab", "EIFFEL TOWER": "train-eiffel", INDIA: "train-india", CHINA: "train-china"
};
export function sidePhotoId(name: string): string {
  const id = SIDE_PHOTO[name];
  if (!id) throw new Error(`AllTrainReels: no photo for side "${name}" in SIDE_PHOTO`);
  return id;
}
export const battlePhotoIds = (n: number): [string, string] => { const q = trainBattle(n); return [sidePhotoId(q.a.name), sidePhotoId(q.b.name)]; };

/** Publish slot (IST) — must match channels.ts alltrainreels.slots (tested). Used in the daily "kal" CTA. */
export const TRAIN_SLOT = "18:45";
/** Tomorrow's battle, teased in today's ending. */
export function nextBattleTeaser(n: number): { line: string; voice: string } {
  const next = BATTLES[Math.floor(n)];
  if (!next) return { line: "KAL SHAAM 6:45 — NAYI BATTLE", voice: "कल शाम पौने सात बजे, नई ट्रेन बैटल। फॉलो करो!" };
  return { line: `KAL 6:45 PM: ${next.a.name} VS ${next.b.name}`, voice: "कल शाम पौने सात बजे, अगली ट्रेन बैटल। फॉलो करो, मिस मत करना!" };
}

export function trainBattleForDay(n: number): StoryDiorama {
  const q = trainBattle(n);
  const sky = SKIES[(n - 1) % SKIES.length]!;
  const [pa, pb] = battlePhotoIds(n);
  const split = [photo(pa), photo(pb)];
  const kal = nextBattleTeaser(n);
  const names = (at = 0.3) => [
    { text: `A · ${q.a.name}`, x: 540, y: 880, toX: 540, toY: 880, at },
    { text: `B · ${q.b.name}`, x: 540, y: 1040, toX: 540, toY: 1040, at: at + 0.4 }
  ];
  const scenes: Scene[] = [
    {
      id: "hook", seconds: 5.5, location: `TRAIN BATTLE #${String(n).padStart(2, "0")}`, sky, particles: "none", camera: "push",
      narration: q.hookHi, caption: q.hookEn, sfx: ["train_horn"], photos: split, grade: "clean",
      headlines: [{ at: 0, lines: [{ text: q.h1 }, { text: q.h2, tone: "accent2" }] }],
      layers: [], labels: names()
    },
    {
      id: "rounds", seconds: 10.5, location: "ROUND BY ROUND", sky, particles: "none", camera: "still",
      narration: q.roundsHi, caption: q.roundsEn, photos: split, grade: "clean", dim: 0.55,
      headlines: [{ at: 0, lines: [{ text: "ROUND BY" }, { text: "ROUND", tone: "accent3" }] }],
      layers: [P("statBars", 540, 1000, { depth: 0.6, at: 0.2, enter: "rise", scale: 1, data: { aName: q.a.name, bName: q.b.name, rows: q.rounds, stepSeconds: 10 / Math.max(2, q.rounds.length + 1) } })]
    },
    {
      id: "twist", seconds: 7, location: q.twist.title, sky, particles: "none", camera: "push",
      narration: q.twist.hi, caption: q.twist.en, photos: [photo(pa)], grade: "clean", dim: 0.15,
      headlines: [{ at: 0, lines: [{ text: q.twist.title.length <= 16 ? q.twist.title : "TWIST" }] }],
      layers: [P("noteCard", 540, 900, { depth: 0.7, at: 0.5, enter: "drop", scale: 0.85, data: { title: q.twist.title, items: q.twist.items } })]
    },
    {
      id: "ask", seconds: 10, location: "AAPKA FAISLA", sky, particles: "none", camera: "still",
      narration: `${q.askHi} ${TRAIN_CTA_VOICE} ${kal.voice}`, caption: "", photos: split, grade: "clean",
      headlines: [{ at: 0, lines: [{ text: "A YA B?" }] }],
      layers: [], labels: names(0)
    }
  ];
  return StoryDioramaSchema.parse({
    music: "sfx/music_rail.mp3",
    brand: "ALL TRAIN REELS", handle: TRAIN_HANDLE,
    tag: "TRAIN BATTLE · #", tagAccent: String(n).padStart(2, "0"),
    palette: PAL, transitionFrames: 8, finish: "rail",
    scenes: scenes.map((s, i) => ({ ...s, fig: `ROUND ${i + 1}` })),
    ask: askOutro({
      question: q.ask, options: [`A: ${q.a.name}`, `B: ${q.b.name}`], voiceQuestion: q.askHi,
      cta: "A YA B? COMMENT KARO! 👇", ctaSub: kal.line, voiceCta: `${TRAIN_CTA_VOICE} ${kal.voice}`,
      handle: TRAIN_HANDLE, questionSeconds: 4, ctaSeconds: 5.5
    })
  });
}

export function trainBattleMeta(n: number) {
  const q = trainBattle(n);
  return {
    title: `${q.title} 🚄 | Train Battle #${n} #shorts`,
    description: [
      q.title,
      `A: ${q.a.name} · B: ${q.b.name} — aapka faisla comment mein likho 👇`,
      `Source: ${q.sources}`,
      "", `⏰ ${nextBattleTeaser(n).line.replace("KAL", "Kal")} — subscribe @AllTrainReels 🔔`,
      "", ...creditLines(battlePhotoIds(n)),
      "#Trains #Railways #IndianRailways #TrainBattle #Locomotives #shorts"
    ].join("\n"),
    tags: ["trains", "railways", "indian railways", "train battle", "train facts", ...q.tags, "shorts"].slice(0, 20),
    caption: `${q.title} 🚄\nA: ${q.a.name} ya B: ${q.b.name}? Comment karo 👇\nYouTube pe roz nayi battle 👉 @AllTrainReels\n#trains #railways #indianrailways #reels`,
    language: "hi",
    categoryId: "2"
  };
}
