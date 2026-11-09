export type CharacterAction =
  | "idle"
  | "walking"
  | "running"
  | "talking"
  | "smiling"
  | "laughing"
  | "thinking"
  | "pointing"
  | "surprised"
  | "afraid"
  | "nervous"
  | "stressed"
  | "angry"
  | "crying"
  | "confused"
  | "suspicious"
  | "sneaking"
  | "looking-left"
  | "looking-right"
  | "celebrating";

export type CharacterExpression =
  | "neutral"
  | "happy"
  | "smiling"
  | "laughing"
  | "angry"
  | "sad"
  | "crying"
  | "afraid"
  | "nervous"
  | "stressed"
  | "shocked"
  | "surprised"
  | "suspicious"
  | "confused"
  | "thinking"
  | "evil-smile";

export type CharacterCategory =
  | "main-detective-family"
  | "rich-family"
  | "household-staff"
  | "business-people"
  | "village-characters"
  | "city-characters"
  | "suspicious-characters"
  | "female-characters"
  | "young-characters"
  | "special-characters";

export type CharacterRole = "main" | "supporting" | "suspect" | "guest";

export interface CharacterLook {
  skin: string;
  hair: string;
  hairStyle: "short" | "bun" | "long" | "bald" | "spiky" | "wavy" | "turban" | "cap";
  facialHair?: "none" | "mustache" | "full-beard" | "stubble" | "goatee";
  outfitColor: string;
  outfitSecondary?: string;
  outfitStyle: "suit" | "sherwani" | "kurta" | "saree" | "uniform" | "casual" | "coat" | "dhoti";
  accessory?: "none" | "detective-hat" | "specs" | "tilak" | "police-cap" | "gold-chain" | "scarf" | "stethoscope" | "pipe";
}

export interface CharacterDefinition {
  id: string;
  name: string;
  profession: string;
  category: CharacterCategory;
  role: CharacterRole;
  persona: string;
  look: CharacterLook;
  defaultAction?: CharacterAction;
  defaultExpression?: CharacterExpression;
}
