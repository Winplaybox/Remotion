import type { CharacterCategory, CharacterDefinition } from "./types";

export const CAST_100: CharacterDefinition[] = [
  // -------------------------------------------------------------
  // 1. Main Detective Family (10)
  // -------------------------------------------------------------
  {
    id: "jasoos-bhai",
    name: "Jasoos Bhai",
    profession: "Chief Private Detective",
    category: "main-detective-family",
    role: "main",
    persona: "Sharp, calm, observant Indian detective with classic trench coat, fedora hat, and magnifying eye.",
    look: { skin: "#B97A55", hair: "#1C1C1C", hairStyle: "short", facialHair: "mustache", outfitColor: "#7A5A3A", outfitSecondary: "#2E2318", outfitStyle: "coat", accessory: "detective-hat" }
  },
  {
    id: "assistant-chhotu",
    name: "Assistant Chhotu",
    profession: "Junior Detective & Tech Whiz",
    category: "main-detective-family",
    role: "main",
    persona: "Energetic, eager assistant who takes notes, holds magnifying glass, and spots tiny forensic details.",
    look: { skin: "#C48658", hair: "#1A1A1A", hairStyle: "spiky", facialHair: "none", outfitColor: "#2F5D8A", outfitSecondary: "#F4D06F", outfitStyle: "casual", accessory: "specs" }
  },
  {
    id: "inspector-sharma",
    name: "Inspector Sharma",
    profession: "Senior Police Inspector",
    category: "main-detective-family",
    role: "main",
    persona: "Stern, booming voice, proud Khaki police officer who relies on Jasoos Bhai's brain to crack impossible cases.",
    look: { skin: "#AD6E46", hair: "#262626", hairStyle: "short", facialHair: "mustache", outfitColor: "#C2A675", outfitSecondary: "#8A2522", outfitStyle: "uniform", accessory: "police-cap" }
  },
  {
    id: "constable-ram-singh",
    name: "Constable Ram Singh",
    profession: "Police Constable",
    category: "main-detective-family",
    role: "supporting",
    persona: "Loyal, humorous constable who guards crime scenes and occasionally blurts out accidental clues.",
    look: { skin: "#9E6038", hair: "#202020", hairStyle: "short", facialHair: "mustache", outfitColor: "#BFA472", outfitSecondary: "#523B25", outfitStyle: "uniform", accessory: "police-cap" }
  },
  {
    id: "forensic-dr-salunkhe",
    name: "Dr. Salunkhe",
    profession: "Chief Forensic Expert",
    category: "main-detective-family",
    role: "main",
    persona: "Analytical scientist in white lab coat who tests poisons, fingerprints, blood drops, and fiber threads.",
    look: { skin: "#BD8153", hair: "#555555", hairStyle: "short", facialHair: "none", outfitColor: "#FFFFFF", outfitSecondary: "#4A90E2", outfitStyle: "coat", accessory: "specs" }
  },
  {
    id: "informer-kallu",
    name: "Kallu Khabari",
    profession: "Street Informant",
    category: "main-detective-family",
    role: "supporting",
    persona: "Sneaky, fast-talking street informant who knows every whisper in the gullies and tea stalls.",
    look: { skin: "#8C522B", hair: "#141414", hairStyle: "short", facialHair: "stubble", outfitColor: "#4A4E69", outfitSecondary: "#22223B", outfitStyle: "casual", accessory: "scarf" }
  },
  {
    id: "head-constable-patil",
    name: "Head Constable Patil",
    profession: "Desk & Evidence Officer",
    category: "main-detective-family",
    role: "supporting",
    persona: "Meticulous record keeper who maintains FIR registers, seized items, and suspect files.",
    look: { skin: "#AB6F47", hair: "#292929", hairStyle: "short", facialHair: "mustache", outfitColor: "#BA9F6E", outfitSecondary: "#453221", outfitStyle: "uniform", accessory: "specs" }
  },
  {
    id: "cyber-expert-priya",
    name: "Priya Cyber",
    profession: "Digital Forensics & CCTV Analyst",
    category: "main-detective-family",
    role: "main",
    persona: "Sharp young analyst who checks hacked phone logs, security cameras, and deleted WhatsApp chats.",
    look: { skin: "#C78D63", hair: "#1E1815", hairStyle: "bun", facialHair: "none", outfitColor: "#3D5A80", outfitSecondary: "#98C1D9", outfitStyle: "casual", accessory: "specs" }
  },
  {
    id: "dog-handler-jaggu",
    name: "Jaggu Handler",
    profession: "K-9 Tracker Handler",
    category: "main-detective-family",
    role: "supporting",
    persona: "Keen-eyed tracker officer following scent trails and discarded footprints near crime scenes.",
    look: { skin: "#A3653C", hair: "#2B2B2B", hairStyle: "cap", facialHair: "stubble", outfitColor: "#588157", outfitSecondary: "#344E41", outfitStyle: "uniform", accessory: "none" }
  },
  {
    id: "court-clerk-tiwari",
    name: "Babu Tiwari",
    profession: "Magistrate Court Clerk",
    category: "main-detective-family",
    role: "supporting",
    persona: "Punctual court clerk managing search warrants, stamp papers, and witness summons.",
    look: { skin: "#BA7E52", hair: "#403D39", hairStyle: "bald", facialHair: "mustache", outfitColor: "#EAE2B7", outfitSecondary: "#003049", outfitStyle: "kurta", accessory: "specs" }
  },

  // -------------------------------------------------------------
  // 2. Rich Family (10)
  // -------------------------------------------------------------
  {
    id: "seth-dhaniram",
    name: "Seth Dhaniram",
    profession: "Wealthy Haveli Owner",
    category: "rich-family",
    role: "main",
    persona: "Flamboyant, wealthy patriarch draped in silk sherwani and heavy gold rings; panics when vaults open.",
    look: { skin: "#C28557", hair: "#EEEEEE", hairStyle: "turban", facialHair: "mustache", outfitColor: "#D4AF37", outfitSecondary: "#800020", outfitStyle: "sherwani", accessory: "gold-chain" }
  },
  {
    id: "sethani-malti-devi",
    name: "Sethani Malti Devi",
    profession: "Haveli Matriarch",
    category: "rich-family",
    role: "main",
    persona: "Strict, jewel-laden matriarch who manages family keys and keeps strict eye on servants.",
    look: { skin: "#C98E64", hair: "#3A3A3A", hairStyle: "bun", facialHair: "none", outfitColor: "#C71585", outfitSecondary: "#FFD700", outfitStyle: "saree", accessory: "gold-chain" }
  },
  {
    id: "beta-rohan",
    name: "Beta Rohan",
    profession: "Playboy Heir",
    category: "rich-family",
    role: "suspect",
    persona: "Spoiled elder son with sports car keys, secret casino debts, and inconsistent nighttime alibis.",
    look: { skin: "#C5895D", hair: "#171717", hairStyle: "spiky", facialHair: "stubble", outfitColor: "#1D3557", outfitSecondary: "#E63946", outfitStyle: "suit", accessory: "none" }
  },
  {
    id: "beti-priya",
    name: "Beti Priya",
    profession: "Fashion Designer Daughter",
    category: "rich-family",
    role: "supporting",
    persona: "Ambitious younger daughter who disputes the family will and keeps a locked sketch studio.",
    look: { skin: "#CE946B", hair: "#231815", hairStyle: "long", facialHair: "none", outfitColor: "#E07A5F", outfitSecondary: "#3D405B", outfitStyle: "saree", accessory: "none" }
  },
  {
    id: "bahu-sunita",
    name: "Bahu Sunita",
    profession: "Daughter-in-Law",
    category: "rich-family",
    role: "suspect",
    persona: "Quiet daughter-in-law who observes everything from the kitchen balcony and hides a duplicate safe key.",
    look: { skin: "#C88E65", hair: "#1A1A1A", hairStyle: "bun", facialHair: "none", outfitColor: "#2A9D8F", outfitSecondary: "#F4A261", outfitStyle: "saree", accessory: "none" }
  },
  {
    id: "damaad-vikram",
    name: "Damaad Vikram",
    profession: "Son-in-Law & Stock Trader",
    category: "rich-family",
    role: "suspect",
    persona: "Smooth-talking son-in-law with an urgent need for an 80-lakh loan before the stock market opens.",
    look: { skin: "#BC7F53", hair: "#1C1C1C", hairStyle: "short", facialHair: "goatee", outfitColor: "#2B2D42", outfitSecondary: "#8D99AE", outfitStyle: "suit", accessory: "specs" }
  },
  {
    id: "dadi-saraswati",
    name: "Dadi Saraswati",
    profession: "Grandmother & Family Elder",
    category: "rich-family",
    role: "main",
    persona: "Sharp-eared grandmother who wakes up at 3 AM for prayer beads and hears floorboards creak.",
    look: { skin: "#CA8E67", hair: "#FFFFFF", hairStyle: "bun", facialHair: "none", outfitColor: "#F5F3F4", outfitSecondary: "#D3D3D3", outfitStyle: "saree", accessory: "specs" }
  },
  {
    id: "dada-hariprasad",
    name: "Dada Hariprasad",
    profession: "Retired Patriarch",
    category: "rich-family",
    role: "supporting",
    persona: "Stern patriarch who built the haveli empire and hid heirloom diamonds inside a grandfather clock.",
    look: { skin: "#BD8055", hair: "#E5E5E5", hairStyle: "bald", facialHair: "full-beard", outfitColor: "#4A3B32", outfitSecondary: "#DDA15E", outfitStyle: "kurta", accessory: "specs" }
  },
  {
    id: "chacha-ramesh",
    name: "Chacha Ramesh",
    profession: "Estranged Business Partner",
    category: "rich-family",
    role: "suspect",
    persona: "Resentful brother who claimed half the haveli property and was seen arguing behind the rose bushes.",
    look: { skin: "#B5764A", hair: "#262626", hairStyle: "short", facialHair: "mustache", outfitColor: "#6B705C", outfitSecondary: "#A5A58D", outfitStyle: "kurta", accessory: "none" }
  },
  {
    id: "chachi-shobha",
    name: "Chachi Shobha",
    profession: "Gossip Aunt",
    category: "rich-family",
    role: "supporting",
    persona: "Talkative aunt who watches everyone's entry times from her second-floor balcony window.",
    look: { skin: "#C88E65", hair: "#1E1815", hairStyle: "bun", facialHair: "none", outfitColor: "#9B5DE5", outfitSecondary: "#F15BB5", outfitStyle: "saree", accessory: "gold-chain" }
  },

  // -------------------------------------------------------------
  // 3. Household Staff (10)
  // -------------------------------------------------------------
  {
    id: "naukar-ramu",
    name: "Naukar Ramu",
    profession: "Head Butler & Valet",
    category: "household-staff",
    role: "main",
    persona: "Loyal haveli servant of 25 years who brings evening tea and knows every secret drawer.",
    look: { skin: "#9E6139", hair: "#1D1D1D", hairStyle: "short", facialHair: "mustache", outfitColor: "#E9D8A6", outfitSecondary: "#005F73", outfitStyle: "kurta", accessory: "none" }
  },
  {
    id: "maali-kaka",
    name: "Maali Kaka",
    profession: "Haveli Gardener",
    category: "household-staff",
    role: "supporting",
    persona: "Quiet gardener with clay-stained hands who noticed fresh footprints over the mud bed at midnight.",
    look: { skin: "#8B512C", hair: "#4A4A4A", hairStyle: "turban", facialHair: "stubble", outfitColor: "#606C38", outfitSecondary: "#283618", outfitStyle: "kurta", accessory: "none" }
  },
  {
    id: "driver-bahadur",
    name: "Driver Bahadur",
    profession: "Chauffeur",
    category: "household-staff",
    role: "suspect",
    persona: "Chauffeur who claimed the garage gate was locked, yet his car engine was still warm at 11:30 PM.",
    look: { skin: "#A66C44", hair: "#181818", hairStyle: "cap", facialHair: "mustache", outfitColor: "#3D405B", outfitSecondary: "#E07A5F", outfitStyle: "uniform", accessory: "none" }
  },
  {
    id: "cook-maharaj",
    name: "Cook Maharaj",
    profession: "Head Royal Chef",
    category: "household-staff",
    role: "supporting",
    persona: "Passionate cook preparing midnight halwa who smelled burnt kerosene near the store room.",
    look: { skin: "#B87C51", hair: "#333333", hairStyle: "turban", facialHair: "full-beard", outfitColor: "#F4F1DE", outfitSecondary: "#E07A5F", outfitStyle: "kurta", accessory: "none" }
  },
  {
    id: "kaamwali-kamla",
    name: "Kaamwali Kamla",
    profession: "Housekeeper",
    category: "household-staff",
    role: "suspect",
    persona: "Sharp housekeeper who found a torn velvet cloth caught in the window latch during morning dusting.",
    look: { skin: "#A2663E", hair: "#1A1A1A", hairStyle: "bun", facialHair: "none", outfitColor: "#EE6C4D", outfitSecondary: "#293241", outfitStyle: "saree", accessory: "none" }
  },
  {
    id: "chowkidar-birju",
    name: "Chowkidar Birju",
    profession: "Main Gate Guard",
    category: "household-staff",
    role: "suspect",
    persona: "Night guard with whistle and wooden lathi who insists he never dozed off between 1 AM and 3 AM.",
    look: { skin: "#945832", hair: "#222222", hairStyle: "turban", facialHair: "mustache", outfitColor: "#4A5568", outfitSecondary: "#CBD5E0", outfitStyle: "uniform", accessory: "none" }
  },
  {
    id: "dhobi-mohan",
    name: "Dhobi Mohan",
    profession: "Washerman",
    category: "household-staff",
    role: "supporting",
    persona: "Washerman who discovered mud stains and perfume scent on a kurta supposedly never worn that night.",
    look: { skin: "#8E542D", hair: "#2D2D2D", hairStyle: "short", facialHair: "stubble", outfitColor: "#E2E8F0", outfitSecondary: "#4A5568", outfitStyle: "kurta", accessory: "scarf" }
  },
  {
    id: "cleaner-pappu",
    name: "Cleaner Pappu",
    profession: "Window & Floor Cleaner",
    category: "household-staff",
    role: "supporting",
    persona: "Curious cleaner who saw an open rooftop ladder leading right into the study room sky-light.",
    look: { skin: "#A76E46", hair: "#1F1F1F", hairStyle: "spiky", facialHair: "none", outfitColor: "#F6BD60", outfitSecondary: "#F28482", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "caretaker-shankar",
    name: "Caretaker Shankar",
    profession: "Estate Key Keeper",
    category: "household-staff",
    role: "suspect",
    persona: "Sole holder of duplicate vault keys who swore no one borrowed the brass master ring.",
    look: { skin: "#9F633B", hair: "#555555", hairStyle: "bald", facialHair: "mustache", outfitColor: "#6D597A", outfitSecondary: "#B56576", outfitStyle: "kurta", accessory: "none" }
  },
  {
    id: "maid-radha",
    name: "Maid Radha",
    profession: "Personal Attendant",
    category: "household-staff",
    role: "supporting",
    persona: "Attendant who served evening milk and noticed the wall safe painting was hung crooked.",
    look: { skin: "#B4794E", hair: "#171717", hairStyle: "long", facialHair: "none", outfitColor: "#84A59D", outfitSecondary: "#F7CAD0", outfitStyle: "saree", accessory: "none" }
  },

  // -------------------------------------------------------------
  // 4. Business People (10)
  // -------------------------------------------------------------
  {
    id: "munim-chimanlal",
    name: "Munim Chimanlal",
    profession: "Chief Accountant & Bookkeeper",
    category: "business-people",
    role: "main",
    persona: "Elderly accountant with bahi-khata ledger book and ink on his fingers; detects mismatched 50,000 rupee tallies.",
    look: { skin: "#BF8356", hair: "#666666", hairStyle: "bald", facialHair: "mustache", outfitColor: "#FDF0D5", outfitSecondary: "#780000", outfitStyle: "kurta", accessory: "specs" }
  },
  {
    id: "jeweller-zaveri",
    name: "Jeweller Zaveri",
    profession: "Precious Gems Merchant",
    category: "business-people",
    role: "suspect",
    persona: "Polished diamond merchant who examined the royal emerald necklace just hours before it vanished.",
    look: { skin: "#C68B5F", hair: "#1E1E1E", hairStyle: "short", facialHair: "mustache", outfitColor: "#003049", outfitSecondary: "#FDF0D5", outfitStyle: "sherwani", accessory: "gold-chain" }
  },
  {
    id: "banker-gupta",
    name: "Banker Gupta",
    profession: "Bank Manager",
    category: "business-people",
    role: "supporting",
    persona: "Nervous branch manager handling the midnight deposit lockers with time-stamped access cards.",
    look: { skin: "#BA7E52", hair: "#2E2E2E", hairStyle: "short", facialHair: "none", outfitColor: "#1B263B", outfitSecondary: "#778DA9", outfitStyle: "suit", accessory: "specs" }
  },
  {
    id: "shopkeeper-lala",
    name: "Lala Kedarnath",
    profession: "General Store Merchant",
    category: "business-people",
    role: "supporting",
    persona: "Corner store merchant who sold 10-meter nylon rope and black gloves to a customer at 8:45 PM.",
    look: { skin: "#B17448", hair: "#383838", hairStyle: "turban", facialHair: "mustache", outfitColor: "#DDA15E", outfitSecondary: "#BC6C25", outfitStyle: "kurta", accessory: "tilak" }
  },
  {
    id: "contractor-tiwari",
    name: "Contractor Tiwari",
    profession: "Haveli Renovation Contractor",
    category: "business-people",
    role: "suspect",
    persona: "Building contractor with blueprints of the haveli's hidden ventilation tunnels and wall cavities.",
    look: { skin: "#A1653B", hair: "#1D1D1D", hairStyle: "short", facialHair: "stubble", outfitColor: "#588157", outfitSecondary: "#3A5A40", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "landlord-verma",
    name: "Landlord Verma",
    profession: "Property Tycoon",
    category: "business-people",
    role: "suspect",
    persona: "Demanding landlord threatening to seal the tenant shop unless rent arrears are handed over tonight.",
    look: { skin: "#B77C50", hair: "#4F4F4F", hairStyle: "short", facialHair: "full-beard", outfitColor: "#495057", outfitSecondary: "#CED4DA", outfitStyle: "suit", accessory: "gold-chain" }
  },
  {
    id: "ca-agarwal",
    name: "CA Agarwal",
    profession: "Chartered Accountant & Tax Auditor",
    category: "business-people",
    role: "supporting",
    persona: "Sharp auditor who discovered an offshore shell company registered under a fake servant's name.",
    look: { skin: "#C1865B", hair: "#212121", hairStyle: "short", facialHair: "none", outfitColor: "#2B2D42", outfitSecondary: "#8D99AE", outfitStyle: "suit", accessory: "specs" }
  },
  {
    id: "broker-mehta",
    name: "Broker Mehta",
    profession: "Antique Broker",
    category: "business-people",
    role: "suspect",
    persona: "Shrewd dealer arranging private collector auctions for stolen Mughal relics and silver coins.",
    look: { skin: "#BC8055", hair: "#1A1A1A", hairStyle: "short", facialHair: "goatee", outfitColor: "#335C67", outfitSecondary: "#E09F3E", outfitStyle: "suit", accessory: "none" }
  },
  {
    id: "trader-bansal",
    name: "Trader Bansal",
    profession: "Grain Wholesaler",
    category: "business-people",
    role: "supporting",
    persona: "Wholesale mandi trader who paid cash bags right before the warehouse lights were cut.",
    look: { skin: "#B3764B", hair: "#303030", hairStyle: "turban", facialHair: "mustache", outfitColor: "#E76F51", outfitSecondary: "#264653", outfitStyle: "kurta", accessory: "none" }
  },
  {
    id: "grocer-murari",
    name: "Murari Kirana",
    profession: "Spice & Ration Merchant",
    category: "business-people",
    role: "supporting",
    persona: "Observant grocer who keeps track of every bicycle parked outside the victim's gate.",
    look: { skin: "#A86D43", hair: "#252525", hairStyle: "short", facialHair: "mustache", outfitColor: "#F4A261", outfitSecondary: "#E76F51", outfitStyle: "kurta", accessory: "tilak" }
  },

  // -------------------------------------------------------------
  // 5. Village Characters (10)
  // -------------------------------------------------------------
  {
    id: "sarpanch-mukhiya",
    name: "Sarpanch Mukhiya Ji",
    profession: "Village Headman",
    category: "village-characters",
    role: "main",
    persona: "Respected panchayat elder with turban, walking stick, and authoritative judgment over boundary disputes.",
    look: { skin: "#A4673D", hair: "#EEEEEE", hairStyle: "turban", facialHair: "full-beard", outfitColor: "#F8F9FA", outfitSecondary: "#D00000", outfitStyle: "dhoti", accessory: "none" }
  },
  {
    id: "patwari-mishra",
    name: "Patwari Mishra",
    profession: "Land Record Officer",
    category: "village-characters",
    role: "suspect",
    persona: "Village registrar holding the cloth map of disputed farmland and inheritance survey numbers.",
    look: { skin: "#B67B4F", hair: "#424242", hairStyle: "short", facialHair: "mustache", outfitColor: "#D8F3DC", outfitSecondary: "#1B4332", outfitStyle: "kurta", accessory: "specs" }
  },
  {
    id: "pandit-radheshyam",
    name: "Pandit Radheshyam",
    profession: "Temple Priest",
    category: "village-characters",
    role: "supporting",
    persona: "Temple priest with saffron angavastra and tilak who conducts the 4 AM temple bell aarti.",
    look: { skin: "#BF8356", hair: "#333333", hairStyle: "bald", facialHair: "none", outfitColor: "#F77F00", outfitSecondary: "#D62828", outfitStyle: "dhoti", accessory: "tilak" }
  },
  {
    id: "farmer-sukhbir",
    name: "Farmer Sukhbir",
    profession: "Sugarcane Farmer",
    category: "village-characters",
    role: "supporting",
    persona: "Honest farmer who spotted a speeding motorcycle without headlights across the canal road at 10 PM.",
    look: { skin: "#8D532B", hair: "#222222", hairStyle: "turban", facialHair: "full-beard", outfitColor: "#52B788", outfitSecondary: "#2D6A4F", outfitStyle: "kurta", accessory: "none" }
  },
  {
    id: "milkman-dudhwala",
    name: "Dudhwala Shyam",
    profession: "Early Morning Milk Delivery",
    category: "village-characters",
    role: "suspect",
    persona: "Milk delivery man with steel cans on his bicycle; first to discover the broken padlock at 5 AM.",
    look: { skin: "#995D35", hair: "#1B1B1B", hairStyle: "turban", facialHair: "mustache", outfitColor: "#FFFFFF", outfitSecondary: "#0077B6", outfitStyle: "kurta", accessory: "none" }
  },
  {
    id: "postman-daakiya",
    name: "Postman Daakiya",
    profession: "Village Postman",
    category: "village-characters",
    role: "supporting",
    persona: "Village postman carrying leather bag who delivered an unsigned blackmail letter with red ink yesterday.",
    look: { skin: "#A86E45", hair: "#282828", hairStyle: "cap", facialHair: "mustache", outfitColor: "#D4A373", outfitSecondary: "#CCD5AE", outfitStyle: "uniform", accessory: "none" }
  },
  {
    id: "barber-hajaam",
    name: "Nai Saloonwala",
    profession: "Village Barber",
    category: "village-characters",
    role: "supporting",
    persona: "Barber whose chair is the gossip capital of the district; heard who bought a railway ticket to Mumbai.",
    look: { skin: "#B2764B", hair: "#1A1A1A", hairStyle: "short", facialHair: "mustache", outfitColor: "#E09F3E", outfitSecondary: "#9E2A2B", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "potter-kumhar",
    name: "Kumhar Ramlal",
    profession: "Earthen Pot Craftsman",
    category: "village-characters",
    role: "supporting",
    persona: "Potter working red clay who found a buried steel tin containing stolen bank notes in his kiln mound.",
    look: { skin: "#8A5029", hair: "#404040", hairStyle: "short", facialHair: "stubble", outfitColor: "#B56576", outfitSecondary: "#6D597A", outfitStyle: "dhoti", accessory: "none" }
  },
  {
    id: "blacksmith-lohar",
    name: "Lohar Mangal",
    profession: "Iron Craftsman & Locksmith",
    category: "village-characters",
    role: "suspect",
    persona: "Locksmith who forged a custom heavy pick-axe and file for a shadowy customer who paid double.",
    look: { skin: "#854A23", hair: "#181818", hairStyle: "short", facialHair: "full-beard", outfitColor: "#353535", outfitSecondary: "#D80032", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "weaver-bunkar",
    name: "Bunkar Ansari",
    profession: "Silk Loom Weaver",
    category: "village-characters",
    role: "supporting",
    persona: "Master weaver who identified the unique gold zari thread found on the suspect's torn sleeve.",
    look: { skin: "#A0643C", hair: "#4F4F4F", hairStyle: "cap", facialHair: "full-beard", outfitColor: "#2A9D8F", outfitSecondary: "#E76F51", outfitStyle: "kurta", accessory: "none" }
  },

  // -------------------------------------------------------------
  // 6. City Characters (10)
  // -------------------------------------------------------------
  {
    id: "doctor-batra",
    name: "Dr. Batra",
    profession: "City Hospital Physician",
    category: "city-characters",
    role: "main",
    persona: "Sharp physician who detected sleeping pill residue inside the night tea cup.",
    look: { skin: "#C1865B", hair: "#3A3A3A", hairStyle: "short", facialHair: "none", outfitColor: "#E9ECEF", outfitSecondary: "#0077B6", outfitStyle: "coat", accessory: "stethoscope" }
  },
  {
    id: "lawyer-saxena",
    name: "Advocate Saxena",
    profession: "High Court Defense Attorney",
    category: "city-characters",
    role: "main",
    persona: "Sharp criminal lawyer who drafts family trusts and knows which heir gets disinherited.",
    look: { skin: "#B87B50", hair: "#262626", hairStyle: "short", facialHair: "mustache", outfitColor: "#000000", outfitSecondary: "#FFFFFF", outfitStyle: "suit", accessory: "specs" }
  },
  {
    id: "teacher-shrikant",
    name: "Teacher Shrikant",
    profession: "High School Science Teacher",
    category: "city-characters",
    role: "supporting",
    persona: "Gentle teacher who noticed his laboratory potassium cyanide bottle was missing 10 grams.",
    look: { skin: "#C4885E", hair: "#4D4D4D", hairStyle: "short", facialHair: "none", outfitColor: "#457B9D", outfitSecondary: "#A8DADC", outfitStyle: "kurta", accessory: "specs" }
  },
  {
    id: "journalist-barkha",
    name: "Journalist Barkha",
    profession: "Crime Reporter",
    category: "city-characters",
    role: "supporting",
    persona: "Fearless investigative journalist with microphone and press badge sniffing out high-profile cover-ups.",
    look: { skin: "#C78E65", hair: "#1B1816", hairStyle: "short", facialHair: "none", outfitColor: "#E63946", outfitSecondary: "#1D3557", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "photographer-alok",
    name: "Photographer Alok",
    profession: "Press & Studio Photographer",
    category: "city-characters",
    role: "suspect",
    persona: "Event photographer with zoom lens whose high-res party photos caught a reflection in the window mirror.",
    look: { skin: "#B07347", hair: "#1F1F1F", hairStyle: "spiky", facialHair: "stubble", outfitColor: "#333333", outfitSecondary: "#F4A261", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "engineer-pradeep",
    name: "Engineer Pradeep",
    profession: "City Power Grid Engineer",
    category: "city-characters",
    role: "supporting",
    persona: "Substation engineer verifying that the locality blackout was deliberately triggered by cut cables at 9:02 PM.",
    look: { skin: "#B97C51", hair: "#2B2B2B", hairStyle: "short", facialHair: "mustache", outfitColor: "#F77F00", outfitSecondary: "#003049", outfitStyle: "uniform", accessory: "none" }
  },
  {
    id: "architect-sen",
    name: "Architect Sen",
    profession: "Heritage Building Architect",
    category: "city-characters",
    role: "supporting",
    persona: "Architect who drew the mansion restoration plan and knows about the hidden cellar lift.",
    look: { skin: "#BF8256", hair: "#505050", hairStyle: "short", facialHair: "goatee", outfitColor: "#2F3E46", outfitSecondary: "#84A98C", outfitStyle: "suit", accessory: "specs" }
  },
  {
    id: "scientist-dr-roy",
    name: "Scientist Dr. Roy",
    profession: "Chemical Metallurgist",
    category: "city-characters",
    role: "supporting",
    persona: "Metallurgy researcher analyzing nitric acid burns found on the safe dial lock mechanism.",
    look: { skin: "#C58B60", hair: "#333333", hairStyle: "bun", facialHair: "none", outfitColor: "#F8F9FA", outfitSecondary: "#4361EE", outfitStyle: "coat", accessory: "specs" }
  },
  {
    id: "professor-das",
    name: "Professor Das",
    profession: "History & Ancient Numismatics Scholar",
    category: "city-characters",
    role: "supporting",
    persona: "University scholar who appraised the stolen Chandragupta gold coin collection.",
    look: { skin: "#BA7D52", hair: "#E0E0E0", hairStyle: "bald", facialHair: "full-beard", outfitColor: "#582F0E", outfitSecondary: "#DDB892", outfitStyle: "kurta", accessory: "specs" }
  },
  {
    id: "bank-teller-neha",
    name: "Neha Teller",
    profession: "Senior Cashier",
    category: "city-characters",
    role: "suspect",
    persona: "Cashier who handled serial numbers of the marked bundles right before bank closing.",
    look: { skin: "#C98F66", hair: "#1E1815", hairStyle: "long", facialHair: "none", outfitColor: "#0077B6", outfitSecondary: "#90E0EF", outfitStyle: "saree", accessory: "none" }
  },

  // -------------------------------------------------------------
  // 7. Suspicious Characters (10)
  // -------------------------------------------------------------
  {
    id: "gambler-jagga",
    name: "Gambler Jagga",
    profession: "Illegal Casino Operator",
    category: "suspicious-characters",
    role: "suspect",
    persona: "Dice gambler with massive underworld debts who suddenly flashed thick stacks of 500-rupee bills.",
    look: { skin: "#9F633B", hair: "#191919", hairStyle: "spiky", facialHair: "mustache", outfitColor: "#6A040F", outfitSecondary: "#03071E", outfitStyle: "casual", accessory: "gold-chain" }
  },
  {
    id: "smuggler-raka",
    name: "Smuggler Raka",
    profession: "Border Contraband Runner",
    category: "suspicious-characters",
    role: "suspect",
    persona: "Scar-faced smuggler with a dark coat who arranged midnight speedboat drops across the creek.",
    look: { skin: "#8C522B", hair: "#141414", hairStyle: "short", facialHair: "full-beard", outfitColor: "#212529", outfitSecondary: "#D90429", outfitStyle: "coat", accessory: "scarf" }
  },
  {
    id: "pickpocket-chikna",
    name: "Chikna Pocketmaar",
    profession: "Market Pickpocket",
    category: "suspicious-characters",
    role: "suspect",
    persona: "Nimble-fingered pickpocket caught holding the victim's leather card case near the bus terminus.",
    look: { skin: "#A66D45", hair: "#222222", hairStyle: "spiky", facialHair: "none", outfitColor: "#E76F51", outfitSecondary: "#2A9D8F", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "stranger-in-coat",
    name: "The Trenchcoat Stranger",
    profession: "Mystery Shadow",
    category: "suspicious-characters",
    role: "suspect",
    persona: "Unidentified figure in collar-up coat and fedora seen pacing under the streetlight outside the mansion.",
    look: { skin: "#945A33", hair: "#111111", hairStyle: "short", facialHair: "stubble", outfitColor: "#1B1D1F", outfitSecondary: "#495057", outfitStyle: "coat", accessory: "detective-hat" }
  },
  {
    id: "fake-baba-nirmal",
    name: "Fake Baba Nirmal",
    profession: "Con Miracle Healer",
    category: "suspicious-characters",
    role: "suspect",
    persona: "Fraudster godman who conducted home shuddhi rituals while secretly eyeing the diamond locker location.",
    look: { skin: "#B87C51", hair: "#2E2318", hairStyle: "long", facialHair: "full-beard", outfitColor: "#FB8500", outfitSecondary: "#FFB703", outfitStyle: "kurta", accessory: "tilak" }
  },
  {
    id: "con-artist-bunty",
    name: "Con Artist Bunty",
    profession: "Imposter & Grifter",
    category: "suspicious-characters",
    role: "suspect",
    persona: "Charming grifter who presented fake Income Tax raid badges to enter the Seth's master bedroom.",
    look: { skin: "#C1865B", hair: "#1D1D1D", hairStyle: "short", facialHair: "goatee", outfitColor: "#3D5A80", outfitSecondary: "#E0FBFC", outfitStyle: "suit", accessory: "none" }
  },
  {
    id: "forger-salim",
    name: "Forger Salim",
    profession: "Document Forger",
    category: "suspicious-characters",
    role: "suspect",
    persona: "Calligrapher who can duplicate signatures, old stamp papers, and wills within 20 minutes.",
    look: { skin: "#A97047", hair: "#2F2F2F", hairStyle: "short", facialHair: "full-beard", outfitColor: "#4A5568", outfitSecondary: "#ED8936", outfitStyle: "kurta", accessory: "specs" }
  },
  {
    id: "fence-billo",
    name: "Billo Kabadiwala",
    profession: "Illegal Scrap & Fence Dealer",
    category: "suspicious-characters",
    role: "suspect",
    persona: "Scrap yard kingpin who melts stolen silver utensils into unmarked bullion bars.",
    look: { skin: "#8B502A", hair: "#1C1C1C", hairStyle: "turban", facialHair: "mustache", outfitColor: "#43281C", outfitSecondary: "#BB9457", outfitStyle: "kurta", accessory: "none" }
  },
  {
    id: "hacker-vicky",
    name: "Hacker Vicky",
    profession: "Blackhat Cyber Specialist",
    category: "suspicious-characters",
    role: "suspect",
    persona: "Basement hacker who looped the CCTV feeds for exactly 14 minutes during the break-in.",
    look: { skin: "#C3885E", hair: "#151515", hairStyle: "spiky", facialHair: "none", outfitColor: "#10002B", outfitSecondary: "#7B2CBF", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "safecracker-kaalia",
    name: "Kaalia Hathoda",
    profession: "Mechanical Safe Cracker",
    category: "suspicious-characters",
    role: "suspect",
    persona: "Notorious safe cracker who uses stethoscope to listen to tumbler clicks without triggering alarms.",
    look: { skin: "#834821", hair: "#1A1A1A", hairStyle: "bald", facialHair: "stubble", outfitColor: "#2B2B2B", outfitSecondary: "#C1121F", outfitStyle: "casual", accessory: "none" }
  },

  // -------------------------------------------------------------
  // 8. Female Characters (10)
  // -------------------------------------------------------------
  {
    id: "neighbour-aunty-pammi",
    name: "Pammi Aunty",
    profession: "Neighbourhood Watch Queen",
    category: "female-characters",
    role: "main",
    persona: "Eagle-eyed neighbour who waters plants on the porch and records every visitor in her mental ledger.",
    look: { skin: "#C98E65", hair: "#261E1A", hairStyle: "bun", facialHair: "none", outfitColor: "#E07A5F", outfitSecondary: "#3D405B", outfitStyle: "saree", accessory: "gold-chain" }
  },
  {
    id: "principal-deshmukh",
    name: "Mrs. Deshmukh",
    profession: "Convent School Principal",
    category: "female-characters",
    role: "supporting",
    persona: "Disciplined educator with silver spectacles who demands absolute truth and precision from everyone.",
    look: { skin: "#BE8155", hair: "#4B4B4B", hairStyle: "bun", facialHair: "none", outfitColor: "#5E548E", outfitSecondary: "#E0B1CB", outfitStyle: "saree", accessory: "specs" }
  },
  {
    id: "nurse-mary",
    name: "Nurse Mary",
    profession: "Senior Night Nurse",
    category: "female-characters",
    role: "supporting",
    persona: "Night shift hospital nurse who saw a suspect arrive with fresh cut scratches on his knuckles at 1:15 AM.",
    look: { skin: "#C78C62", hair: "#181818", hairStyle: "bun", facialHair: "none", outfitColor: "#FFFFFF", outfitSecondary: "#00B4D8", outfitStyle: "uniform", accessory: "none" }
  },
  {
    id: "singer-riya",
    name: "Riya Sen",
    profession: "Club Jazz & Classical Singer",
    category: "female-characters",
    role: "suspect",
    persona: "Glamorous singer performing at the hotel gala whose emerald brooch matched the missing royal jewels.",
    look: { skin: "#D0956C", hair: "#141414", hairStyle: "long", facialHair: "none", outfitColor: "#7209B7", outfitSecondary: "#F72585", outfitStyle: "saree", accessory: "gold-chain" }
  },
  {
    id: "actress-simran",
    name: "Simran Kapoor",
    profession: "Bollywood Film Actress",
    category: "female-characters",
    role: "guest",
    persona: "Famous cinema star whose confidential marriage registry was stolen from the lawyer's locker.",
    look: { skin: "#CE936A", hair: "#191919", hairStyle: "long", facialHair: "none", outfitColor: "#D90429", outfitSecondary: "#FFD166", outfitStyle: "saree", accessory: "gold-chain" }
  },
  {
    id: "boutique-owner-suman",
    name: "Suman Chhabra",
    profession: "Designer Boutique Owner",
    category: "female-characters",
    role: "supporting",
    persona: "Fashion designer who tailored the exact crimson silk mask discarded in the garden fountain.",
    look: { skin: "#C58B60", hair: "#2A1F1B", hairStyle: "short", facialHair: "none", outfitColor: "#2A9D8F", outfitSecondary: "#E76F51", outfitStyle: "casual", accessory: "specs" }
  },
  {
    id: "chef-ananya",
    name: "Chef Ananya",
    profession: "Patisserie Owner",
    category: "female-characters",
    role: "supporting",
    persona: "Pastry chef who delivered the custom birthday cake to the crime scene room at 8 PM.",
    look: { skin: "#CB9066", hair: "#241A16", hairStyle: "bun", facialHair: "none", outfitColor: "#FFFFFF", outfitSecondary: "#F28482", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "trainer-pooja",
    name: "Pooja Trainer",
    profession: "Martial Arts & Fitness Coach",
    category: "female-characters",
    role: "supporting",
    persona: "Fitness coach who recognized the advanced rope-knot technique used to climb the balcony railing.",
    look: { skin: "#B97B50", hair: "#181818", hairStyle: "bun", facialHair: "none", outfitColor: "#003566", outfitSecondary: "#FFC300", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "pilot-sneha",
    name: "Captain Sneha",
    profession: "Commercial Airline Pilot",
    category: "female-characters",
    role: "guest",
    persona: "Airline captain whose chartered flight manifest revealed a suspect attempted to board with a false passport.",
    look: { skin: "#C88E64", hair: "#1F1F1F", hairStyle: "bun", facialHair: "none", outfitColor: "#1B263B", outfitSecondary: "#E0E1DD", outfitStyle: "uniform", accessory: "none" }
  },
  {
    id: "writer-arundhati",
    name: "Arundhati Roy",
    profession: "Mystery Novelist",
    category: "female-characters",
    role: "guest",
    persona: "Bestselling mystery author who realizes the real-life burglary mirrors Chapter 7 of her unpublished book.",
    look: { skin: "#BD8156", hair: "#444444", hairStyle: "short", facialHair: "none", outfitColor: "#4A4E69", outfitSecondary: "#F2E9E4", outfitStyle: "kurta", accessory: "specs" }
  },

  // -------------------------------------------------------------
  // 9. Young Characters (10)
  // -------------------------------------------------------------
  {
    id: "school-boy-bunty",
    name: "Bunty",
    profession: "School Student & Scout",
    category: "young-characters",
    role: "main",
    persona: "Clever kid searching for cricket balls who spotted the culprit ditching a black bag inside the dry well.",
    look: { skin: "#C4885D", hair: "#1A1A1A", hairStyle: "short", facialHair: "none", outfitColor: "#0077B6", outfitSecondary: "#FFB703", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "school-girl-pinky",
    name: "Pinky",
    profession: "School Student & Science Fair Winner",
    category: "young-characters",
    role: "supporting",
    persona: "Observant schoolgirl who recorded a TikTok dance video in the lane that accidentally filmed the get-away car.",
    look: { skin: "#C98E65", hair: "#211A16", hairStyle: "long", facialHair: "none", outfitColor: "#FF006E", outfitSecondary: "#8338EC", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "college-student-aryan",
    name: "Aryan",
    profession: "Engineering Student",
    category: "young-characters",
    role: "suspect",
    persona: "Student with racing bike who claimed he was studying for exams, but his library card was never swiped.",
    look: { skin: "#B87A4F", hair: "#151515", hairStyle: "spiky", facialHair: "stubble", outfitColor: "#2B2D42", outfitSecondary: "#EF233C", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "hostel-warden-khurana",
    name: "Mr. Khurana",
    profession: "Boys Hostel Warden",
    category: "young-characters",
    role: "supporting",
    persona: "Strict warden who keeps the 10 PM hostel gate register and caught someone sneaking in over the back wall.",
    look: { skin: "#B17549", hair: "#383838", hairStyle: "short", facialHair: "mustache", outfitColor: "#6C757D", outfitSecondary: "#CED4DA", outfitStyle: "kurta", accessory: "specs" }
  },
  {
    id: "tuition-teacher-deepak",
    name: "Deepak Sir",
    profession: "Maths Tuition Teacher",
    category: "young-characters",
    role: "supporting",
    persona: "Private tutor who was grading test papers in the verandah when he heard glass shatter next door.",
    look: { skin: "#C2865B", hair: "#2A2A2A", hairStyle: "short", facialHair: "none", outfitColor: "#457B9D", outfitSecondary: "#E63946", outfitStyle: "kurta", accessory: "specs" }
  },
  {
    id: "techie-rohan",
    name: "Rohan Techie",
    profession: "App Developer",
    category: "young-characters",
    role: "supporting",
    persona: "Smart coder whose fitness tracker GPS data proved he was jogging 5 km away during the crime.",
    look: { skin: "#BD8155", hair: "#1E1E1E", hairStyle: "short", facialHair: "stubble", outfitColor: "#3A0CA3", outfitSecondary: "#4CC9F0", outfitStyle: "casual", accessory: "specs" }
  },
  {
    id: "intern-tanvi",
    name: "Tanvi Intern",
    profession: "Law Firm Intern",
    category: "young-characters",
    role: "supporting",
    persona: "Diligent intern who photocopied the real property deed before the original was swapped with a counterfeit.",
    look: { skin: "#CB9067", hair: "#1A1A1A", hairStyle: "long", facialHair: "none", outfitColor: "#06D6A0", outfitSecondary: "#073B4C", outfitStyle: "casual", accessory: "specs" }
  },
  {
    id: "delivery-boy-sonu",
    name: "Sonu Delivery",
    profession: "Food Delivery Rider",
    category: "young-characters",
    role: "suspect",
    persona: "Food delivery rider who rang the doorbell at 9:45 PM and saw two people arguing in the hallway.",
    look: { skin: "#A56B43", hair: "#1B1B1B", hairStyle: "cap", facialHair: "none", outfitColor: "#E23744", outfitSecondary: "#FFFFFF", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "gamer-sunny",
    name: "Sunny Gamer",
    profession: "Esports Streamer",
    category: "young-characters",
    role: "supporting",
    persona: "Streamer whose live Twitch microphone picked up the exact sound of gun-fire in the background at 10:14 PM.",
    look: { skin: "#C1865C", hair: "#252525", hairStyle: "spiky", facialHair: "none", outfitColor: "#7209B7", outfitSecondary: "#3A0CA3", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "scout-leader-kabir",
    name: "Kabir Scout",
    profession: "National Scout Trainer",
    category: "young-characters",
    role: "supporting",
    persona: "Eagle Scout who identified the rare compass orientation marks chalked on the garden boundary wall.",
    look: { skin: "#B2764A", hair: "#1D1D1D", hairStyle: "short", facialHair: "none", outfitColor: "#606C38", outfitSecondary: "#DDA15E", outfitStyle: "uniform", accessory: "scarf" }
  },

  // -------------------------------------------------------------
  // 10. Special Characters (10)
  // -------------------------------------------------------------
  {
    id: "watchman-jaggu",
    name: "Jaggu Nightwatch",
    profession: "Colony Night Watchman",
    category: "special-characters",
    role: "supporting",
    persona: "Night watchman whistling down the colony lanes whose flashlight surprised the escaping intruder.",
    look: { skin: "#915630", hair: "#303030", hairStyle: "turban", facialHair: "mustache", outfitColor: "#343A40", outfitSecondary: "#F8F9FA", outfitStyle: "uniform", accessory: "none" }
  },
  {
    id: "magician-pc-sorcar",
    name: "Jaadugar Ojas",
    profession: "Stage Magician & Illusionist",
    category: "special-characters",
    role: "guest",
    persona: "Illusionist who reveals how the locked-room trapdoor trick was executed using mirrors and hidden hinges.",
    look: { skin: "#B77B4F", hair: "#181818", hairStyle: "short", facialHair: "goatee", outfitColor: "#560BAD", outfitSecondary: "#F72585", outfitStyle: "suit", accessory: "detective-hat" }
  },
  {
    id: "astrologer-acharya",
    name: "Acharya Ji",
    profession: "Vedic Astrologer",
    category: "special-characters",
    role: "supporting",
    persona: "Astrologer with horoscope scrolls who warned the victim about a 'betrayal by someone wearing silver' on full moon.",
    look: { skin: "#BE8156", hair: "#3D3D3D", hairStyle: "bald", facialHair: "full-beard", outfitColor: "#FF5400", outfitSecondary: "#FFD166", outfitStyle: "dhoti", accessory: "tilak" }
  },
  {
    id: "traveller-marco",
    name: "Marco Wanderer",
    profession: "Foreign Backpacker",
    category: "special-characters",
    role: "guest",
    persona: "Backpacker staying in the guest wing who took rooftop photos of the full moon that night.",
    look: { skin: "#D9A078", hair: "#705335", hairStyle: "long", facialHair: "full-beard", outfitColor: "#457B9D", outfitSecondary: "#E76F51", outfitStyle: "casual", accessory: "none" }
  },
  {
    id: "tourist-john",
    name: "Tourist John",
    profession: "Heritage Tourist",
    category: "special-characters",
    role: "guest",
    persona: "Curious tourist whose rental car dashcam continuously recorded the street outside the heritage museum.",
    look: { skin: "#DEAC87", hair: "#8C6239", hairStyle: "short", facialHair: "none", outfitColor: "#2A9D8F", outfitSecondary: "#F4A261", outfitStyle: "casual", accessory: "specs" }
  },
  {
    id: "old-friend-rakesh",
    name: "Rakesh Uncle",
    profession: "Retired Army Major & Old Friend",
    category: "special-characters",
    role: "guest",
    persona: "Seth's childhood friend from the military who noticed the service revolver was moved from the showcase.",
    look: { skin: "#B5774B", hair: "#CCCCCC", hairStyle: "short", facialHair: "mustache", outfitColor: "#588157", outfitSecondary: "#3A5A40", outfitStyle: "coat", accessory: "none" }
  },
  {
    id: "collector-singhania",
    name: "Mr. Singhania",
    profession: "Royal Antique Collector",
    category: "special-characters",
    role: "guest",
    persona: "Wealthy collector who was offered the victim's stolen 18th-century jade dagger by an anonymous broker.",
    look: { skin: "#C58A5F", hair: "#4A4A4A", hairStyle: "short", facialHair: "mustache", outfitColor: "#1B263B", outfitSecondary: "#C5A059", outfitStyle: "sherwani", accessory: "gold-chain" }
  },
  {
    id: "curator-joshi",
    name: "Curator Joshi",
    profession: "State Museum Curator",
    category: "special-characters",
    role: "supporting",
    persona: "Museum chief who verified the theft was an inside job because laser sensors were deliberately disarmed.",
    look: { skin: "#BD8155", hair: "#2B2B2B", hairStyle: "short", facialHair: "none", outfitColor: "#3D348B", outfitSecondary: "#7678ED", outfitStyle: "suit", accessory: "specs" }
  },
  {
    id: "hotel-manager-oberoi",
    name: "Manager Oberoi",
    profession: "5-Star Luxury Hotel Manager",
    category: "special-characters",
    role: "supporting",
    persona: "Suave hotelier who provided the master electronic keycard logs for Suite 402.",
    look: { skin: "#C1865B", hair: "#1E1E1E", hairStyle: "short", facialHair: "mustache", outfitColor: "#0D1B2A", outfitSecondary: "#E0E1DD", outfitStyle: "suit", accessory: "none" }
  },
  {
    id: "tte-pandey",
    name: "TTE Pandey",
    profession: "Indian Railways Ticket Examiner",
    category: "special-characters",
    role: "supporting",
    persona: "Train ticket examiner whose chart proves the suspect was on the Rajdhani Express, not at the crime scene.",
    look: { skin: "#AB6F45", hair: "#353535", hairStyle: "cap", facialHair: "mustache", outfitColor: "#111111", outfitSecondary: "#D4AF37", outfitStyle: "coat", accessory: "specs" }
  }
];

export const CAST_BY_ID = new Map<string, CharacterDefinition>(
  CAST_100.map((c) => [c.id, c])
);

export const getCharacterById = (id: string): CharacterDefinition => {
  const found = CAST_BY_ID.get(id);
  if (!found) {
    // Fallback to Jasoos Bhai if unknown
    return CAST_100[0]!;
  }
  return found;
};

export const getCharactersByCategory = (cat: CharacterCategory): CharacterDefinition[] => {
  return CAST_100.filter((c) => c.category === cat);
};

export const getSuspectCharacters = (): CharacterDefinition[] => {
  return CAST_100.filter((c) => c.role === "suspect");
};
