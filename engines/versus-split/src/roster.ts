import type { BattlePreset } from "./model";

export type UniverseCategory =
  | "anime"
  | "superhero"
  | "gaming"
  | "wwe"
  | "mythology"
  | "movies"
  | "creatures"
  | "concepts";

export interface MatchupEntry extends BattlePreset {
  universe: UniverseCategory;
  subCategory: string;
}

export const MASTER_ROSTER: MatchupEntry[] = [
  // ==========================================
  // 1. ANIME & MANGA
  // ==========================================
  {
    universe: "anime", subCategory: "Dragon Ball",
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
    universe: "anime", subCategory: "Naruto",
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
    universe: "anime", subCategory: "Naruto",
    a: { name: "KAKASHI", title: "DMS Double Sharingan", franchise: "NARUTO", color: "#64748B", signatureMove: "Kamui Raikiri", signaturePower: 94, speedStat: 93, durabilityStat: 90 },
    b: { name: "ITACHI", title: "Susanoo Yata Mirror", franchise: "NARUTO", color: "#DC2626", signatureMove: "Tsukuyomi", signaturePower: 95, speedStat: 91, durabilityStat: 92 },
    r1Name: "GENJUTSU IQ", r1A: "Tactical Clone Swap", r1B: "Tsukuyomi Realm", r1Win: "b",
    r2Name: "DIMENSIONAL JUTSU", r2A: "Kamui Phasing", r2B: "Amaterasu Flames", r2Win: "a",
    r3Name: "SUSANOO WEAPON", r3A: "Kamui Shuriken", r3B: "Totsuka Blade & Yata", r3Win: "a",
    winner: "a",
    voiceHook: "काकाशी बनाम इताची! उचिहा जीनियस और कॉपी निंजा का माइंड बैटल!",
    verdictHi: "काकाशी बने विजेता! कामुई फेज़िंग को कोई भी जेन्जुत्सु नहीं छू पाया!",
    verdictReason: "DMS Kakashi ka Kamui phasing aur Kamui Shuriken dimensional tier attack hai!"
  },
  {
    universe: "anime", subCategory: "Naruto",
    a: { name: "MADARA", title: "Ten Tails Jinchuriki", franchise: "NARUTO", color: "#831843", signatureMove: "Tengai Shinsei", signaturePower: 98, speedStat: 95, durabilityStat: 97 },
    b: { name: "HASHIRAMA", title: "God of Shinobi", franchise: "NARUTO", color: "#15803D", signatureMove: "True Several Thousand Hands", signaturePower: 97, speedStat: 92, durabilityStat: 98 },
    r1Name: "AVATAR CLASH", r1A: "Perfect Susanoo", r1B: "Wood Golem Buddha", r1Win: "b",
    r2Name: "DESTRUCTION SCALE", r2A: "Double Meteorite Drop", r2B: "Deep Forest Bloom", r2Win: "a",
    r3Name: "REGENERATION & CHAKRA", r3A: "Six Paths Immortality", r3B: "Sage Healing Cells", r3Win: "a",
    winner: "a",
    voiceHook: "मदारा बनाम हाशिरामा! शिनोबी इतिहास की सबसे विनाशकारी प्रतिद्वंद्विता!",
    verdictHi: "मदारा को मिला ताज! टेन टेल्स की असीमित शक्ति ने इतिहास बदल दिया!",
    verdictReason: "Ten-Tails Jinchuriki Madara ki Six Paths chakra Hashirama ke wood release se aage nikal gayi!"
  },
  {
    universe: "anime", subCategory: "Dragon Ball",
    a: { name: "GOKU", title: "Ultra Instinct Mastered", franchise: "DRAGON BALL", color: "#3B82F6", signatureMove: "Dragon Fist", signaturePower: 98, speedStat: 99, durabilityStat: 96 },
    b: { name: "VEGETA", title: "Ultra Ego God of Destruction", franchise: "DRAGON BALL", color: "#7C3AED", signatureMove: "Hakai Final Flash", signaturePower: 97, speedStat: 96, durabilityStat: 98 },
    r1Name: "ATTACK IMPACT", r1A: "Silver Dragon Burst", r1B: "Sphere of Destruction", r1Win: "a",
    r2Name: "PAIN ABSORPTION", r2A: "Autonomous Dodge", r2B: "Damage Booster Ego", r2Win: "b",
    r3Name: "DIVINE TECHNIQUE", r3A: "Angelic UI Reflex", r3B: "Hakai Erase Limit", r3Win: "a",
    winner: "a",
    voiceHook: "गोकू बनाम वेजीटा! अल्ट्रा इंस्टिंक्ट और अल्ट्रा ईगो की अंतिम टक्कर!",
    verdictHi: "गोकू के सिर पर ताज! एंजेलिक रिफ्लेक्स ने डिस्ट्रक्शन गॉड को पछाड़ दिया!",
    verdictReason: "Ultra Instinct ka autonomous dodge Vegeta ke hit-taking Ultra Ego ko stamina exhaustion par le gaya!"
  },
  {
    universe: "anime", subCategory: "One Piece",
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
    universe: "anime", subCategory: "One Piece",
    a: { name: "SHANKS", title: "Red Hair Emperor", franchise: "ONE PIECE", color: "#DC2626", signatureMove: "Divine Departure", signaturePower: 97, speedStat: 96, durabilityStat: 92 },
    b: { name: "MIHAWK", title: "World Strongest Swordsman", franchise: "ONE PIECE", color: "#475569", signatureMove: "Black Blade Yoru Slash", signaturePower: 96, speedStat: 95, durabilityStat: 93 },
    r1Name: "SWORD SLASH", r1A: "Gryphon Speed Cut", r1B: "Tsunami Splitting Yoru", r1Win: "b",
    r2Name: "OBSERVATION HAKI", r2A: "Killer of Observation", r2B: "Hawk Eye Clairvoyance", r2Win: "a",
    r3Name: "CONQUEROR HAKI", r3A: "Wi-Fi Conqueror Stun", r3B: "Supreme Grade Blade", r3Win: "a",
    winner: "a",
    voiceHook: "शैंक्स बनाम मिहॉक! वन पीस की दुनिया के दो सबसे महान तलवारबाज!",
    verdictHi: "शैंक्स के सिर पर क्राउन! डिवाइन डिपार्चर और कॉन्करर हाकी ने जीत दिलाई!",
    verdictReason: "Shanks ki Observation-killing Conqueror Haki Mihawk ke Yoru slash par bhaari pad gayi!"
  },
  {
    universe: "anime", subCategory: "Jujutsu Kaisen",
    a: { name: "GOJO SATORU", title: "Honored One", franchise: "JUJUTSU KAISEN", color: "#38BDF8", signatureMove: "Hollow Purple 200%", signaturePower: 98, speedStat: 99, durabilityStat: 95 },
    b: { name: "SUKUNA", title: "King of Curses", franchise: "JUJUTSU KAISEN", color: "#BE123C", signatureMove: "World Cutting Slash", signaturePower: 99, speedStat: 96, durabilityStat: 97 },
    r1Name: "DOMAIN EXPANSION", r1A: "Unlimited Void", r1B: "Malevolent Shrine", r1Win: "tie",
    r2Name: "LIMITLESS BARRIER", r2A: "Infinity Space", r2B: "Mahoraga Adaptation", r2Win: "b",
    r3Name: "LETHAL TECHNIQUE", r3A: "Max Output Purple", r3B: "World Dismantle Cut", r3Win: "b",
    winner: "b",
    voiceHook: "गोजो सातोरु बनाम सुकुना! जुजुत्सु कैसेन की सदी की सबसे बड़ी महाभिड़ंत!",
    verdictHi: "सुकुना को मिला ताज! वर्ल्ड कटिंग स्लैश ने इनफिनिटी स्पेस को चीर दिया!",
    verdictReason: "Sukuna ke World Cutting Slash ne space ko target kiya jisse Gojo ki Infinity bypass ho gayi!"
  },
  {
    universe: "anime", subCategory: "Bleach",
    a: { name: "ICHIGO", title: "True Bankai Horn of Salvation", franchise: "BLEACH", color: "#F97316", signatureMove: "Gran Rey Getsuga", signaturePower: 98, speedStat: 97, durabilityStat: 95 },
    b: { name: "AIZEN", title: "Hokyoku Immortal", franchise: "BLEACH", color: "#9333EA", signatureMove: "Kyoka Suigetsu Illusion", signaturePower: 97, speedStat: 95, durabilityStat: 99 },
    r1Name: "RAW SPIRITUAL PRESSURE", r1A: "Hollow-Quincy Fusion", r1B: "Hokyoku Evolution", r1Win: "a",
    r2Name: "HYPNOSIS & MIND", r2A: "Instinct Speed", r2B: "Total Hypnosis Control", r2Win: "b",
    r3Name: "IMMORTALITY VS POWER", r3A: "Getsuga Tensho Slash", r3B: "Regeneration Core", r3Win: "b",
    winner: "b",
    voiceHook: "इचिगो कुरोसाकी बनाम सोसुके आइजेन! ब्लीच की सबसे क्लासिक सोल रीपर लड़ाई!",
    verdictHi: "आइजेन ने जीता मैच! होक्योकु की अमरता और सम्मोहन को कोई तोड़ नहीं सका!",
    verdictReason: "Aizen ki complete immortality aur Kyoka Suigetsu mind control ne Ichigo ko outlast kiya!"
  },

  // ==========================================
  // 2. SUPERHEROES & COMIC MULTIVERSE
  // ==========================================
  {
    universe: "superhero", subCategory: "Marvel vs DC",
    a: { name: "SUPERMAN", title: "Man of Steel", franchise: "DC COMICS", color: "#2563EB", signatureMove: "Heat Vision Burst", signaturePower: 99, speedStat: 99, durabilityStat: 99 },
    b: { name: "THOR", title: "Rune King God of Thunder", franchise: "MARVEL", color: "#EAB308", signatureMove: "God Blast Mjolnir", signaturePower: 98, speedStat: 93, durabilityStat: 97 },
    r1Name: "COSMIC STRENGTH", r1A: "Moving Tectonic Plates", r1B: "Shattering Planet Core", r1Win: "a",
    r2Name: "MAGIC VULNERABILITY", r2A: "Vulnerable to Spells", r2B: "Odinforce Ancient Runes", r2Win: "b",
    r3Name: "LIGHTSPEED COMBAT", r3A: "Faster Than Lightning", r3B: "Stormbreaker Throw", r3Win: "a",
    winner: "a",
    voiceHook: "सुपरमैन बनाम थॉर! डीसी और मार्वल के सबसे ताकतवर देवताओं की भिड़ंत!",
    verdictHi: "सुपरमैन के सिर पर क्राउन! बेजोड़ रफ्तार और अपार शारीरिक ताकत ने मैच जीत लिया!",
    verdictReason: "Superman ki sheer speed aur physical durability Rune magic par bhaari pad gayi!"
  },
  {
    universe: "superhero", subCategory: "Marvel vs DC",
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
    universe: "superhero", subCategory: "Marvel vs DC",
    a: { name: "THANOS", title: "Infinity Gauntlet", franchise: "MARVEL", color: "#7E22CE", signatureMove: "Infinity Snap", signaturePower: 99, speedStat: 88, durabilityStat: 98 },
    b: { name: "DARKSEID", title: "True Form New God", franchise: "DC COMICS", color: "#374151", signatureMove: "Omega Beams", signaturePower: 99, speedStat: 92, durabilityStat: 99 },
    r1Name: "COSMIC WEAPON", r1A: "6 Infinity Stones", r1B: "Anti-Life Equation", r1Win: "a",
    r2Name: "TRACKING ATTACK", r2A: "Reality Warp", r2B: "Unavoidable Omega Beams", r2Win: "b",
    r3Name: "EXISTENCE LEVEL", r3A: "Universe Bounded", r3B: "Multiversal Concept God", r3Win: "b",
    winner: "b",
    voiceHook: "थेनोस बनाम डार्कसाइड! मार्वल और डीसी के सबसे बड़े खलनायकों का महाविनाशकारी युद्ध!",
    verdictHi: "डार्कसाइड बने अल्टीमेट विजेता! ओमेगा बीम्स और मल्टीवर्सल ताकत ने थेनोस को मिटा दिया!",
    verdictReason: "Infinity Gauntlet DC universe mein kaam nahi karta, jabki Darkseid ka True Form multiversal hai!"
  },
  {
    universe: "superhero", subCategory: "Marvel",
    a: { name: "HULK", title: "World Breaker", franchise: "MARVEL", color: "#16A34A", signatureMove: "Gamma Thunderclap", signaturePower: 98, speedStat: 85, durabilityStat: 99 },
    b: { name: "WOLVERINE", title: "Adamantium Berserker", franchise: "MARVEL", color: "#F59E0B", signatureMove: "Berserker Claw Flurry", signaturePower: 91, speedStat: 90, durabilityStat: 97 },
    r1Name: "LETHAL CUTTING", r1A: "Shockwave Punch", r1B: "Adamantium Claws", r1Win: "b",
    r2Name: "RAW STRENGTH", r2A: "Planet Breaking Rage", r2B: "Peak Human Strength", r2Win: "a",
    r3Name: "HEALING FACTOR", r3A: "Endless Gamma Regen", r3B: "Cellular Healing", r3Win: "a",
    winner: "a",
    voiceHook: "हल्क बनाम वूल्वरिन! कॉमिक्स की सबसे खूनी और प्रसिद्ध प्रतिद्वंद्विता!",
    verdictHi: "हल्क के सिर पर ताज! वर्ल्ड ब्रेकर के प्रचंड गुस्से को एडमैंटियम भी नहीं सह पाया!",
    verdictReason: "World Breaker Hulk ki endless kinetic gamma energy ne Wolverine ko knock out kiya!"
  },

  // ==========================================
  // 3. GAMING LEGENDS
  // ==========================================
  {
    universe: "gaming", subCategory: "God of War vs DOOM",
    a: { name: "KRATOS", title: "Ghost of Sparta", franchise: "GOD OF WAR", color: "#DC2626", signatureMove: "Blades of Chaos", signaturePower: 97, speedStat: 92, durabilityStat: 98 },
    b: { name: "DOOM SLAYER", title: "Hell Walker", franchise: "DOOM", color: "#166534", signatureMove: "BFG 9000 & Crucible", signaturePower: 97, speedStat: 93, durabilityStat: 97 },
    r1Name: "MELEE WEAPONRY", r1A: "Leviathan Axe Frost", r1B: "Crucible Energy Blade", r1Win: "tie",
    r2Name: "RANGED FIREPOWER", r2A: "Draupnir Spear Rain", r2B: "BFG 9000 Plasma Core", r2Win: "b",
    r3Name: "GOD SLAYING FEATS", r3A: "Destroyed Greek & Norse Gods", r3B: "Eradicated Entire Hell", r3Win: "a",
    winner: "a",
    voiceHook: "क्रैटोस बनाम डूम स्लेयर! गेमिंग इतिहास के दो सबसे क्रूर और निर्दयी वॉरियर्स!",
    verdictHi: "क्रैटोस के सिर पर ताज! स्पार्टन रेज और देव-संहारक ताकत ने डूम स्लेयर को हराया!",
    verdictReason: "Kratos ki endless physical scaling aur God-killing physiology ne edge dilayi!"
  },
  {
    universe: "gaming", subCategory: "Mortal Kombat",
    a: { name: "SCORPION", title: "Grandmaster of Shirai Ryu", franchise: "MORTAL KOMBAT", color: "#EAB308", signatureMove: "Spear & Hellfire", signaturePower: 94, speedStat: 93, durabilityStat: 92 },
    b: { name: "SUB-ZERO", title: "Grandmaster of Lin Kuei", franchise: "MORTAL KOMBAT", color: "#0284C7", signatureMove: "Ice Clone & Deep Freeze", signaturePower: 93, speedStat: 92, durabilityStat: 93 },
    r1Name: "ELEMENTAL CLASH", r1A: "Netherrealm Hellfire", r1B: "Absolute Zero Frost", r1Win: "a",
    r2Name: "TACTICAL TRAPS", r2A: "Teleport Punch", r2B: "Ice Decoy Freeze", r2Win: "b",
    r3Name: "FATALITY EXECUTION", r3A: "Toasty Skull Breath", r3B: "Spine Rip Execution", r3Win: "a",
    winner: "a",
    voiceHook: "स्कॉर्पियन बनाम सब-ज़ीरो! मोर्टल कॉम्बैट का सबसे आइकॉनिक आग और बर्फ का युद्ध!",
    verdictHi: "स्कॉर्पियन बने विनर! नेदररेल्म की नर्क की आग ने बर्फ के साम्राज्य को पिघला दिया!",
    verdictReason: "Scorpion ka Netherrealm hellfire aur teleportation ne Sub-Zero ke ice shield ko tod diya!"
  },
  {
    universe: "gaming", subCategory: "Tekken",
    a: { name: "JIN KAZAMA", title: "Devil Gene Awakening", franchise: "TEKKEN", color: "#E11D48", signatureMove: "Electric Wind Hook Fist", signaturePower: 95, speedStat: 94, durabilityStat: 93 },
    b: { name: "KAZUYA MISHIMA", title: "True Devil Form", franchise: "TEKKEN", color: "#4F46E5", signatureMove: "Devil Blaster Beam", signaturePower: 96, speedStat: 92, durabilityStat: 95 },
    r1Name: "MISHIMA KARATE", r1A: "Kazama Defense Style", r1B: "Wave Dash Aggression", r1Win: "a",
    r2Name: "DEVIL BEAM", r2A: "Telekinetic Burst", r2B: "Third Eye Laser", r2Win: "b",
    r3Name: "WILLPOWER SURGE", r3A: "Purified Angel Wing", r3B: "Ruthless Bloodline", r3Win: "a",
    winner: "a",
    voiceHook: "जिन कज़ामा बनाम काजुया मिशिमा! टेकन की सबसे खून से सनी बाप-बेटे की जंग!",
    verdictHi: "जिन कज़ामा के सिर पर क्राउन! एंजेल विंग्स और कज़ामा तकनीक ने काजुया को हरा दिया!",
    verdictReason: "Jin ki purified Angel power ne Kazuya ke Devil Gene ko neutralize kiya!"
  },
  {
    universe: "gaming", subCategory: "Pokémon",
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

  // ==========================================
  // 4. WWE & COMBAT SPORTS
  // ==========================================
  {
    universe: "wwe", subCategory: "WWE Legends",
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
    universe: "wwe", subCategory: "WWE Modern",
    a: { name: "ROMAN REIGNS", title: "Tribal Chief", franchise: "WWE", color: "#1E3A8A", signatureMove: "Spear & Guillotine", signaturePower: 97, speedStat: 84, durabilityStat: 96 },
    b: { name: "THE ROCK", title: "Final Boss", franchise: "WWE", color: "#B45309", signatureMove: "Rock Bottom & Spinebuster", signaturePower: 96, speedStat: 85, durabilityStat: 94 },
    r1Name: "PEOPLES ATTACK", r1A: "Superman Punch", r1B: "People's Elbow", r1Win: "b",
    r2Name: "BLOODLINE INFLUENCE", r2A: "1300+ Day Champion", r2B: "Hollywood Final Boss", r2Win: "a",
    r3Name: "FINISHING BLOW", r3A: "Running Spear", r3B: "Rock Bottom", r3Win: "a",
    winner: "a",
    voiceHook: "रोमन रेंस बनाम द रॉक! ब्लडलाइन और हेड ऑफ द टेबल का पारिवारिक महायुद्ध!",
    verdictHi: "रोमन रेंस ने जीता ताज! 1300 दिन की ऐतिहासिक बादशाहत और स्पीयर ने रॉक को पिन किया!",
    verdictReason: "Roman Reigns ki ruthless consistency aur devastating spear ne victory seal ki!"
  },
  {
    universe: "wwe", subCategory: "WWE Ruthless",
    a: { name: "BROCK LESNAR", title: "The Beast Incarnate", franchise: "WWE", color: "#991B1B", signatureMove: "F-5 & Kimura Lock", signaturePower: 98, speedStat: 88, durabilityStat: 97 },
    b: { name: "GOLDBERG", title: "The Streak", franchise: "WWE", color: "#374151", signatureMove: "Jackhammer & Spear", signaturePower: 97, speedStat: 86, durabilityStat: 95 },
    r1Name: "OPENING SPEAR", r1A: "German Suplex Hold", r1B: "Speed Spear 100mph", r1Win: "b",
    r2Name: "SUPLEX CITY STAMINA", r2A: "10x Suplex Assault", r2B: "Short Match Power", r2Win: "a",
    r3Name: "SUBMISSION DANGER", r3A: "Kimura Arm Fracture", r3B: "Jackhammer Lift", r3Win: "a",
    winner: "a",
    voiceHook: "ब्रॉक लेसनर बनाम गोल्डबर्ग! दो अजेय दैत्यों का सबसे विनाशकारी मुकाबला!",
    verdictHi: "ब्रॉक लेसनर बने चैंपियन! सुप्लेक्स सिटी और किमुरा लॉक ने गोल्डबर्ग का खेल खत्म किया!",
    verdictReason: "Brock Lesnar ki superior stamina aur MMA submission ne match turn kiya!"
  },

  // ==========================================
  // 5. MYTHOLOGY & ANCIENT LEGENDS
  // ==========================================
  {
    universe: "mythology", subCategory: "Hindu Mythology",
    a: { name: "LORD SHIVA", title: "Mahadev Destroyer", franchise: "HINDU MYTHOLOGY", color: "#0284C7", signatureMove: "Trishul & Third Eye", signaturePower: 100, speedStat: 100, durabilityStat: 100 },
    b: { name: "LORD VISHNU", title: "Preserver of Cosmos", franchise: "HINDU MYTHOLOGY", color: "#F59E0B", signatureMove: "Sudarshana Chakra", signaturePower: 100, speedStat: 100, durabilityStat: 100 },
    r1Name: "DIVINE ASTRA", r1A: "Pashupatastra & Trishul", r1B: "Sudarshana Chakra", r1Win: "tie",
    r2Name: "COSMIC ROLE", r2A: "Dissolution (Samhara)", r2B: "Preservation (Sthiti)", r2Win: "tie",
    r3Name: "ULTIMATE REALITY", r3A: "Paramashiva Brahman", r3B: "Paravishnu Brahman", r3Win: "tie",
    winner: "a",
    voiceHook: "भगवान शिव बनाम भगवान विष्णु! ब्रह्मांड के दो सर्वोच्च शक्तियों का अलौकिक दर्शन!",
    verdictHi: "दोनों सर्वोच्च और अभिन्न हैं! हरि और हर एक ही चेतना के दो रूप हैं!",
    verdictReason: "Shiv aur Vishnu ek hi Parabrahm hain, dono ke astra aur astitva anant hain!"
  },
  {
    universe: "mythology", subCategory: "Hindu Mythology",
    a: { name: "HANUMAN", title: "Pawanputra Sankatmochan", franchise: "HINDU MYTHOLOGY", color: "#EA580C", signatureMove: "Gada & Cosmic Form", signaturePower: 99, speedStat: 99, durabilityStat: 100 },
    b: { name: "GARUDA", title: "King of Birds Vishnu Vahana", franchise: "HINDU MYTHOLOGY", color: "#FACC15", signatureMove: "Amrita Wing Slash", signaturePower: 96, speedStat: 99, durabilityStat: 97 },
    r1Name: "SPEED OF FLIGHT", r1A: "Sun Leaping Flight", r1B: "Cosmic Wind Speed", r1Win: "tie",
    r2Name: "PHYSICAL STRENGTH", r2A: "Lifting Dronagiri Mountain", r2B: "Crushing Giant Serpents", r2Win: "a",
    r3Name: "DIVINE BOONS", r3A: "Ashta Siddhi & Immortality", r3B: "Amrita Protection", r3Win: "a",
    winner: "a",
    voiceHook: "पवनपुत्र हनुमान बनाम गरुड़ देव! ब्रह्मांड के दो सबसे तेज और शक्तिशाली उड़ने वाले महाबली!",
    verdictHi: "बजरंगबली के सिर पर क्राउन! अष्ट सिद्धि और पर्वत उठाने वाले बल की जय हो!",
    verdictReason: "Hanuman ji ke paas Ashta Siddhi aur Chiranjeevi varadan hai, unka bal adviteeya hai!"
  },
  {
    universe: "mythology", subCategory: "Greek Mythology",
    a: { name: "ZEUS", title: "King of Olympus", franchise: "GREEK MYTHOLOGY", color: "#FBBF24", signatureMove: "Master Lightning Bolt", signaturePower: 98, speedStat: 96, durabilityStat: 97 },
    b: { name: "POSEIDON", title: "God of the Sea", franchise: "GREEK MYTHOLOGY", color: "#06B6D4", signatureMove: "Earthquake Trident", signaturePower: 97, speedStat: 94, durabilityStat: 97 },
    r1Name: "ELEMENTAL WRATH", r1A: "Heavenly Thunder", r1B: "Tsunami & Storms", r1Win: "a",
    r2Name: "EARTH SHAKING", r2A: "Sky Domination", r2B: "Tectonic Shatter", r2Win: "b",
    r3Name: "DIVINE AUTHORITY", r3A: "King of the Gods", r3B: "Oceanic Titan Slayer", r3Win: "a",
    winner: "a",
    voiceHook: "ज़ीउस बनाम पोसीडॉन! आसमान के बिजली देवता और समुद्र के राजा की टक्कर!",
    verdictHi: "ज़ीउस बने ओलंपस के किंग! मास्टर लाइटनिंग बोल्ट ने समुद्र को चीर कर जीत दिलाई!",
    verdictReason: "Zeus ke Master Bolt ki firepower Poseidon ke trident se superior hai!"
  },
  {
    universe: "mythology", subCategory: "Cross Mythology",
    a: { name: "SUN WUKONG", title: "Monkey King Great Sage", franchise: "CHINESE MYTHOLOGY", color: "#EAB308", signatureMove: "Ruyi Jingu Bang", signaturePower: 99, speedStat: 99, durabilityStat: 99 },
    b: { name: "HANUMAN", title: "Sankatmochan Mahabali", franchise: "HINDU MYTHOLOGY", color: "#EA580C", signatureMove: "Vajra Body & Gada", signaturePower: 99, speedStat: 99, durabilityStat: 100 },
    r1Name: "72 TRANSFORMATIONS", r1A: "Clone Army & Shapes", r1B: "Anima-Mahima Siddhi", r1Win: "b",
    r2Name: "IMMORTALITY LAYERS", r2A: "7 Layers of Immortality", r2B: "Indestructible Vajra Deha", r2Win: "tie",
    r3Name: "COSMIC DEVOTION", r3A: "Heaven Havoc Rebel", r3B: "Selfless Divine Grace", r3Win: "b",
    winner: "b",
    voiceHook: "सन वुकॉन्ग बनाम हनुमान जी! पूर्व और पश्चिम के दो सबसे महान वानर योद्धा!",
    verdictHi: "महाबली हनुमान को मिला ताज! अटूट वज्र देह और अष्ट सिद्धियों ने जीत तय की!",
    verdictReason: "Hanuman ji ki Vajra sharir aur Rudra avatar power Sun Wukong ke shapeshifting se aage hai!"
  },

  // ==========================================
  // 6. MOVIES & POP CULTURE
  // ==========================================
  {
    universe: "movies", subCategory: "Action Legends",
    a: { name: "JOHN WICK", title: "Baba Yaga", franchise: "JOHN WICK", color: "#475569", signatureMove: "Gun Fu Double Tap", signaturePower: 92, speedStat: 94, durabilityStat: 95 },
    b: { name: "JASON BOURNE", title: "Treadstone Assassin", franchise: "BOURNE", color: "#1E293B", signatureMove: "Improvised CQB Strike", signaturePower: 91, speedStat: 93, durabilityStat: 92 },
    r1Name: "FIREARM PRECISION", r1A: "100% Headshot Rate", r1B: "Tactical Concealment", r1Win: "a",
    r2Name: "HAND TO HAND", r2A: "Judo & Sambo Throws", r2B: "Kali & Krav Maga", r2Win: "b",
    r3Name: "PAIN RESISTANCE", r3A: "Fell off Continental Roof", r3B: "Escaped CIA Network", r3Win: "a",
    winner: "a",
    voiceHook: "जॉन विक बनाम जेसन बॉर्न! सिनेमा इतिहास के दो सबसे खतरनाक हत्यारे आमने-सामने!",
    verdictHi: "बाबा यागा ने जीता ताज! गन-फू और बेजोड़ दर्द सहने की क्षमता ने बॉर्न को पछाड़ दिया!",
    verdictReason: "John Wick ka body armor suit aur relentless weapon speed Bourne ke CQB par bhaari pada!"
  },
  {
    universe: "movies", subCategory: "Sci-Fi Titans",
    a: { name: "GODZILLA", title: "King of the Monsters", franchise: "MONSTERVERSE", color: "#06B6D4", signatureMove: "Atomic Breath Beam", signaturePower: 98, speedStat: 70, durabilityStat: 99 },
    b: { name: "KING KONG", title: "Ruler of Hollow Earth", franchise: "MONSTERVERSE", color: "#D97706", signatureMove: "Charged Battle Axe", signaturePower: 95, speedStat: 88, durabilityStat: 94 },
    r1Name: "AGILITY & COMBAT", r1A: "Heavy Tail Slam", r1B: "Building Jumping Strike", r1Win: "b",
    r2Name: "ENERGY ABSORPTION", r2A: "Nuclear Radiation Core", r2B: "Hollow Earth Axe Energy", r2Win: "a",
    r3Name: "DESTRUCTIVE OUTPUT", r3A: "Deep Earth Atomic Breath", r3B: "Two Hand Axe Drop", r3Win: "a",
    winner: "a",
    voiceHook: "गॉडज़िला बनाम किंग कांग! मॉन्स्टरवर्स के दो सबसे विशाल सम्राटों की महाटक्कर!",
    verdictHi: "गॉडज़िला बने असली किंग! एटॉमिक ब्रेथ की विनाशकारी ताकत को कांग नहीं रोक सका!",
    verdictReason: "Godzilla ka endless atomic breath aur regenerative scale armor King Kong par haavi raha!"
  },

  // ==========================================
  // 7. ANIMALS & APEX PREDATORS
  // ==========================================
  {
    universe: "creatures", subCategory: "Big Cats",
    a: { name: "BENGAL TIGER", title: "Lord of the Sundarbans", franchise: "WILDLIFE APEX", color: "#EA580C", signatureMove: "Ambush Neck Bite (1050 PSI)", signaturePower: 94, speedStat: 92, durabilityStat: 93 },
    b: { name: "AFRICAN LION", title: "King of the Savannah", franchise: "WILDLIFE APEX", color: "#CA8A04", signatureMove: "Mane Defense & Paw Swipe", signaturePower: 91, speedStat: 89, durabilityStat: 91 },
    r1Name: "BITE FORCE & WEIGHT", r1A: "310 kg, 1050 PSI", r1B: "220 kg, 650 PSI", r1Win: "a",
    r2Name: "COMBAT EXPERIENCE", r2A: "Solitary Lone Hunter", r2B: "Pride Battle Veteran", r2Win: "b",
    r3Name: "AGILITY & WATER", r3A: "Master Swimmer & Climber", r3B: "Dry Plains Fighter", r3Win: "a",
    winner: "a",
    voiceHook: "रॉयल बंगाल टाइगर बनाम अफ्रीकी शेर! जंगल का असली राजा कौन है?",
    verdictHi: "बंगाल टाइगर बना विजेता! भारी वजन और 1050 PSI बाइट फोर्स ने शेर को हरा दिया!",
    verdictReason: "Bengal Tiger ka 90kg extra muscular weight aur massive bite force 1v1 battle mein decisve raha!"
  },
  {
    universe: "creatures", subCategory: "Prehistoric Titans",
    a: { name: "T-REX", title: "Tyrant Lizard King", franchise: "PREHISTORIC APEX", color: "#78350F", signatureMove: "Bone Crushing Bite (12,800 PSI)", signaturePower: 98, speedStat: 78, durabilityStat: 97 },
    b: { name: "SPINOSAURUS", title: "River Monster", franchise: "PREHISTORIC APEX", color: "#065F46", signatureMove: "Hook Claw & Conical Snout", signaturePower: 94, speedStat: 82, durabilityStat: 94 },
    r1Name: "LENGTH & MASS", r1A: "12 Meters, 9 Tons", r1B: "15 Meters, 8 Tons", r1Win: "b",
    r2Name: "BITE FORCE", r2A: "12,800 PSI Bone Shatter", r2B: "Fish Snapping Jaw", r2Win: "a",
    r3Name: "TERRESTRIAL COMBAT", r3A: "Thick Muscular Neck", r3B: "Fragile Sail Spine", r3Win: "a",
    winner: "a",
    voiceHook: "टी-रेक्स बनाम स्पिनोसॉरस! डायनासोर इतिहास के दो सबसे भयानक शिकारियों की भिड़ंत!",
    verdictHi: "टी-रेक्स के सिर पर क्राउन! 12,800 पाउंड बाइट फोर्स ने स्पिनोसॉरस की हड्डी तोड़ दी!",
    verdictReason: "T-Rex ka bone-crushing bite force land combat mein Spinosaurus ke fish jaw par bhari pada!"
  },

  // ==========================================
  // 8. SPEED & INTELLIGENCE CONCEPTS
  // ==========================================
  {
    universe: "concepts", subCategory: "Speed Showdown",
    a: { name: "THE FLASH", title: "Speed Force Conduit", franchise: "DC COMICS", color: "#DC2626", signatureMove: "Infinite Mass Punch", signaturePower: 98, speedStat: 100, durabilityStat: 92 },
    b: { name: "SONIC", title: "Super Sonic", franchise: "SEGA", color: "#2563EB", signatureMove: "Chaos Emerald Spindash", signaturePower: 96, speedStat: 99, durabilityStat: 94 },
    r1Name: "BASE FOOTRACE", r1A: "Trans-Time Velocity", r1B: "Mach 5 Hypersonic", r1Win: "a",
    r2Name: "CHAOS EMERALDS", r2A: "Speed Force Steal", r2B: "Chaos Control Warp", r2Win: "b",
    r3Name: "MULTIVERSE SPEED", r3A: "Faster Than Teleportation", r3B: "Light Speed Dash", r3Win: "a",
    winner: "a",
    voiceHook: "द फ्लैश बनाम सोनिक द हेजहॉग! फिक्शन की दुनिया का सबसे तेज धावक कौन है?",
    verdictHi: "द फ्लैश ने जीता ताज! स्पीड फोर्स की असीम गति ने सोनिक को पीछे छोड़ दिया!",
    verdictReason: "The Flash speed of light se bhi trillion times tez bhaag sakta hai aur time travel kar sakta hai!"
  },
  {
    universe: "concepts", subCategory: "Mind & Strategy IQ",
    a: { name: "BATMAN", title: "Prep Time God", franchise: "DC COMICS", color: "#1F2937", signatureMove: "Contingency Protocol", signaturePower: 90, speedStat: 88, durabilityStat: 92 },
    b: { name: "SHERLOCK HOLMES", title: "Master of Deduction", franchise: "CONAN DOYLE", color: "#92400E", signatureMove: "Science of Deduction", signaturePower: 86, speedStat: 82, durabilityStat: 85 },
    r1Name: "CRIME SCENE ANALYSIS", r1A: "Bat-Computer Forensics", r1B: "Pure Human Observation", r1Win: "b",
    r2Name: "COMBAT APPLICATION", r2A: "127 Martial Arts", r2B: "Baritsu Boxing", r2Win: "a",
    r3Name: "GLOBAL STRATEGY", r3A: "Contingency for Gods", r3B: "Moriarty Syndicate Bust", r3Win: "a",
    winner: "a",
    voiceHook: "बैटमैन बनाम शर्लक होम्स! दुनिया के दो सबसे तेज दिमागों की रणनीतिक जंग!",
    verdictHi: "बैटमैन बने अल्टीमेट डिटेक्टिव! कॉम्बैट मास्टरी और आधुनिक तकनीक ने बाजी मारी!",
    verdictReason: "Sherlock deduction mein genius hai par Batman ki physical prowess aur tech unhe outmatch karti hai!"
  }
];
