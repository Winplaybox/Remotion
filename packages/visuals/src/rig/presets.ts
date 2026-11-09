/**
 * CHARACTER PRESETS — the look of every cast member, in one place.
 * Want a change? Edit the preset here (colours, hair, headwear, moustache, outfit, accessories); every engine
 * that uses the rig (Jhooth Kaun?, Spot the Liar, Raaz serial…) picks it up. See docs/CHARACTERS.md.
 */
export type Gender = "m" | "f";
export type Hair = "short" | "sidePart" | "spiky" | "bald" | "bun" | "braid" | "ponytail" | "greyBun" | "none";
export type Headwear = "none" | "pagdi" | "gandhiTopi" | "cap" | "policeCap" | "fedora";
export type FacialHair = "none" | "mustache" | "bigMustache" | "stubble" | "beard";
export type Top = "kurta" | "shirt" | "vest" | "blouse" | "coat" | "uniform" | "tshirt";
export type Bottom = "pants" | "dhoti" | "saree" | "salwar" | "pyjama";
export type Accessory = "bindi" | "glasses" | "tilak" | "gamcha" | "dupatta" | "magnifier" | "goldChain" | "belly" | "badge" | "earrings" | "bangles";

export interface Look {
  label: string;
  gender: Gender;
  skin: string;
  hair: Hair;
  hairColor: string;
  headwear: Headwear;
  headwearColor: string;
  facialHair: FacialHair;
  top: Top;
  topColor: string;
  /** trim / second colour (saree pallu, coat lapel, vest, border) */
  trim: string;
  bottom: Bottom;
  bottomColor: string;
  shoes: string;
  accessories: Accessory[];
  /** 0.85–1.1, scales the whole body (kids/elders a bit shorter) */
  height: number;
}

const OUT = "#2B1B14";
export const OUTLINE = OUT;

export const PRESETS = {
  jasoos: {
    label: "Jasoos Bhai", gender: "m", skin: "#C98B5E", hair: "short", hairColor: "#1E1410", headwear: "fedora", headwearColor: "#5A4632",
    facialHair: "mustache", top: "coat", topColor: "#B98A4E", trim: "#8A6234", bottom: "pants", bottomColor: "#3B3A48", shoes: "#2A1E18",
    accessories: ["magnifier"], height: 1.04
  },
  seth: {
    label: "Seth ji", gender: "m", skin: "#D9A273", hair: "bald", hairColor: "#3A2A22", headwear: "pagdi", headwearColor: "#E2483D",
    facialHair: "bigMustache", top: "kurta", topColor: "#F2C14E", trim: "#C98A1B", bottom: "dhoti", bottomColor: "#FFF6E3", shoes: "#6B3B1E",
    accessories: ["belly", "goldChain", "tilak"], height: 1
  },
  naukar: {
    label: "Naukar", gender: "m", skin: "#B87A4E", hair: "sidePart", hairColor: "#1A120E", headwear: "none", headwearColor: "#000",
    facialHair: "mustache", top: "vest", topColor: "#F4F0E6", trim: "#D9D2C2", bottom: "pyjama", bottomColor: "#8FA3B8", shoes: "#5A3A26",
    accessories: ["gamcha"], height: 0.97
  },
  maali: {
    label: "Maali", gender: "m", skin: "#A86C42", hair: "short", hairColor: "#2A2420", headwear: "gandhiTopi", headwearColor: "#FBF8F0",
    facialHair: "stubble", top: "kurta", topColor: "#6FA35A", trim: "#4E7C3E", bottom: "dhoti", bottomColor: "#F3EBD8", shoes: "#5A3A26",
    accessories: ["gamcha"], height: 0.98
  },
  driver: {
    label: "Driver", gender: "m", skin: "#BF8558", hair: "short", hairColor: "#16100C", headwear: "cap", headwearColor: "#F4F4F0",
    facialHair: "mustache", top: "shirt", topColor: "#F4F4F0", trim: "#C9CED6", bottom: "pants", bottomColor: "#2F3A4E", shoes: "#1E1A18",
    accessories: [], height: 1.01
  },
  munim: {
    label: "Munim ji", gender: "m", skin: "#D2A07A", hair: "bald", hairColor: "#8C8C8C", headwear: "gandhiTopi", headwearColor: "#3B3B46",
    facialHair: "none", top: "kurta", topColor: "#E8E0CF", trim: "#B9AE96", bottom: "dhoti", bottomColor: "#FFFFFF", shoes: "#3A2A20",
    accessories: ["glasses", "tilak"], height: 0.95
  },
  beta: {
    label: "Beta", gender: "m", skin: "#CF9468", hair: "spiky", hairColor: "#1A120E", headwear: "none", headwearColor: "#000",
    facialHair: "none", top: "tshirt", topColor: "#3E7BE0", trim: "#F2C14E", bottom: "pants", bottomColor: "#2D4A7A", shoes: "#F4F4F4",
    accessories: [], height: 1
  },
  chowkidar: {
    label: "Chowkidar", gender: "m", skin: "#A46A40", hair: "short", hairColor: "#262626", headwear: "policeCap", headwearColor: "#7A6A45",
    facialHair: "bigMustache", top: "uniform", topColor: "#B4A274", trim: "#7A6A45", bottom: "pants", bottomColor: "#8E7E54", shoes: "#1E1A18",
    accessories: ["badge"], height: 1.02
  },
  bahu: {
    label: "Bahu", gender: "f", skin: "#D9A073", hair: "bun", hairColor: "#15100D", headwear: "none", headwearColor: "#000",
    facialHair: "none", top: "blouse", topColor: "#C2185B", trim: "#F2C14E", bottom: "saree", bottomColor: "#E5397A", shoes: "#8A2A3A",
    accessories: ["bindi", "earrings", "bangles"], height: 0.95
  },
  beti: {
    label: "Beti", gender: "f", skin: "#E0AC82", hair: "ponytail", hairColor: "#1B130F", headwear: "none", headwearColor: "#000",
    facialHair: "none", top: "kurta", topColor: "#8E5BD6", trim: "#F6D365", bottom: "salwar", bottomColor: "#F6E7FF", shoes: "#5B3B8C",
    accessories: ["dupatta", "earrings"], height: 0.93
  },
  dadi: {
    label: "Dadi", gender: "f", skin: "#CFA07E", hair: "greyBun", hairColor: "#D8D8D8", headwear: "none", headwearColor: "#000",
    facialHair: "none", top: "blouse", topColor: "#F6F1E4", trim: "#B48A3C", bottom: "saree", bottomColor: "#FBF8EF", shoes: "#6B5B4B",
    accessories: ["glasses", "bindi"], height: 0.88
  },
  kaamwali: {
    label: "Kaamwali", gender: "f", skin: "#A96B43", hair: "braid", hairColor: "#140F0C", headwear: "none", headwearColor: "#000",
    facialHair: "none", top: "blouse", topColor: "#2E8B7A", trim: "#F29E4C", bottom: "saree", bottomColor: "#F29E4C", shoes: "#5A3A26",
    accessories: ["bindi", "bangles"], height: 0.94
  }
} satisfies Record<string, Look>;

export type PresetId = keyof typeof PRESETS;
export const PRESET_IDS = Object.keys(PRESETS) as PresetId[];
export const lookOf = (p: PresetId | Look): Look => (typeof p === "string" ? PRESETS[p] : p);
