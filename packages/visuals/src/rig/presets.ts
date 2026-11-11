/**
 * CHARACTER LOOK — every visible trait of a cast member lives in one `Look` object (see cast.ts for the 100 looks).
 * Want a change? Edit the look in cast.ts (colours, hair, headwear, facial hair, outfit, props, face shape…) and every
 * engine that uses the rig picks it up. Only options listed here are drawn — see docs/CHARACTERS.md.
 */
export type Gender = "m" | "f";
export const HAIRS = ["short", "sidePart", "spiky", "bald", "bun", "braid", "ponytail", "greyBun", "none", "curly", "slickBack", "buzz", "balding", "bob", "long", "topknot", "twinBraids", "messy", "jata", "flatTop", "pigtails"] as const;
export const HEADWEARS = ["none", "pagdi", "gandhiTopi", "cap", "policeCap", "fedora", "sunHat", "chefHat", "nurseCap", "ghunghat", "bandana", "beanie", "hardHat", "headCloth"] as const;
export const FACIAL_HAIRS = ["none", "mustache", "bigMustache", "stubble", "beard", "goatee", "longBeard", "handlebar", "sideburns"] as const;
export const TOPS = ["kurta", "shirt", "vest", "blouse", "coat", "uniform", "tshirt", "suit", "labcoat", "robe", "hoodie", "sherwani"] as const;
export const BOTTOMS = ["pants", "dhoti", "saree", "salwar", "pyjama", "skirt", "shorts", "lungi"] as const;
export const ACCESSORIES = ["bindi", "glasses", "sunglasses", "bandit", "tilak", "tripund", "gamcha", "dupatta", "goldChain", "badge", "earrings", "bangles", "tie", "stethoscope", "camera", "scarf", "rudraksha", "apron", "backpack", "scar", "mole", "bandage", "medals"] as const;
export const PROPS = ["none", "magnifier", "briefcase", "clipboard", "baton", "ledger", "milkCan", "cane", "mic", "wateringCan", "broom", "ladle", "bag", "phone"] as const;
export const FACE_SHAPES = ["round", "oval", "square", "long"] as const;
export const BUILDS = ["slim", "normal", "stout"] as const;
export const EYE_STYLES = ["dot", "narrow", "big", "sleepy"] as const;
export const NOSES = ["small", "big", "pointy", "round"] as const;
export const BROWS = ["thin", "normal", "thick", "bushy"] as const;

export type Hair = (typeof HAIRS)[number];
export type Headwear = (typeof HEADWEARS)[number];
export type FacialHair = (typeof FACIAL_HAIRS)[number];
export type Top = (typeof TOPS)[number];
export type Bottom = (typeof BOTTOMS)[number];
export type Accessory = (typeof ACCESSORIES)[number];
export type Prop = (typeof PROPS)[number];
export type FaceShape = (typeof FACE_SHAPES)[number];
export type Build = (typeof BUILDS)[number];
export type EyeStyle = (typeof EYE_STYLES)[number];
export type Nose = (typeof NOSES)[number];
export type Brow = (typeof BROWS)[number];

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
  /** trim / second colour (saree pallu, coat lapel, shirt under a coat, border) */
  trim: string;
  bottom: Bottom;
  bottomColor: string;
  shoes: string;
  accessories: Accessory[];
  /** 0.85–1.1, scales the whole body (kids/elders a bit shorter) */
  height: number;
  /** held item, drawn in the right hand while the action leaves it free */
  prop?: Prop;
  faceShape?: FaceShape;
  build?: Build;
  eyes?: EyeStyle;
  nose?: Nose;
  brow?: Brow;
  /** tie / stethoscope / small accent colour */
  accent?: string;
}

export type FullLook = Required<Look>;

export const OUTLINE = "#2B1B14";

/** Fill the optional traits with defaults so the drawing code never branches on undefined. */
export function fillLook(l: Look): FullLook {
  return {
    prop: "none", faceShape: "round", build: "normal", eyes: "dot", nose: "small", brow: "normal", accent: "#C0392B",
    ...l
  };
}
